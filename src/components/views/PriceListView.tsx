import { generatePlaceholderImage } from '@/lib/placeholderImage'
import { ProductList } from '@/types'
import { Package } from 'lucide-react'
import React, { useMemo } from 'react'
import { OptimizedImage } from '../ui/OptimizedImage'
import { PriceTable } from './PriceTable'

interface PriceListViewProps {
  products: ProductList[]
  onProductClick: (product: ProductList) => void
}

export const PriceListView: React.FC<PriceListViewProps> = ({
  products,
  onProductClick,
}) => {
  // 1. Grouping Logic
  const groupedData = useMemo(() => {
    // helper: extract numeric volume safely
    const getVolumeNumber = (volume?: string) => {
      if (!volume) return 0
      const match = volume.match(/\d+/)
      return match ? parseInt(match[0], 10) : 0
    }

    // Structure to hold our specific groups
    const groups: Record<
      string,
      { vertical: ProductList[]; horizontal: ProductList[] }
    > = {
      A: { vertical: [], horizontal: [] },
      B: { vertical: [], horizontal: [] },
      C: { vertical: [], horizontal: [] },
      OTHER: { vertical: [], horizontal: [] },
    }

    products.forEach((p) => {
      // 1. Determine Group Key (A, B, C, or OTHER)
      let typeKey = p.group ? p.group.trim().toUpperCase() : 'OTHER'
      if (!['A', 'B', 'C'].includes(typeKey)) {
        typeKey = 'OTHER'
      }

      // 2. Determine Orientation (Vertical vs Horizontal)
      // Heuristic: Check category name for "horizontal"
      const isHorizontal = p.type?.toLowerCase().includes('horizontal')

      // 3. Push to correct array
      if (isHorizontal) {
        groups[typeKey].horizontal.push(p)
      } else {
        groups[typeKey].vertical.push(p)
      }
    })

    Object.values(groups).forEach((group) => {
      group.vertical.sort((a, b) => {
        const volA = getVolumeNumber(a.volume!)
        const volB = getVolumeNumber(b.volume!)

        if (volA !== volB) return volA - volB

        // tie-breaker: keep consistent order for same volume
        return (a.volume ?? '').localeCompare(b.volume ?? '', 'km')
      })

      group.horizontal.sort((a, b) => {
        const volA = getVolumeNumber(a.volume!)
        const volB = getVolumeNumber(b.volume!)

        if (volA !== volB) return volA - volB

        return (a.volume ?? '').localeCompare(b.volume ?? '', 'km')
      })
    })

    return groups
  }, [products])

  // Helper to render sections only if they have data
  const renderSection = (type: string, isOther = false) => {
    const group = groupedData[type]
    const hasData = group.vertical.length > 0 || group.horizontal.length > 0
    if (!hasData) return null

    return (
      <div
        key={type}
        className="animate-in fade-in slide-in-from-bottom-4 duration-500"
      >
        {/* Mobile Header (Visible only on small screens) */}
        <div className="lg:hidden text-center mb-4">
          <span
            className={`inline-block px-8 py-2 text-white text-2xl font-black rounded-xl shadow-lg ${
              isOther ? 'bg-slate-500 hidden' : 'bg-red-600'
            }`}
          >
            {isOther ? 'General Products' : `TYPE ${type}`}
          </span>
        </div>

        {/* Desktop Layout: [Vertical Table] - [Center Letter] - [Horizontal Table] */}
        <div className="flex flex-col lg:flex-row items-stretch gap-4">
          {/* Left: Vertical Table */}
          <div className="flex-1 w-full">
            <PriceTable
              items={group.vertical}
              title="ធុងឈរ (Vertical Tanks)"
              subtitle=""
              onRowClick={onProductClick}
              isHorizontal={false}
            />
          </div>

          {/* Center: The Identifier (Letter or Icon) */}
          <div className="hidden lg:flex flex-col justify-center items-center w-24 xl:w-32 shrink-0 select-none">
            {isOther ? (
              <div className="flex flex-col items-center text-slate-300">
                <Package size={64} />
                <span className="font-bold text-slate-400">OTHER</span>
              </div>
            ) : (
              <span className="text-[110px] font-black text-red-600 leading-none drop-shadow-lg transform scale-y-110">
                {type}
              </span>
            )}
          </div>

          {/* Right: Horizontal Table */}
          <div className="flex-1 w-full min-w-0">
            <PriceTable
              items={group.horizontal}
              title="ធុងទឹកផ្តេក (Horizontal Tanks)"
              subtitle=""
              onRowClick={onProductClick}
              isHorizontal={true}
            />
          </div>
        </div>

        {/* Divider between sections */}
        <div className="my-12 border-b border-slate-200"></div>
      </div>
    )
  }

  return (
    <div className="max-w-full rounded-lg mx-auto p-2 md:p-8 bg-slate-200/30 min-h-screen font-sans">
      {/* Page Header */}
      <div className="flex justify-center pb-8 relative">
        <OptimizedImage
          src={
            products[0]?.category.priceBanner ||
            generatePlaceholderImage(products[0]?.category.name || 'Water Tank')
          }
          alt="Product"
          className="w-full h-auto object-contain rounded"
          width={1920}
          height={240}
          // loading="eager"
        />
      </div>

      {/* Content Area */}
      <div className="space-y-4">
        {renderSection('A')}
        {renderSection('B')}
        {renderSection('C')}
        {renderSection('OTHER', true)}

        {products.length === 0 && (
          <div className="py-20 text-center text-slate-400 bg-slate-50 rounded-xl border-dashed border-2 border-slate-200">
            No products found.
          </div>
        )}
      </div>
    </div>
  )
}
