// lib/pdfFonts.ts
import { Font } from '@react-pdf/renderer'

// Get the base URL for fonts (works in both development and production)
const getFontUrl = (filename: string) => {
  if (typeof window !== 'undefined') {
    return `${window.location.origin}/fonts/${filename}`
  }
  // For SSR, use absolute path - fonts will be loaded client-side
  return `/fonts/${filename}`
}

// Register fonts from public/fonts/ directory
// This should be called once at app initialization
let fontsRegistered = false

export function registerPDFFonts() {
  if (fontsRegistered) return
  fontsRegistered = true

  Font.register({
    family: 'Battambang',
    fonts: [
      {
        src: getFontUrl('Battambang-Regular.ttf'),
        fontWeight: 'normal',
      },
      {
        src: getFontUrl('Battambang-Bold.ttf'),
        fontWeight: 'bold',
      },
    ],
  })

  Font.register({
    family: 'Inter',
    fonts: [
      {
        src: getFontUrl('Inter-Regular.ttf'),
        fontWeight: 'normal',
      },
      {
        src: getFontUrl('Inter-Bold.ttf'),
        fontWeight: 'bold',
      },
    ],
  })

  Font.register({
    family: 'KantumruyPro',
    fonts: [
      {
        src: getFontUrl('KantumruyPro-Regular.ttf'),
        fontWeight: 'normal',
      },
      {
        src: getFontUrl('KantumruyPro-Bold.ttf'),
        fontWeight: 'bold',
      },
    ],
  })
}

// Auto-register when this module is imported (both client and server)
registerPDFFonts()
