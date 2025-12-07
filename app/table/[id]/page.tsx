import { prisma } from '@/lib/prisma'
import MenuClient from './components/MenuClient'
import Link from 'next/link'
import { redirect } from 'next/navigation'

export default async function TableMenuPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const tableId = parseInt(id)
  const table = await prisma.table.findUnique({
    where: { id: tableId }
  })

  if (!table) return <div>Table not found</div>

  // Check for recent paid order
  const latestOrder = await prisma.order.findFirst({
    where: { tableId },
    orderBy: { updatedAt: 'desc' }
  })

  if (latestOrder && latestOrder.status === 'PAID') {
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000)
    if (latestOrder.updatedAt > fiveMinutesAgo) {
      redirect('/')
    }
  }

  // Check for active order status
  const activeOrder = await prisma.order.findFirst({
    where: { 
      tableId, 
      status: { in: ['PENDING', 'BILL_REQUESTED'] } 
    }
  })

  const products = await prisma.product.findMany({
    orderBy: { id: 'asc' }
  })

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <h1 className="text-xl font-bold text-gray-900">{table.name}</h1>
          <Link href={`/table/${tableId}/bill`} className="text-orange-600 font-medium">
            お会計
          </Link>
        </div>
      </header>
      <main className="max-w-7xl mx-auto">
        <MenuClient 
            tableId={tableId} 
            products={products} 
            initialBillRequested={activeOrder?.status === 'BILL_REQUESTED'} 
        />
      </main>
    </div>
  )
}
