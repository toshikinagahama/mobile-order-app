'use server'

import { prisma } from '@/lib/prisma'

export async function getOrderHistory(tableId: number) {
  const orders = await prisma.order.findMany({
    where: {
      tableId,
      status: { in: ['PENDING', 'DELIVERED'] } // Show active and delivered (but not paid/archived)
    },
    include: {
      items: {
        include: {
          product: true
        }
      }
    },
    orderBy: {
      createdAt: 'desc' // Newest first
    }
  })
  return orders
}
