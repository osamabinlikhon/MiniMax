import { describe, it, expect, vi, beforeEach } from 'vitest'
import server from './index'

// Mock the queue module so tests don't need Redis
const addMock = vi.fn().mockResolvedValue(undefined)
vi.mock('../../../libs/queue/src', () => ({
  createQueue: (name: string) => ({ queue: { add: addMock } }),
}))

beforeEach(() => {
  addMock.mockClear()
})

describe('POST /plans', () => {
  it('returns a plan and enqueues a task', async () => {
    const response = await server.inject({
      method: 'POST',
      url: '/plans',
      payload: { goal: 'Summarize recent AI research' },
    })

    expect(response.statusCode).toBe(200)
    const body = JSON.parse(response.payload)
    expect(body).toHaveProperty('id')
    expect(Array.isArray(body.tasks)).toBe(true)
    expect(body.tasks.length).toBeGreaterThanOrEqual(1)
    expect(addMock).toHaveBeenCalled()
    // ensure a job was enqueued per task
    expect(addMock.mock.calls.length).toBe(body.tasks.length)
  })
})
