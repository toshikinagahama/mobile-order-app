
import { prisma } from '@/lib/prisma'
import { updateProduct } from '../actions'
import { redirect } from 'next/navigation'

export default async function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const productId = parseInt(id)
  
  if (isNaN(productId)) {
    redirect('/admin/products')
  }

  const product = await prisma.product.findUnique({
    where: { id: productId }
  })

  if (!product) {
    return <div>Product not found</div>
  }

  return (
    <div>
      <div className="flex items-center mb-6">
          <a href="/admin/products" className="mr-4 text-gray-500 hover:text-gray-700">
            &larr; Back
          </a>
          <h1 className="text-2xl font-semibold text-gray-900">Edit Product: {product.name}</h1>
      </div>

      <div className="bg-white shadow sm:rounded-lg p-6 max-w-2xl">
        <form action={updateProduct.bind(null, productId)} className="space-y-6">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700">Name</label>
            <input 
                type="text" 
                name="name" 
                id="name" 
                required 
                defaultValue={product.name}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm border p-2" 
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="price" className="block text-sm font-medium text-gray-700">Price (¥)</label>
                <input 
                    type="number" 
                    name="price" 
                    id="price" 
                    required 
                    defaultValue={product.price}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm border p-2" 
                />
              </div>
              
               <div>
                 <label htmlFor="category" className="block text-sm font-medium text-gray-700">Category</label>
                 <select 
                   name="category" 
                   id="category" 
                   disabled // Category editing not requested yet, keeping safety
                   defaultValue={product.category}
                   className="mt-1 block w-full rounded-md border-gray-300 bg-gray-100 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm border p-2 text-gray-500"
                 >
                   <option value="Drink">Drink</option>
                   <option value="Food">Food</option>
                   <option value="Dessert">Dessert</option>
                 </select>
                 <p className="text-xs text-gray-400 mt-1">Category cannot be changed currently</p>
               </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
                <label htmlFor="calories" className="block text-sm font-medium text-gray-700">Calories (kcal)</label>
                <input 
                    type="number" 
                    name="calories" 
                    id="calories" 
                    defaultValue={product.calories ?? ''}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm border p-2" 
                />
            </div>
            <div>
                <label htmlFor="alcoholContent" className="block text-sm font-medium text-gray-700">Alcohol Content (mg)</label>
                <input 
                    type="number" 
                    step="0.1" 
                    name="alcoholContent" 
                    id="alcoholContent" 
                    defaultValue={product.alcoholContent ?? ''}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm border p-2" 
                />
            </div>
          </div>

          <div>
            <label htmlFor="imageUrl" className="block text-sm font-medium text-gray-700">Image (URL or File)</label>
            <div className="space-y-2 mt-1">
                <input 
                    type="text" 
                    name="imageUrl" 
                    id="imageUrl" 
                    defaultValue={product.imageUrl ?? ''}
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm border p-2"
                    placeholder="https://..."
                />
                <div className="text-xs text-gray-500">- OR Upload New Image -</div>
                <input 
                    type="file" 
                    name="imageFile" 
                    accept="image/*" 
                    className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100" 
                />
            </div>
            {product.imageUrl && (
                <div className="mt-2">
                    <p className="text-xs text-gray-500 mb-1">Current Image:</p>
                    <img src={product.imageUrl} alt="Preview" className="h-32 w-32 object-cover rounded-md border" />
                </div>
            )}
          </div>

          <div className="pt-4 flex justify-end">
            <button type="submit" className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
              Update Product
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
