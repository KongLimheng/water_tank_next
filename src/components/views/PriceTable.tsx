'use client'

import { useDealer } from '@/contexts/DealerContext'
import { ProductList } from '@/types'
import { useMemo } from 'react'

export const PriceTable = ({
  items,
  title,
  subtitle,
  onRowClick,
  isHorizontal,
}: {
  items: ProductList[]
  title: string
  subtitle: string
  onRowClick: (p: ProductList) => void
  isHorizontal: boolean
}) => {
  const { isAuthenticated } = useDealer()

  // Calculate the maximum number of variants to determine grid layout
  const maxVariants = useMemo(
    () => Math.max(...items.map((item) => item.variants.length), 1),
    [items],
  )

  // Calculate base columns (capacity, diameter, height, and length for horizontal)
  const baseColCount = isHorizontal ? 4 : 3
  const totalCols = baseColCount + maxVariants

  // Grid style for dynamic column count
  const gridStyle = useMemo(
    () => ({
      display: 'grid',
      gridTemplateColumns: `repeat(${totalCols}, minmax(0, 1fr))`,
    }),
    [totalCols],
  )

  // If list is empty, render a placeholder to keep layout balanced?
  // Or return null? The image shows empty space if missing, but let's return null for cleaner UI.
  if (items.length === 0) {
    return (
      <div className="h-full min-h-[200px] border-2 border-dashed border-slate-100 rounded-lg flex items-center justify-center text-slate-300 text-sm">
        No {title} Available
      </div>
    )
  }

  return (
    <div className="border border-slate-400 h-full flex flex-col relative">
      <div className="text-center font-bold text-blue-900 bg-slate-50 py-2 border-b-2 border-slate-400">
        {title}
      </div>
      {/* Table Header */}
      <div
        className="text-center font-bold border-b-2 border-slate-400 bg-slate-50"
        style={gridStyle}
      >
        {/* Col 1: Capacity */}
        <div className="py-2 px-1 border-r border-slate-300">
          <div className="text-blue-900 text-sm lg:text-base">ចំណុះ</div>
        </div>

        {/* Col 2: Diameter */}
        <div className="py-2 px-1 border-r border-slate-300">
          <div className="text-blue-900 text-sm lg:text-base">ទទឹងមាត់</div>
        </div>

        {/* Col 3: Length (Only for Horizontal) */}
        {isHorizontal && (
          <div className="py-2 px-1 border-r border-slate-300">
            <div className="text-blue-900 text-sm lg:text-base">បណ្ដោយ</div>
          </div>
        )}

        {/* Col 4/3: Height */}
        <div className="py-2 px-1 border-r border-slate-300">
          <div className="text-blue-900 text-sm lg:text-base">កំពស់</div>
        </div>

        {maxVariants > 1 ? (
          ['តម្លៃ', 'តម្លៃ'].map((v, idx) => (
            <div
              key={`header-price-${idx}`}
              className={`py-2 px-1 ${
                idx < maxVariants - 1 ? 'border-r border-slate-300' : ''
              }`}
            >
              <div className="text-blue-900 text-sm lg:text-base">{v}</div>
            </div>
          ))
        ) : (
          <div className="py-2 px-1">
            <div className="text-blue-900 text-sm lg:text-base">តម្លៃលក់</div>
          </div>
        )}
      </div>

      {/* Table Body */}
      <div className="bg-white divide-y flex-1">
        {items.map((product, idx) => (
          <div
            key={product.id}
            onClick={() => onRowClick(product)}
            className="text-center items-center py-2 cursor-pointer transition-colors group hover:bg-blue-50 hover:border-blue-600 hover:border"
            style={{
              ...gridStyle,
              backgroundColor: idx % 2 === 0 ? 'white' : '#f1f5f9',
            }}
          >
            {/* 1. Capacity */}
            <div className="text-red-600 font-black text-sm lg:text-base border-r border-transparent px-1 break-words">
              {product.volume || product.name}
            </div>

            {/* 2. Diameter */}
            <div className="text-red-600 font-bold text-sm lg:text-base border-r border-transparent px-1">
              {product.diameter || '-'}
            </div>

            {/* 3. Length (Horizontal only) */}
            {isHorizontal && (
              <div className="text-red-600 font-bold text-sm lg:text-base border-r border-transparent px-1">
                {product.length}
              </div>
            )}

            {/* 4. Height */}
            <div className="text-red-600 font-bold text-sm lg:text-base border-r border-transparent px-1">
              {product.height || '-'}
            </div>

            {/* Price columns - one for each variant slot */}
            {Array.from({ length: maxVariants }).map((_, variantIdx) => {
              const variant = product.variants[variantIdx]

              if (!variant && isAuthenticated) {
                // Empty slot if product has fewer variants than max
                return (
                  <div
                    key={`empty-price-${variantIdx}`}
                    className="text-red-600 font-black text-sm px-1"
                  >
                    $0
                  </div>
                )
              }

              // Show price for variant only if authenticated as dealer
              if (isAuthenticated && variant) {
                return (
                  <div
                    key={variant.id}
                    className="text-red-600 font-bold text-sm lg:text-base border-r border-transparent px-1"
                  >
                    ${variant.price}
                  </div>
                )
              }

              // Show "Login to view price" or "សាកសួរ" when not authenticated
              return (
                <div
                  key={variantIdx}
                  className="text-red-600 font-bold text-sm px-1"
                >
                  សាកសួរ
                </div>
              )
            })}
          </div>
        ))}
      </div>
    </div>
  )
}
