'use client'

import { useQuery } from '@tanstack/react-query'
import { Loader2 } from 'lucide-react'
import { useSearchParams } from 'next/navigation'
import { useState } from 'react'
import ProductDetailsModal from '../components/Product/ProductDetailsModal'
import { PriceListView } from '../components/views/PriceListView'
import { getProductsByBrandCategory } from '../services/productService'
import { ProductList } from '../types'

const ShopProducts = () => {
  const searchParams = useSearchParams()
  const activeCategory = searchParams?.get('category') || ''

  const [selectedProduct, setSelectedProduct] = useState<ProductList | null>(
    null,
  )
  const { data: fetchedProducts, isLoading: isQueryLoading } = useQuery({
    queryKey: ['products', 'category', activeCategory],
    queryFn: () => getProductsByBrandCategory(activeCategory), // activeCategory is now string
    staleTime: 1000 * 60 * 5, // Cache for 5 minutes
    enabled: !!activeCategory, // Only run if category exists
    placeholderData: (previousData) => previousData,
  })

  const visibleProducts = fetchedProducts || []
  const isGridLoading = isQueryLoading

  return (
    <>
      <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="flex items-center justify-between gap-2 mb-2">
          <h2 className="text-3xl font-bold text-slate-900">
            {/* {`All ${
              activeBrand.charAt(0).toUpperCase() + activeBrand.slice(1)
            } ${
              visibleProducts.length ? visibleProducts[0].category.name : ''
            } Products`} */}
          </h2>
          <div className="text-sm text-slate-400 font-medium">
            {`Showing ${visibleProducts.length} results`}
          </div>
        </div>
        {/* Product Grid */}
        {isGridLoading ? (
          <div className="flex justify-center items-center h-64">
            <Loader2 size={48} className="text-primary-600 animate-spin" />
          </div>
        ) : (
          <PriceListView
            products={visibleProducts}
            onProductClick={setSelectedProduct}
          />
        )}
      </div>

      <ProductDetailsModal
        product={selectedProduct}
        onClose={() => setSelectedProduct(null)}
      />
    </>
  )
}

export default ShopProducts
