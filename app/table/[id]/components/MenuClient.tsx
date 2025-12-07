'use client'

import { useState, useMemo } from 'react'
import { placeOrder, requestBill } from '../actions'

type Product = {
  id: number
  name: string
  price: number
  imageUrl: string | null
  category: string
  calories: number | null
  alcoholContent: number | null
  isSoldOut: boolean
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
  const [selectedCategory, setSelectedCategory] = useState<string>('Drink')
  const [billRequested, setBillRequested] = useState(initialBillRequested)
  const [showSuccessModal, setShowSuccessModal] = useState(false)

  const categories = Array.from(new Set(products.map(p => p.category)))
  
  // Custom sort order for categories
  const categoryOrder = ['Drink', 'Food', 'Dessert']
  categories.sort((a, b) => {
    return categoryOrder.indexOf(a) - categoryOrder.indexOf(b)
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
    setCart({})
    setIsCartOpen(false)
    alert('注文が完了しました！')
  }

  const handleRequestBill = async () => {
    if (confirm('お会計をお願いしますか？')) {
      await requestBill(tableId)
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
                    <span className="mx-2 font-medium w-4 text-center">{quantity}</span>
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

  return (
    <div className="flex h-[calc(100vh-4rem)]">
      {/* Sidebar */}
      <div className="w-24 bg-gray-100 overflow-y-auto border-r border-gray-200 flex-shrink-0">
        <ul className="py-2">
          {categories.map(category => (
            <li key={category}>
              <button
                onClick={() => setSelectedCategory(category)}
                className={`w-full py-4 px-1 text-center text-sm font-medium transition-colors ${
                  selectedCategory === category 
                    ? 'bg-white text-orange-600 border-l-4 border-orange-500 shadow-sm' 
                    : 'text-gray-500 hover:bg-gray-50'
                }`}
              >
                {category === 'Drink' && 'ドリンク'}
                {category === 'Food' && 'お料理'}
                {category === 'Dessert' && 'デザート'}
                {!['Drink', 'Food', 'Dessert'].includes(category) && category}
              </button>
            </li>
          ))}
        </ul>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto bg-gray-50 pb-24">
        <div className="p-4">
          <h2 className="text-xl font-bold text-gray-800 mb-4">
             {selectedCategory === 'Drink' && 'ドリンク'}
             {selectedCategory === 'Food' && 'お料理'}
             {selectedCategory === 'Dessert' && 'デザート'}
          </h2>
          <div className="grid grid-cols-1 gap-4">
            {filteredProducts.map(product => (
              <div key={product.id} className={`bg-white rounded-xl shadow-sm p-3 flex ${product.isSoldOut ? 'opacity-60 grayscale' : ''}`}>
                {product.imageUrl ? (
                  <img src={product.imageUrl} alt={product.name} className="w-28 h-28 object-cover rounded-lg mr-4 flex-shrink-0" />
                ) : (
                  <div className="w-28 h-28 bg-gray-200 rounded-lg mr-4 flex-shrink-0 flex items-center justify-center text-gray-400">No Image</div>
                )}
                <div className="flex-1 flex flex-col justify-between py-1">
                    <div>
                      <h3 className="font-bold text-lg text-gray-800 leading-tight mb-1">{product.name}</h3>
                      <p className="text-orange-600 font-bold">¥{product.price.toLocaleString()}</p>
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
                          <span className="px-2 font-bold text-gray-800 min-w-[1.5rem] text-center">{cart[product.id]}</span>
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
          
          <div className="mt-8 pt-6 border-t border-gray-200">
             <button
               onClick={handleRequestBill}
               disabled={billRequested}
               className={`w-full py-4 rounded-xl font-bold text-lg shadow-sm transition-colors ${
                 billRequested 
                   ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                   : 'bg-white text-gray-800 border-2 border-orange-500 text-orange-600 hover:bg-orange-50'
               }`}
             >
               {billRequested ? '会計呼出済み' : 'レジにて会計をお願いします'}
             </button>
             <p className="text-center text-gray-400 text-xs mt-2">
               ※ボタンを押すと店員がテーブルまで伺います
             </p>
          </div>
        </div>
      </div>

      {/* Floating Cart Button */}
      {totalItems > 0 && (
        <div className="fixed bottom-6 left-4 right-4 z-40">
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

      {/* Success Modal */}
      {showSuccessModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none">
          <div className="bg-black bg-opacity-80 text-white px-8 py-4 rounded-full shadow-2xl flex items-center animate-bounce-in">
            <span className="text-2xl mr-3">🙆‍♀️</span>
            <span className="font-bold text-lg">店員を呼び出しました</span>
          </div>
        </div>
      )}
    </div>
  )
}
