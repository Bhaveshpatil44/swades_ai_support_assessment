// src/services/chatService.ts
import { classifyIntent, delegateToAgent } from '../agents/router'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function handleNewMessage(chatId: number, userMessage: string) {
    const history = await prisma.message.findMany({ where: { chatId } })
    const intent = await classifyIntent(userMessage, history.map(m => m.content))

    const agentReply = await delegateToAgent(intent, chatId, userMessage)

    await prisma.message.create({
        data: {
            chatId,
            sender: 'agent',
            content: agentReply,
        },
    })

    return { reply: agentReply, intent }
}

//  Add this export so controller can import it
export async function getChatHistory(chatId: number) {
    return prisma.message.findMany({
        where: { chatId },
        orderBy: { sentAt: 'asc' },
    })
}