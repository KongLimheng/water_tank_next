import { getCategories } from '@/services/categoryService'
import { getSettings } from '@/services/settingsService'
import {
  AboutUsData,
  AboutUsItem,
  AboutUsSection3Item,
  Category,
  SocialItem,
} from '@/types'
import { useQuery } from '@tanstack/react-query'
import {
  AlertCircle,
  CheckCircle2,
  Globe,
  HelpCircle,
  Image as ImageIcon,
  Mail,
  MapPin,
  Phone,
  Plus,
  Save,
  Trash2,
  UploadCloud,
  User,
} from 'lucide-react'
import { useCallback, useEffect, useRef, useState } from 'react'
import {
  Controller,
  FormProvider,
  useFieldArray,
  useForm,
} from 'react-hook-form'
import { toast } from 'react-toastify'

// Import the AboutUsSection component
import { OptimizedImage } from '@/components/ui/OptimizedImage'
import { useSettingMutations } from '@/hooks/useSettingMutations'
import AboutUsSection from './AboutUsSectionNew'

// Define the shape of our form
interface BannerItem {
  name: string
  banner_image: string
  categoryId?: number | null
  file?: File // Optional: used for new uploads before they become URLs
}

interface SettingsFormValues {
  phone: string
  email: string
  address: string
  mapUrl: string
  banners: BannerItem[]
  aboutUs: AboutUsData
  socials: SocialItem[]
}

type SettingsTab = 'contact' | 'banners' | 'about'

