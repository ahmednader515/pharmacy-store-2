'use server'

import { revalidatePath } from 'next/cache'

import { connectToDatabase } from '@/lib/db'
import { formatError } from '@/lib/utils'

import { WebPageInputSchema, WebPageUpdateSchema } from '../validator'
import { z } from 'zod'

// CREATE
export async function createWebPage(data: z.infer<typeof WebPageInputSchema>) {
  try {
    const connection = await connectToDatabase()
    const webPage = WebPageInputSchema.parse(data)
    
    // Mock mode removed: always use database
    
    if (!connection.prisma) {
      return { success: false, message: 'Database connection failed' }
    }
    
    await connection.prisma.webPage.create({
      data: webPage
    })
    revalidatePath('/admin/web-pages')
    return {
      success: true,
      message: 'WebPage created successfully',
    }
  } catch (error) {
    return { success: false, message: formatError(error) }
  }
}

// UPDATE
export async function updateWebPage(data: z.infer<typeof WebPageUpdateSchema>) {
  try {
    const connection = await connectToDatabase()
    const webPage = WebPageUpdateSchema.parse(data)
    
    // Mock mode removed: always use database
    
    if (!connection.prisma) {
      return { success: false, message: 'Database connection failed' }
    }
    
    const { _id, ...updateData } = webPage
    
    await connection.prisma.webPage.update({
      where: { id: _id },
      data: updateData
    })
    revalidatePath('/admin/web-pages')
    return {
      success: true,
      message: 'WebPage updated successfully',
    }
  } catch (error) {
    return { success: false, message: formatError(error) }
  }
}
// DELETE
export async function deleteWebPage(id: string) {
  try {
    const connection = await connectToDatabase()
    
    // Mock mode removed: always use database
    
    if (!connection.prisma) {
      return { success: false, message: 'Database connection failed' }
    }
    
    const res = await connection.prisma.webPage.delete({
      where: { id }
    })
    if (!res) throw new Error('WebPage not found')
    revalidatePath('/admin/web-pages')
    return {
      success: true,
      message: 'تم الحذف بنجاح',
    }
  } catch (error) {
    return { success: false, message: formatError(error) }
  }
}

// GET ALL
export async function getAllWebPages() {
  const connection = await connectToDatabase()
  // Mock mode removed: always use database
  
  if (!connection.prisma) {
    console.warn('Database connection failed in getAllWebPages')
    return []
  }
  
  const webPages = await connection.prisma.webPage.findMany()
  return JSON.parse(JSON.stringify(webPages))
}
export async function getWebPageById(webPageId: string) {
  const connection = await connectToDatabase()
  // Mock mode removed: always use database
  
  if (!connection.prisma) {
    console.warn('Database connection failed in getWebPageById')
    return null
  }
  
  const webPage = await connection.prisma.webPage.findUnique({
    where: { id: webPageId }
  })
  return JSON.parse(JSON.stringify(webPage))
}

// GET ONE PAGE BY SLUG
export async function getWebPageBySlug(slug: string) {
  const connection = await connectToDatabase()
  // Mock mode removed: always use database
  if (!connection.prisma) {
    return null
  }
  
  try {
    const webPage = await connection.prisma.webPage.findFirst({
      where: { slug, isPublished: true }
    })
    if (!webPage) return null
    return JSON.parse(JSON.stringify(webPage))
  } catch (error) {
    console.warn('Database error in getWebPageBySlug:', error)
    return null
  }
}
