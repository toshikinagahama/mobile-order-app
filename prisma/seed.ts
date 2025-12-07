import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  // Clean up existing data
  await prisma.orderItem.deleteMany()
  await prisma.order.deleteMany()
  await prisma.product.deleteMany()
  await prisma.table.deleteMany()

  // Create Tables
  const tableNames = ['テーブル 1', 'テーブル 2', 'テーブル 3', 'テーブル 4', 'テーブル 5']
  for (const name of tableNames) {
    await prisma.table.create({
      data: { name }, // name is unique
    })
  }

  // Create Products
  const products = [
    { name: '生ビール', price: 550, category: 'Drink', imageUrl: 'https://images.unsplash.com/photo-1535958636474-b021ee8876a3?w=800&q=80', calories: 150, alcoholContent: 20.0 },
    { name: 'ハイボール', price: 450, category: 'Drink', imageUrl: 'https://images.unsplash.com/photo-1564424224827-cd24b8915874?w=800&q=80', calories: 100, alcoholContent: 15.0 },
    { name: 'ウーロン茶', price: 300, category: 'Drink', imageUrl: 'https://images.unsplash.com/photo-1544145945-f90425340c7e?w=800&q=80', calories: 0, alcoholContent: 0.0 },
    { name: '枝豆', price: 300, category: 'Food', imageUrl: 'https://images.unsplash.com/photo-1615485925694-a031e79b7104?w=800&q=80', calories: 80, alcoholContent: 0.0 },
    { name: '唐揚げ', price: 600, category: 'Food', imageUrl: 'https://images.unsplash.com/photo-1562967914-608f82629710?w=800&q=80', calories: 450, alcoholContent: 0.0 },
    { name: 'フライドポテト', price: 450, category: 'Food', imageUrl: 'https://images.unsplash.com/photo-1573080496987-aeb7d53385c7?w=800&q=80', calories: 350, alcoholContent: 0.0 },
    { name: 'シーザーサラダ', price: 700, category: 'Food', imageUrl: 'https://images.unsplash.com/photo-1550304943-4f24f54ddde9?w=800&q=80', calories: 200, alcoholContent: 0.0 },
    { name: 'バニラアイス', price: 350, category: 'Dessert', imageUrl: 'https://images.unsplash.com/photo-1560008581-09826d1de69e?w=800&q=80', calories: 180, alcoholContent: 0.0 },
    { name: 'チョコパフェ', price: 750, category: 'Dessert', imageUrl: 'https://images.unsplash.com/photo-1563805042-7684c019e1cb?w=800&q=80', calories: 500, alcoholContent: 0.0 },
  ]

  for (const product of products) {
    await prisma.product.create({
      data: product,
    })
  }
  
  console.log('Seed data created.')
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })
