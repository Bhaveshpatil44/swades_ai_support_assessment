
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
    const chats = await prisma.chat.findMany({ include: { messages: true } })
    console.log('Found chats:', chats)
}

main().catch(console.error).finally(() => prisma.$disconnect())