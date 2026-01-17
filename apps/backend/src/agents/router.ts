// src/agents/router.ts
// router decides which agent gets the message

import { groq } from '@ai-sdk/groq'
import { generateText } from 'ai'

import { supportAgent } from './subagents/support'
import { orderAgent } from './subagents/order'
import { billingAgent } from './subagents/billing'

const model = groq('llama-3.1-8b-instant')

// classifies intent (support/order/billing/fallback)
export async function classifyIntent(message: string, history: string[] = []) {
    const recent = history.slice(-4).join('\n')

    const prompt = `Classify this message. Reply with ONLY one word: support order billing fallback

support = password, how-to, faq, general help
order = track order, status, delivery, cancel
billing = refund, payment, invoice, subscription
fallback = anything else

Message: ${message}
Recent: ${recent || 'none'}`

    try {
        const { text } = await generateText({
            model,
            prompt,
            maxOutputTokens: 5, // correct property
            temperature: 0,
        })

        let guess = text.trim().toLowerCase().replace(/[^a-z]/g, '')

        if (guess.includes('support')) return 'support'
        if (guess.includes('order')) return 'order'
        if (guess.includes('billing')) return 'billing'
        if (guess.includes('fallback')) return 'fallback'

        return 'fallback'
    } catch (err) {
        console.error('classify error:', err)
        return 'fallback'
    }
}

// calls the right agent based on intent
export async function delegateToAgent(
    intent: string,
    chatId: number,
    userMessage: string
): Promise<string> {
    try {
        if (intent === 'support') {
            return await supportAgent(chatId, userMessage)
        }
        if (intent === 'order') {
            return await orderAgent(userMessage)
        }
        if (intent === 'billing') {
            return await billingAgent()
        }
        return "Sorry, not sure how to handle that one."
    } catch (err) {
        console.error('agent failed:', err)
        return "Something went wrong, try again?"
    }
}