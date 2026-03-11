'use client'

import { generatePlaceholderImage } from '@/lib/placeholderImage'
import { useInfiniteQuery } from '@tanstack/react-query'
import { Loader2, Search } from 'lucide-react'
import Image from 'next/image'
import { useRouter, useSearchParams } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'
import ProductDetailsModal from '../components/Product/ProductDetailsModal'
import { searchProducts } from '../services/productService'
import { ProductList } from '../types'

const PAGE_SIZE = 20

const SearchResults = () => {
  const searchParams = useSearchParams()
  const query = searchParams?.get('q') || ''
  const router = useRouter()

  const [selectedProduct, setSelectedProduct] = useState<ProductList | null>(
    null,
  )

  const { data, fetchNextPage, hasNextPage, isLoading, isFetchingNextPage } =
    useInfiniteQuery({
      queryKey: ['products-search', query],
      queryFn: ({ pageParam = 0 }) =>
        searchProducts(query, PAGE_SIZE, pageParam),
      enabled: !!query,
      staleTime: 1000 * 60 * 5,
      getNextPageParam: (lastPage) => {
        if (!lastPage.hasMore) return undefined
        return lastPage.offset + lastPage.limit
      },
      initialPageParam: 0,
    })

  // Flatten all products from all pages
  const allProducts = data?.pages.flatMap((page) => page.products) || []
  const totalResults = data?.pages[0]?.total || 0

  // Infinite scroll observer
  const observerRef = useRef<IntersectionObserver | null>(null)
  const loadMoreRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    if (isFetchingNextPage) return

    observerRef.current = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasNextPage) {
          fetchNextPage()
        }
      },
      { threshold: 0.1, rootMargin: '200px' },
    )

    if (loadMoreRef.current) {
      observerRef.current.observe(loadMoreRef.current)
    }

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect()
      }
    }
  }, [hasNextPage, isFetchingNextPage, fetchNextPage])

  return (
    <>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16">
        {/* Search Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Search className="text-primary-600 size-6 lg:size-7" />
            <h1 className="text-xl lg:text-3xl font-bold text-slate-900">
              Search Results
            </h1>
          </div>
          <div className="flex items-center justify-between">
            <p className="text-sm lg:text-lg text-slate-600">
              {query ? (
                <>
                  Results for "<span className="font-semibold">{query}</span>"
                </>
              ) : (
                'Please enter a search term'
              )}
            </p>
            <div className="text-sm text-slate-400 font-medium">
              {totalResults} result{totalResults !== 1 ? 's' : ''} found
            </div>
          </div>
        </div>

        {/* Search Results Grid */}
        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <Loader2 size={48} className="text-primary-600 animate-spin" />
          </div>
        ) : allProducts.length > 0 ? (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {allProducts.map((product) => (
                <div
                  key={product.id}
                  onClick={() => setSelectedProduct(product)}
                  className="group bg-white rounded-2xl border border-slate-200 overflow-hidden hover:shadow-lg transition-all duration-300 cursor-pointer hover:-translate-y-1"
                >
                  {/* Product Image */}
                  <div className="aspect-square bg-slate-50 relative overflow-hidden">
                    <Image
                      src={
                        product.image[0] ||
                        generatePlaceholderImage(product.name)
                      }
                      alt={product.name}
                      className="object-contain group-hover:scale-105 transition-transform duration-300 size-full"
                      width={400}
                      height={400}
                    />
                  </div>

                  {/* Product Info */}
                  <div className="p-4 space-y-2">
                    <div className="text-xs font-medium text-primary-600 uppercase tracking-wide">
                      {product.category.brand?.name}
                    </div>
                    <h3 className="font-semibold text-slate-900 line-clamp-2 min-h-[2.5rem]">
                      {product.name}
                    </h3>
                    <div className="text-sm text-slate-500">
                      {product.category.name}
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm md:text-lg font-bold text-primary-600">
                        {product.price
                          ? `$${product.price.toFixed(2)}`
                          : 'សាកសួរ'}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Load More Trigger */}
            {hasNextPage && (
              <div
                ref={loadMoreRef}
                className="flex justify-center items-center py-8"
              >
                <Loader2 size={32} className="text-primary-600 animate-spin" />
              </div>
            )}

            {/* No More Results */}
            {!hasNextPage && allProducts.length > 0 && (
              <div className="text-center py-8 text-slate-500 text-sm">
                No more results to load
              </div>
            )}
          </>
        ) : query ? (
          <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-slate-300">
            <Search size={48} className="text-slate-300 mx-auto mb-4" />
            <p className="text-slate-900 font-medium text-lg mb-2">
              No products found
            </p>
            <p className="text-slate-500">
              Try searching with different keywords or browse all products
            </p>
            <button
              onClick={() => router.push('/products')}
              className="mt-6 px-6 py-2 bg-primary-600 text-white rounded-xl font-medium hover:bg-primary-700 transition-colors"
            >
              Browse All Products
            </button>
          </div>
        ) : null}
      </div>

      <ProductDetailsModal
        product={selectedProduct}
        onClose={() => setSelectedProduct(null)}
      />
    </>
  )
}

export default SearchResults
