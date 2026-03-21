import { Prisma } from '@prisma/client'

export interface ProductVariant {
  id?: number
  name: string // e.g., "500L Type A"
  price: number
  stock: number
  sku?: string
  image?: string
}

export type ProductList = Prisma.ProductGetPayload<{
  include: {
    category: {
      include: {
        brand: true
      }
    }
    variants: true
  }
}>

export type Category = Prisma.CategoryGetPayload<{
  include: {
    brand: true
  }
}>

// export interface ProductList {
//   brand: string
//   id: number
//   name: string
//   slug: string
//   description: string
//   price: number
//   image: string[]
//   volume: string
//   categoryId: number
//   type?: string
//   diameter: string
//   height: string
//   group: string
//   length?: string
//   category: {
//     brand: {
//       name: string
//     }
//     name: string
//     slug: string
//     createdAt: Date
//     displayName: string
//     image: string
//   }
//   variants: {
//     id: number
//     name: string
//     price: number
//     image: string
//     createdAt: Date
//     updatedAt: Date
//     stock: number
//     sku: string
//     productId: number
//   }[]
// }

export interface ChatMessage {
  id: string
  role: 'user' | 'model'
  text: string
  timestamp: Date
}

export interface Review {
  id: string
  productId: number
  author: string
  rating: number
  text: string
  date: string
}

export interface SiteSettings {
  phone: string
  email: string
  address: string
  dealerPassword: string
  mapUrl: string
  banners: BannerItem[]
  aboutUs: AboutUsData
  socials: SocialItem[]
}

export interface Video {
  id: number
  title: string
  description: string
  videoUrl: string // Embed URL (e.g. YouTube embed)
  thumbnail?: string
  date: string
}

export interface BannerItem {
  name: string
  banner_image: string
  categoryId?: number | null
}

export interface AboutUsItem {
  image?: string
  content?: string // TipTap HTML content
  imageFile?: File
}

export interface AboutUsSection3Item {
  title?: string
  image?: string
  imageFile?: File
}

export interface AboutUsData {
  section1: Section1
  section2: AboutUsItem[]
  section3: {
    description?: string // TipTap HTML content
    items: AboutUsSection3Item[]
  }
}

export interface Section1 {
  dealerPassword: string
  image: string
  content: string
  imageFile?: File
}

export interface Brand {
  id: number
  name: string
  slug: string
}

export interface CategoryList {
  id: number
  name: string
  title?: string
  slug: string
  displayName?: string | null
  image?: string | null
  brandId?: number | null

  brand?: Brand | null
}

export interface SocialItem {
  url?: string
  image: string
  imageFile?: File
}
