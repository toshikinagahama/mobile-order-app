import { prisma } from '@/lib/prisma'
import Link from 'next/link'

export default async function AdminDashboard() {
  const tables = await prisma.table.findMany({
    include: {
      orders: {
        where: { status: 'PENDING' },
        include: { items: true }
      }
    }
  })

  return (
    <div>
      <h1 className="text-2xl font-semibold text-gray-900 mb-6">Table Overview</h1>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {tables.map((table) => {
          const activeOrder = table.orders[0]
          const totalAmount = activeOrder ? activeOrder.items.reduce((sum, item) => sum + (item.price * item.quantity), 0) : 0
          
          return (
            <Link key={table.id} href={`/admin/table/${table.id}`} className="block">
              <div className={`bg-white overflow-hidden shadow rounded-lg hover:shadow-md transition-shadow ${activeOrder ? 'border-l-4 border-green-500' : 'border-l-4 border-gray-200'}`}>
                <div className="px-4 py-5 sm:p-6">
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    {table.name}
                  </dt>
                  <dd className="mt-1 text-3xl font-semibold text-gray-900">
                    {activeOrder ? `¥${totalAmount.toLocaleString()}` : 'Empty'}
                  </dd>
                  {activeOrder && (
                    <p className="mt-2 text-sm text-green-600">
                      Active Order
                    </p>
                  )}
                </div>
              </div>
            </Link>
          )
        })}
      </div>
    </div>
  )
}
