import { createGroq } from '@ai-sdk/groq'

let groqClient: ReturnType<typeof createGroq> | null = null
let groqModel: ReturnType<typeof groqClient> | null = null

if (process.env.GROQ_API_KEY) {
  try {
    groqClient = createGroq({ apiKey: process.env.GROQ_API_KEY })
    // model name used in project docs; keep this reference here for convenience
    // consumer code should call `getGroqModel()` to access the model safely
    groqModel = groqClient('llama-3.3-70b-versatile')
  } catch (err) {
    // fall through — exports below will surface errors at call time
    console.warn('Failed to initialize Groq client:', (err as Error).message)
  }
} else {
  console.warn('GROQ_API_KEY is not set. AI calls will fail until it is provided.')
}

export function getGroq() {
  if (!groqClient) throw new Error('Missing GROQ_API_KEY — set it in .env.local')
  return groqClient
}

export function getGroqModel() {
  if (!groqModel) throw new Error('Groq model not initialized — check GROQ_API_KEY')
  return groqModel
}

export default getGroqModel
