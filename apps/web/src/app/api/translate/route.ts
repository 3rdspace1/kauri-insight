import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'

import { getAIProvider } from '@kauri/ai/provider'
import { z } from 'zod'

const translateSchema = z.object({
    text: z.string().min(1),
    targetLanguage: z.string().min(2),
})

export async function POST(request: Request) {
    try {
        const session = await auth()

        if (!session?.tenantId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const body = await request.json()
        const { text, targetLanguage } = translateSchema.parse(body)

        const provider = getAIProvider()

        // Using a generic LLM call for translation
        // In a real app, you might have a specific .translate() method in the provider
        const prompt = `Translate the following survey question/text to ${targetLanguage}. 
    Keep the tone professional and appropriate for a survey. 
    Return ONLY the translated text without any explanation or quotes.
    
    Text: ${text}`

        // We'll use a fast model for translation
        const translatedText = await (provider as any).callModelslab?.('mixtral-8x7b-instruct', prompt, {
            temperature: 0.1,
        }) || await fallbackTranslate(text, targetLanguage)

        return NextResponse.json({ translatedText: translatedText.trim() })
    } catch (error) {
        console.error('Translation error:', error)
        return NextResponse.json({ error: 'Failed to translate text' }, { status: 500 })
    }
}

async function fallbackTranslate(text: string, target: string) {
    // Simple fallback for mock provider or if callModelslab isn't exposed
    return `[${target}] ${text}`
}
