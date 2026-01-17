// prisma/seed.ts - quick seed data for testing agents

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
    //console.log('Starting seed...')

    // Optional: skip wipe if you want to keep existing data
    // await prisma.message.deleteMany({})
    // await prisma.chat.deleteMany({})
    // await prisma.order.deleteMany({})
    // await prisma.invoice.deleteMany({})
    // await prisma.customer.deleteMany({})

    // Check if customer already exists (so re-run is safe)
    let customer = await prisma.customer.findUnique({
        where: { email: 'bhavesh@test.com' },
    })

    if (!customer) {
        customer = await prisma.customer.create({
            data: {
                name: 'Bhavesh Test',
                email: 'bhavesh@test.com',
            },
        })
      //  console.log('Created customer:', customer.id)
    }

    // Create chat if not exists
    let chat = await prisma.chat.findFirst({
        where: { customerId: customer.id },
    })

    if (!chat) {
        chat = await prisma.chat.create({
            data: { customerId: customer.id },
        })
       // console.log('Created chat:', chat.id)

        // Add sample messages only if chat is new
        await prisma.message.createMany({
            data: [
                { chatId: chat.id, sender: 'user', content: 'Hi, where is my order?' },
                { chatId: chat.id, sender: 'agent', content: 'Checking right now...' },
            ],
        })
    }

    // Seed order (upsert so safe to re-run)
    await prisma.order.upsert({
        where: { orderNumber: 'ORD-12345' },
        update: {},
        create: {
            customerId: customer.id,
            orderNumber: 'ORD-12345',
            status: 'shipped',
            trackingUrl: 'https://track.example.com/abc123',
        },
    })

    // Seed invoice (upsert)
    await prisma.invoice.upsert({
        where: { invoiceNumber: 'INV-987' },
        update: {},
        create: {
            customerId: customer.id,
            invoiceNumber: 'INV-987',
            amount: 1499.0,
            status: 'paid',
        },
    })

    //console.log('Seed done! Open Prisma Studio or run queries to check.')
}

main()
    .catch((e) => {
        //console.error('Seed failed:', e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })