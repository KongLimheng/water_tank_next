// lib/pdf-to-image.ts
type PDFJSModule = typeof import('pdfjs-dist')

let pdfjsInstance: PDFJSModule | null = null

let pdfjsLoadingPromise: Promise<PDFJSModule> | null = null

// Worker configuration flag
let workerConfigured = false

/**
 * Configure PDF.js worker source
 * Uses the worker bundled locally for offline support
 */
export function configurePdfjsWorker(pdfjsLib: PDFJSModule): void {
  if (workerConfigured) return

  if (typeof window !== 'undefined') {
    // Use the local worker file for offline support
    // The worker file is located in public/workers/pdf.worker.min.mjs
    pdfjsLib.GlobalWorkerOptions.workerSrc = '/pdfjs/pdf.worker.min.mjs'
    workerConfigured = true
  }
}

/**
 * Load pdfjs-dist library
 * Used for PDF rendering and text extraction
 */
export async function loadPdfjs(): Promise<PDFJSModule> {
  if (pdfjsInstance) {
    return pdfjsInstance
  }

  if (pdfjsLoadingPromise) {
    return pdfjsLoadingPromise
  }

  pdfjsLoadingPromise = import('pdfjs-dist').then((module) => {
    // Configure worker using centralized function
    configurePdfjsWorker(module)
    pdfjsInstance = module
    pdfjsLoadingPromise = null
    return module
  })

  return pdfjsLoadingPromise
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
): Promise<Blob> {
  const {
    scale = 2,
    format = 'image/png',
    quality = 1.0,
    pageNumber = 1,
  } = options

  const pdfjsLib = await loadPdfjs()

  // ✅ Use blob URL - most compatible approach
  const blobUrl = URL.createObjectURL(pdfBlob)
  const arrayBuffer = await pdfBlob.arrayBuffer()

  try {
    const pdf = await pdfjsLib.getDocument({
      data: arrayBuffer,
    }).promise

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
      canvas,
    }).promise

    return new Promise<Blob>((resolve, reject) => {
      canvas.toBlob(
        (blob) => {
          if (blob) {
            resolve(blob)
          } else {
            reject(new Error('Failed to create image blob'))
          }
        },
        format,
        quality,
      )
    })
  } finally {
    URL.revokeObjectURL(blobUrl)
  }
}

/**
 * Convert a PDF blob to multiple image data URLs (one per page)
 */
// export async function pdfBlobToImages(
//   pdfBlob: Blob,
//   options: PDFToImageOptions = {},
// ): Promise<string[]> {
//   const { scale = 2, format = 'image/png', quality = 1.0 } = options

//   ensureWorkerConfigured()

//   const arrayBuffer = await pdfBlob.arrayBuffer()
//   const pdf = await pdfjsLib.getDocument(arrayBuffer).promise
//   const images: string[] = []

//   for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
//     const page = await pdf.getPage(pageNum)
//     const viewport = page.getViewport({ scale })

//     const canvas = document.createElement('canvas')
//     const context = canvas.getContext('2d')

//     if (!context) continue

//     canvas.height = viewport.height
//     canvas.width = viewport.width

//     if (format === 'image/jpeg') {
//       context.fillStyle = '#ffffff'
//       context.fillRect(0, 0, canvas.width, canvas.height)
//     }

//     await page.render({
//       canvasContext: context,
//       viewport: viewport,
//     }).promise

//     images.push(canvas.toDataURL(format, quality))
//   }

//   return images
// }

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
  link.href = URL.createObjectURL(dataUrl)
  link.download = `${fileName}.${extension}`
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(link.href)
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
// function ensureWorkerConfigured(): void {
//   if (typeof window === 'undefined') return

//   if (!pdfjsLib.GlobalWorkerOptions.workerSrc) {
//     pdfjsLib.GlobalWorkerOptions.workerSrc = '/pdfjs/pdf.worker.min.mjs'
//   }
// }
