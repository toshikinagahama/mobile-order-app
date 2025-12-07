'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'

export async function placeOrder(tableId: number, items: { productId: number; quantity: number }[]) {
  if (items.length === 0) return

  // Check if there is an active order
  let order = await prisma.order.findFirst({
    where: { tableId, status: 'PENDING' }
  })

  if (!order) {
    order = await prisma.order.create({
      data: {
        tableId,
        status: 'PENDING',
      }
    })
  }

  // Add items
  // We need to get current prices
  const products = await prisma.product.findMany({
    where: { id: { in: items.map(i => i.productId) } }
  })

  const orderItemsData = items.map(item => {
    const product = products.find(p => p.id === item.productId)
    if (!product) throw new Error(`Product ${item.productId} not found`)
    return {
      orderId: order!.id,
      productId: item.productId,
      quantity: item.quantity,
      price: product.price
    }
  })

  await prisma.orderItem.createMany({
    data: orderItemsData
  })

  // Recalculate total for the order
  const allItems = await prisma.orderItem.findMany({
    where: { orderId: order.id }
  })
  const total = allItems.reduce((sum, item) => sum + (item.price * item.quantity), 0)

  await prisma.order.update({
    where: { id: order.id },
    data: { totalAmount: total }
  })

  revalidatePath(`/table/${tableId}`)
  revalidatePath('/admin')
}

export async function requestBill(tableId: number) {
  const order = await prisma.order.findFirst({
    where: { tableId, status: 'PENDING' }
  })

  if (order) {
    await prisma.order.update({
      where: { id: order.id },
      data: { status: 'BILL_REQUESTED' }
    })
    revalidatePath(`/table/${tableId}`)
    revalidatePath('/admin')
  }
}
