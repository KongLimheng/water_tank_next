'use client'

import { Hero } from '@/components/Hero'
import ProductCard from '@/components/Product/ProductCard'
import ProductDetailsModal from '@/components/Product/ProductDetailsModal'
import { getProducts } from '@/services/productService'
import { ProductList } from '@/types'
import { useQuery } from '@tanstack/react-query'
import { useState } from 'react'

export default function HomePage() {
  const [selectedProduct, setSelectedProduct] = useState<ProductList | null>(
    null,
  )

  // 3. Query: Products (Only fetches if brand is selected)
  const { data: fetchedProducts, isLoading: isQueryLoading } = useQuery({
    queryKey: ['products'],
    queryFn: getProducts,
    staleTime: 1000 * 60 * 5, // Cache for 5 minutes
  })

  if (!fetchedProducts) return null

  return (
    <>
      <Hero />

      <div className="mx-auto px-5 xl:px-40 py-8">
        <h2 className="text-3xl font-bold text-slate-900 mb-4">
          Product Features
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {fetchedProducts.length > 0 ? (
            fetchedProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onClick={setSelectedProduct}
              />
            ))
          ) : (
            <div className="col-span-full py-20 text-center text-slate-400 bg-white rounded-2xl border border-dashed border-slate-200">
              <p className="text-lg">No products found in this category.</p>
            </div>
          )}
        </div>
      </div>

      <ProductDetailsModal
        product={selectedProduct}
        onClose={() => setSelectedProduct(null)}
      />
    </>
  )
}
