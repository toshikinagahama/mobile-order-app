import { prisma } from '@/lib/prisma'
import { completeOrder, finishSession } from './actions'

export default async function TablePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const tableId = parseInt(id)
  const table = await prisma.table.findUnique({
    where: { id: tableId },
    include: {
      orders: {
        orderBy: { createdAt: 'desc' },
        include: { items: { include: { product: true } } }
      }
    }
  })

  if (!table) return <div>Table not found</div>

  const activeOrder = table.orders.find(o => o.status === 'PENDING' || o.status === 'BILL_REQUESTED')
  const pastOrders = table.orders.filter(o => o.status !== 'PENDING' && o.status !== 'BILL_REQUESTED')

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center">
            <h1 className="text-2xl font-semibold text-gray-900 mr-4">{table.name} Details</h1>
            {activeOrder?.status === 'BILL_REQUESTED' && (
                <span className="bg-orange-600 text-white px-3 py-1 rounded-full text-sm font-bold animate-pulse">
                    Checkout Requested
                </span>
            )}
        </div>
      </div>

      {/* Active Order */}
      <div className={`shadow sm:rounded-lg mb-8 p-6 ${activeOrder?.status === 'BILL_REQUESTED' ? 'bg-orange-50 border-2 border-orange-200' : 'bg-white'}`}>
        <h2 className="text-lg font-medium text-gray-900 mb-4">Active Order</h2>
        {activeOrder ? (
          <div>
            <ul className="divide-y divide-gray-200 mb-4">
              {activeOrder.items.map(item => (
                <li key={item.id} className="py-2 flex justify-between">
                  <span>{item.product.name} x {item.quantity}</span>
                  <span>¥{(item.price * item.quantity).toLocaleString()}</span>
                </li>
              ))}
            </ul>
            <div className="flex justify-between items-center border-t pt-4">
              <span className="font-bold text-xl">Total: ¥{activeOrder.items.reduce((sum, item) => sum + (item.price * item.quantity), 0).toLocaleString()}</span>
              <div className="flex space-x-2">
                 {/* Only allow Mark as Paid when pure pending if we want manual flow, but usually just finish session is enough if payment is done at register */}
                 {/* The user wants "Payment Finished" (Admin) -> Reset Table */}
                 
                 <form action={finishSession.bind(null, activeOrder.id)}>
                    <button type="submit" className="bg-green-600 text-white px-5 py-2 rounded font-bold hover:bg-green-700 shadow flex items-center">
                      <span className="mr-1">✓</span> 会計終了 (Finish & Reset)
                    </button>
                 </form>
              </div>
            </div>
          </div>
        ) : (
          <p className="text-gray-500">No active order</p>
        )}
      </div>

      {/* Order History */}
      <div className="bg-white shadow sm:rounded-lg p-6">
        <h2 className="text-lg font-medium text-gray-900 mb-4">Order History</h2>
        <ul className="divide-y divide-gray-200">
          {pastOrders.map(order => (
            <li key={order.id} className="py-4">
              <div className="flex justify-between mb-2">
                <span className="text-sm text-gray-500">{order.createdAt.toLocaleString()}</span>
                <span className="font-medium">¥{order.items.reduce((sum, item) => sum + (item.price * item.quantity), 0).toLocaleString()}</span>
              </div>
              <div className="text-sm text-gray-600">
                {order.items.map(item => `${item.product.name} x${item.quantity}`).join(', ')}
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
