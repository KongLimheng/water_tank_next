import { cleanImage } from '@/lib/cleanImage'
import { saveFile } from '@/lib/fileUpload'
import { prisma } from '@/lib/prismaClient' // Now should verify
import { SocialItem } from '@/types'
import { Prisma } from '@prisma/client'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const settings = await prisma.siteSettings.findUnique({
      where: { id: 1 },
    })

    if (!settings) {
      return NextResponse.json({
        phone: '',
        email: '',
        address: '',
        mapUrl: '',
        banners: [],
        aboutUs: [],
        socials: [],
      })
    }
    return NextResponse.json(settings)
  } catch (err) {
    return NextResponse.json(
      { error: 'Failed to fetch settings' },
      { status: 500 },
    )
  }
}

export async function PUT(req: Request) {
  try {
    const formData = await req.formData()
    const phone = formData.get('phone') as string
    const email = formData.get('email') as string
    const address = formData.get('address') as string
    const mapUrl = formData.get('mapUrl') as string

    const bannersMetadataRaw = formData.get('banners_metadata') as string
    const aboutUsRaw = formData.get('aboutUs') as string
    const socialsRaw = formData.get('socials') as string

    const oldSettings = await prisma.siteSettings.findUnique({
      where: { id: 1 },
    })

    if (!oldSettings) {
      return NextResponse.json({ msg: 'Settings not found' }, { status: 404 })
    }

    // Parse About Us data
    let socialData: SocialItem[] = []
    if (socialsRaw) {
      try {
        socialData = JSON.parse(socialsRaw)
      } catch (e) {
        console.error('Error parsing aboutUs:', e)
      }
    }

    // Parse About Us data
    let newAboutUsData: any = {}
    if (aboutUsRaw) {
      try {
        newAboutUsData = JSON.parse(aboutUsRaw)
      } catch (e) {
        console.error('Error parsing aboutUs:', e)
      }
    }

    // Handle files logic from settingService (client) and server.ts
    // Client sends 'banner_files' for new uploads.
    // Client sends 'banners_metadata' JSON.
    let bannerMetadata: any[] = []
    if (bannersMetadataRaw) {
      try {
        bannerMetadata = JSON.parse(bannersMetadataRaw)
      } catch (e) {}
    }

    // In Route Handler, we iterate the formData.
    const newFiles: File[] = []
    for (const [key, value] of Array.from(formData.entries())) {
      if (key === 'banner_files' && value instanceof File) {
        newFiles.push(value)
      }
    }
    // ========================================================
    // ========================================================

    let fileIndex = 0
    const finalBanners: any[] = []

    for (const item of bannerMetadata) {
      if (item.isNewUpload) {
        if (fileIndex < newFiles.length) {
          const file = newFiles[fileIndex]
          fileIndex++
          const savedPath = await saveFile(file, 'banners')
          finalBanners.push({
            name: item.name,
            banner_image: savedPath,
            categoryId: item.categoryId ?? null,
          })
        }
      } else {
        // Keep existing
        finalBanners.push({
          name: item.name,
          banner_image: item.banner_image,
          categoryId: item.categoryId ?? null,
        })
      }
    }

    // Process About Us images
    // newAboutUsData is an object with section1, section2, section3 properties
    const processedAboutUs = await (async () => {
      const processedSection: any = { ...newAboutUsData }

      // Process section 1
      if (newAboutUsData.section1) {
        processedSection.section1 = { ...newAboutUsData.section1 }
        // Process main image for section 1 if there's a file
        // The imageFile property contains the key to look up in formData
        if (newAboutUsData.section1.imageFile) {
          const file = formData.get('aboutUs_section1_imageFile')
          if (file instanceof File) {
            processedSection.section1.image = await saveFile(file, 'about-us')
          }
        }
      }

      // Process section 2 items (array of content items)
      if (newAboutUsData.section2 && Array.isArray(newAboutUsData.section2)) {
        processedSection.section2 = await Promise.all(
          newAboutUsData.section2.map(async (item: any, index: number) => {
            if (item.imageFile) {
              const file = formData.get(
                `aboutUs_section2_item_${index}_imageFile`,
              )
              if (file instanceof File) {
                return { ...item, image: await saveFile(file, 'about-us') }
              }
            }
            return item
          }),
        )
      }

      // Process section 3 images
      if (newAboutUsData.section3) {
        const processedSection3: any = { ...newAboutUsData.section3 }

        // Process section 3 items if they exist
        if (
          newAboutUsData.section3.items &&
          Array.isArray(newAboutUsData.section3.items)
        ) {
          processedSection3.items = await Promise.all(
            newAboutUsData.section3.items.map(
              async (item: any, index: number) => {
                if (item.imageFile) {
                  const file = formData.get(
                    `aboutUs_section3_item_${index}_imageFile`,
                  )
                  if (file instanceof File) {
                    return { ...item, image: await saveFile(file, 'about-us') }
                  }
                }
                return item
              },
            ),
          )
        }
        processedSection.section3 = processedSection3
      }

      return processedSection
    })()

    const processSocial: any[] = await Promise.all(
      socialData.map(async (item, index) => {
        if (item.imageFile) {
          const file = formData.get(`socials_${index}_imageFile`)
          if (file instanceof File) {
            return { ...item, image: await saveFile(file, 'socials') }
          }
        }
        return item
      }),
    )

    // Upsert settings
    const updated = await prisma.siteSettings.upsert({
      where: { id: 1 },
      update: {
        phone,
        email,
        address,
        mapUrl,
        banners: finalBanners as Prisma.InputJsonValue,
        aboutUs: processedAboutUs as Prisma.InputJsonValue,
        socials: processSocial as Prisma.InputJsonValue,
      },
      create: {
        id: 1,
        phone,
        email,
        address,
        mapUrl,
        banners: finalBanners as Prisma.InputJsonValue,
        aboutUs: processedAboutUs as Prisma.InputJsonValue,
        socials: processSocial as Prisma.InputJsonValue,
      },
    })

    // Delete old files
    if (oldSettings?.banners && Array.isArray(oldSettings.banners)) {
      const oldBanners = oldSettings.banners as any[]

      const oldUrls = oldBanners
        .map((b) => b.banner_image)
        .filter((url) => typeof url === 'string')
      const newUrls = finalBanners
        .map((b) => b.banner_image)
        .filter((url) => typeof url === 'string')

      const urlsToDelete = oldUrls.filter((url) => !newUrls.includes(url))

      await Promise.all(urlsToDelete.map((url) => cleanImage(url, 'banners')))
    }

    // Delete old About Us images
    if (oldSettings?.aboutUs) {
      const oldAboutUs = oldSettings.aboutUs as any
      // Collect all image URLs from the new aboutUs data (object structure)
      const newUrls: string[] = []
      if (processedAboutUs.section1?.image) {
        newUrls.push(processedAboutUs.section1.image)
      }
      if (Array.isArray(processedAboutUs.section2)) {
        newUrls.push(
          ...processedAboutUs.section2
            .map((item: any) => item.image)
            .filter((url: string) => typeof url === 'string'),
        )
      }

      if (Array.isArray(processedAboutUs.section3?.items)) {
        newUrls.push(
          ...processedAboutUs.section3.items
            .map((item: any) => item.image)
            .filter((url: string) => typeof url === 'string'),
        )
      }

      // Collect all image URLs from the old aboutUs data
      const oldUrls: string[] = []
      if (oldAboutUs.section1?.image) {
        oldUrls.push(oldAboutUs.section1.image)
      }
      if (Array.isArray(oldAboutUs.section2)) {
        oldUrls.push(
          ...oldAboutUs.section2
            .map((item: any) => item.image)
            .filter((url: string) => typeof url === 'string'),
        )
      }

      if (Array.isArray(oldAboutUs.section3?.items)) {
        oldUrls.push(
          ...oldAboutUs.section3.items
            .map((item: any) => item.image)
            .filter((url: string) => typeof url === 'string'),
        )
      }

      const urlsToDelete = oldUrls.filter(
        (url) => url && !newUrls.includes(url),
      )

      await Promise.all([
        ...urlsToDelete.map((url) => cleanImage(url, 'about-us')),
      ])
    }

    if (oldSettings?.socials && Array.isArray(oldSettings.socials)) {
      const oldSocials = oldSettings.socials as any[]

      const oldUrls = oldSocials
        .map((s) => s.image)
        .filter((url) => typeof url === 'string')

      const newUrls = processSocial
        .map((s) => s.image)
        .filter((url) => typeof url === 'string')

      const urlsToDelete = oldUrls.filter((url) => !newUrls.includes(url))

      await Promise.all([
        ...urlsToDelete.map((url) => cleanImage(url, 'socials')),
      ])
    }

    return NextResponse.json(updated)
  } catch (err) {
    console.error('Error updating settings:', err)
    return NextResponse.json(
      { error: 'Failed to update settings' },
      { status: 500 },
    )
  }
}
