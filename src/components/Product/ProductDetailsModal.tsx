'use client'
import { useDealer } from '@/contexts/DealerContext'
import { generatePlaceholderImage } from '@/lib/placeholderImage'
import { X } from 'lucide-react'
import { ProductList } from '../../types'
import ProductImageGallery from './ProductImageGallery'

interface ProductDetailsModalProps {
  product: ProductList | null
  onClose: () => void
  isSearchPage?: boolean
}

const ProductDetailsModal: React.FC<ProductDetailsModalProps> = ({
  product,
  onClose,
  isSearchPage = false,
}) => {
  const { isAuthenticated } = useDealer()

  if (!product) return null

  // Determine display values
  const displayImage = product.image

  // Show 'សាកសួរ' if on search page or user is not authenticated
  const showInquiryPrice = isSearchPage || !isAuthenticated

  const displayPrice = showInquiryPrice
    ? 'សាកសួរ'
    : `$${product.price.toFixed(2)}`

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 md:p-6">
      <div
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      <div className="relative bg-white rounded-lg lg:rounded-2xl shadow-2xl w-[90%] md:w-[75%] overflow-y-auto flex flex-col animate-in zoom-in-95 duration-200">
        {/* Product Details */}
        <div className="w-full max-h-[90vh] mx-auto p-2 lg:p-6">
          <button
            onClick={onClose}
            className="p-2 absolute right-8 top-8 z-50 hover:bg-slate-200 rounded-full transition"
          >
            <X size={20} className="text-slate-500" />
          </button>

          <div className="grid grid-cols-1 lg:grid-cols-1 gap-8 lg:gap-12">
            {/* Product Images */}
            <div className="bg-white rounded-lg lg:rounded-2xl shadow-sm border border-gray-100 overflow-hidden ">
              <ProductImageGallery
                images={displayImage}
                name={product.name}
                defaultImage={generatePlaceholderImage(product.name, 200)}
              />
            </div>

            <div className="overflow-y-auto bg-white flex gap-4">
              <div className="">
                <h2 className="sm:text-2xl md:text-3xl font-bold text-slate-900 mb-2">
                  {product.name}
                </h2>
                <div className="flex items-center gap-2 mb-4">
                  {product.volume && (
                    <>
                      <span className="text-slate-500 text-sm font-medium">
                        {product.volume}
                      </span>
                    </>
                  )}
                </div>
              </div>

              <div className="">
                <p className="sm:text-xl md:text-2xl font-bold text-primary-600 mb-2">
                  {displayPrice}
                </p>
                <p className="text-slate-600 leading-relaxed">
                  {product.description}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ProductDetailsModal
