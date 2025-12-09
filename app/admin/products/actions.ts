'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'

export async function toggleProductStock(id: number, isSoldOut: boolean) {
  await prisma.product.update({
    where: { id },
    data: { isSoldOut },
  })
  revalidatePath('/admin/products')
}

import sharp from 'sharp'

async function handleImageUpload(formData: FormData): Promise<string | null> {
    const file = formData.get('imageFile') as File | null
    const urlInput = formData.get('imageUrl') as string | null

    if (file && file.size > 0 && file.name !== 'undefined') {
        const arrayBuffer = await file.arrayBuffer()
        const buffer = Buffer.from(arrayBuffer)
        
        // Compress and resize image
        const processedBuffer = await sharp(buffer)
            .resize(800, null, { // Max width 800px, auto height
                withoutEnlargement: true,
                fit: 'inside'
            })
            .webp({ quality: 80 }) // Convert to WebP, 80% quality
            .toBuffer()

        const base64 = processedBuffer.toString('base64')
        return `data:image/webp;base64,${base64}`
    }
    return urlInput || null
}

function parseNumber(value: any): number | null {
    if (!value) return null
    const num = Number(value)
    return isNaN(num) ? null : num
}

export async function addProduct(formData: FormData) {
  const name = formData.get('name') as string
  const price = Number(formData.get('price'))
  const category = formData.get('category') as string || 'Food'
  
  const imageUrl = await handleImageUpload(formData)

  const calories = parseNumber(formData.get('calories'))
  const alcoholContent = parseNumber(formData.get('alcoholContent'))
  const unit = formData.get('unit') as string || '点'
  const quantityStep = Number(formData.get('quantityStep')) || 1

  await prisma.product.create({
    data: {
      name,
      price,
      category,
      imageUrl,
      calories,
      alcoholContent,
      unit,
      quantityStep,
    },
  })
  revalidatePath('/admin/products')
}

export async function updateProduct(id: number, formData: FormData) {
  const name = formData.get('name') as string
  const price = Number(formData.get('price'))
  const category = formData.get('category') as string
  
  const imageUrl = await handleImageUpload(formData)

  const calories = parseNumber(formData.get('calories'))
  const alcoholContent = parseNumber(formData.get('alcoholContent'))
  const unit = formData.get('unit') as string
  const quantityStep = Number(formData.get('quantityStep'))

  const updateData: any = {
      name,
      price,
      category,
      calories,
      alcoholContent,
      unit,
      quantityStep,
  }

  // Only update imageUrl if a new one is provided (either URL or File)
  // If user clears the input and sends nothing, it might mean delete, but for now let's assume valid string means update.
  // Actually handleImageUpload returns null if nothing is provided.
  // But for update, we might want to keep existing if nothing changed.
  // However, input type="text" usually has the current value.
  // So if handleImageUpload returns value, use it.
  if (imageUrl !== null && imageUrl !== '') {
      updateData.imageUrl = imageUrl
  }

  await prisma.product.update({
    where: { id },
    data: updateData,
  })
  revalidatePath('/admin/products')
}

export async function deleteProduct(id: number) {
  await prisma.product.delete({
    where: { id },
  })
  revalidatePath('/admin/products')
}
