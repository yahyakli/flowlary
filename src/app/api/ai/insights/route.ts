import { auth } from '@/lib/auth'
import { getGroqModel } from '@/lib/ai/groq'
import { buildInsightsPrompt } from '@/lib/ai/prompts'
import { isRateLimited } from '@/lib/ai/rate-limit'
import { z } from 'zod'

const insightsSchema = z.object({
  monthlySnapshots: z.array(z.object({
    month: z.string(),
    totalIncome: z.number(),
    totalExpenses: z.number(),
    netBalance: z.number(),
  }))
})

export async function GET() {
  return Response.json({ message: 'Insights API is available.' })
}

export async function POST(request: Request) {
  const session = await auth()
  if (!session?.user?.id) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  if (isRateLimited(`insights:${session.user.id}`)) {
    return Response.json({ error: 'Rate limit exceeded. Please try again shortly.' }, { status: 429 })
  }

  try {
    const body = await request.json()
    const parsed = insightsSchema.parse(body)
    const model = await getGroqModel()
    const prompt = buildInsightsPrompt(parsed.monthlySnapshots)
    const response = await model.doGenerate({
      inputFormat: 'prompt',
      prompt,
      temperature: 0.1,
      maxTokens: 400,
    })

    let payload: { trend: string; anomalies: string[]; suggestion: string }
    try {
      payload = JSON.parse(response.text ?? '{}')
    } catch {
      payload = { trend: 'No trend available', anomalies: [], suggestion: 'Add more financial data to generate a stronger insight.' }
    }

    return Response.json({ insight: payload, provider: 'groq' })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return Response.json({ error: error.flatten().fieldErrors }, { status: 400 })
    }

    return Response.json({ error: (error as Error).message }, { status: 500 })
  }
}
