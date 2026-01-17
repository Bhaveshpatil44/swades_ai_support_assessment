import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// Support tool: get last few messages
export async function getConversationHistory(chatId: number, limit = 5) {
    const history = await prisma.message.findMany({
        where: { chatId },
        orderBy: { sentAt: 'desc' },
        take: limit,
    })

    // infer type of one message from the array
    type Message = typeof history[number]

    return history as Message[]
}

// Order tool: find order by number
export async function getOrderDetails(orderNum: string) {
    const order = await prisma.order.findUnique({
        where: { orderNumber: orderNum },
    })

    type Order = typeof order

    if (!order) return "Couldn't find that order. Double-check the number?"

    return `Order ${order.orderNumber}: ${order.status.toUpperCase()}. ` +
        (order.trackingUrl ? `Track here: ${order.trackingUrl}` : 'No tracking yet.')
}

// Billing tool: find latest invoice
export async function getInvoiceDetails(customerId: number = 1) {
    const invoice = await prisma.invoice.findFirst({
        where: { customerId },
        orderBy: { id: 'desc' },
    })

    type Invoice = typeof invoice

    if (!invoice) return "No invoices found for your account."

    return `Invoice ${invoice.invoiceNumber}: $${invoice.amount} - Status: ${invoice.status.toUpperCase()}`
}