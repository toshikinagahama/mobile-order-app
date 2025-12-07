import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import { redirect } from 'next/navigation'

export default async function BillPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const tableId = parseInt(id)
  const table = await prisma.table.findUnique({
    where: { id: tableId },
    include: {
      orders: {
        where: { status: 'PENDING' },
        include: { items: { include: { product: true } } }
      }
    }
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

  const activeOrder = table.orders[0]
  const totalAmount = activeOrder ? activeOrder.items.reduce((sum, item) => sum + (item.price * item.quantity), 0) : 0

  return (
    <div className="min-h-screen bg-orange-50">
      <header className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link href={`/table/${tableId}`} className="text-orange-600 font-medium flex items-center">
            &larr; メニューへ戻る
          </Link>
          <h1 className="text-xl font-bold text-gray-900">お会計</h1>
          <div className="w-10"></div> {/* Spacer */}
        </div>
      </header>
      <main className="max-w-7xl mx-auto p-4">
        <div className="bg-white shadow-lg rounded-xl p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4">現在の注文</h2>
          {activeOrder ? (
            <div>
              <ul className="divide-y divide-orange-100 mb-4">
                {activeOrder.items.map(item => (
                  <li key={item.id} className="py-3 flex justify-between items-center">
                    <span className="font-medium text-gray-800">{item.product.name} x {item.quantity}</span>
                    <span className="text-gray-600">¥{(item.price * item.quantity).toLocaleString()}</span>
                  </li>
                ))}
              </ul>
              <div className="flex justify-between items-center border-t border-orange-200 pt-4">
                <span className="font-bold text-xl text-gray-900">合計</span>
                <span className="font-bold text-2xl text-orange-600">¥{totalAmount.toLocaleString()}</span>
              </div>
              <p className="mt-6 text-center text-gray-500 text-sm bg-gray-50 p-4 rounded-lg">
                レジにてお支払いをお願いいたします。
              </p>
            </div>
          ) : (
            <p className="text-gray-500 text-center py-8">現在のご注文はありません</p>
          )}
        </div>
      </main>
    </div>
  )
}
