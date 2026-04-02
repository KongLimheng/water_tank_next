// lib/pdf-to-image.ts
import * as pdfjsLib from 'pdfjs-dist'

// ✅ Configure pdf.js worker for Next.js (client-side only)
if (typeof window !== 'undefined') {
  try {
    // Primary: Load worker from node_modules via import.meta.url
    pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
      'pdfjs-dist/build/pdf.worker.min.mjs',
      import.meta.url,
    ).href
  } catch (error) {
    console.warn('Failed to load pdf.js worker from node_modules:', error)
    // Fallback will be handled in the function below
  }
}

export interface PDFToImageOptions {
  scale?: number
  format?: 'image/png' | 'image/jpeg'
  quality?: number
  pageNumber?: number
}

/**
 * Convert a PDF blob to a single image data URL
 */
export async function pdfBlobToImage(
  pdfBlob: Blob,
  options: PDFToImageOptions = {},
): Promise<string> {
  const {
    scale = 2,
    format = 'image/png',
    quality = 1.0,
    pageNumber = 1,
  } = options

  ensureWorkerConfigured()

  // ✅ Use blob URL - most compatible approach
  const blobUrl = URL.createObjectURL(pdfBlob)

  try {
    const pdf = await pdfjsLib.getDocument(blobUrl).promise

    if (pageNumber < 1 || pageNumber > pdf.numPages) {
      throw new Error(`Invalid page: ${pageNumber}`)
    }

    const page = await pdf.getPage(pageNumber)
    const viewport = page.getViewport({ scale })

    const canvas = document.createElement('canvas')
    const context = canvas.getContext('2d')

    if (!context) throw new Error('No canvas context')

    canvas.height = viewport.height
    canvas.width = viewport.width

    if (format === 'image/jpeg') {
      context.fillStyle = '#ffffff'
      context.fillRect(0, 0, canvas.width, canvas.height)
    }

    await page.render({
      canvasContext: context,
      viewport: viewport,
    }).promise

    return canvas.toDataURL(format, quality)
  } finally {
    URL.revokeObjectURL(blobUrl)
  }
}

/**
 * Convert a PDF blob to multiple image data URLs (one per page)
 */
export async function pdfBlobToImages(
  pdfBlob: Blob,
  options: PDFToImageOptions = {},
): Promise<string[]> {
  const { scale = 2, format = 'image/png', quality = 1.0 } = options

  ensureWorkerConfigured()

  const arrayBuffer = await pdfBlob.arrayBuffer()
  const pdf = await pdfjsLib.getDocument({ arrayBuffer }).promise
  const images: string[] = []

  for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
    const page = await pdf.getPage(pageNum)
    const viewport = page.getViewport({ scale })

    const canvas = document.createElement('canvas')
    const context = canvas.getContext('2d')

    if (!context) continue

    canvas.height = viewport.height
    canvas.width = viewport.width

    if (format === 'image/jpeg') {
      context.fillStyle = '#ffffff'
      context.fillRect(0, 0, canvas.width, canvas.height)
    }

    await page.render({
      canvasContext: context,
      viewport: viewport,
    }).promise

    images.push(canvas.toDataURL(format, quality))
  }

  return images
}

/**
 * Download a PDF as an image file
 */
export async function downloadPDFAsImage(
  pdfBlob: Blob,
  fileName: string,
  options: PDFToImageOptions = {},
): Promise<void> {
  const { format = 'image/png' } = options
  const extension = format === 'image/jpeg' ? 'jpg' : 'png'

  const dataUrl = await pdfBlobToImage(pdfBlob, { ...options, format })

  const link = document.createElement('a')
  link.href = dataUrl
  link.download = `${fileName}.${extension}`
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

/**
 * Download all PDF pages as a ZIP file
 */
// export async function downloadPDFAsZip(
//   pdfBlob: Blob,
//   fileName: string,
//   options: { scale?: number; format?: 'png' | 'jpeg'; quality?: number } = {},
// ): Promise<void> {
//   const { scale = 2, format = 'png', quality = 0.9 } = options

//   // Lazy load JSZip to avoid bundling issues
//   const JSZip = (await import('jszip')).default

//   const images = await pdfBlobToImages(pdfBlob, {
//     scale,
//     format: format === 'jpeg' ? 'image/jpeg' : 'image/png',
//     quality,
//   })

//   const zip = new JSZip()

//   images.forEach((img, index) => {
//     const base64Data = img.split(',')[1]
//     const ext = format === 'jpeg' ? 'jpg' : 'png'
//     zip.file(`${fileName}-page-${index + 1}.${ext}`, base64Data, {
//       base64: true,
//     })
//   })

//   const zipBlob = await zip.generateAsync({ type: 'blob' })

//   const link = document.createElement('a')
//   link.href = URL.createObjectURL(zipBlob)
//   link.download = `${fileName}.zip`
//   document.body.appendChild(link)
//   link.click()
//   document.body.removeChild(link)
//   URL.revokeObjectURL(link.href)
// }

/**
 * Ensure pdf.js worker is properly configured
 */
function ensureWorkerConfigured(): void {
  if (typeof window === 'undefined') return

  if (!pdfjsLib.GlobalWorkerOptions.workerSrc) {
    // Fallback: try public folder
    const baseUrl = window.location.origin
    pdfjsLib.GlobalWorkerOptions.workerSrc = `${baseUrl}/pdfjs/pdf.worker.min.mjs`
  }
}
