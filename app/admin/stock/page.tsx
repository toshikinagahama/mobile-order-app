import { prisma } from '@/lib/prisma'
import StockClient from './StockClient'

export default async function StockPage() {
  const products = await prisma.product.findMany({
    orderBy: { id: 'asc' }
  })
  
  const categories = Array.from(new Set(products.map(p => p.category))).sort()
  // Ensure we sort categories roughly consistently if possible, or use a fixed order.
  // For now, alphabetical is fine, or reuse the custom order if desired.
  // Let's stick to simple sort for admin.

  return (
    <div className="p-4 bg-gray-50 min-h-screen">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Stock Management</h1>
      <StockClient products={products} categories={categories} />
    </div>
  )
}
