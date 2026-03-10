'use client'

import { ProductList } from '@/types'
import { Search } from 'lucide-react'
import { useRouter } from 'next/navigation'
import React, { useEffect, useRef, useState } from 'react'

const SearchBox: React.FC<{
  setMobileMenu?: (isOpen: boolean) => void
}> = ({ setMobileMenu }) => {
  const [searchQuery, setSearchQuery] = useState('')
  const [isFocused, setIsFocused] = useState(false)
  const router = useRouter()
  const searchRef = useRef<HTMLDivElement>(null)

  // Debounce search query
  const [debouncedQuery, setDebouncedQuery] = useState('')

  // useEffect(() => {
  //   const timer = setTimeout(() => {
  //     setDebouncedQuery(searchQuery.trim())
  //   }, 300)

  //   return () => clearTimeout(timer)
  // }, [searchQuery])

  // Fetch search results
  // const { data: searchResults, isLoading } = useQuery({
  //   queryKey: ['products-search', searchQuery],
  //   queryFn: () => searchProducts(searchQuery),
  //   enabled: searchQuery.length > 0,
  //   staleTime: 1000 * 60 * 5, // Cache for 5 minutes
  // })

  // Close search when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        searchRef.current &&
        !searchRef.current.contains(event.target as Node)
      ) {
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
        setMobileMenu && setMobileMenu(false) // Close mobile menu if open
      }
    }

    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [])

  const handleProductClick = (product: ProductList) => {
    setIsFocused(false)
    setSearchQuery('')
    router.push(`/shop?category=${product.categoryId}`)
  }

  const handleViewAllResults = () => {
    if (searchQuery.trim()) {
      setIsFocused(false)
      setSearchQuery('')
      router.push(`/search?q=${encodeURIComponent(searchQuery)}`)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      handleViewAllResults()
      setMobileMenu && setMobileMenu(false)
    }
  }

  // const hasResults = searchResults && searchResults.length > 0
  return (
    <div ref={searchRef} className="relative w-full md:max-w-md">
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
          onKeyDown={handleKeyDown}
          onFocus={() => setIsFocused(true)}
          placeholder="Search products..."
          className="w-full pl-10 pr-10 py-2 border border-slate-200 rounded-xl text-xs lg:text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all"
        />
      </div>

      {/* Search Results Dropdown */}
    </div>
  )
}

export default SearchBox
