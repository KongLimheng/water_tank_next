'use client'

import { useQuery } from '@tanstack/react-query'
import { X, Search, Loader2, ChevronRight } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import React, { useEffect, useState, useRef } from 'react'
import { searchProducts } from '@/services/productService'
import { ProductList } from '@/types'
import { generatePlaceholderImage } from '@/lib/placeholderImage'

const SearchBox: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('')
  const [isFocused, setIsFocused] = useState(false)
  const router = useRouter()
  const searchRef = useRef<HTMLDivElement>(null)

  // Debounce search query
  const [debouncedQuery, setDebouncedQuery] = useState('')

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(searchQuery.trim())
    }, 300)

    return () => clearTimeout(timer)
  }, [searchQuery])

  // Fetch search results
  const { data: searchResults, isLoading } = useQuery({
    queryKey: ['products-search', debouncedQuery],
    queryFn: () => searchProducts(debouncedQuery),
    enabled: debouncedQuery.length > 0,
    staleTime: 1000 * 60 * 5, // Cache for 5 minutes
  })

  // Close search when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsFocused(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Close search on Escape key
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsFocused(false)
        setSearchQuery('')
      }
    }

    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [])

  const handleProductClick = (product: ProductList) => {
    setIsFocused(false)
    setSearchQuery('')
    // Navigate to product detail (you may need to adjust this based on your routing)
    router.push(`/shop?category=${product.categoryId}`)
  }

  const hasResults = searchResults && searchResults.length > 0

  return (
    <div ref={searchRef} className="relative w-full max-w-md">
      {/* Search Input */}
      <div className="relative">
        <Search
          className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
          size={18}
        />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onFocus={() => setIsFocused(true)}
          placeholder="Search products..."
          className="w-full pl-10 pr-10 py-2 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all"
        />
        {searchQuery && (
          <button
            onClick={() => {
              setSearchQuery('')
              setDebouncedQuery('')
            }}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
            type="button"
          >
            <X size={16} />
          </button>
        )}
      </div>

      {/* Search Results Dropdown */}
      {isFocused && debouncedQuery.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-lg border border-slate-200 max-h-[400px] overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-200">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 size={24} className="text-primary-600 animate-spin" />
            </div>
          ) : hasResults ? (
            <div className="overflow-y-auto max-h-[380px]">
              <div className="px-4 py-2 bg-slate-50 border-b border-slate-100 text-xs font-medium text-slate-500 uppercase tracking-wider">
                Search Results ({searchResults.length})
              </div>
              <ul className="divide-y divide-slate-100">
                {searchResults.map((product) => (
                  <li
                    key={product.id}
                    onClick={() => handleProductClick(product)}
                    className="flex items-center gap-3 px-4 py-3 hover:bg-slate-50 cursor-pointer transition-colors"
                  >
                    <div className="w-12 h-12 rounded-lg bg-slate-100 overflow-hidden shrink-0">
                      <Image
                        src={
                          product.image[0] ||
                          generatePlaceholderImage(product.name)
                        }
                        alt={product.name}
                        width={48}
                        height={48}
                        className="w-full h-full object-contain"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-slate-900 truncate">
                        {product.name}
                      </p>
                      <p className="text-xs text-slate-500 truncate">
                        {product.category.brand?.name} • {product.category.name}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-sm font-semibold text-primary-600">
                        ${product.price.toFixed(2)}
                      </span>
                      <ChevronRight size={16} className="text-slate-400" />
                    </div>
                  </li>
                ))}
              </ul>
              <div className="px-4 py-3 bg-slate-50 border-t border-slate-100 text-center">
                <Link
                  href={`/search?q=${encodeURIComponent(debouncedQuery)}`}
                  className="text-sm font-medium text-primary-600 hover:text-primary-700 transition-colors"
                  onClick={() => {
                    setIsFocused(false)
                    setSearchQuery('')
                  }}
                >
                  View all results →
                </Link>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-8 px-4 text-center">
              <Search size={32} className="text-slate-300 mb-2" />
              <p className="text-sm font-medium text-slate-900">
                No products found
              </p>
              <p className="text-xs text-slate-500 mt-1">
                Try searching with different keywords
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default SearchBox
