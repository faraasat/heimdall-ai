import { ChatGroq } from "@langchain/groq"
import { ChatGoogleGenerativeAI } from "@langchain/google-genai"

type MinimalChatModel = {
  invoke: (messages: unknown) => Promise<{ content: string }>
}

function getNoopModel(): MinimalChatModel {
  return {
    async invoke() {
      // Always return valid JSON so callers can parse.
      return {
        content: JSON.stringify({
          severity: "medium",
          confidence: 40,
          reasoning: [
            "AI model is not configured (missing GROQ_API_KEY/GOOGLE_AI_API_KEY).",
            "Using deterministic fallback analysis.",
          ],
          exploitability: "medium",
          false_positive_likelihood: 50,
          steps: [
            "Review the vulnerability details.",
            "Apply security best practices.",
            "Test and verify the fix.",
          ],
          estimated_effort: "Unknown",
          priority: "medium",
          verification_steps: ["Re-run the scan and confirm the issue is resolved."],
        }),
      }
    },
  }
}

// Groq configuration (primary)
export function getGroqModel(options: { temperature?: number; modelName?: string } = {}) {
  const apiKey = process.env.GROQ_API_KEY
  if (!apiKey) {
    throw new Error("GROQ_API_KEY environment variable is not set")
  }

  return new ChatGroq({
    apiKey,
    model: options.modelName || "llama-3.3-70b-versatile",
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
    model: options.modelName || "gemini-1.5-flash-latest",
    temperature: options.temperature ?? 0.2,
    maxOutputTokens: 2048,
  })
}

// Get the appropriate model with fallback logic
export async function getAIModel(preferredModel: 'groq' | 'gemini' = 'groq', options: { temperature?: number } = {}) {
  try {
    if (preferredModel === 'groq') {
      return getGroqModel(options)
    }
    return getGeminiModel(options)
  } catch (error) {
    console.warn(`Failed to initialize ${preferredModel}, falling back...`, error)
    try {
      // Fallback to the other model
      if (preferredModel === 'groq') {
        return getGeminiModel(options)
      }
      return getGroqModel(options)
    } catch (fallbackError) {
      console.warn('No AI provider configured; using noop model.', fallbackError)
      return getNoopModel() as any
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
