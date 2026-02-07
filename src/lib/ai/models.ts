import { ChatGroq } from "@langchain/groq"
import { ChatGoogleGenerativeAI } from "@langchain/google-genai"

// Groq configuration (primary)
export function getGroqModel(options: { temperature?: number; modelName?: string } = {}) {
  const apiKey = process.env.GROQ_API_KEY
  if (!apiKey) {
    throw new Error("GROQ_API_KEY environment variable is not set")
  }

  return new ChatGroq({
    apiKey,
    model: options.modelName || "mixtral-8x7b-32768",
    temperature: options.temperature ?? 0.2,
    maxTokens: 2048,
  })
}

// Google Gemini configuration (secondary/fallback)
export function getGeminiModel(options: { temperature?: number; modelName?: string } = {}) {
  const apiKey = process.env.GOOGLE_AI_API_KEY
  if (!apiKey) {
    throw new Error("GOOGLE_AI_API_KEY environment variable is not set")
  }

  return new ChatGoogleGenerativeAI({
    apiKey,
    model: options.modelName || "gemini-1.5-flash",
    temperature: options.temperature ?? 0.2,
    maxOutputTokens: 2048,
  })
}

// Get the appropriate model with fallback logic
export async function getAIModel(preferredModel: 'groq' | 'gemini' = 'groq', options: { temperature?: number } = {}) {
  try {
    if (preferredModel === 'groq') {
      return getGroqModel(options)
    } else {
      return getGeminiModel(options)
    }
  } catch (error) {
    console.warn(`Failed to initialize ${preferredModel}, falling back...`, error)
    // Fallback to the other model
    if (preferredModel === 'groq') {
      return getGeminiModel(options)
    } else {
      return getGroqModel(options)
    }
  }
}

// Model for different use cases
export const AI_MODELS = {
  // Fast, for quick classifications and summaries
  fast: () => getGeminiModel({ temperature: 0.1 }),
  
  // Standard, for general reasoning
  standard: () => getGroqModel({ temperature: 0.2 }),
  
  // Creative, for attack hypothesis generation
  creative: () => getGroqModel({ temperature: 0.7 }),
  
  // Precise, for false positive filtering
  precise: () => getGroqModel({ temperature: 0.1 }),
}
