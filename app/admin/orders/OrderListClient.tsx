'use client'

import { markOrderDelivered, toggleOrderItemDelivery } from './actions'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

type OrderItem = {
  id: number
  productId: number
  quantity: number
  price: number
  isDelivered: boolean
  product: {
    name: string
  }
}

type Order = {
  id: number
  table: {
    name: string
  }
  createdAt: string
  items: OrderItem[]
}

export default function OrderListClient({ orders }: { orders: Order[] }) {
  const router = useRouter()

  useEffect(() => {
    // Auto refresh every 10 seconds to check for new orders
    const interval = setInterval(() => {
      router.refresh()
    }, 10000)
    return () => clearInterval(interval)
  }, [router])

  if (orders.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 text-lg">No active orders</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {orders.map(order => (
        <div key={order.id} className="bg-white shadow rounded-lg overflow-hidden border-2 border-orange-500">
          <div className="bg-orange-500 px-4 py-3 flex justify-between items-center text-white">
            <h2 className="text-xl font-bold">{order.table.name}</h2>
            <span className="text-sm font-medium">
               {new Date(order.createdAt).toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit', hour12: false })}
            </span>
          </div>
          <div className="p-4">
            <ul className="divide-y divide-gray-100 mb-4">
              {order.items.map(item => (
                <li key={item.id} className="py-2 flex justify-between items-center">
                    <div className="flex items-center space-x-3">
                        <input 
                            type="checkbox" 
                            checked={item.isDelivered} 
                            onChange={() => toggleOrderItemDelivery(item.id, !item.isDelivered)}
                            className="h-6 w-6 text-green-600 rounded focus:ring-green-500 border-gray-300"
                        />
                        <span className={`font-bold text-lg ${item.isDelivered ? 'text-gray-400 line-through' : 'text-gray-800'}`}>
                            {item.product.name}
                        </span>
                    </div>
                    <span className="bg-gray-100 px-3 py-1 rounded-full font-bold text-gray-700">x{item.quantity}</span>
                </li>
              ))}
            </ul>
            <form action={markOrderDelivered.bind(null, order.id)}>
                <button 
                    type="submit"
                    className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold py-3 rounded-lg shadow transition-colors text-sm"
                >
                    まとめて提供完了 (All Delivered)
                </button>
            </form>
          </div>
        </div>
      ))}
    </div>
  )
}
