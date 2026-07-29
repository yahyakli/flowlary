import { beforeEach, describe, expect, it, vi } from 'vitest'

const mockAuth = vi.fn()
const mockGetGroqModel = vi.fn()
const mockStreamText = vi.fn()
const mockConnectDB = vi.fn()
const mockFindMonthlySnapshot = vi.fn()
const mockFindLedgerEntries = vi.fn()

vi.mock('@/lib/auth', () => ({ auth: mockAuth }))
vi.mock('@/lib/ai/groq', () => ({ getGroqModel: mockGetGroqModel }))
vi.mock('ai', () => ({ streamText: mockStreamText }))
vi.mock('@/lib/db/mongoose', () => ({ default: mockConnectDB }))
vi.mock('@/lib/db/models/MonthlySnapshot', () => ({
  MonthlySnapshot: {
    findOne: mockFindMonthlySnapshot,
  },
}))
vi.mock('@/lib/db/models/LedgerEntry', () => ({
  LedgerEntry: {
    find: mockFindLedgerEntries,
  },
}))

describe('AI chat route', () => {
  beforeEach(() => {
    vi.resetModules()
    vi.clearAllMocks()
  })

  it('returns 401 when the user is not authenticated', async () => {
    mockAuth.mockResolvedValue(null)

    const { POST } = await import('./route')
    const response = await POST(new Request('http://localhost/api/ai/chat', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ message: 'Hello there' }),
    }))

    expect(response.status).toBe(401)
    expect(mockStreamText).not.toHaveBeenCalled()
  })

  it('rate-limits repeated requests and streams a response when allowed', async () => {
    mockAuth.mockResolvedValue({ user: { id: 'user-1', name: 'Alex' } })
    mockConnectDB.mockResolvedValue(undefined)
    mockFindMonthlySnapshot.mockReturnValue({
      sort: () => ({
        lean: async () => ({
          month: '2024-06',
          totalIncome: 5000,
          totalExpenses: 2500,
          netBalance: 2500,
          expenseByCategory: { groceries: 200 },
          savingsRate: 0.5,
        }),
      }),
    })
    mockFindLedgerEntries.mockReturnValue({
      sort: () => ({
        limit: () => ({
          lean: async () => [
            { type: 'income', category: 'salary', amountIn: 5000, amountOut: 0, note: 'Salary', createdAt: new Date('2024-06-01') },
            { type: 'expense', category: 'groceries', amountIn: 0, amountOut: 120, note: 'Groceries', createdAt: new Date('2024-06-02') },
          ],
        }),
      }),
    })
    mockGetGroqModel.mockResolvedValue({})
    ;(globalThis as typeof globalThis & { __flowlaryAiRateLimit?: Map<string, number[]> }).__flowlaryAiRateLimit?.clear()
    mockStreamText.mockReturnValue({
      toTextStreamResponse: vi.fn(() => new Response('streamed-response', {
        status: 200,
        headers: { 'content-type': 'text/plain; charset=utf-8' },
      })),
    })

    const { POST } = await import('./route')

    const firstResponse = await POST(new Request('http://localhost/api/ai/chat', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ message: 'Give me a quick insight' }),
    }))

    let rateLimitedResponse: Response | undefined
    for (let index = 0; index < 6; index += 1) {
      rateLimitedResponse = await POST(new Request('http://localhost/api/ai/chat', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ message: `Insight ${index}` }),
      }))
    }

    expect(firstResponse.status).toBe(200)
    expect(await firstResponse.text()).toBe('streamed-response')
    expect(firstResponse.headers.get('content-type')).toContain('text/plain')
    expect(rateLimitedResponse?.status).toBe(429)
    expect(mockStreamText).toHaveBeenCalledTimes(5)
    expect(mockStreamText).toHaveBeenCalledWith(expect.objectContaining({
      model: {},
      system: expect.stringContaining('finance copilot'),
      messages: [{ role: 'user', content: 'Give me a quick insight' }],
    }))
  })
})
