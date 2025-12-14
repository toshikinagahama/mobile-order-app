'use client'

import { useState } from 'react'
import { toggleProductStock } from '../products/actions'

type Product = {
  id: number
  name: string
  price: number
  imageUrl: string | null
  category: string
  isSoldOut: boolean
}

export default function StockClient({ 
    products, 
    categories 
}: { 
    products: Product[], 
    categories: string[] 
}) {
  const [selectedCategory, setSelectedCategory] = useState(categories[0] || 'ドリンク')

  const filteredProducts = products.filter(p => p.category === selectedCategory)

  return (
    <div className="space-y-6">
      {/* Category Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8 overflow-x-auto" aria-label="Tabs">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`
                whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors
                ${selectedCategory === category
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}
              `}
            >
              {category}
            </button>
          ))}
        </nav>
      </div>

      {/* Product List */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        {filteredProducts.length === 0 ? (
           <div className="p-8 text-center text-gray-500">No products in this category.</div>
        ) : (
            <ul className="divide-y divide-gray-200">
            {filteredProducts.map(product => (
                <li key={product.id} className={`px-4 py-4 flex items-center justify-between ${product.isSoldOut ? 'bg-gray-50' : ''}`}>
                    <div className="flex items-center">
                        <div className={`w-3 h-3 rounded-full mr-3 ${product.isSoldOut ? 'bg-red-500' : 'bg-green-500'}`}></div>
                        <div>
                            <p className={`font-medium text-lg ${product.isSoldOut ? 'text-gray-500 line-through' : 'text-gray-900'}`}>
                                {product.name}
                            </p>
                            <p className="text-sm text-gray-500">¥{product.price.toLocaleString()}</p>
                        </div>
                    </div>
                    
                    <form action={toggleProductStock.bind(null, product.id, !product.isSoldOut)}>
                        <button 
                            type="submit"
                            className={`px-6 py-2 rounded-full font-bold text-sm shadow-sm transition-colors ${
                                product.isSoldOut 
                                    ? 'bg-red-100 text-red-700 hover:bg-red-200 border border-red-200' 
                                    : 'bg-green-100 text-green-700 hover:bg-green-200 border border-green-200'
                            }`}
                        >
                            {product.isSoldOut ? 'Sold Out' : 'In Stock'}
                        </button>
                    </form>
                </li>
            ))}
            </ul>
        )}
      </div>
    </div>
  )
}
