import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()


async function trackOrder(orderNumber: string) {
  const order = await prisma.order.findUnique({ where: { orderNumber } })

  if (!order) {
    return `Couldn't find order ${orderNumber}. Please double‑check the number.`
  }

  return `Order ${order.orderNumber}: ${order.status}. Track here: ${order.trackingUrl ?? 'N/A'}`
}


export const orderAgent = async (userMessage: string) => {
  const match = userMessage.match(/ORD-\d+/i)
  const orderNum = match ? match[0] : 'ORD-12345' // fallback to seeded 
  return trackOrder(orderNum)
}