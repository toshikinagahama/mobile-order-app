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

  // Sales Report Data Aggregation
  const completedOrders = await prisma.order.findMany({
    where: {
      status: { in: ['PAID', 'COMPLETED'] }
    },
    include: {
      table: true
    },
    orderBy: {
      updatedAt: 'desc'
    }
  })

  type DayData = {
    total: number
    byTable: Record<string, number>
  }

  const dailySales: Record<string, DayData> = {}

  for (const order of completedOrders) {
    // Simple YYYY-MM-DD formatting
    const date = order.updatedAt.toISOString().split('T')[0]
    
    if (!dailySales[date]) {
      dailySales[date] = { total: 0, byTable: {} }
    }

    dailySales[date].total += order.totalAmount
    
    const tableName = order.table.name
    if (!dailySales[date].byTable[tableName]) {
        dailySales[date].byTable[tableName] = 0
    }
    dailySales[date].byTable[tableName] += order.totalAmount
  }

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

      <div className="mt-12">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Sales Report (Daily x Table)</h2>
        <div className="bg-white shadow overflow-hidden sm:rounded-md">
           <ul className="divide-y divide-gray-200">
             {Object.entries(dailySales).map(([date, dayData]) => (
               <li key={date} className="px-4 py-4 sm:px-6">
                 <div className="flex items-center justify-between mb-2">
                    <h3 className="text-lg font-medium text-gray-900">{date}</h3>
                    <span className="px-3 py-1 rounded-full text-sm font-semibold bg-green-100 text-green-800">
                      Total: ¥{dayData.total.toLocaleString()}
                    </span>
                 </div>
                 <div className="mt-2 border-t border-gray-100 pt-2">
                    <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                       {Object.entries(dayData.byTable).map(([tableName, amount]) => (
                          <li key={tableName} className="text-sm text-gray-600 flex justify-between">
                             <span>{tableName}</span>
                             <span className="font-medium">¥{amount.toLocaleString()}</span>
                          </li>
                       ))}
                    </ul>
                 </div>
               </li>
             ))}
             {Object.keys(dailySales).length === 0 && (
                <li className="px-4 py-4 text-gray-500 text-center text-sm">No sales data available.</li>
             )}
           </ul>
        </div>
      </div>
    </div>
  )
}
