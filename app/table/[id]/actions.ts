'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'

export async function placeOrder(tableId: number, items: { productId: number; quantity: number }[]) {
  if (items.length === 0) return

  // Create a new Order (Batch) for every submission
  const order = await prisma.order.create({
    data: {
      tableId,
      status: 'PENDING',
    }
  })

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

  // Create Print Job
  const table = await prisma.table.findUnique({ where: { id: tableId } })
  const newItemsDetails = orderItemsData.map(item => {
    const p = products.find(p => p.id === item.productId)
    return { name: p?.name || 'Unknown', quantity: item.quantity }
  })

  await prisma.printJob.create({
    data: {
      type: 'ORDER',
      payload: JSON.stringify({
        tableName: table?.name || `Table ${tableId}`,
        items: newItemsDetails
      })
    }
  })

  revalidatePath(`/table/${tableId}`)
  revalidatePath('/admin')
}

export async function requestBill(tableId: number) {
  // Find all active orders (PENDING or DELIVERED)
  const orders = await prisma.order.findMany({
    where: { 
        tableId, 
        status: { in: ['PENDING', 'DELIVERED'] } // New status DELIVERED
    }
  })

  if (orders.length > 0) {
    // Update all to BILL_REQUESTED
    await prisma.order.updateMany({
      where: { 
          id: { in: orders.map(o => o.id) } 
      },
      data: { status: 'BILL_REQUESTED' }
    })

    // Create Print Job
    const table = await prisma.table.findUnique({ where: { id: tableId } })
    await prisma.printJob.create({
      data: {
        type: 'BILL',
        payload: JSON.stringify({
          tableName: table?.name || `Table ${tableId}`,
          orderCount: orders.length
        })
      }
    })

    revalidatePath(`/table/${tableId}`)
    revalidatePath('/admin')
  }
}
