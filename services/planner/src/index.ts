import Fastify from 'fastify'
import { v4 as uuidv4 } from 'uuid'
import dotenv from 'dotenv'
import { z } from 'zod'
import { TaskSchema, PlanSchema } from '../../../libs/common/src/types'
import { decomposeGoal } from './decomposer'
import { createQueue } from '../../../libs/queue/src'

dotenv.config()

const server = Fastify({ logger: true })

const bodySchema = z.object({ goal: z.string().min(1) })

server.post('/plans', async (request, reply) => {
  const parse = bodySchema.safeParse(request.body)
  if (!parse.success) return reply.status(400).send({ error: 'goal required' })

  const { goal } = parse.data
  const planId = uuidv4()

  // Build a schema-conformant Task
  const taskData = {
    id: uuidv4(),
    type: 'planning' as const,
    title: `Research: ${goal.slice(0, 120)}`,
    description: `Research and summarize: ${goal}`,
    agentId: uuidv4(),
    planId,
    priority: 'medium' as const,
    status: 'pending' as const,
    dependencies: [],
    inputs: { prompt: `Research and summarize: ${goal}` },
    outputs: {},
    retryCount: 0,
    maxRetries: 3,
    metadata: {},
  }

  const subGoals = decomposeGoal(goal)

  const tasks = subGoals.map((sg) => {
    const data = {
      ...taskData,
      id: uuidv4(),
      title: `Step: ${sg.slice(0, 100)}`,
      description: sg,
      inputs: { prompt: `Research: ${sg}` },
    }
    return TaskSchema.parse(data)
  })

  const planData = {
    id: planId,
    title: `Plan: ${goal.slice(0, 120)}`,
    description: `Auto-generated plan for: ${goal}`,
    type: subGoals.length > 1 ? ('complex' as const) : ('simple' as const),
    userId: uuidv4(),
    status: 'pending' as const,
    tasks: tasks.map((t) => t.id),
    context: { goal },
    constraints: {},
    results: {},
    progress: { total: tasks.length, completed: 0, failed: 0, percentage: 0 },
  }

  const plan = PlanSchema.parse(planData)

  try {
    const { queue } = createQueue('tasks')
    // enqueue the first task for workers to pick up
    // enqueue all tasks
    for (const t of tasks) {
      await queue.add('execute_task', { planId, taskId: t.id, inputs: t.inputs }, { removeOnComplete: true })
    }
  } catch (err) {
    server.log.error('Failed to enqueue task', err)
  }

  return plan
})

const port = Number(process.env.PORT) || 3001
if (process.env.NODE_ENV !== 'test') {
  server.listen({ port, host: '0.0.0.0' }).then(() => console.log(`Planner running on ${port}`))
}

export default server
