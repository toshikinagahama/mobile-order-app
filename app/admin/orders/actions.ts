'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'

export async function markOrderDelivered(orderId: number) {
  // Legacy support or "Deliver All"
  await prisma.order.update({
    where: { id: orderId },
    data: { status: 'DELIVERED' }
  })
  // Also mark all items as delivered
  await prisma.orderItem.updateMany({
    where: { orderId },
    data: { isDelivered: true }
  })
  revalidatePath('/admin/orders')
}

export async function toggleOrderItemDelivery(orderItemId: number, isDelivered: boolean) {
  await prisma.orderItem.update({
    where: { id: orderItemId },
    data: { isDelivered }
  })

  // Check if all items in the order are delivered
  const item = await prisma.orderItem.findUnique({
      where: { id: orderItemId },
      select: { orderId: true }
  })

  if (item) {
      const orderItems = await prisma.orderItem.findMany({
          where: { orderId: item.orderId }
      })
      
      const allDelivered = orderItems.every(i => i.isDelivered)
      
      if (allDelivered) {
          await prisma.order.update({
              where: { id: item.orderId },
              data: { status: 'DELIVERED' }
          })
      } else {
          // If unchecking, ensure order is PENDING
          await prisma.order.update({
              where: { id: item.orderId },
              data: { status: 'PENDING' }
          })
      }
  }

  revalidatePath('/admin/orders')
}
