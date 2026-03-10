import { useCategoryMutations } from '@/hooks/useCategoryMutations'
import { Brand } from '@/services/brandService'
import { Category } from '@/types'
import { Camera, ImageIcon, Upload, UploadCloud, X } from 'lucide-react'
import Image from 'next/image'
import { useEffect, useState } from 'react'
import { SubmitHandler, useForm } from 'react-hook-form'

interface CategoryFormValues {
  name: string
  displayName: string
  brandId: string
}

export const CategoryModal: React.FC<{
  isOpen: boolean
  onClose: () => void
  category?: Category | null
  brands: Brand[]
}> = ({ isOpen, onClose, category, brands }) => {
  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors },
  } = useForm<CategoryFormValues>()

  const { addCategory, updateCategory, isSaving } = useCategoryMutations()
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [selectedBannerFile, setSelectedBannerFile] = useState<File | null>(
    null,
  )
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [previewBannerUrl, setPreviewBannerUrl] = useState<string | null>(null)

  useEffect(() => {
    if (isOpen) {
      // Reset Image State
      setSelectedFile(null)
      setSelectedBannerFile(null)

      if (category) {
        reset({
          name: category.name,
          displayName: category.displayName || '',
          brandId: category.brandId?.toString() || '',
        })
        setPreviewUrl(category.image || null)
        setPreviewBannerUrl(category.priceBanner || null)
      } else {
        reset({ name: '', displayName: '', brandId: '' })
        setPreviewUrl(null)
        setPreviewBannerUrl(null)
      }
    }
  }, [isOpen, category, reset])

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]
      setSelectedFile(file)
      setPreviewUrl(URL.createObjectURL(file))
    }
  }

  const handleBannerChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]
      setSelectedBannerFile(file)
      setPreviewBannerUrl(URL.createObjectURL(file))
    }
  }

  const onSubmit: SubmitHandler<CategoryFormValues> = (data) => {
    // 3. Construct FormData
    const formData = new FormData()
    formData.append('name', data.name)
    formData.append('displayName', data.displayName || '')
    if (data.brandId) {
      formData.append('brandId', data.brandId)
    }
    formData.append('uploadType', 'categories')

    if (selectedFile) {
      formData.append('image', selectedFile)
    }

    if (selectedBannerFile) {
      formData.append('priceBanner', selectedBannerFile)
    }

    const options = {
      onSuccess: () => {
        onClose()
      },
      onError: (error: any) => {
        setError(
          'name',
          {
            message: error.message,
          },
          { shouldFocus: true },
        )
      },
    }

    if (category) {
      formData.append('id', category.id.toString())
      updateCategory(formData, options)
    } else {
      addCategory(formData, options)
    }
  }

  if (!isOpen) return null

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in">
        <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden flex flex-col max-h-[90vh]">
          {/* Header */}
          <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
            <h3 className="font-bold text-lg text-slate-800">
              {category ? 'Edit Category' : 'New Category'}
            </h3>
            <button
              onClick={onClose}
              className="p-2 hover:bg-slate-200 rounded-full transition"
            >
              <X size={20} className="text-slate-500" />
            </button>
          </div>

          <form
            onSubmit={handleSubmit(onSubmit)}
            className="p-6 space-y-5 overflow-y-auto"
          >
            {/* Image Upload Section */}
            <div className="flex justify-center mb-6">
              <div className="relative group">
                <div className="size-24 rounded-full border-2 border-slate-200 overflow-hidden bg-slate-50 flex items-center justify-center">
                  {previewUrl ? (
                    <Image
                      src={previewUrl}
                      alt="Preview"
                      className="size-full object-fill"
                      loading="lazy"
                      width={100}
                      height={100}
                    />
                  ) : (
                    <Camera className="text-slate-300" size={32} />
                  )}
                </div>

                {/* Overlay Button */}
                <label className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 rounded-full cursor-pointer transition-opacity text-white text-xs font-bold">
                  <Upload size={16} className="mr-1" /> Change
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleFileChange}
                    name="image"
                  />
                </label>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Category Name
              </label>
              <input
                {...register('name', { required: 'Category name is required' })}
                className={`w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none `}
                placeholder="e.g. water_bottles"
              />
              {errors.name && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.name.message}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Display Name
              </label>
              <input
                {...register('displayName')}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
                placeholder="e.g. Water Bottles"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Brand Scope
              </label>
              <select
                {...register('brandId')}
                className="w-full px-3 py-2 border rounded-lg bg-white"
              >
                <option value="">-- No Specific Brand --</option>
                {brands.map((brand: Brand) => (
                  <option key={brand.id} value={brand.id}>
                    {brand.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="w-full h-40 shrink-0 bg-slate-200 rounded-lg overflow-hidden relative group border border-slate-300">
              {previewBannerUrl ? (
                <Image
                  src={previewBannerUrl}
                  alt="Price Banner"
                  className="size-full object-cover"
                  fill
                  loading="lazy"
                />
              ) : (
                <div className="flex items-center justify-center h-full text-slate-400">
                  <ImageIcon size={24} />
                </div>
              )}

              {/* Hidden File Input + Overlay Label */}
              <label className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center cursor-pointer text-white text-xs font-medium">
                <UploadCloud size={20} className="mb-1" />
                <span>Change 700x250</span>
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleBannerChange}
                  name="priceBanner"
                />
              </label>
            </div>

            <div className="pt-4 flex justify-end gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-slate-600 font-medium hover:bg-slate-100 rounded-lg transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSaving}
                className="px-4 py-2 bg-primary-600 text-white font-bold rounded-lg hover:bg-primary-700 disabled:opacity-70 flex items-center gap-2 transition"
              >
                {isSaving ? 'Saving...' : 'Save Category'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  )
}
