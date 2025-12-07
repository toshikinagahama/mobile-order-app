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

  revalidatePath('/admin/products')
}

async function handleImageUpload(formData: FormData): Promise<string | null> {
    const file = formData.get('imageFile') as File | null
    const urlInput = formData.get('imageUrl') as string | null

    if (file && file.size > 0 && file.name !== 'undefined') {
        const buffer = await file.arrayBuffer()
        const base64 = Buffer.from(buffer).toString('base64')
        const mimeType = file.type || 'image/jpeg' // Default fallback
        return `data:${mimeType};base64,${base64}`
    }
    return urlInput || null
}

export async function addProduct(formData: FormData) {
  const name = formData.get('name') as string
  const price = Number(formData.get('price'))
  
  const imageUrl = await handleImageUpload(formData)

  const calories = formData.get('calories') ? Number(formData.get('calories')) : null
  const alcoholContent = formData.get('alcoholContent') ? Number(formData.get('alcoholContent')) : null

  await prisma.product.create({
    data: {
      name,
      price,
      imageUrl,
      calories,
      alcoholContent,
    },
  })
  revalidatePath('/admin/products')
}

export async function updateProduct(id: number, formData: FormData) {
  const name = formData.get('name') as string
  const price = Number(formData.get('price'))
  
  const imageUrl = await handleImageUpload(formData)

  const calories = formData.get('calories') ? Number(formData.get('calories')) : null
  const alcoholContent = formData.get('alcoholContent') ? Number(formData.get('alcoholContent')) : null

  const updateData: any = {
      name,
      price,
      calories,
      alcoholContent,
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
