import { NextResponse } from 'next/server'
import { getGroqModel, getGeminiModel } from '@/lib/ai/models'

export async function GET() {
  try {
    // Test environment variables
    const hasGroqKey = !!process.env.GROQ_API_KEY
    const hasGeminiKey = !!process.env.GOOGLE_AI_API_KEY
    
    // Test AI models
    let groqWorks = false
    let geminiWorks = false
    let groqError = null
    let geminiError = null
    
    try {
      const groqModel = getGroqModel()
      const response = await groqModel.invoke([{ role: 'user', content: 'Say "test" in one word' }])
      groqWorks = !!response.content
    } catch (error: any) {
      groqError = error.message
    }
    
    try {
      const geminiModel = getGeminiModel()
      const response = await geminiModel.invoke([{ role: 'user', content: 'Say "test" in one word' }])
      geminiWorks = !!response.content
    } catch (error: any) {
      geminiError = error.message
    }
    
    return NextResponse.json({
      environment: {
        hasGroqKey,
        hasGeminiKey,
      },
      models: {
        groq: {
          works: groqWorks,
          error: groqError
        },
        gemini: {
          works: geminiWorks,
          error: geminiError
        }
      }
    })
  } catch (error: any) {
    return NextResponse.json({
      error: error.message,
      stack: error.stack
    }, { status: 500 })
  }
}