export const SettingsView = () => {
  const [isLoading, setIsLoading] = useState(false)
  const [activeTab, setActiveTab] = useState<SettingsTab>('contact')
  const { updateSettings, isSaving } = useSettingMutations()
  const [hasSubmitted, setHasSubmitted] = useState(false)

  // 1. Setup React Hook Form
  const methods = useForm<SettingsFormValues>({
    defaultValues: {
      phone: '',
      email: '',
      address: '',
      mapUrl: '',
      banners: [{ name: 'Main Banner', banner_image: '', categoryId: null }],
      socials: [{ image: '', url: '' }],
      aboutUs: {
        section1: {
          image: '',
          content: '',
        },
        section2: [{ image: '', content: '' }],
        section3: {
          description: '',
          items: [{ title: 'Certificate 1', image: '' }],
        },
      },
    },
  })

  const {
    register,
    control,
    handleSubmit,
    watch,
    getValues,
    reset,
    formState: { errors, isDirty: isRHFDirty },
  } = methods

  // Watch all form values for manual dirty tracking
  const watchedValues = watch()

  // Store initial values for comparison
  const [initialValues, setInitialValues] = useState<SettingsFormValues | null>(
    null,
  )
  const hasLoadedInitialValues = useRef(false)

  // Ref to track dirty state for keyboard shortcut
  const isDirtyRef = useRef(false)

  // Update dirty state ref whenever form state changes
  useEffect(() => {
    isDirtyRef.current = isRHFDirty
  }, [isRHFDirty])

  // Check if form is dirty - use RHF's built-in tracking as primary source
  useEffect(() => {
    // Once initial values are loaded, also compare with watched values
    // as a fallback/secondary check
    if (initialValues && !hasLoadedInitialValues.current) {
      hasLoadedInitialValues.current = true
    }
  }, [watchedValues, initialValues])

  const { data: settings } = useQuery({
    queryKey: ['site-settings'],
    queryFn: getSettings,
    staleTime: 1000 * 60 * 60,
  })

  const { data: categories = [], isLoading: isCategoriesLoading } = useQuery<
    Category[]
  >({
    queryKey: ['categories'],
    queryFn: getCategories,
    staleTime: 1000 * 60 * 60,
  })

  // Force disable save button until initial data loads to prevent premature saves
  const isInitialLoading =
    !initialValues && !isCategoriesLoading && !settings?.banners

  // 2. Setup Field Array for Banners
  const { fields, append, remove, update } = useFieldArray({
    control,
    name: 'banners',
  })

  const {
    fields: socialFields,
    append: appendSocial,
    remove: removeSocial,
    update: updateSocial,
  } = useFieldArray({
    control,
    name: 'socials',
  })

  const normalizeCategoryId = (value: unknown): number | null => {
    if (value === null || value === undefined || value === '') return null
    const parsed = Number(value)
    return Number.isNaN(parsed) ? null : parsed
  }

  // Watch map URL for live preview and validation
  const watchedMapUrl = watch('mapUrl')

  // 3. Load Data
  useEffect(() => {
    const data = settings
    if (data) {
      const rawBanners = (data.banners as unknown as BannerItem[]) || []

      const normalizedBanners = rawBanners.map((banner, index) => ({
        name: banner.name || '',
        banner_image: banner.banner_image || '',
        categoryId: index === 0 ? null : normalizeCategoryId(banner.categoryId),
      }))

      const loadedBanners =
        normalizedBanners.length > 0
          ? normalizedBanners
          : [{ name: 'Main Banner', banner_image: '', categoryId: null }]

      const formValues = {
        phone: data.phone || '',
        email: data.email || '',
        address: data.address || '',
        mapUrl: data.mapUrl || '',
        banners: loadedBanners,
        aboutUs: data.aboutUs,
        socials: data.socials || [{ image: '', url: '' }],
      }

      reset(formValues)
      setInitialValues(formValues)
    }
  }, [reset, settings])

  // Helper: Extract URL from iframe tag
  const extractUrl = (input: string) => {
    if (!input) return ''
    const match = input.match(/src=["']([^"']+)["']/)
    return match && match[1] ? match[1] : input.trim()
  }

  // Helper: Map Validation
  const getMapValidationState = (url: string) => {
    const clean = extractUrl(url)
    if (!clean) return { status: 'empty', message: null }

    if (
      clean.includes('maps.app.goo.gl') ||
      (clean.includes('maps.google.com') && !clean.includes('embed'))
    ) {
      return {
        status: 'error',
        message:
          'This looks like a Share Link. Please use the "Embed a map" HTML.',
      }
    }
    if (!clean.includes('google.com/maps/embed')) {
      return {
        status: 'warning',
        message: 'Warning: This URL may not be a valid Google Maps Embed link.',
      }
    }
    return { status: 'valid', message: 'Valid Embed Link detected.' }
  }

  const mapValidation = getMapValidationState(watchedMapUrl)
  const previewMapUrl = extractUrl(watchedMapUrl)

  const handleBannerImageChange = (index: number, files: FileList | null) => {
    if (files && files[0]) {
      const file = files[0]
      const previewUrl = URL.createObjectURL(file)

      const currentValues = getValues(`banners.${index}`)

      update(index, {
        ...currentValues,
        banner_image: previewUrl,
        file: file,
      })
    }
  }

  const handleSocialImageChange = (index: number, files: FileList | null) => {
    if (files && files[0]) {
      const file = files[0]
      const previewUrl = URL.createObjectURL(file)

      const currentValues = getValues(`socials.${index}`)

      updateSocial(index, {
        ...currentValues,
        image: previewUrl,
        imageFile: file,
      })
    }
  }

  // 5. Submit Handler
  const onSubmit = async (data: SettingsFormValues) => {
    if (hasSubmitted || isSaving) return
    setHasSubmitted(true)
    setIsLoading(true)
    try {
      const processedBanners = await Promise.all(
        data.banners.map(async (b: any, index: number) => {
          const categoryId =
            index === 0 ? null : normalizeCategoryId(b.categoryId)
          if (b.file) {
            // const uploadResult = await uploadService.upload(b.file)
            // return { name: b.name, banner_image: uploadResult.url }

            // For now, we just keep the local preview or the file name to simulate
            console.log(`Uploading file for ${b.name}...`)
            return {
              name: b.name,
              banner_image: b.banner_image,
              categoryId,
              file: b.file,
            } // In real app, replace this with server URL
          }
          // No new file, keep existing URL
          return {
            name: b.name,
            banner_image: b.banner_image,
            categoryId,
            file: null,
          }
        }),
      )

      // Process aboutUs images
      const aboutUs = data.aboutUs || {
        section1: { image: '', content: '' },
        section2: [{ image: '', content: '' }],
        section3: {
          description: '',
          items: [{ title: 'Certificate 1', image: '' }],
        },
      }

      const processedAboutUs = {
        section1: {
          image: aboutUs.section1?.image,
          content: aboutUs.section1?.content,
          imageFile: aboutUs.section1?.imageFile,
        },
        section2: await Promise.all(
          aboutUs.section2.map(async (item: AboutUsItem) => ({
            image: item.image,
            content: item.content,
            imageFile: item.imageFile,
          })),
        ),
        section3: {
          description: aboutUs.section3.description,

          items: await Promise.all(
            aboutUs.section3.items.map(async (item: AboutUsSection3Item) => ({
              title: item.title,
              image: item.image,
              imageFile: item.imageFile,
            })),
          ),
        },
      }

      const processedSocials = await Promise.all(
        data.socials.map(async (s: SocialItem, index: number) => {
          if (s.imageFile && s.imageFile instanceof File) {
            // const uploadResult = await uploadService.upload(s.imageFile)
            // return { name: s.name, image: uploadResult.url }

            // For now, we just keep the local preview or the file name to simulate
            console.log(`Uploading file for ${s.url}...`)
            return {
              url: s.url,
              imageFile: s.imageFile,
            } // In real app, replace this with server URL
          }
          // No new file, keep existing URL
          return {
            url: s.url,
            imageFile: null,
            image: s.image,
          }
        }),
      )

      const cleanMapUrl = extractUrl(data.mapUrl)

      const payload = {
        ...data,
        mapUrl: cleanMapUrl,
        banners: processedBanners,
        aboutUs: processedAboutUs,
        socials: processedSocials,
      }

      updateSettings(payload as any)
    } catch (e) {
      console.error(e)
      toast.error('Failed to save settings')
      setHasSubmitted(false)
    } finally {
      setIsLoading(false)
      setHasSubmitted(false)
    }
  }

  // Keyboard shortcut: Ctrl+S to save
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      const isCtrlOrMeta = e.ctrlKey || e.metaKey
      if (isCtrlOrMeta && e.key === 's') {
        e.preventDefault()
        // Use ref for reliable dirty state tracking
        if (
          isDirtyRef.current &&
          !isLoading &&
          !isSaving &&
          !hasSubmitted &&
          !isInitialLoading
        ) {
          handleSubmit(onSubmit)()
        } else if (!isDirtyRef.current) {
          toast.warning('No changes to save')
        } else if (isSaving || isLoading) {
          toast.warning('Already saving...')
        }
      }
    },
    [
      isLoading,
      isSaving,
      hasSubmitted,
      isInitialLoading,
      handleSubmit,
      onSubmit,
    ],
  )

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown)
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [handleKeyDown])

  return (
    <div className="w-full max-w-5xl mx-auto space-y-6 animate-in fade-in duration-300 p-1">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Site Settings</h2>
          <p className="text-slate-500 text-sm">
            Update contact information, map location, and homepage banners.
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs text-slate-400 bg-slate-100 px-3 py-1.5 rounded-lg">
          <span>Press</span>
          <kbd className="px-2 py-1 bg-white border border-slate-300 rounded font-mono text-xs">
            Ctrl
          </kbd>
          <span>+</span>
          <kbd className="px-2 py-1 bg-white border border-slate-300 rounded font-mono text-xs">
            S
          </kbd>
          <span>to save</span>
        </div>
      </div>

      <FormProvider {...methods}>
        <form
          onSubmit={handleSubmit(onSubmit)}
          className={`bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden`}
        >
          {/* --- Tabs Navigation --- */}
          <div className="border-b border-slate-200 bg-slate-50 overflow-x-auto scrollbar-hide -mx-1 sm:mx-0">
            <div className="flex min-w-max">
              <button
                type="button"
                onClick={() => setActiveTab('contact')}
                className={`md:flex-1 flex items-center justify-center gap-2 px-4 sm:px-6 py-4 text-sm font-bold transition-colors whitespace-nowrap flex-shrink-0 ${
                  activeTab === 'contact'
                    ? 'bg-white text-primary-600 border-b-2 border-primary-600'
                    : 'text-slate-500 hover:text-slate-700 hover:bg-slate-100'
                }`}
              >
                <Phone size={18} />
                <span className="hidden sm:inline">Contact Details</span>
                <span className="sm:hidden">Contact</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('banners')}
                className={`md:flex-1 flex items-center justify-center gap-2 px-4 sm:px-6 py-4 text-sm font-bold transition-colors whitespace-nowrap flex-shrink-0 ${
                  activeTab === 'banners'
                    ? 'bg-white text-primary-600 border-b-2 border-primary-600'
                    : 'text-slate-500 hover:text-slate-700 hover:bg-slate-100'
                }`}
              >
                <ImageIcon size={18} />
                <span className="hidden sm:inline">Promotion Banners</span>
                <span className="sm:hidden">Banners</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('about')}
                className={`md:flex-1 flex items-center justify-center gap-2 px-4 sm:px-6 py-4 text-sm font-bold transition-colors whitespace-nowrap flex-shrink-0 ${
                  activeTab === 'about'
                    ? 'bg-white text-primary-600 border-b-2 border-primary-600'
                    : 'text-slate-500 hover:text-slate-700 hover:bg-slate-100'
                }`}
              >
                <User size={18} />
                <span className="hidden sm:inline">About Us</span>
                <span className="sm:hidden">About</span>
              </button>
            </div>
          </div>

          {/* --- Tab Content --- */}
          <div className="p-6">
            {/* Contact Details Tab */}
            {activeTab === 'contact' && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-1.5">
                      Phone Number
                    </label>
                    <div className="relative">
                      <Phone
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                        size={16}
                      />
                      <input
                        {...register('phone')}
                        className="w-full pl-9 pr-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-1.5">
                      Email Address
                    </label>
                    <div className="relative">
                      <Mail
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                        size={16}
                      />
                      <input
                        {...register('email')}
                        className="w-full pl-9 pr-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none"
                      />
                    </div>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1.5">
                    Address
                  </label>
                  <div className="relative">
                    <MapPin
                      className="absolute left-3 top-3 text-slate-400"
                      size={16}
                    />
                    <textarea
                      {...register('address')}
                      rows={2}
                      className="w-full pl-9 pr-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none resize-none"
                    />
                  </div>
                </div>

                <div className="flex border-b border-slate-100 justify-between items-center">
                  <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                    <Globe size={20} className="text-primary-600" /> Socials
                    Media
                  </h3>

                  <button
                    type="button"
                    onClick={() => appendSocial({ url: '', image: '' })}
                    className=" text-xs font-bold text-primary-600 flex items-center gap-1 hover:underline justify-self-end"
                  >
                    <Plus size={14} /> Add Social
                  </button>
                </div>
                <div className="flex flex-col gap-4">
                  {socialFields.map((social, index) => (
                    <div
                      className="flex gap-4 justify-center items-center"
                      key={index}
                    >
                      <div className="size-10 md:size-16 shrink-0 bg-slate-200 rounded-full overflow-hidden relative group border border-slate-300">
                        {social.image ? (
                          <OptimizedImage
                            src={social.image}
                            alt="Banner"
                            className="size-full object-contain aspect-square"
                            width={64}
                            height={64}
                          />
                        ) : (
                          <div className="flex items-center justify-center h-full text-slate-400">
                            <ImageIcon size={24} />
                          </div>
                        )}

                        {/* Hidden File Input + Overlay Label */}
                        <label className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center cursor-pointer text-white text-xs font-medium">
                          <UploadCloud size={20} className="mb-1" />
                          <span>Change</span>
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) =>
                              handleSocialImageChange(index, e.target.files)
                            }
                          />
                        </label>
                      </div>

                      <div className="flex-1">
                        <label className="block text-sm font-bold text-slate-700 mb-1.5">
                          Url
                        </label>
                        <input
                          type="text"
                          className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-600 focus:border-transparent text-sm"
                          {...register(`socials.${index}.url` as const)}
                          placeholder="www.facebook.com"
                        />
                      </div>

                      <button
                        type="button"
                        onClick={() => removeSocial(index)}
                        className={`p-2 rounded-lg transition ${
                          fields.length === 1
                            ? 'text-slate-300 cursor-not-allowed'
                            : 'text-slate-400 hover:text-red-500 hover:bg-red-50'
                        }`}
                        title={
                          fields.length === 1
                            ? 'At least one banner is required'
                            : 'Remove Banner'
                        }
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  ))}
                </div>

                {/* --- Map Configuration Section --- */}
                <div className="space-y-4 pt-2">
                  <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2 pb-2 border-b border-slate-100">
                    <Globe size={20} className="text-primary-600" /> Map
                    Location
                  </h3>

                  <div className="grid grid-cols-1 gap-6">
                    <div className="bg-blue-50 text-blue-800 text-xs p-3 rounded-lg mb-3 flex gap-2 items-start">
                      <HelpCircle size={16} className="shrink-0 mt-0.5" />
                      <div>
                        <p className="font-bold mb-1">
                          How to get the correct link:
                        </p>
                        <ol className="list-decimal ml-4 space-y-1">
                          <li>
                            Go to your location on <strong>Google Maps</strong>.
                          </li>
                          <li>
                            Click the <strong>Share</strong> button.
                          </li>
                          <li>
                            Select the <strong>Embed a map</strong> tab.
                          </li>
                          <li>
                            Click <strong>Copy HTML</strong> and paste it below.
                          </li>
                        </ol>
                      </div>
                    </div>
                    <div className="lg:col-span-1 space-y-3">
                      <label className="block text-sm font-bold text-slate-700">
                        Google Maps Embed Code
                      </label>
                      <textarea
                        {...register('mapUrl')}
                        rows={4}
                        placeholder='<iframe src="https://www.google.com/maps/embed?..." ...></iframe>'
                        className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-primary-500 outline-none font-mono text-xs ${
                          mapValidation.status === 'error'
                            ? 'border-red-300 bg-red-50'
                            : 'border-slate-200'
                        }`}
                      />

                      {/* Validation Messages */}
                      {mapValidation.status === 'error' && (
                        <div className="text-red-600 text-xs flex items-center gap-1.5">
                          <AlertCircle size={14} /> {mapValidation.message}
                        </div>
                      )}
                      {mapValidation.status === 'warning' && (
                        <div className="text-amber-600 text-xs flex items-center gap-1.5">
                          <HelpCircle size={14} /> {mapValidation.message}
                        </div>
                      )}
                      {mapValidation.status === 'valid' && (
                        <div className="text-green-600 text-xs flex items-center gap-1.5">
                          <CheckCircle2 size={14} /> {mapValidation.message}
                        </div>
                      )}
                    </div>

                    {/* Map Preview Box */}
                    <div className="lg:col-span-1">
                      <label className="block text-sm font-bold text-slate-700 mb-1.5">
                        Live Preview
                      </label>
                      <div className="w-full h-40 rounded-xl overflow-hidden bg-slate-100 border border-slate-200 relative shadow-inner">
                        {previewMapUrl ? (
                          <iframe
                            src={previewMapUrl}
                            width="100%"
                            height="100%"
                            style={{ border: 0 }}
                            loading="lazy"
                            title="Map Preview"
                          />
                        ) : (
                          <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-400 gap-2">
                            <MapPin size={24} className="opacity-20" />
                            <span className="text-xs">No map URL</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Promotion Banners Tab */}
            {activeTab === 'banners' && (
              <div className="space-y-4">
                <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2 pb-2 border-b border-slate-100">
                  <ImageIcon size={20} className="text-primary-600" /> Promotion
                  Banners
                </h3>

                <div className="grid grid-cols-1 gap-4">
                  {fields.map((field, index) => {
                    return (
                      <div
                        key={field.id}
                        className="p-4 bg-slate-50 border border-slate-200 rounded-xl flex gap-4 items-start animate-in slide-in-from-left-2"
                      >
                        <div className="flex-col flex flex-1 gap-2">
                          {/* Inputs */}
                          <div className="w-full space-y-3">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                              <div>
                                <label className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                                  Category
                                </label>
                                <Controller
                                  control={control}
                                  name={`banners.${index}.categoryId` as const}
                                  defaultValue={field.categoryId ?? null}
                                  render={({ field: categoryField }) => (
                                    <select
                                      ref={categoryField.ref}
                                      value={categoryField.value ?? ''}
                                      onBlur={categoryField.onBlur}
                                      onChange={(event) => {
                                        const value = event.target.value
                                        categoryField.onChange(
                                          value === '' ? null : Number(value),
                                        )
                                      }}
                                      className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 outline-none bg-white"
                                      disabled={
                                        isCategoriesLoading || index === 0
                                      }
                                    >
                                      <option value="">
                                        {index === 0
                                          ? 'Main banner (no category)'
                                          : isCategoriesLoading
                                            ? 'Loading categories...'
                                            : 'Select Category'}
                                      </option>
                                      {categories.map((category) => (
                                        <option
                                          key={category.id}
                                          value={category.id}
                                        >
                                          {category.displayName ||
                                            category.name}
                                          {category.brand
                                            ? ` (${category.brand.name})`
                                            : ''}
                                        </option>
                                      ))}
                                    </select>
                                  )}
                                />
                                {!isCategoriesLoading &&
                                  categories.length === 0 && (
                                    <span className="text-slate-400 text-xs">
                                      No categories found.
                                    </span>
                                  )}
                              </div>
                            </div>

                            {/* Hidden input to store the URL text (if manually editing or verifying) */}
                            <div className="hidden">
                              <input
                                {...register(
                                  `banners.${index}.banner_image` as const,
                                )}
                              />
                            </div>
                          </div>

                          {/* Image Preview / Upload */}
                          <div className="w-full h-40 shrink-0 bg-slate-200 rounded-lg overflow-hidden relative group border border-slate-300">
                            {field.banner_image ? (
                              <OptimizedImage
                                src={field.banner_image}
                                alt="Banner"
                                className="size-full object-cover"
                              />
                            ) : (
                              <div className="flex items-center justify-center h-full text-slate-400">
                                <ImageIcon size={24} />
                              </div>
                            )}

                            {/* Hidden File Input + Overlay Label */}
                            <label className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center cursor-pointer text-white text-xs font-medium">
                              <UploadCloud size={20} className="mb-1" />
                              <span>Change</span>
                              <input
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={(e) =>
                                  handleBannerImageChange(index, e.target.files)
                                }
                              />
                            </label>
                          </div>
                        </div>

                        {/* Actions */}
                        {index > 0 && (
                          <button
                            type="button"
                            onClick={() => remove(index)}
                            className={`p-2 rounded-lg transition self-start md:self-center ${
                              fields.length === 1
                                ? 'text-slate-300 cursor-not-allowed'
                                : 'text-slate-400 hover:text-red-500 hover:bg-red-50'
                            }`}
                            title={
                              fields.length === 1
                                ? 'At least one banner is required'
                                : 'Remove Banner'
                            }
                          >
                            <Trash2 size={18} />
                          </button>
                        )}
                      </div>
                    )
                  })}

                  {fields.length === 0 && (
                    <div className="text-center py-8 bg-slate-50 rounded-xl border border-dashed border-slate-300 text-slate-400 text-sm">
                      No banners added yet.
                    </div>
                  )}

                  {fields.length < 10 && (
                    <button
                      type="button"
                      onClick={() =>
                        append({ name: '', banner_image: '', categoryId: null })
                      }
                      className=" text-xs font-bold text-primary-600 flex items-center gap-1 hover:underline justify-self-end"
                    >
                      <Plus size={14} /> Add Banner
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* About Us Tab */}
            {activeTab === 'about' && <AboutUsSection />}
          </div>

          {/* --- Save Button --- */}
          <div className="flex justify-end pt-4 border-t border-slate-100 bg-slate-50 px-6 py-4">
            <button
              type="submit"
              disabled={
                hasSubmitted ||
                isLoading ||
                isSaving ||
                !isRHFDirty ||
                isInitialLoading
              }
              className="px-8 py-3 bg-primary-600 text-white font-bold rounded-xl hover:bg-primary-700 transition shadow-lg shadow-primary-200 flex items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isSaving && (
                <span className="animate-spin w-5 h-5 border-2 border-white/30 border-t-white rounded-full"></span>
              )}{' '}
              <Save size={18} /> Save Settings
            </button>
          </div>
        </form>
      </FormProvider>
    </div>
  )
}
