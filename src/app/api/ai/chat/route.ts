import { streamText } from 'ai'
import { auth } from '@/lib/auth'
import { getGroqModel } from '@/lib/ai/groq'
import { buildChatSystemPrompt } from '@/lib/ai/prompts'
import connectDB from '@/lib/db/mongoose'
import { MonthlySnapshot } from '@/lib/db/models/MonthlySnapshot'
import { LedgerEntry } from '@/lib/db/models/LedgerEntry'
import { z } from 'zod'

const chatRequestSchema = z.object({
  message: z.string().trim().min(1).max(2000),
})

const rateLimitStore = (globalThis as typeof globalThis & {
  __flowlaryAiRateLimit?: Map<string, number[]>
}).__flowlaryAiRateLimit ??= new Map<string, number[]>()

function isRateLimited(userId: string, maxRequestsPerMinute = 5) {
  // Keep the MVP limiter simple and conservative: five requests per minute per user.
  const now = Date.now()
  const timestamps = rateLimitStore.get(userId) ?? []
  const recent = timestamps.filter((timestamp) => now - timestamp < 60_000)

  if (recent.length >= maxRequestsPerMinute) {
    rateLimitStore.set(userId, recent)
    return true
  }

  recent.push(now)
  rateLimitStore.set(userId, recent)
  return false
}

export async function GET() {
  return Response.json({ message: 'Chat API is available.' })
}

export async function POST(request: Request) {
  const session = await auth()
  if (!session?.user?.id) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  if (isRateLimited(session.user.id)) {
    return Response.json({ error: 'Rate limit exceeded. Please try again shortly.' }, { status: 429 })
  }

  try {
    const body = await request.json()
    const parsed = chatRequestSchema.parse(body)

    await connectDB()

    const latestSnapshot = await MonthlySnapshot.findOne({ userId: session.user.id }).sort({ month: -1 }).lean()
    const recentEntries = await LedgerEntry.find({ userId: session.user.id })
      .sort({ createdAt: -1 })
      .limit(20)
      .lean()

    const ledgerSummary = recentEntries
      .map((entry) => {
        const amount = entry.amountIn > 0 ? entry.amountIn : entry.amountOut
        const direction = entry.amountIn > 0 ? 'in' : 'out'
        const note = entry.note ? ` (${entry.note})` : ''
        return `${entry.type}: ${direction} ${amount}${note}`
      })
      .join('; ')

    const userContext = {
      userId: session.user.id,
      userName: session.user.name ?? undefined,
      latestSnapshot: latestSnapshot
        ? {
            month: latestSnapshot.month,
            totalIncome: latestSnapshot.totalIncome ?? 0,
            totalExpenses: latestSnapshot.totalExpenses ?? 0,
            netBalance: latestSnapshot.netBalance ?? 0,
            expenseByCategory: latestSnapshot.expenseByCategory ? Object.fromEntries(Object.entries(latestSnapshot.expenseByCategory)) : undefined,
            savingsRate: latestSnapshot.savingsRate ?? 0,
          }
        : undefined,
      ledgerSummary: ledgerSummary || 'No recent ledger entries found.',
    }

    const model = await getGroqModel()
    const result = streamText({
      model,
      system: buildChatSystemPrompt(userContext),
      messages: [{ role: 'user', content: parsed.message }],
      temperature: 0.2,
      maxOutputTokens: 400,
    })

    return result.toTextStreamResponse()
  } catch (error) {
    if (error instanceof z.ZodError) {
      return Response.json({ error: error.flatten().fieldErrors }, { status: 400 })
    }

    return Response.json({ error: (error as Error).message }, { status: 500 })
  }
}
