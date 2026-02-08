import { ChevronLeft, ChevronRight, X } from 'lucide-react'
import React, { useEffect, useRef, useState } from 'react'
import '../../styles/image-skeleton.css'

interface ProductImageGalleryProps {
  images: string[]
  name: string
  defaultImage: string
}

const ProductImageGallery: React.FC<ProductImageGalleryProps> = ({
  images,
  name,
  defaultImage,
}) => {
  const [selectedImage, setSelectedImage] = useState(images[0] || defaultImage)
  const [selectedIndex, setSelectedIndex] = useState(0)
  const [isZoomed, setIsZoomed] = useState(false)
  const [isPreviewOpen, setIsPreviewOpen] = useState(false)
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })
  const clickTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const [imageLoaded, setImageLoaded] = useState(false)

  useEffect(() => {
    const index = images.findIndex((img) => img === selectedImage)
    setSelectedIndex(index !== -1 ? index : 0)
    setImageLoaded(false)
  }, [selectedImage, images])

  useEffect(() => {
    if (!isPreviewOpen) return

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsPreviewOpen(false)
        setIsZoomed(false)
      }
    }

    const originalOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    document.addEventListener('keydown', handleKeyDown)

    return () => {
      document.body.style.overflow = originalOverflow
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [isPreviewOpen])

  const handleImageSelect = (img: string, index: number) => {
    setSelectedImage(img)
    setSelectedIndex(index)
    setIsZoomed(false)
  }

  const handlePrevImage = () => {
    const newIndex = selectedIndex === 0 ? images.length - 1 : selectedIndex - 1
    setSelectedImage(images[newIndex] || defaultImage)
    setSelectedIndex(newIndex)
    setIsZoomed(false)
  }

  const handleNextImage = () => {
    const newIndex = selectedIndex === images.length - 1 ? 0 : selectedIndex + 1
    setSelectedImage(images[newIndex] || defaultImage)
    setSelectedIndex(newIndex)
    setIsZoomed(false)
  }

  const handleMainImageClick = () => {
    if (clickTimeoutRef.current) return
    clickTimeoutRef.current = setTimeout(() => {
      setIsPreviewOpen(true)
      setIsZoomed(false)
      clickTimeoutRef.current = null
    }, 200)
  }

  const handleMainImageDoubleClick = () => {
    if (clickTimeoutRef.current) {
      clearTimeout(clickTimeoutRef.current)
      clickTimeoutRef.current = null
    }
    setIsZoomed((prev) => !prev)
  }

  const handlePreviewClose = () => {
    setIsPreviewOpen(false)
    setIsZoomed(false)
  }

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isZoomed) return

    const rect = e.currentTarget.getBoundingClientRect()
    const x = ((e.clientX - rect.left) / rect.width) * 100
    const y = ((e.clientY - rect.top) / rect.height) * 100

    setMousePosition({ x, y })
  }

  if (images.length === 0) {
    return (
      <div className="image-wrapper relative bg-gray-50 rounded-2xl p-6 flex items-center justify-center">
        <img
          src={selectedImage}
          alt={name}
          className="object-contain rounded-xl max-h-full"
          loading="lazy"
        />
      </div>
    )
  }

  return (
    <div className="relative">
      <div className="flex flex-col md:flex-row gap-6 p-4">
        {/* Thumbnails */}
        <div className="flex md:flex-col gap-3 overflow-auto">
          {images.map((img, index) => (
            <button
              key={index}
              onClick={() => handleImageSelect(img, index)}
              className={`border-2 rounded-xl p-1 ${
                selectedImage === img ? 'border-indigo-600' : 'border-gray-200'
              }`}
            >
              {/* <img
                src={img}
                alt={`${name} ${index}`}
                loading="lazy"
                className="size-20 object-contain rounded-lg"
              /> */}
              <img
                src={img}
                alt={`${name} ${index}`}
                className="size-20 object-contain rounded-lg"
                loading="lazy"
                onLoad={() => setImageLoaded(true)}
                onError={(e) =>
                  ((e.target as HTMLImageElement).src = selectedImage)
                }
              />
            </button>
          ))}
        </div>

        {/* Main Image */}
        <div
          className="relative image-wrapper flex-1 flex items-center justify-center bg-gray-50 rounded-2xl p-6"
          onMouseMove={handleMouseMove}
          onClick={handleMainImageClick}
          onDoubleClick={handleMainImageDoubleClick}
          style={{ cursor: isZoomed ? 'zoom-out' : 'pointer' }}
        >
          {!imageLoaded && <div className="image-skeleton z-50" />}

          <img
            src={selectedImage}
            alt={name}
            loading="lazy"
            decoding="async"
            onLoad={() => setImageLoaded(true)}
            className={`transition-transform duration-300 md:max-h-[500px] max-h-[320px] ${
              isZoomed ? 'scale-150' : 'scale-100'
            } ${imageLoaded ? 'image-loaded' : ''}`}
            style={
              isZoomed
                ? { transformOrigin: `${mousePosition.x}% ${mousePosition.y}%` }
                : {}
            }
            onError={(e) =>
              ((e.target as HTMLImageElement).src = selectedImage)
            }
          />

          {/* Navigation */}
          <button
            onClick={handlePrevImage}
            className="absolute left-2 bg-white rounded-full p-2"
          >
            <ChevronLeft size={20} />
          </button>

          <button
            onClick={handleNextImage}
            className="absolute right-2 bg-white rounded-full p-2"
          >
            <ChevronRight size={20} />
          </button>
        </div>
      </div>

      {isPreviewOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
          onClick={handlePreviewClose}
        >
          <button
            onClick={handlePreviewClose}
            className="absolute top-4 right-4 rounded-full p-2 bg-white/90 shadow-md"
            aria-label="Close image preview"
          >
            <X size={20} />
          </button>

          <button
            onClick={(event) => {
              event.stopPropagation()
              handlePrevImage()
            }}
            className="absolute left-4 bg-white/90 rounded-full p-2"
            aria-label="Previous image"
          >
            <ChevronLeft size={20} />
          </button>

          <div
            className="max-h-[90vh] max-w-[90vw]"
            onClick={(event) => event.stopPropagation()}
          >
            <img
              src={selectedImage}
              alt={name}
              className="max-h-[90vh] max-w-[90vw] object-contain rounded-lg"
              loading="lazy"
              decoding="async"
            />
          </div>

          <button
            onClick={(event) => {
              event.stopPropagation()
              handleNextImage()
            }}
            className="absolute right-4 bg-white/90 rounded-full p-2"
            aria-label="Next image"
          >
            <ChevronRight size={20} />
          </button>
        </div>
      )}
    </div>
  )
}

export default ProductImageGallery
