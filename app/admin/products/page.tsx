import { prisma } from '@/lib/prisma'
import { addProduct, toggleProductStock } from './actions'
import DeleteProductButton from './DeleteProductButton'

export default async function ProductsPage() {
  const products = await prisma.product.findMany({
    orderBy: { id: 'asc' }
  })
  
  const existingCategories = Array.from(new Set(products.map(p => p.category))).sort()

  return (
    <div>
      <h1 className="text-2xl font-semibold text-gray-900 mb-6">Product Management</h1>
      
      {/* Add Product Form */}
      <div className="bg-white shadow sm:rounded-lg mb-8 p-6">
        <h2 className="text-lg font-medium text-gray-900 mb-4">Add New Product</h2>
        <form action={addProduct} className="space-y-4 sm:flex sm:space-y-0 sm:space-x-4 items-end">
          <div className="flex-grow">
            <label htmlFor="name" className="block text-sm font-medium text-gray-700">Name</label>
            <input type="text" name="name" id="name" required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm border p-2 text-gray-900" />
          </div>
          <div>
            <label htmlFor="price" className="block text-sm font-medium text-gray-700">Price</label>
            <input type="number" name="price" id="price" required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm border p-2 text-gray-900" />
          </div>
          <div>
            <label htmlFor="calories" className="block text-sm font-medium text-gray-700">Kcal</label>
            <input type="number" name="calories" id="calories" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm border p-2 text-gray-900" />
          </div>
          <div>
            <label htmlFor="alcoholContent" className="block text-sm font-medium text-gray-700">Alc (mg)</label>
            <input type="number" step="0.1" name="alcoholContent" id="alcoholContent" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm border p-2 text-gray-900" />
          </div>
          <div>
            <label htmlFor="category" className="block text-sm font-medium text-gray-700">Category</label>
            <select name="category" id="category" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm border p-2 text-gray-900">
              {existingCategories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
            <input 
                type="text" 
                name="newCategory" 
                placeholder="Or create new..." 
                className="mt-2 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm border p-2 bg-gray-50 text-gray-900" 
            />
          </div>
          <div>
            <label htmlFor="unit" className="block text-sm font-medium text-gray-700">Unit</label>
            <input type="text" name="unit" id="unit" placeholder="点" defaultValue="点" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm border p-2 text-gray-900" />
          </div>
          <div>
            <label htmlFor="quantityStep" className="block text-sm font-medium text-gray-700">Step</label>
            <input type="number" name="quantityStep" id="quantityStep" defaultValue="1" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm border p-2 text-gray-900" />
          </div>
          <div className="flex-grow">
            <label htmlFor="imageUrl" className="block text-sm font-medium text-gray-700">Image (URL or File)</label>
            <div className="space-y-2">
                <input type="text" name="imageUrl" id="imageUrl" className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm border p-2 text-gray-900" placeholder="https://..." />
                <div className="text-xs text-center text-gray-500">- OR -</div>
                <input type="file" name="imageFile" accept="image/*" className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100" />
            </div>
          </div>
          <button type="submit" className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
            Add
          </button>
        </form>
      </div>

      {/* Product List */}
      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        <ul className="divide-y divide-gray-200">
          {products.map((product) => (
            <li key={product.id} className="px-4 py-4 sm:px-6 flex items-center justify-between">
              <div className="flex items-center">
                {product.imageUrl && (
                  <img src={product.imageUrl} alt={product.name} className="h-10 w-10 rounded-full mr-4 object-cover" />
                )}
                <div>
                  <p className="text-sm font-medium text-indigo-600 truncate">{product.name}</p>
                  <p className="flex items-center text-sm text-gray-500">
                    ¥{product.price.toLocaleString()}
                    {product.calories !== null && <span className="ml-2 text-xs">🔥 {product.calories} kcal</span>}
                    {product.alcoholContent !== null && product.alcoholContent > 0 && <span className="ml-2 text-xs">🍷 {product.alcoholContent} mg</span>}
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <a href={`/admin/products/${product.id}`} className="text-gray-400 hover:text-indigo-600">
                  <span className="sr-only">Edit</span>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                  </svg>
                </a>
                <form action={toggleProductStock.bind(null, product.id, !product.isSoldOut)}>
                  <button 
                    type="submit"
                    className={`px-3 py-1 rounded-full text-xs font-medium ${product.isSoldOut ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}`}
                  >
                    {product.isSoldOut ? 'Sold Out' : 'In Stock'}
                  </button>
                </form>
                <DeleteProductButton id={product.id} />
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
