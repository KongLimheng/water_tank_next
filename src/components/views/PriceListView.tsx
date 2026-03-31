import { generatePlaceholderImage } from '@/lib/placeholderImage'
import { ProductList } from '@/types'
import { toCanvas } from 'html-to-image'
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

  const captureContent = async (opts?: { width?: number; scale?: number }) => {
    if (!contentRef.current) return null

    const width = opts?.width ?? 1920
    const scale = opts?.scale ?? 2

    const original = contentRef.current

    // ✅ Clone node
    const clone = original.cloneNode(true) as HTMLElement

    // ✅ Create offscreen container
    const container = document.createElement('div')
    container.style.position = 'fixed'
    container.style.top = '-99999px'
    container.style.left = '0'
    container.style.width = `${width}px`
    container.style.background = '#ffffff'
    container.style.zIndex = '-1'

    // ✅ Force layout size
    clone.style.width = `${width}px`
    clone.style.minWidth = `${width}px`
    clone.style.maxWidth = `${width}px`

    clone.style.height = clone.clientHeight ? `${clone.clientHeight}px` : 'auto'

    container.appendChild(clone)
    document.body.appendChild(container)

    try {
      // ✅ Wait for fonts
      await document.fonts.ready

      // ✅ Wait for images inside clone
      const images = Array.from(clone.querySelectorAll('img'))
      await Promise.all(
        images.map((img) => {
          if (img.complete) return Promise.resolve()
          return new Promise((res) => {
            img.onload = res
            img.onerror = res
          })
        }),
      )
      // ✅ Wait for layout paint
      await new Promise((r) => setTimeout(r, 100))

      // ✅ Capture
      const canvas = await toCanvas(clone, {
        width,
        height: 1750,
        pixelRatio: scale,
        backgroundColor: '#ffffff',
        cacheBust: true,

        filter: (node: HTMLElement) => {
          if (node.classList?.contains('not-print')) return false
          if (node.classList?.contains('lg:flex-row')) {
            node.style.flexDirection = 'row'
            return true
          }

          if (node.classList?.contains('lg:hidden')) {
            return false
          }

          if (node.classList?.contains('lg:flex')) {
            node.style.justifyContent = 'center'
            node.style.display = 'flex'
            return true
          }
          return true
        },
      })

      console.log(canvas)

      return canvas
    } catch (err) {
      console.error('capture failed', err)
      return null
    } finally {
      // ✅ Cleanup
      document.body.removeChild(container)
    }
  }

  const downloadAsPDF = async () => {
    setDownloadType('pdf')
    try {
      const canvas = await captureContent({
        width: 1920,
        scale: 2,
      })
      if (!canvas) return
      const jsPDF = (await import('jspdf')).default

      const orientation =
        canvas.width > canvas.height ? 'landscape' : 'portrait'
      const pdf = new jsPDF({ orientation, unit: 'mm', format: 'a4' })

      const pdfWidth = pdf.internal.pageSize.getWidth()
      const pdfHeight = pdf.internal.pageSize.getHeight()

      // px per mm for this rendered canvas when scaled to pdf width
      const pxPerMm = canvas.width / pdfWidth
      const pageHeightPx = Math.floor(pdfHeight * pxPerMm)

      let remainingHeight = canvas.height
      let position = 0

      while (remainingHeight > 0) {
        const pageCanvas = document.createElement('canvas')
        pageCanvas.width = canvas.width
        pageCanvas.height = Math.min(remainingHeight, pageHeightPx)

        const ctx = pageCanvas.getContext('2d')
        if (ctx) {
          ctx.fillStyle = '#ffffff'
          ctx.fillRect(0, 0, pageCanvas.width, pageCanvas.height)
          ctx.drawImage(
            canvas,
            0,
            position,
            canvas.width,
            pageCanvas.height,
            0,
            0,
            pageCanvas.width,
            pageCanvas.height,
          )
        }

        const pageData = pageCanvas.toDataURL('image/png')
        const pageImgHeightMm = (pageCanvas.height * pdfWidth) / canvas.width

        pdf.addImage(pageData, 'PNG', 0, 0, pdfWidth, pageImgHeightMm)

        remainingHeight -= pageCanvas.height
        position += pageCanvas.height
        if (remainingHeight > 0) pdf.addPage()
      }

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
      const canvas = await captureContent({
        width: 1920,
        scale: 3,
      })
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
