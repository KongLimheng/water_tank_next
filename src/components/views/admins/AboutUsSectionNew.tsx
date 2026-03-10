'use client'

import { AboutUsData, BannerItem } from '@/types'
import { ImageIcon, Plus, Trash2, UploadCloud } from 'lucide-react'
import Image from 'next/image'
import { useFieldArray, useFormContext } from 'react-hook-form'
import { toast } from 'react-toastify'
import { TipTapEditor } from '../../TipTapEditor'

interface SettingsFormValues {
  phone: string
  email: string
  address: string
  mapUrl: string
  banners: BannerItem[]
  aboutUs: AboutUsData
}

function AboutUsSectionInner() {
  const { control, watch, setValue, getValues } =
    useFormContext<SettingsFormValues>()

  // Watch the entire aboutUs object
  const watchedAboutUs = watch('aboutUs')

  // Handle Section 1 image change
  const handleSection1ImageChange = (files: FileList | null) => {
    if (files && files[0]) {
      const file = files[0]
      const previewUrl = URL.createObjectURL(file)
      setValue('aboutUs.section1.image', previewUrl, { shouldDirty: true })
      setValue('aboutUs.section1.imageFile', file, { shouldDirty: true })
    }
  }

  // Configure field array for section2 items
  const {
    fields: section2Fields,
    append: appendSection2,
    remove: removeSection2,
  } = useFieldArray({
    control,
    name: 'aboutUs.section2',
  })

  // Handle Section 2 item image change
  const handleSection2ImageChange = (
    itemIndex: number,
    files: FileList | null,
  ) => {
    if (files && files[0]) {
      const file = files[0]
      const previewUrl = URL.createObjectURL(file)
      setValue(`aboutUs.section2.${itemIndex}.image`, previewUrl, {
        shouldDirty: true,
      })
      setValue(`aboutUs.section2.${itemIndex}.imageFile`, file, {
        shouldDirty: true,
      })
    }
  }

  // Add a new section 2 item
  const addSection2Item = () => {
    appendSection2({ image: '', content: '' })
  }

  // Remove a section 2 item
  const removeSection2Item = (index: number) => {
    if (section2Fields.length === 1) {
      toast.warning('At least one item is required in section 2')
      return
    }
    removeSection2(index)
  }

  // Configure field array for section3 items (certificates)
  const {
    fields: section3Fields,
    append: appendSection3,
    remove: removeSection3,
  } = useFieldArray({
    control,
    name: 'aboutUs.section3.items',
  })

  // Handle Section 3 item image change
  const handleSection3ImageChange = (
    itemIndex: number,
    files: FileList | null,
  ) => {
    if (files && files[0]) {
      const file = files[0]
      const previewUrl = URL.createObjectURL(file)
      setValue(`aboutUs.section3.items.${itemIndex}.image`, previewUrl)
      setValue(`aboutUs.section3.items.${itemIndex}.imageFile`, file)
    }
  }

  // Add / Remove Section 3 items
  const addSection3Item = () => {
    appendSection3({ title: '', image: '' })
  }

  const removeSection3Item = (index: number) => {
    if (section3Fields.length === 1) {
      return
    }
    removeSection3(index)
  }

  return (
    <div className="space-y-6 pt-2">
      <div className="border-b border-slate-100 pb-2">
        <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
          <ImageIcon size={20} className="text-primary-600" /> About Us
        </h3>
      </div>

      <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-6">
        {/* === SECTION 1: Main Image & Content === */}
        <div className="space-y-4">
          <h4 className="text-md font-bold text-slate-700">
            Section 1: Main Image &amp; Content
          </h4>
          <div className="">
            {/* Section 1 Image */}
            <div className="">
              <label className="block text-sm font-bold text-slate-700 mb-1.5">
                Main Image
              </label>
              <div className="w-full h-64 bg-slate-200 rounded-lg overflow-hidden relative group border border-slate-300">
                {watchedAboutUs?.section1?.image ? (
                  <Image
                    src={watchedAboutUs?.section1?.image}
                    alt="Section 1"
                    className="size-full object-cover"
                    fill
                  />
                ) : (
                  <div className="flex items-center justify-center h-full text-slate-400">
                    <ImageIcon size={24} />
                  </div>
                )}
                <label className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center cursor-pointer text-white text-xs font-medium">
                  <UploadCloud size={20} className="mb-1" />
                  <span>Upload</span>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => handleSection1ImageChange(e.target.files)}
                  />
                </label>
              </div>
            </div>

            {/* Section 1 Content */}
            <div className="space-y-3">
              <label className="block text-sm font-bold text-slate-700 mb-1.5">
                Content
              </label>
              <TipTapEditor
                value={watchedAboutUs?.section1?.content || ''}
                onChange={(content) =>
                  setValue('aboutUs.section1.content', content, {
                    shouldDirty: true,
                  })
                }
              />
            </div>
          </div>
        </div>

        {/* === SECTION 2: Items Array === */}
        <div className="space-y-4 border-t border-slate-200 pt-6 flex flex-col">
          <div className="flex justify-between items-center">
            <h4 className="text-md font-bold text-slate-700">
              Section 2: Product/Item Gallery
            </h4>
          </div>

          <div className="space-y-4">
            {section2Fields.map((field, itemIndex) => {
              const watchedItem = watch(`aboutUs.section2.${itemIndex}`)

              return (
                <div
                  key={field.id}
                  className="p-4 bg-white border border-slate-200 rounded-lg space-y-3"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-bold text-slate-700">
                      Item {itemIndex + 1}
                    </span>
                    {section2Fields.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeSection2Item(itemIndex)}
                        className="p-2 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 transition"
                        title="Remove Item"
                      >
                        <Trash2 size={16} />
                      </button>
                    )}
                  </div>
                  <div className="flex gap-4 md:flex-row flex-col">
                    {/* Item Image */}
                    <div className="">
                      <span className="block text-sm font-bold text-slate-700 mb-1.5">
                        Product Image
                      </span>
                      <div className="w-64 aspect-square bg-slate-200 rounded-lg overflow-hidden relative group border border-slate-300">
                        {watchedItem?.image ? (
                          <Image
                            src={watchedItem?.image}
                            alt={`Item ${itemIndex + 1}`}
                            className="size-full object-cover"
                            fill
                            sizes="( max-width: 768px ) 50vw, 33vw"
                          />
                        ) : (
                          <div className="flex items-center justify-center h-full text-slate-400">
                            <ImageIcon size={24} />
                          </div>
                        )}
                        <label className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center cursor-pointer text-white text-xs font-medium">
                          <UploadCloud size={20} className="mb-1" />
                          <span>Upload</span>
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) =>
                              handleSection2ImageChange(
                                itemIndex,
                                e.target.files,
                              )
                            }
                          />
                        </label>
                      </div>
                    </div>

                    {/* Item Content */}
                    <div className="flex-1">
                      <span className="block text-sm font-bold text-slate-700 mb-1.5">
                        Content
                      </span>
                      <TipTapEditor
                        value={watchedItem?.content || ''}
                        onChange={(content) =>
                          setValue(
                            `aboutUs.section2.${itemIndex}.content`,
                            content,
                            { shouldDirty: true },
                          )
                        }
                      />
                    </div>
                  </div>
                </div>
              )
            })}
          </div>

          {section2Fields.length === 0 && (
            <div className="text-center py-8 bg-white rounded-lg border border-dashed border-slate-300 text-slate-400">
              <p className="text-sm">No items added yet</p>
              <button
                type="button"
                onClick={addSection2Item}
                className="mt-2 text-sm font-bold text-primary-600 hover:underline"
              >
                Add first item
              </button>
            </div>
          )}

          {section2Fields.length < 10 && (
            <button
              type="button"
              onClick={addSection2Item}
              className="text-xs font-bold justify-end text-primary-600 flex items-center gap-1 hover:underline"
            >
              <Plus size={14} /> Add Item
            </button>
          )}
        </div>

        {/* === SECTION 3: Items Array === */}
        <div className="space-y-4 border-t border-slate-200 pt-6 flex flex-col">
          <div className="flex justify-between items-center">
            <h4 className="text-md font-bold text-slate-700">
              Section 3: Quality & Certificates Gallery
            </h4>
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1.5">
              Description
            </label>
            <TipTapEditor
              value={watchedAboutUs?.section3?.description || ''}
              onChange={(content) =>
                setValue('aboutUs.section3.description', content, {
                  shouldDirty: true,
                })
              }
            />
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-3 gap-2 lg:gap-4">
            {section3Fields.map((field, itemIndex) => {
              const watchedItem = watch(`aboutUs.section3.items.${itemIndex}`)

              return (
                <div
                  key={field.id}
                  className="p-4 bg-white border border-slate-200 rounded-lg space-y-3"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-bold text-slate-700">
                      Certificate {itemIndex + 1}
                    </span>
                    {section3Fields.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeSection3Item(itemIndex)}
                        className="p-2 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 transition"
                        title="Remove Item"
                      >
                        <Trash2 size={16} />
                      </button>
                    )}
                  </div>

                  <div className="flex flex-col gap-4">
                    {/* Item Image */}
                    <div className="">
                      <label className="block text-sm font-bold text-slate-700 mb-1.5">
                        Image
                      </label>
                      <div className="w-full h-80 bg-slate-200 rounded-lg overflow-hidden relative group border border-slate-300">
                        {watchedItem?.image ? (
                          <Image
                            src={watchedItem?.image}
                            alt={`Certificate ${itemIndex + 1}`}
                            className="size-full object-contain"
                            fill
                            sizes="( max-width: 768px ) 100vw, 25vw"
                          />
                        ) : (
                          <div className="flex items-center justify-center h-full text-slate-400">
                            <ImageIcon size={24} />
                          </div>
                        )}
                        <label className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center cursor-pointer text-white text-xs font-medium">
                          <UploadCloud size={20} className="mb-1" />
                          <span>Upload</span>
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) =>
                              handleSection3ImageChange(
                                itemIndex,
                                e.target.files,
                              )
                            }
                          />
                        </label>
                      </div>
                    </div>

                    {/* Item Content */}
                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-1.5">
                        Title
                      </label>
                      <input
                        type="text"
                        className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-600 focus:border-transparent text-sm"
                        value={watchedItem?.title || ''}
                        onChange={(e) =>
                          setValue(
                            `aboutUs.section3.items.${itemIndex}.title`,
                            e.target.value,
                            { shouldDirty: true },
                          )
                        }
                      />
                    </div>
                  </div>
                </div>
              )
            })}
          </div>

          {section3Fields.length < 10 && (
            <button
              type="button"
              onClick={addSection3Item}
              className="text-xs justify-end font-bold text-primary-600 flex items-center gap-1 hover:underline"
            >
              <Plus size={14} /> Add Certificate
            </button>
          )}

          {section3Fields.length === 0 && (
            <div className="text-center py-8 bg-white rounded-lg border border-dashed border-slate-300 text-slate-400">
              <p className="text-sm">No items added yet</p>
              <button
                type="button"
                onClick={addSection3Item}
                className="mt-2 text-sm font-bold text-primary-600 hover:underline"
              >
                Add first item
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default AboutUsSectionInner
