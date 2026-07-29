import { beforeEach, describe, expect, it, vi } from 'vitest'

const mockAuth = vi.fn()
const mockGetGroqModel = vi.fn()
const mockConnectDB = vi.fn()
const mockFindMonthlySnapshots = vi.fn()
const mockFindAiInsightsCache = vi.fn()
const mockCreateAiInsightsCache = vi.fn()

vi.mock('@/lib/auth', () => ({ auth: mockAuth }))
vi.mock('@/lib/ai/groq', () => ({ getGroqModel: mockGetGroqModel }))
vi.mock('@/lib/db/mongoose', () => ({ default: mockConnectDB }))
vi.mock('@/lib/db/models/MonthlySnapshot', () => ({
  MonthlySnapshot: {
    find: mockFindMonthlySnapshots,
  },
}))
vi.mock('@/lib/db/models/AiInsightsCache', () => ({
  AiInsightsCache: {
    findOne: mockFindAiInsightsCache,
    create: mockCreateAiInsightsCache,
  },
}))

describe('AI insights route', () => {
  beforeEach(() => {
    vi.resetModules()
    vi.clearAllMocks()
  })

  it('returns a cached insight when one is fresh', async () => {
    mockAuth.mockResolvedValue({ user: { id: 'user-1', name: 'Alex' } })
    mockConnectDB.mockResolvedValue(undefined)
    mockFindAiInsightsCache.mockReturnValue({
      lean: async () => ({
        result: { trend: 'stable', anomalies: [], suggestion: 'Keep tracking.' },
        createdAt: new Date(),
      }),
    })

    const { GET } = await import('./route')
    const response = await GET()

    expect(response.status).toBe(200)
    expect(await response.json()).toEqual({
      insight: { trend: 'stable', anomalies: [], suggestion: 'Keep tracking.' },
      cached: true,
    })
    expect(mockGetGroqModel).not.toHaveBeenCalled()
  })

  it('fetches and stores insights when no fresh cache exists', async () => {
    mockAuth.mockResolvedValue({ user: { id: 'user-2', name: 'Jamie' } })
    mockConnectDB.mockResolvedValue(undefined)
    mockFindAiInsightsCache.mockReturnValue({
      lean: async () => null,
    })
    mockFindMonthlySnapshots.mockReturnValue({
      sort: () => ({
        limit: () => ({
          lean: async () => [
            { month: '2024-06', totalIncome: 5000, totalExpenses: 2200, netBalance: 2800 },
            { month: '2024-05', totalIncome: 4800, totalExpenses: 2500, netBalance: 2300 },
          ],
        }),
      }),
    })
    mockGetGroqModel.mockResolvedValue({
      doGenerate: vi.fn(async () => ({ text: JSON.stringify({ trend: 'upward', anomalies: ['higher expenses'], suggestion: 'Trim discretionary spend.' }) })),
    })
    mockCreateAiInsightsCache.mockResolvedValue({})

    const { GET } = await import('./route')
    const response = await GET()

    expect(response.status).toBe(200)
    expect(await response.json()).toEqual({
      insight: { trend: 'upward', anomalies: ['higher expenses'], suggestion: 'Trim discretionary spend.' },
      cached: false,
    })
    expect(mockCreateAiInsightsCache).toHaveBeenCalled()
    expect(mockGetGroqModel).toHaveBeenCalled()
  })
})
