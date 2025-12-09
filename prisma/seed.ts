import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('Start seeding high-quality data...')
  
  // Clean up existing data (Order related first due to FK)
  await prisma.orderItem.deleteMany()
  await prisma.order.deleteMany()
  await prisma.product.deleteMany()
  await prisma.table.deleteMany()

  // Create Tables
  const tableNames = ['テーブル 1', 'テーブル 2', 'テーブル 3', 'テーブル 4', 'テーブル 5']
  for (const name of tableNames) {
    await prisma.table.create({
      data: { name },
    })
  }

  const productsToCreate = [
    // Soft Drink
    { name: 'ウーロン茶', price: 300, category: 'ドリンク', calories: 0, alcoholContent: 0, unit: '杯', quantityStep: 1 },
    { name: 'コーラ', price: 350, category: 'ドリンク', calories: 150, alcoholContent: 0, unit: '杯', quantityStep: 1 },
    { name: 'オレンジジュース', price: 350, category: 'ドリンク', calories: 120, alcoholContent: 0, unit: '杯', quantityStep: 1 },
    { name: 'ジンジャーエール', price: 350, category: 'ドリンク', calories: 140, alcoholContent: 0, unit: '杯', quantityStep: 1 },

    // Alcohol
    { name: '生ビール', price: 550, category: 'アルコール', calories: 200, alcoholContent: 5, unit: '杯', quantityStep: 1 },
    { name: 'ハイボール', price: 500, category: 'アルコール', calories: 150, alcoholContent: 7, unit: '杯', quantityStep: 1 },
    { name: 'レモンサワー', price: 480, category: 'アルコール', calories: 180, alcoholContent: 5, unit: '杯', quantityStep: 1 },
    { name: '梅酒', price: 500, category: 'アルコール', calories: 250, alcoholContent: 12, unit: '杯', quantityStep: 1 },
    
    // Speed / Appetizer
    { name: '枝豆', price: 300, category: 'スピード', calories: 80, alcoholContent: 0, unit: '皿', quantityStep: 1 },
    { name: '冷奴', price: 300, category: 'スピード', calories: 100, alcoholContent: 0, unit: '皿', quantityStep: 1 },
    { name: 'キムチ', price: 350, category: 'スピード', calories: 40, alcoholContent: 0, unit: '皿', quantityStep: 1 },
    { name: 'たこわさ', price: 380, category: 'スピード', calories: 60, alcoholContent: 0, unit: '皿', quantityStep: 1 },

    // Appetizer (Otsumami)
    { name: '唐揚げ', price: 580, category: 'おつまみ', calories: 450, alcoholContent: 0, unit: '皿', quantityStep: 1 },
    { name: 'ポテトフライ', price: 480, category: 'おつまみ', calories: 400, alcoholContent: 0, unit: '皿', quantityStep: 1 },
    { name: 'だし巻き卵', price: 500, category: 'おつまみ', calories: 250, alcoholContent: 0, unit: '皿', quantityStep: 1 },
    { name: 'あさりの酒蒸し', price: 600, category: 'おつまみ', calories: 120, alcoholContent: 1, unit: '皿', quantityStep: 1 },

    // Vegetable
    { name: 'シーザーサラダ', price: 680, category: '野菜', calories: 350, alcoholContent: 0, unit: '皿', quantityStep: 1 },
    { name: 'トマトスライス', price: 400, category: '野菜', calories: 50, alcoholContent: 0, unit: '皿', quantityStep: 1 },
    
    // Meat
    { name: '牛ハラミ焼き', price: 980, category: '肉', calories: 500, alcoholContent: 0, unit: '皿', quantityStep: 1 },
    { name: 'ソーセージ盛り合わせ', price: 780, category: '肉', calories: 600, alcoholContent: 0, unit: '皿', quantityStep: 1 },
    { name: '豚の角煮', price: 850, category: '肉', calories: 700, alcoholContent: 0, unit: '皿', quantityStep: 1 },

    // Fish
    { name: '刺身盛り合わせ', price: 1280, category: '魚', calories: 300, alcoholContent: 0, unit: '皿', quantityStep: 1 },
    { name: 'ホッケ焼き', price: 880, category: '魚', calories: 400, alcoholContent: 0, unit: '皿', quantityStep: 1 },
    
    // Rice
    { name: 'おにぎり (鮭)', price: 200, category: 'お米', calories: 200, alcoholContent: 0, unit: '個', quantityStep: 1 },
    { name: 'おにぎり (梅)', price: 180, category: 'お米', calories: 180, alcoholContent: 0, unit: '個', quantityStep: 1 },
    { name: 'チャーハン', price: 750, category: 'お米', calories: 600, alcoholContent: 0, unit: '皿', quantityStep: 1 },
    { name: 'お茶漬け', price: 450, category: 'お米', calories: 250, alcoholContent: 0, unit: '杯', quantityStep: 1 },

    // Noodle
    { name: '醤油ラーメン', price: 800, category: '麺', calories: 500, alcoholContent: 0, unit: '杯', quantityStep: 1 },
    { name: '焼きそば', price: 700, category: '麺', calories: 550, alcoholContent: 0, unit: '皿', quantityStep: 1 },

    // Dessert
    { name: 'バニラアイス', price: 300, category: 'デザート', calories: 200, alcoholContent: 0, unit: '個', quantityStep: 1 },
    { name: '抹茶アイス', price: 350, category: 'デザート', calories: 180, alcoholContent: 0, unit: '個', quantityStep: 1 },
    { name: '杏仁豆腐', price: 400, category: 'デザート', calories: 220, alcoholContent: 0, unit: '個', quantityStep: 1 },
  ]

  console.log(`Prepared ${productsToCreate.length} products. Inserting...`)

  for (const product of productsToCreate) {
      await prisma.product.create({
          data: {
              ...product,
              imageUrl: null // Placeholder or null
          }
      })
  }
  
  console.log(`\nSeed data created successfully. Total: ${productsToCreate.length}`)
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
