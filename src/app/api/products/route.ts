import { saveFile } from '@/lib/fileUpload'
import { prisma } from '@/lib/prismaClient'
import { Prisma } from '@prisma/client'
import { NextRequest, NextResponse } from 'next/server'

// Helper function to extract numeric value from volume string
const getVolumeNumber = (volume?: string) => {
  if (!volume) return 0
  const match = volume.match(/\d+/)
  return match ? parseInt(match[0], 10) : 0
}

// Shared include configuration for product queries
const productInclude = {
  variants: true,
  category: {
    include: {
      brand: true,
    },
  },
} as const

// Build search conditions for query and count
const buildSearchWhere = (query: string): Prisma.ProductWhereInput => ({
  OR: [{ volume: { contains: query, mode: 'insensitive' } }],
})

// Sort products: by volume (numeric asc), then by volume string
const sortProducts = (products: any[]) =>
  products.sort((a, b) => {
    const volA = getVolumeNumber(a.volume ?? '')
    const volB = getVolumeNumber(b.volume ?? '')
    if (volA !== volB) return volA - volB
    return (a.volume ?? '').localeCompare(b.volume ?? '', 'km')
  })

// Build paginated response
const buildPaginatedResponse = (
  products: any[],
  total: number,
  limit: number,
  offset: number,
) => ({
  products,
  total,
  limit,
  offset,
  hasMore: offset + products.length < total,
})

export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams
    const query = searchParams.get('q')
    const limit = parseInt(searchParams.get('limit') || '20')
    const offset = parseInt(searchParams.get('offset') || '0')

    if (query) {
      const where = buildSearchWhere(query)
      const [products, total] = await prisma.$transaction([
        prisma.product.findMany({
          where,
          include: productInclude,
          skip: offset,
          take: limit,
          orderBy: [
            { category: { name: 'asc' } },
            { type: 'desc' },
            { group: 'asc' },
            { volume: 'asc' },
          ],
        }),
        prisma.product.count({ where }),
      ])

      return NextResponse.json(
        buildPaginatedResponse(products, total, limit, offset),
      )
    }

    const [products, total] = await prisma.$transaction([
      prisma.product.findMany({
        include: productInclude,
        skip: offset,
        take: limit,
        orderBy: [{ volume: 'asc' }],
      }),
      prisma.product.count(),
    ])

    return NextResponse.json(
      buildPaginatedResponse(products, total, limit, offset),
    )
  } catch (err) {
    console.error('Failed to fetch products', err)
    return NextResponse.json(
      { error: 'Failed to fetch products' },
      { status: 500 },
    )
  }
}

export async function POST(req: Request) {
  try {
    const formData = await req.formData()
    const name = formData.get('name') as string
    const description = (formData.get('description') as string) || ''
    const price = parseFloat(formData.get('price') as string)
    const categoryId = parseInt(formData.get('categoryId') as string)
    const brand = (formData.get('brand') as string) || null
    const volume = (formData.get('volume') as string) || null
    const type = (formData.get('type') as string) || null
    const group = (formData.get('group') as string) || null
    const diameter = (formData.get('diameter') as string) || null
    const height = (formData.get('height') as string) || null
    const length = (formData.get('length') as string) || null
    const variantsRaw = formData.get('variants') as string
    const existingImage = formData.get('existingImage') as string

    if (!name || isNaN(price)) {
      return NextResponse.json(
        { msg: 'Name and Price are required' },
        { status: 400 },
      )
    }

    let parsedVariants: any[] = []
    try {
      parsedVariants = variantsRaw ? JSON.parse(variantsRaw) : []
    } catch {
      return NextResponse.json(
        { error: 'Invalid variants JSON format' },
        { status: 400 },
      )
    }

    // Handle file uploads
    const galleryPaths: string[] = []
    for (const [, value] of formData.entries()) {
      if (value instanceof File && value.size > 0) {
        const path = await saveFile(value, 'products')
        galleryPaths.push(path)
      }
    }

    const imageList =
      galleryPaths.length > 0
        ? galleryPaths
        : existingImage
          ? [existingImage]
          : []
    const slug = name.toLowerCase().replace(/\s+/g, '_') + `_${Date.now()}`

    const newProduct = await prisma.product.create({
      data: {
        name,
        slug,
        description,
        price,
        brand,
        image: imageList,
        categoryId,
        volume,
        height,
        type,
        group,
        diameter,
        length,
        variants: {
          create: parsedVariants.map((v) => ({
            name: v.name,
            price: parseFloat(v.price),
            stock: parseInt(v.stock) || 0,
            sku: v.sku || null,
            image: v.image || null,
          })),
        },
      },
      include: { variants: true },
    })

    return NextResponse.json(newProduct)
  } catch (err) {
    console.error('Error creating product:', err)
    return NextResponse.json(
      { error: 'Failed to create product' },
      { status: 500 },
    )
  }
}
