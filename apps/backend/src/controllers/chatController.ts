// src/controllers/chatController.ts
// streams reply with typing + loader steps

import { Context } from 'hono'
import { streamSSE } from 'hono/streaming'
import { handleNewMessage, getChatHistory } from '../services/chatService'
import { PrismaClient } from '@prisma/client'

export async function postMessage(c: Context) {
    const body = await c.req.json()
    const { chatId, message } = body

    if (!chatId || !message?.trim()) {
        return c.json({ error: 'Need chatId and message' }, 400)
    }

    // Get the stream + intent
    const result = await handleNewMessage(Number(chatId), message.trim())

    // Loader words
    const thinkingSteps = [
        'Thinking...',
        result.intent === 'order'
            ? 'Searching your order...'
            : result.intent === 'billing'
                ? 'Checking your invoice...'
                : result.intent === 'support'
                    ? 'Looking at chat history...'
                    : 'Hmm...',
        'Almost there...',
    ]

    return streamSSE(c, async (stream) => {
        // Typing steps
        for (const step of thinkingSteps) {
            await stream.writeSSE({
                data: JSON.stringify({ type: 'thinking', text: step }),
            })
            await stream.sleep(1200)
        }

        // Agent reply chunks
        for await (const chunk of result.stream) {
            await stream.writeSSE({
                data: JSON.stringify({ type: 'content', text: chunk }),
            })
        }

        // End
        await stream.writeSSE({ data: JSON.stringify({ type: 'done' }) })
    })
}
const prisma = new PrismaClient()

export async function listConversations(c: Context) {
    const chats = await prisma.chat.findMany({
        include: {
            messages: {
                take: 1,
                orderBy: { sentAt: 'desc' },
            },
        },
    })
    return c.json(chats)
}

export async function getConversation(c: Context) {
    
    const chatId = Number(c.req.param('id'))
    if (!chatId) return c.json({ error: 'Need chatId' }, 400)

    const history = await getChatHistory(chatId)
    return c.json({ messages: history })
}