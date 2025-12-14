import { prisma } from '@/lib/prisma'
import OrderListClient from './OrderListClient'

export const dynamic = 'force-dynamic'

export default async function OrdersPage() {
  const orders = await prisma.order.findMany({
    where: {
      status: 'PENDING'
    },
    include: {
      table: true,
      items: {
        include: {
          product: true
        }
      }
    },
    orderBy: {
      createdAt: 'asc' // Oldest orders first
    }
  })

  // Serialize dates just in case Next.js complains about passing Date objects to Client Components
  const serializedOrders = orders.map(order => ({
      ...order,
      createdAt: order.createdAt.toISOString(),
      items: order.items.map(item => ({
          ...item,
          price: Number(item.price) // Ensure serializable number
      }))
  }))

  return (
    <div className="p-4 bg-gray-50 min-h-screen">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Active Orders (Kitchen)</h1>
      <OrderListClient orders={serializedOrders} />
    </div>
  )
}
