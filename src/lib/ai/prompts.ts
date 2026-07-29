export interface UserContext {
  userId?: string
  userName?: string
  latestSnapshot?: {
    month: string
    totalIncome: number
    totalExpenses: number
    netBalance: number
    expenseByCategory?: Record<string, number>
    savingsRate?: number
  }
  ledgerSummary?: string
}

export function buildChatSystemPrompt(userContext: UserContext) {
  const name = userContext.userName ? `for user ${userContext.userName}` : ''

  return [
    `You are a finance copilot ${name}.`,
    'You have access ONLY to the context provided below. Do not attempt to fetch external data or assume facts beyond what is included in the context.',
    '',
    'Context Start',
    JSON.stringify(userContext, null, 2),
    'Context End',
    '',
    'Rules:',
    '- Answer questions only using the provided context. If the information is missing, say you do not have enough information.',
    "- Do NOT provide investment advice, trading signals, or tax advice. If asked for investments or taxes, respond with a clear, friendly refusal and suggest speaking to a licensed professional.",
    "- If asked for recommendations or financial planning, clarify you're not a financial advisor and provide educational, non-prescriptive information only.",
    "- Keep answers concise and cite which part of the provided context you used when possible.",
  ].join('\n')
}

export interface SnapshotBrief {
  month: string
  totalIncome: number
  totalExpenses: number
  netBalance: number
}

export function buildInsightsPrompt(monthlySnapshots: SnapshotBrief[]) {
  const monthsList = monthlySnapshots.map((s) => s.month).join(', ')

  return [
    'You are an analysis assistant that summarizes recent financial activity.',
    `You have been given monthly snapshots for these months: ${monthsList}.`,
    'Based ONLY on the provided snapshots, produce a JSON object and nothing else that matches this exact schema:',
    '{',
    '  "trend": string,               // short human-readable summary of the trend (e.g., "increasing income")',
    '  "anomalies": string[],         // list of notable anomalies (e.g., unusually high expense categories or sudden drops)',
    '  "suggestion": string           // a single clear operational suggestion (educational, non-advisory)',
    '}',
    '',
    'Return ONLY valid JSON that conforms to the schema above. Do not include any explanatory text, headings, or code fences. If there is no data, return empty values following the types (e.g., empty array for anomalies).',
    '',
    'Provided snapshots:',
    JSON.stringify(monthlySnapshots, null, 2),
  ].join('\n')
}

export default buildChatSystemPrompt
