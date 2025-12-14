import dotenv from 'dotenv'
dotenv.config()

import { createWorker } from '../../../libs/queue/src'
import { Job } from 'bullmq'

const TASK_QUEUE = 'tasks'

function processor(job: Job) {
  console.log(`Worker received job ${job.id} of type ${job.name}`)
  // Very small demo processor: mark job completed with simple result
  return Promise.resolve({ ok: true, jobId: job.id, data: job.data })
}

const worker = createWorker(TASK_QUEUE, processor)

worker.on('completed', (job) => {
  console.log(`Job ${job.id} completed`) // job is Job
})

worker.on('failed', (job, err) => {
  console.error(`Job ${job?.id} failed:`, err)
})

console.log('Agent worker started, listening for tasks...')
