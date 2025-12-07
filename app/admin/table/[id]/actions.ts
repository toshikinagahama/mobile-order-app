'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'

export async function completeOrder(orderId: number) {
  await prisma.order.update({
    where: { id: orderId },
    data: { status: 'PAID' },
  })
  revalidatePath('/admin')
}

export async function finishSession(orderId: number) {
  await prisma.order.update({
    where: { id: orderId },
    data: { status: 'COMPLETED' },
  })
  revalidatePath('/admin')
}
