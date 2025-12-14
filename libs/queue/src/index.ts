import { Queue, Worker, QueueScheduler, Job } from 'bullmq'
import IORedis from 'ioredis'

const connection = new IORedis(process.env.REDIS_URL || 'redis://localhost:6379')

export function createQueue(name: string) {
  const scheduler = new QueueScheduler(name, { connection })
  const queue = new Queue(name, { connection })
  return { queue, scheduler }
}

export function createWorker(name: string, processor: (job: Job) => Promise<any>) {
  const worker = new Worker(name, async (job) => processor(job), { connection })
  return worker
}
