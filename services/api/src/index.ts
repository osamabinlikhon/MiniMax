import Fastify from 'fastify';
import cors from '@fastify/cors';
import websocket from '@fastify/websocket';
import jwt from '@fastify/jwt';
import rateLimit from '@fastify/rate-limit';
import dotenv from 'dotenv';
import { v4 as uuidv4 } from 'uuid';
import { z } from 'zod';
import OpenAI from 'openai';

dotenv.config();

const server = Fastify({ logger: true });

// OpenAI client (using OpenRouter)
const openai = new OpenAI({
  baseURL: 'https://openrouter.ai/api/v1',
  apiKey: process.env.OPENROUTER_API_KEY,
});

// Plugins
await server.register(cors, { origin: true });
await server.register(websocket);
await server.register(rateLimit, { max: 100, timeWindow: '1 minute' });
await server.register(jwt, { secret: process.env.JWT_SECRET || 'minimax-secret-key' });

// Types
interface Plan {
  id: string;
  goal: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  tasks: Task[];
  result?: any;
  createdAt: string;
}

interface Task {
  id: string;
  type: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  result?: any;
}

// In-memory storage (replace with Supabase in production)
const plans = new Map<string, Plan>();
const sessions = new Map<string, any>();

// Schemas
const CreatePlanSchema = z.object({
  goal: z.string().min(1),
  mode: z.enum(['lightning', 'standard', 'custom']).default('standard'),
});

const ChatMessageSchema = z.object({
  message: z.string().min(1),
  sessionId: z.string().optional(),
});

// Health check
server.get('/health', async () => ({ status: 'ok', timestamp: new Date().toISOString() }));

// Create a new plan
server.post('/api/plans', async (request, reply) => {
  const parse = CreatePlanSchema.safeParse(request.body);
  if (!parse.success) {
    return reply.status(400).send({ error: 'Invalid request', details: parse.error });
  }

  const { goal, mode } = parse.data;
  const planId = uuidv4();

  const plan: Plan = {
    id: planId,
    goal,
    status: 'pending',
    tasks: [],
    createdAt: new Date().toISOString(),
  };

  // Generate tasks using AI
  try {
    const completion = await openai.chat.completions.create({
      model: mode === 'lightning' ? 'google/gemini-2.0-flash-exp:free' : 'google/gemini-2.0-flash-exp:free',
      messages: [
        {
          role: 'system',
          content: `You are a task planner. Break down the user's goal into actionable tasks.
Return a JSON array of tasks with format: [{"type": "task_type", "description": "what to do"}]
Task types: research, code, design, write, analyze, create_presentation, generate_media`,
        },
        { role: 'user', content: goal },
      ],
    });

    const content = completion.choices[0]?.message?.content || '[]';
    const tasksJson = JSON.parse(content.replace(/```json?|```/g, '').trim());
    
    plan.tasks = tasksJson.map((t: any) => ({
      id: uuidv4(),
      type: t.type,
      description: t.description,
      status: 'pending',
    }));
    plan.status = 'running';
  } catch (error: any) {
    server.log.error('Failed to generate plan', error);
    plan.tasks = [{ id: uuidv4(), type: 'manual', status: 'pending' }];
  }

  plans.set(planId, plan);
  return plan;
});

// Get plan status
server.get('/api/plans/:id', async (request, reply) => {
  const { id } = request.params as { id: string };
  const plan = plans.get(id);
  if (!plan) {
    return reply.status(404).send({ error: 'Plan not found' });
  }
  return plan;
});

// List all plans
server.get('/api/plans', async () => {
  return Array.from(plans.values()).sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
});

// Chat endpoint
server.post('/api/chat', async (request, reply) => {
  const parse = ChatMessageSchema.safeParse(request.body);
  if (!parse.success) {
    return reply.status(400).send({ error: 'Invalid request' });
  }

  const { message, sessionId } = parse.data;
  const currentSessionId = sessionId || uuidv4();

  // Get or create session
  let session = sessions.get(currentSessionId) || { messages: [], createdAt: new Date().toISOString() };

  session.messages.push({ role: 'user', content: message });

  try {
    const completion = await openai.chat.completions.create({
      model: 'google/gemini-2.0-flash-exp:free',
      messages: [
        {
          role: 'system',
          content: `You are MiniMax, an AI assistant capable of:
        - 🌐 **Full-Stack Web Development** - Complete web apps with Auth, Database, Stripe integration
        - 📊 **Presentation Agent** - HTML to PPTX export with real-time preview
        - 🔬 **Research & Analysis** - Multi-source research, code analysis, chart generation
        - 🎨 **Multimedia Generation** - Image, audio, and video generation and editing
        - 🔧 **MCP Ecosystem** - Custom MCP creation and pre-built integrations

        Be helpful, concise, and proactive. Ask clarifying questions when needed.`,
        },
        ...session.messages,
      ],
    });

    const response = completion.choices[0]?.message?.content || 'I apologize, I could not process that request.';
    session.messages.push({ role: 'assistant', content: response });
    sessions.set(currentSessionId, session);

    return { sessionId: currentSessionId, response, usage: completion.usage };
  } catch (error: any) {
    server.log.error('Chat error', error);
    return reply.status(500).send({ error: 'Failed to process chat', details: error.message });
  }
});

// Execute task
server.post('/api/tasks/:id/execute', async (request, reply) => {
  const { id } = request.params as { id: string };
  
  // Find task in plans
  for (const plan of plans.values()) {
    const task = plan.tasks.find(t => t.id === id);
    if (task) {
      task.status = 'running';
      
      // Simulate task execution
      setTimeout(() => {
        task.status = 'completed';
        task.result = { success: true, completedAt: new Date().toISOString() };
        
        // Check if all tasks completed
        if (plan.tasks.every(t => t.status === 'completed')) {
          plan.status = 'completed';
        }
      }, 2000);
      
      return { message: 'Task execution started', task };
    }
  }
  
  return reply.status(404).send({ error: 'Task not found' });
});

// WebSocket for real-time updates
server.register(async function (fastify) {
  fastify.get('/ws', { websocket: true }, (connection, req) => {
    connection.socket.on('message', (message: string) => {
      try {
        const data = JSON.parse(message.toString());
        
        if (data.type === 'subscribe') {
          // Send current state
          connection.socket.send(JSON.stringify({
            type: 'state',
            plans: Array.from(plans.values()),
          }));
        }
      } catch (error) {
        server.log.error('WebSocket message error', error);
      }
    });

    connection.socket.on('close', () => {
      server.log.info('WebSocket connection closed');
    });
  });
});

// Start server
const port = Number(process.env.PORT) || 3000;
const host = process.env.HOST || '0.0.0.0';

server.listen({ port, host }).then(() => {
  console.log(`🚀 MiniMax API running on http://${host}:${port}`);
});

export default server;
