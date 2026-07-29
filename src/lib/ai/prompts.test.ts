import { describe, it, expect } from 'vitest'
import { buildChatSystemPrompt, buildInsightsPrompt } from './prompts'

describe('AI prompts', () => {
  it('buildChatSystemPrompt includes provided context and safety rules', () => {
    const ctx = {
      userId: 'user-1',
      userName: 'Alex',
      latestSnapshot: { month: '2024-01', totalIncome: 1000, totalExpenses: 200, netBalance: 800 },
      ledgerSummary: 'Recent deposits and groceries.'
    }

    const prompt = buildChatSystemPrompt(ctx as any)

    expect(prompt).toContain('finance copilot')
    expect(prompt).toContain('ONLY to the context provided') // check phrasing intent
    expect(prompt).toContain('NOT provide investment advice')
    expect(prompt).toContain('user Alex')
    expect(prompt).toContain('"month": "2024-01"')
  })

  it('buildInsightsPrompt requests only valid JSON and includes schema keys', () => {
    const snaps = [
      { month: '2024-01', totalIncome: 1000, totalExpenses: 300, netBalance: 700 },
      { month: '2024-02', totalIncome: 1200, totalExpenses: 400, netBalance: 800 },
    ]

    const prompt = buildInsightsPrompt(snaps as any)
    expect(prompt).toContain('ONLY valid JSON')
    expect(prompt).toContain('"trend": string')
    expect(prompt).toContain('"anomalies": string[]')
    expect(prompt).toContain('"suggestion": string')
    expect(prompt).toContain('2024-01')
    expect(prompt).toContain('2024-02')
  })
})
