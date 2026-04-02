import { useDealer } from '@/contexts/DealerContext'
import { registerPDFFonts } from '@/lib/pdfFonts'
import { generatePlaceholderImage } from '@/lib/placeholderImage'
import { ProductList } from '@/types'
import { usePDF } from '@react-pdf/renderer'
import {
  ChevronDown,
  Download,
  FileImage,
  FileText,
  Loader2,
  Package,
} from 'lucide-react'
import React, { useMemo, useRef, useState } from 'react'
import PriceListPDF from '../PricelistPDF'
import { OptimizedImage } from '../ui/OptimizedImage'
import { PriceTable } from './PriceTable'

// Register PDF fonts on module load
if (typeof window !== 'undefined') {
  registerPDFFonts()
}

const loadPdfToImage = async () => {
  if (typeof window === 'undefined') {
    throw new Error('pdf-to-image can only be used in browser')
  }
  return import('@/lib/pdf-to-blob')
}

interface PriceListViewProps {
  products: ProductList[]
  onProductClick: (product: ProductList) => void
}

export const PriceListView: React.FC<PriceListViewProps> = ({
  products,
  onProductClick,
}) => {
  const contentRef = useRef<HTMLDivElement>(null)
  const [downloadType, setDownloadType] = useState<'pdf' | 'jpg' | null>(null)
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const { isAuthenticated } = useDealer()

  const handleDownloadJPG = async (blob: Blob) => {
    setDownloadType('jpg')
    try {
      const { downloadPDFAsImage } = await loadPdfToImage()
      await downloadPDFAsImage(blob, 'price-list.jpg', {
        scale: 3,
        format: 'image/jpeg',
        quality: 1,
      })
    } catch (error) {
      console.error('Image export error:', error)
      alert('Failed to download image')
    } finally {
      setDownloadType(null)
    }
  }
  // 1. Grouping Logic - Dynamic grouping based on product types
  const groupedData = useMemo(() => {
    // helper: extract numeric volume safely
    const getVolumeNumber = (volume?: string) => {
      if (!volume) return 0
      const match = volume.match(/\d+/)
      return match ? parseInt(match[0], 10) : 0
    }

    // Use a Map to collect all unique group keys dynamically
    const groups: Record<
      string,
      { vertical: ProductList[]; horizontal: ProductList[] }
    > = {}

    products.forEach((p) => {
      // 1. Determine Group Key from product type, or fallback to OTHER
      let typeKey = p.group ? p.group.trim().toUpperCase() : 'OTHER'

      // Validate: only allow alphabetic group keys (A, B, C, D, etc.)
      // Anything else goes to OTHER
      if (!/^[A-Z]$/.test(typeKey)) {
        typeKey = 'OTHER'
      }

      // 2. Initialize group if it doesn't exist
      if (!groups[typeKey]) {
        groups[typeKey] = { vertical: [], horizontal: [] }
      }

      // 3. Determine Orientation (Vertical vs Horizontal)
      // Heuristic: Check category name for "horizontal"
      const isHorizontal = p.type?.toLowerCase().includes('horizontal')

      // 4. Push to correct array
      if (isHorizontal) {
        groups[typeKey].horizontal.push(p)
      } else {
        groups[typeKey].vertical.push(p)
      }
    })

    // Sort each group's products by volume
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

  const [instance, updateInstance] = usePDF({
    document: PriceListPDF({
      products: products,
      groupedData: groupedData,
      bannerUrl: products[0]?.category.priceBanner || '',
      isAuthenticated,
    }),
  })

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
        <div className="flex flex-col lg:flex-row items-stretch">
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
              <span className="text-[90px] font-black text-red-600 leading-none drop-shadow-lg transform scale-y-110">
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

        {/* Divider between sections - Desktop only */}
        <div className="hidden lg:block my-12 border-b border-slate-200 not-print"></div>
      </div>
    )
  }

  return (
    <div className="max-w-full rounded-lg mx-auto p-2 md:p-8 bg-slate-200/30 min-h-screen font-sans">
      {/* Download Button with Dropdown */}
      <div className="flex justify-end gap-2 mb-4 relative">
        <div className="relative">
          <button
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            disabled={downloadType !== null}
            className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors shadow-md font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            title="Download Price List"
          >
            {downloadType !== null ? (
              <Loader2 className="animate-spin" size={18} />
            ) : (
              <Download size={18} />
            )}
            <span>Download</span>
            <ChevronDown
              size={16}
              className={`transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`}
            />
          </button>

          {/* Dropdown Menu */}
          {isDropdownOpen && (
            <>
              {/* Backdrop to close dropdown */}
              <div
                className="fixed inset-0 z-10"
                onClick={() => setIsDropdownOpen(false)}
              />
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-slate-200 z-20 overflow-hidden">
                {instance.loading ? (
                  <div className="w-full flex items-center gap-3 px-4 py-3 text-left">
                    <Loader2 className="animate-spin" size={18} />
                    <div>
                      <div className="text-xs font-medium text-slate-900">
                        Generating...
                      </div>
                    </div>
                  </div>
                ) : (
                  <>
                    <button
                      onClick={() => {
                        const a = document.createElement('a')
                        a.href = instance.url!
                        a.download = 'pricelist.pdf'
                        a.click()
                        setIsDropdownOpen(false)
                        setDownloadType(null)
                      }}
                      disabled={downloadType !== null}
                      className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-slate-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <FileText className="text-red-600" size={18} />
                      <div>
                        <div className="text-xs font-medium text-slate-900">
                          PDF Format
                        </div>
                      </div>
                    </button>
                    <div className="border-t border-slate-200" />
                    <button
                      onClick={() => {
                        setIsDropdownOpen(false)
                        // downloadAsJPG()
                        handleDownloadJPG(instance.blob!)
                      }}
                      disabled={downloadType !== null}
                      className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-slate-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <FileImage className="text-blue-600" size={18} />
                      <div>
                        <div className="text-xs  font-medium text-slate-900">
                          JPG Format
                        </div>
                      </div>
                    </button>
                  </>
                )}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Page Header */}
      <div className="flex justify-center pb-8 relative">
        <OptimizedImage
          src={
            products[0]?.category.priceBanner ||
            generatePlaceholderImage(products[0]?.category.name || 'Water Tank')
          }
          alt="Product"
          className="w-full object-contain rounded"
          width={1920}
          // loading="eager"
        />
      </div>

      {/* Content Area */}
      <div ref={contentRef} className="space-y-4 bg-white">
        {products.length === 0 ? (
          <div className="py-20 text-center text-slate-400 bg-slate-50 rounded-xl border-dashed border-2 border-slate-200">
            No products found.
          </div>
        ) : (
          <>
            {/* Render groups in order: A, B, C, then other letters, then OTHER */}
            {Object.entries(groupedData)
              .sort(([a], [b]) => {
                // Sort: A, B, C first, then other letters alphabetically, OTHER last
                if (a === 'OTHER') return 1
                if (b === 'OTHER') return -1
                return a.localeCompare(b)
              })
              .map(([key]) => renderSection(key, key === 'OTHER'))}
          </>
        )}
      </div>
    </div>
  )
}
