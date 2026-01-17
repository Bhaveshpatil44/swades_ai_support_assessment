// src/services/chatService.ts

import { PrismaClient } from '@prisma/client'
import { classifyIntent, delegateToAgent } from '../agents/router'
import { streamText, generateText } from 'ai'   
import { groq } from '@ai-sdk/groq'

const prisma = new PrismaClient()

export async function handleNewMessage(chatId: number, userMessage: string) {
    // Save user message
    await prisma.message.create({
        data: { chatId, sender: 'user', content: userMessage },
    })

    // Get recent history
    const recent = await prisma.message.findMany({
        where: { chatId },
        orderBy: { sentAt: 'desc' },
        take: 20,   //  allow more than 10
    })

    let history = recent.reverse().map(m => `${m.sender}: ${m.content}`)

    
    if (recent.length > 10) {
        const summary = await generateText({
            model: groq('llama-3.1-8b-instant'),
            prompt: `Summarize this chat history in 2 sentences:\n${history.join('\n')}`,
        })
        history = [`Summary: ${summary.text}`]
    }

    
    const intent = await classifyIntent(userMessage, history)

    // Get reply from sub-agent
    const fullReply = await delegateToAgent(intent, chatId, userMessage)

    // Groq model
    const { textStream } = await streamText({
        model: groq('llama-3.1-8b-instant'),
        prompt: `Rewrite this reply naturally and friendly:\n${fullReply}`,
        maxOutputTokens: 300,
        temperature: 0.7,
    })

    
    const [streamForController, streamForSaving] = textStream.tee()

    // Save final reply once complete
    let savedReply = ''
    for await (const chunk of streamForSaving) {
        savedReply += chunk
    }
    await prisma.message.create({
        data: { chatId, sender: 'agent', content: savedReply },
    })

    return { stream: streamForController, intent }
}

export async function getChatHistory(chatId: number) {
    return prisma.message.findMany({
        where: { chatId },
        orderBy: { sentAt: 'asc' },
    })
}