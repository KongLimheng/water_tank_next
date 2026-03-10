import type { Product } from '@prisma/client'
import { cache } from 'react'
import { ProductList } from '../types'
import { api } from './apiInstance'

export interface PaginatedProductsResponse {
  products: ProductList[]
  total: number
  limit: number
  offset: number
  hasMore: boolean
}

export const getProducts = cache(
  async (limit = 100, offset = 0): Promise<PaginatedProductsResponse> => {
    const { data } = await api.get<PaginatedProductsResponse>(
      `/products?limit=${limit}&offset=${offset}`,
    )
    return (
      data || {
        products: [],
        total: 0,
        limit,
        offset,
        hasMore: false,
      }
    )
  },
)

export const searchProducts = async (
  query: string,
  limit = 20,
  offset = 0,
): Promise<PaginatedProductsResponse> => {
  if (!query || !query.trim()) {
    return {
      products: [],
      total: 0,
      limit,
      offset,
      hasMore: false,
    }
  }
  const { data } = await api.get<PaginatedProductsResponse>(
    `/products?q=${encodeURIComponent(query.trim())}&limit=${limit}&offset=${offset}`,
  )
  return data || { products: [], total: 0, limit, offset, hasMore: false }
}

export const getProductsByBrandCategory = async (
  category: string,
): Promise<ProductList[]> => {
  const { data } = await api.get<ProductList[]>(
    `/product/category?id=${category}`,
  )
  return data
}

export const createProduct = async (
  productData: FormData | Omit<Product, 'id'>,
): Promise<Product> => {
  const { data } = await api.post<Product>('/products', productData)
  return data
}

export const updateProduct = async (
  productData: FormData | Product,
): Promise<Product> => {
  const isFormData = productData instanceof FormData
  const id = isFormData ? productData.get('id') : (productData as Product).id
  const { data } = await api.put<Product>(`/products/${id}`, productData)
  return data
}

export const deleteProduct = async (id: number): Promise<boolean> => {
  await api.delete(`/products/${id}`)
  return true
}
