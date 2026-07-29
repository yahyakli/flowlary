import { auth } from '@/lib/auth'
import { getGroqModel } from '@/lib/ai/groq'
import { buildInsightsPrompt } from '@/lib/ai/prompts'
import connectDB from '@/lib/db/mongoose'
import { MonthlySnapshot } from '@/lib/db/models/MonthlySnapshot'
import { AiInsightsCache } from '@/lib/db/models/AiInsightsCache'
import { z } from 'zod'

const insightResponseSchema = z.object({
  trend: z.string().min(1),
  anomalies: z.array(z.string()),
  suggestion: z.string().min(1),
})

async function parseInsightsResponse(rawText: string) {
  const trimmed = rawText.trim()
  const parsed = JSON.parse(trimmed)
  return insightResponseSchema.parse(parsed)
}

async function generateInsightForSnapshots(monthlySnapshots: Array<{ month: string; totalIncome: number; totalExpenses: number; netBalance: number }>) {
  const model = await getGroqModel()
  const prompt = buildInsightsPrompt(monthlySnapshots)
  const firstResult = await model.doGenerate({
    inputFormat: 'prompt',
    prompt,
    temperature: 0.1,
    maxTokens: 400,
  })

  try {
    return await parseInsightsResponse(firstResult.text ?? '{}')
  } catch {
    const retryResult = await model.doGenerate({
      inputFormat: 'prompt',
      prompt,
      temperature: 0.1,
      maxTokens: 400,
    })

    return await parseInsightsResponse(retryResult.text ?? '{}')
  }
}

export async function GET() {
  const session = await auth()
  if (!session?.user?.id) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    await connectDB()

    const freshCache = await AiInsightsCache.findOne({ userId: session.user.id }).lean()
    if (freshCache && freshCache.createdAt && Date.now() - new Date(freshCache.createdAt).getTime() < 24 * 60 * 60 * 1000) {
      return Response.json({ insight: freshCache.result, cached: true })
    }

    const monthlySnapshots = await MonthlySnapshot.find({ userId: session.user.id })
      .sort({ month: -1 })
      .limit(6)
      .lean()

    const insight = await generateInsightForSnapshots(monthlySnapshots.map((snapshot) => ({
      month: snapshot.month,
      totalIncome: snapshot.totalIncome ?? 0,
      totalExpenses: snapshot.totalExpenses ?? 0,
      netBalance: snapshot.netBalance ?? 0,
    })))

    await AiInsightsCache.create({
      userId: session.user.id,
      result: insight,
      createdAt: new Date(),
    })

    return Response.json({ insight, cached: false })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return Response.json({ error: 'AI returned malformed insights data.' }, { status: 502 })
    }

    return Response.json({ error: (error as Error).message }, { status: 500 })
  }
}

export async function POST() {
  return Response.json({ error: 'Method not allowed' }, { status: 405 })
}
