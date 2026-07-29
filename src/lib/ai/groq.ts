/**
 * Lazily initialize a Groq (Vercel AI SDK) client using the GROQ_API_KEY.
 *
 * Important: do not throw during module import if the API key or provider
 * is missing. Instead surface a clear error when the client is actually
 * used. This allows the rest of the app to run in environments without
 * AI configured.
 */

let groqClient: any | null = null
let groqModelCache: any | null = null

export const groqModel = null

export function isAiConfigured(): boolean {
  return Boolean(process.env.GROQ_API_KEY)
}

async function initializeClient() {
  if (groqClient) return groqClient

  const apiKey = process.env.GROQ_API_KEY
  if (!apiKey) {
    throw new Error('GROQ_API_KEY is not configured. Set GROQ_API_KEY in your environment to enable AI features.')
  }

  try {
    const mod = await import('@ai-sdk/groq')
    if (typeof mod.createGroq !== 'function') {
      throw new Error('createGroq not found on @ai-sdk/groq')
    }

    groqClient = mod.createGroq({ apiKey })
    return groqClient
  } catch (err) {
    throw new Error(`Failed to initialize Groq provider: ${(err as Error).message}`)
  }
}

export async function getGroqClient() {
  return await initializeClient()
}

/**
 * Return a model callable from the Groq client. Consumers may await this
 * and call the returned function. Provide a helper so callers can lazily
 * obtain the model and get a clear error if AI isn't configured.
 */
export async function getGroqModel(modelName = 'llama-3.3-70b-versatile') {
  if (groqModelCache) return groqModelCache
  const client = await initializeClient()
  try {
    const model = client(modelName)
    groqModelCache = model
    return model
  } catch (err) {
    throw new Error(`Failed to load Groq model "${modelName}": ${(err as Error).message}`)
  }
}

export default getGroqModel
