import { SiteSettings } from '../types'
import { api } from './apiInstance' // Your axios instance

export const getSettings = async (): Promise<SiteSettings> => {
  const { data } = await api.get<SiteSettings>('/settings')
  return data
}

export const saveSettings = async (settings: any): Promise<SiteSettings> => {
  const formData = new FormData()

  // Append basic fields
  formData.append('phone', settings.phone || '')
  formData.append('email', settings.email || '')
  formData.append('address', settings.address || '')
  formData.append('mapUrl', settings.mapUrl || '')
  formData.append('facebookUrl', settings.facebookUrl || '')
  formData.append('youtubeUrl', settings.youtubeUrl || '')
  formData.append('uploadType', 'banners')

  // Append About Us data
  formData.append('aboutUs', JSON.stringify(settings.aboutUs || {}))

  // Handle About Us file uploads
  // settings.aboutUs is an object with section1, section2, section3
  if (settings.aboutUs) {
    // Section 1 image
    if (settings.aboutUs.section1?.imageFile) {
      formData.append('aboutUs_section1_imageFile', settings.aboutUs.section1.imageFile)
    }

    // Section 2 items images
    if (Array.isArray(settings.aboutUs.section2)) {
      settings.aboutUs.section2.forEach((item: any, itemIndex: number) => {
        if (item.imageFile) {
          formData.append(`aboutUs_section2_item_${itemIndex}_imageFile`, item.imageFile)
        }
      })
    }

    // Section 3 images
    if (settings.aboutUs.section3) {
      if (settings.aboutUs.section3.qualityImageFile) {
        formData.append('aboutUs_section3_qualityImageFile', settings.aboutUs.section3.qualityImageFile)
      }
      if (settings.aboutUs.section3.certificateImageFile) {
        formData.append('aboutUs_section3_certificateImageFile', settings.aboutUs.section3.certificateImageFile)
      }
      // Section 3 items images
      if (Array.isArray(settings.aboutUs.section3.items)) {
        settings.aboutUs.section3.items.forEach((item: any, itemIndex: number) => {
          if (item.imageFile) {
            formData.append(`aboutUs_section3_item_${itemIndex}_imageFile`, item.imageFile)
          }
        })
      }
    }
  }

  const incomingBanners =
    Array.isArray(settings.banners) && settings.banners.length > 0
      ? settings.banners
      : [{ name: 'Main Banner', banner_image: '', categoryId: null }]

  if (Array.isArray(incomingBanners)) {
    const bannerMetadata: any[] = []
    incomingBanners.forEach((banner: any, index: number) => {
      const categoryId = index === 0 ? null : banner.categoryId ?? null
      if (banner.file) {
        // This is a NEW upload
        // Append the file with a specific key.
        // We use a naming convention like 'banner_files' so multer can grab them.
        formData.append('banner_files', banner.file)

        // Push metadata saying "The file at this index corresponds to this banner"
        // Note: Multer will give us an array of files. The order *usually* matches,
        // but it's safer to rely on the fact that we're iterating.
        // However, standard FormData doesn't let us link a file to a specific JSON object easily.
        // STRATEGY: We will mark this banner as "needs_upload" in the metadata.
        bannerMetadata.push({
          name: banner.name,
          banner_image: null, // Server will fill this
          categoryId,
          isNewUpload: true,
          originalIndex: index, // Track order
        })
      } else {
        // Existing banner, just keep the URL
        bannerMetadata.push({
          name: banner.name,
          banner_image: banner.banner_image,
          categoryId,
          isNewUpload: false,
        })
      }
    })

    // Append the metadata JSON
    formData.append('banners_metadata', JSON.stringify(bannerMetadata))
  }

  // Send as Multipart
  const { data } = await api.put<SiteSettings>('/settings', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  })
  return data
}
