'use client'

import { useState, useMemo, useEffect } from 'react'
import { placeOrder, requestBill } from '../actions'
// import { socket } from '@/lib/socket'
import { useRouter } from 'next/navigation'
import { getOrderHistory } from '../history-actions'

type Product = {
  id: number
  name: string
  price: number
  imageUrl: string | null
  category: string
  calories: number | null
  alcoholContent: number | null
  isSoldOut: boolean
  unit: string
  quantityStep: number
}

export default function MenuClient({ 
    tableId, 
    products, 
    initialBillRequested = false 
}: { 
    tableId: number, 
    products: Product[],
    initialBillRequested?: boolean 
}) {
  const [cart, setCart] = useState<Record<number, number>>({})
  const [isCartOpen, setIsCartOpen] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState<string>('ドリンク')
  const [billRequested, setBillRequested] = useState(initialBillRequested)
  const [showSuccessModal, setShowSuccessModal] = useState(false)
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [isHistoryOpen, setIsHistoryOpen] = useState(false)
  const [orderHistory, setOrderHistory] = useState<any[]>([])
  const router = useRouter()

  useEffect(() => {
    // Socket logic removed
    // We can rely on router.refresh() or manual reload if needed if the table status changes externally
  }, [tableId, router])

  const categories = Array.from(new Set(products.map(p => p.category)))
  const categoryOrder = ['ドリンク', 'アルコール', 'スピード', 'おつまみ', '野菜', '肉', '魚', 'お米', '麺', 'デザート']
  categories.sort((a, b) => {
    const indexA = categoryOrder.indexOf(a)
    const indexB = categoryOrder.indexOf(b)
    // If both are in the known list, sort by index
    if (indexA !== -1 && indexB !== -1) return indexA - indexB
    // If only A is known, it comes first
    if (indexA !== -1) return -1
    // If only B is known, it comes first
    if (indexB !== -1) return 1
    // Otherwise alphabetical
    return a.localeCompare(b)
  })

  // Sync with prop if it changes (revalidation)
  useMemo(() => {
    if (initialBillRequested) {
        setBillRequested(true)
    }
  }, [initialBillRequested])

  const filteredProducts = products.filter(p => p.category === selectedCategory)

  const addToCart = (productId: number) => {
    setCart(prev => ({ ...prev, [productId]: (prev[productId] || 0) + 1 }))
  }

  const removeFromCart = (productId: number) => {
    setCart(prev => {
      const newCount = (prev[productId] || 0) - 1
      if (newCount <= 0) {
        const { [productId]: _, ...rest } = prev
        return rest
      }
      return { ...prev, [productId]: newCount }
    })
  }

  const cartItems = Object.entries(cart).map(([id, quantity]) => {
    const product = products.find(p => p.id === parseInt(id))
    return { product, quantity }
  }).filter(item => item.product)

  const totalAmount = cartItems.reduce((sum, { product, quantity }) => sum + (product!.price * quantity), 0)
  const totalItems = Object.values(cart).reduce((a, b) => a + b, 0)

  const handlePlaceOrder = async () => {
    const items = Object.entries(cart).map(([id, quantity]) => ({
      productId: parseInt(id),
      quantity
    }))
    await placeOrder(tableId, items)
    // socket.emit('order_placed', { tableId, type: 'order' })
    setCart({})
    setIsCartOpen(false)
    alert('注文が完了しました！')
    // Refresh history
    const history = await getOrderHistory(tableId)
    setOrderHistory(history)
  }

  // Load history when component mounts or history drawer opens
  useEffect(() => {
    if (isHistoryOpen) {
        getOrderHistory(tableId).then(setOrderHistory)
    }
  }, [isHistoryOpen, tableId])

  const handleRequestBill = async () => {
    if (confirm('お会計をお願いしますか？')) {
      await requestBill(tableId)
      // socket.emit('order_placed', { tableId, type: 'bill_request' })
      setBillRequested(true)
      setShowSuccessModal(true)
      // Auto close success modal after 3 seconds
      setTimeout(() => setShowSuccessModal(false), 3000)
    }
  }

  if (isCartOpen) {
    return (
      <div className="fixed inset-0 bg-white z-50 flex flex-col">
        <div className="p-4 border-b flex justify-between items-center bg-orange-50">
          <h2 className="text-xl font-bold text-gray-800">カート</h2>
          <button onClick={() => setIsCartOpen(false)} className="text-gray-500 font-medium">閉じる</button>
        </div>
        <div className="flex-1 overflow-y-auto p-4">
          {cartItems.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-gray-400">
              <p>カートは空です</p>
            </div>
          ) : (
            <ul className="divide-y divide-orange-100">
              {cartItems.map(({ product, quantity }) => (
                <li key={product!.id} className="py-4 flex justify-between items-center">
                  <div className="flex items-center">
                     {product!.imageUrl && (
                      <img src={product!.imageUrl} alt={product!.name} className="w-16 h-16 object-cover rounded-md mr-3" />
                    )}
                    <div>
                      <p className="font-bold text-gray-800">{product!.name}</p>
                      <p className="text-sm text-gray-500">¥{product!.price.toLocaleString()}</p>
                    </div>
                  </div>
                    <div className="flex items-center bg-gray-100 rounded-lg p-1">
                     <button onClick={() => removeFromCart(product!.id)} className="w-8 h-8 flex items-center justify-center text-gray-600 font-bold">-</button>
                     <span className="mx-2 font-medium min-w-[3rem] text-center text-gray-900">
                        {quantity * product!.quantityStep}{product!.unit}
                     </span>
                     <button onClick={() => addToCart(product!.id)} className="w-8 h-8 flex items-center justify-center text-orange-600 font-bold">+</button>
                   </div>
                </li>
              ))}
            </ul>
          )}
        </div>
        <div className="p-4 border-t bg-white shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)]">
          <div className="flex justify-between mb-4 text-lg font-bold text-gray-800">
            <span>合計</span>
            <span>¥{totalAmount.toLocaleString()}</span>
          </div>
          <button 
            onClick={handlePlaceOrder}
            disabled={cartItems.length === 0}
            className="w-full bg-orange-500 text-white py-3 rounded-full font-bold text-lg shadow-md hover:bg-orange-600 disabled:bg-gray-300 disabled:shadow-none transition-colors"
          >
            注文を確定する
          </button>
        </div>
      </div>
    )
  }

  // ... (inside component)
  // Placeholder for where hook used to be

  // ...

  return (
    <div className="flex h-[calc(100vh-4rem)] relative">
      {/* Mobile Hamburger Button */}
      {!isSidebarOpen && (
        <button 
            onClick={() => setIsSidebarOpen(true)}
            className="md:hidden absolute top-4 left-4 z-30 bg-white p-2 rounded-full shadow-lg text-orange-500"
        >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
        </button>
      )}

      {/* Sidebar Overlay (Mobile) */}
      {isSidebarOpen && (
        <div className="fixed inset-0 z-40 bg-black bg-opacity-50 md:hidden" onClick={() => setIsSidebarOpen(false)}></div>
      )}

      {/* Sidebar */}
      <div className={`
          fixed inset-y-0 left-0 z-50 w-64 bg-gray-100 border-r border-gray-200 transform transition-transform duration-300 ease-in-out
          md:relative md:translate-x-0 md:w-24 md:block
          ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
         {/* Mobile Close Button */}
         <div className="md:hidden p-4 flex justify-end">
             <button onClick={() => setIsSidebarOpen(false)} className="text-gray-500">
                 <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                 </svg>
             </button>
         </div>

        <div className="px-4 pb-4">
            <button 
                onClick={() => setIsHistoryOpen(true)}
                className="w-full bg-indigo-600 text-white py-2 rounded-lg font-bold shadow-md hover:bg-indigo-700 transition-colors mb-4"
            >
                注文履歴
            </button>
        </div>

        <ul className="py-2 overflow-y-auto h-full">
          {categories.map(category => (
            <li key={category}>
              <button
                onClick={() => {
                    setSelectedCategory(category)
                    setIsSidebarOpen(false)
                }}
                className={`w-full py-4 px-4 md:px-1 text-left md:text-center text-base md:text-sm font-medium transition-colors border-l-4 ${
                  selectedCategory === category 
                    ? 'bg-white text-orange-600 border-orange-500 shadow-sm' 
                    : 'text-gray-500 hover:bg-gray-50 border-transparent'
                }`}
              >
                {category}
              </button>
            </li>
          ))}
        </ul>
      </div>

      {/* Right Side Wrapper */}
      <div className="flex-1 relative flex flex-col overflow-hidden">
        {/* Main Content */}
        <div className="flex-1 overflow-y-auto bg-gray-50 pb-24 md:pl-0">
          <div className="p-4">
            <h2 className="text-xl font-bold text-gray-800 mb-4">
               {categoryOrder.includes(selectedCategory) ? selectedCategory : 'その他'}
            </h2>
            <div className="grid grid-cols-1 gap-4">
              {filteredProducts.map(product => (
                <div key={product.id} className={`rounded-xl shadow-sm p-3 flex ${product.isSoldOut ? 'bg-gray-100 opacity-60 grayscale' : 'bg-white'}`}>
                  {product.imageUrl ? (
                    <img src={product.imageUrl} alt={product.name} className="w-28 h-28 object-cover rounded-lg mr-4 flex-shrink-0" />
                  ) : (
                    <div className="w-28 h-28 bg-gray-200 rounded-lg mr-4 flex-shrink-0 flex items-center justify-center text-gray-400">No Image</div>
                  )}
                  <div className="flex-1 flex flex-col justify-between py-1">
                      <div>
                        <h3 className="font-bold text-lg text-gray-800 leading-tight mb-1">{product.name}</h3>
                        <p className="text-orange-600 font-bold">
                          ¥{product.price.toLocaleString()} 
                          <span className="text-sm text-gray-500 font-normal ml-1">
                              / {product.quantityStep}{product.unit}
                          </span>
                        </p>
                        <div className="text-xs text-gray-500 mt-1">
                          {product.calories !== null && <span className="mr-2">🔥 {product.calories} kcal</span>}
                          {product.alcoholContent !== null && product.alcoholContent > 0 && <span>🍷 {product.alcoholContent} mg</span>}
                        </div>
                      </div>
                    
                    {product.isSoldOut ? (
                      <span className="text-red-500 font-bold text-sm bg-red-50 px-2 py-1 rounded self-start">売り切れ</span>
                    ) : (
                      <div className="flex justify-end mt-2">
                        {cart[product.id] ? (
                          <div className="flex items-center bg-orange-50 rounded-full border border-orange-200 shadow-sm">
                            <button onClick={() => removeFromCart(product.id)} className="w-8 h-8 flex items-center justify-center text-gray-600 font-bold hover:bg-orange-100 rounded-full transition-colors">-</button>
                            <span className="px-2 font-bold text-gray-800 min-w-[3rem] text-center">
                              {cart[product.id] * product.quantityStep}{product.unit}
                            </span>
                            <button onClick={() => addToCart(product.id)} className="w-8 h-8 flex items-center justify-center text-orange-600 font-bold hover:bg-orange-100 rounded-full transition-colors">+</button>
                          </div>
                        ) : (
                          <button 
                            onClick={() => addToCart(product.id)} 
                            className="px-6 py-2 bg-orange-500 text-white rounded-full text-sm font-bold shadow-md hover:bg-orange-600 transition-colors active:scale-95"
                          >
                            追加
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
            
            {/* Bill request section removed */}
          </div>
        </div>

        {/* Floating Cart Button */}
        {totalItems > 0 && (
          <div className="absolute bottom-6 left-4 right-4 z-40">
            <button 
              onClick={() => setIsCartOpen(true)}
              className="w-full bg-gray-900 text-white p-4 rounded-full shadow-xl flex justify-between items-center transform transition-transform active:scale-95"
            >
              <div className="flex items-center">
                <span className="bg-orange-500 text-white text-xs font-bold px-2 py-1 rounded-full mr-3 min-w-[1.5rem]">{totalItems}</span>
                <span className="font-bold">カートを見る</span>
              </div>
              <span className="font-bold text-lg">¥{totalAmount.toLocaleString()}</span>
            </button>
          </div>
        )}
      </div>

      {/* Success Modal */}
      {showSuccessModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none">
          <div className="bg-black bg-opacity-80 text-white px-8 py-4 rounded-full shadow-2xl flex items-center animate-bounce-in">
            <span className="text-2xl mr-3">🙆‍♀️</span>
            <span className="font-bold text-lg">店員を呼び出しました</span>
          </div>
        </div>
      )}

      {/* Order History Drawer */}
      {isHistoryOpen && (
        <div className="fixed inset-0 z-50 flex justify-end">
           <div className="absolute inset-0 bg-black bg-opacity-50" onClick={() => setIsHistoryOpen(false)}></div>
           <div className="relative w-full max-w-md bg-white h-full shadow-xl flex flex-col animate-slide-in-right">
              <div className="p-4 border-b flex justify-between items-center bg-indigo-50">
                  <h2 className="text-xl font-bold text-gray-800">注文履歴</h2>
                  <button onClick={() => setIsHistoryOpen(false)} className="text-gray-500">閉じる</button>
              </div>
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                  {orderHistory.length === 0 ? (
                      <p className="text-center text-gray-500 py-8">注文履歴はありません</p>
                  ) : (
                      orderHistory.map((order) => (
                          <div key={order.id} className="border rounded-lg p-4 shadow-sm bg-white">
                              <div className="flex justify-between items-center mb-2 border-b pb-2">
                                  <span className="text-sm text-gray-500">
                                      {new Date(order.createdAt).toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit', hour12: false })}
                                  </span>
                                  {/* Order level status hidden in favor of item level, or shown as summary */}
                              </div>
                              <ul className="space-y-2">
                                  {order.items.map((item: any) => (
                                      <li key={item.id} className="flex justify-between items-center text-sm">
                                          <div className="flex items-center">
                                              <span className="text-gray-800 mr-2">{item.product.name}</span>
                                              <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                                  item.isDelivered 
                                                      ? 'bg-green-100 text-green-800' 
                                                      : 'bg-orange-100 text-orange-800'
                                              }`}>
                                                  {item.isDelivered ? '到着済み' : '調理中'}
                                              </span>
                                          </div>
                                          <span className="font-medium">x{item.quantity}</span>
                                      </li>
                                  ))}
                              </ul>
                          </div>
                      ))
                  )}
              </div>
           </div>
        </div>
      )}
    </div>
  )
}
