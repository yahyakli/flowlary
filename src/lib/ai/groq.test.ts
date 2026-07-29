import { describe, expect, it } from 'vitest'

describe('groq AI helper', () => {
  it('exposes a shared groqModel reference and surfaces missing API key errors', async () => {
    const module = await import('./groq')

    expect(module.groqModel).toBeNull()
    await expect(module.getGroqModel()).rejects.toThrow('GROQ_API_KEY')
  })
})
