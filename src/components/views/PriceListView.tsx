import { generatePlaceholderImage } from '@/lib/placeholderImage'
import { ProductList } from '@/types'
import html2canvas from 'html2canvas'
import {
  ChevronDown,
  Download,
  FileImage,
  FileText,
  Loader2,
  Package,
} from 'lucide-react'
import React, { useMemo, useRef, useState } from 'react'
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
  const contentRef = useRef<HTMLDivElement>(null)
  const [downloadType, setDownloadType] = useState<'pdf' | 'jpg' | null>(null)
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)

  const captureContent = async () => {
    if (!contentRef.current) return null

    // Save original styles
    const originalStyle = {
      width: contentRef.current.style.width,
      minWidth: contentRef.current.style.minWidth,
      maxWidth: contentRef.current.style.maxWidth,
      position: contentRef.current.style.position,
    }

    // Force desktop layout for capture
    contentRef.current.style.width = '1920px'
    contentRef.current.style.minWidth = '1200px'
    contentRef.current.style.maxWidth = 'none'
    contentRef.current.style.position = 'absolute'
    contentRef.current.style.left = '0'
    contentRef.current.style.top = '0'
    contentRef.current.style.zIndex = '-9999'

    try {
      const canvas = await html2canvas(contentRef.current, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        logging: true,
        backgroundColor: '#ffffff',
        windowWidth: 1920,
        scrollX: 0,
        scrollY: 0,
        ignoreElements: (el) => {
          // Exclude the download button and dropdown from the capture
          if (el.closest('.not-print')) return true
          return false
        },
      })

      return canvas
    } finally {
      // Restore original styles
      contentRef.current.style.width = originalStyle.width
      contentRef.current.style.minWidth = originalStyle.minWidth
      contentRef.current.style.maxWidth = originalStyle.maxWidth
      contentRef.current.style.position = originalStyle.position
      contentRef.current.style.left = ''
      contentRef.current.style.top = ''
      contentRef.current.style.zIndex = ''
    }
  }

  const downloadAsPDF = async () => {
    setDownloadType('pdf')
    try {
      const canvas = await captureContent()
      if (!canvas) return

      const jsPDF = (await import('jspdf')).default
      const imgData = canvas.toDataURL('image/png')

      const pdf = new jsPDF({
        orientation: canvas.width > canvas.height ? 'landscape' : 'portrait',
        unit: 'mm',
        format: 'a4',
      })

      const imgWidth = 210
      const imgHeight = (canvas.height * imgWidth) / canvas.width

      pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight)
      pdf.save(`pricelist-${new Date().toISOString().split('T')[0]}.pdf`)
    } catch (error) {
      console.error('Error downloading PDF:', error)
    } finally {
      setDownloadType(null)
    }
  }

  const downloadAsJPG = async () => {
    setDownloadType('jpg')
    try {
      const canvas = await captureContent()
      if (!canvas) return

      const link = document.createElement('a')
      link.download = `pricelist-${new Date().toISOString().split('T')[0]}.jpg`
      link.href = canvas.toDataURL('image/jpeg', 0.95)
      link.click()
    } catch (error) {
      console.error('Error downloading JPG:', error)
    } finally {
      setDownloadType(null)
    }
  }
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
                <button
                  onClick={() => {
                    setIsDropdownOpen(false)
                    downloadAsPDF()
                  }}
                  disabled={downloadType !== null}
                  className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-slate-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <FileText className="text-red-600" size={18} />
                  <div>
                    <div className="font-medium text-slate-900">PDF Format</div>
                    <div className="text-xs text-slate-500">
                      Best for printing
                    </div>
                  </div>
                </button>
                <div className="border-t border-slate-200" />
                <button
                  onClick={() => {
                    setIsDropdownOpen(false)
                    downloadAsJPG()
                  }}
                  disabled={downloadType !== null}
                  className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-slate-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <FileImage className="text-blue-600" size={18} />
                  <div>
                    <div className="font-medium text-slate-900">JPG Format</div>
                    <div className="text-xs text-slate-500">
                      Best for sharing
                    </div>
                  </div>
                </button>
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
          className="w-full h-auto object-contain rounded"
          width={1920}
          height={240}
          // loading="eager"
        />
      </div>

      {/* Content Area */}
      <div ref={contentRef} className="space-y-4 bg-white">
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
