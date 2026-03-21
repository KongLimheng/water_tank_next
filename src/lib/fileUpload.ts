import { execFile } from 'child_process'
import { chown, mkdir, stat, writeFile } from 'fs/promises'
import path from 'path'
import sharp from 'sharp'
import { promisify } from 'util'

const execFileAsync = promisify(execFile)

const IMAGE_CONFIG = {
  maxFileSize: 5 * 1024 * 1024, // 5MB
  allowedTypes: ['image/jpeg', 'image/png', 'image/webp'],
  allowedExtensions: ['.jpg', '.jpeg', '.png', '.webp'],
  maxDimensions: { width: 4000, height: 4000 },
  minDimensions: { width: 100, height: 100 },
  outputQuality: 85,
  outputFormat: 'jpeg' as 'jpeg' | 'png' | 'webp',
}

export async function saveFile(file: File, folder: string): Promise<string> {
  const startTime = Date.now()

  try {
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    const relativeUploadDir = `/uploads/${folder}`
    const uploadDir = path.join(process.cwd(), 'public', relativeUploadDir)

    try {
      await mkdir(uploadDir, { recursive: true })
    } catch (e) {
      // Ignore error if directory exists
      console.error('Error creating directory', e)
    }

    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9)

    const sanitizedName = sanitizeFilename(file.name)
    const nameWithoutExt = path.parse(sanitizedName).name
    const ext = path.extname(sanitizedName).toLowerCase()

    // Handle edge case where name might still have only underscores/hyphens
    let cleanNameWithoutExt = nameWithoutExt
    if (!cleanNameWithoutExt.replace(/[_-]/g, '').trim()) {
      cleanNameWithoutExt = 'file'
    }

    const filename = `${cleanNameWithoutExt}-${uniqueSuffix}.jpg`
    const filepath = path.join(uploadDir, filename)

    let metadata: sharp.Metadata
    try {
      metadata = await sharp(buffer).metadata()
      if (!metadata.width || !metadata.height) {
        throw new Error('Invalid image dimensions')
      }
    } catch (err) {
      console.error('Image validation failed:', err)
      throw new Error('Uploaded file is not a valid image')
    }
    console.log(`Start size: ${Math.round(file.size / 1024)}KB`)

    let sharpPipeline = sharp(buffer).rotate().toColorspace('srgb') // Auto-rotate based on EXIF

    // Optional resize
    sharpPipeline.resize({
      width: 1920,
      fit: 'inside', // Maintain aspect ratio
      withoutEnlargement: true, // Don't upscale
    })

    if (
      metadata.hasAlpha ||
      file.type === 'image/png' ||
      file.type === 'image/webp'
    ) {
      sharpPipeline = sharpPipeline.flatten({
        background: { r: 255, g: 255, b: 255 }, // White background
      })
    }

    // Convert and compress
    const outputOptions = {
      quality: IMAGE_CONFIG.outputQuality,
      progressive: true, // Better perceived loading
      mozjpeg: true, // Better compression
      chromaSubsampling: '4:2:0',
    }
    const processedBuffer = await sharpPipeline.jpeg(outputOptions).toBuffer()

    await writeFile(filepath, processedBuffer)

    console.log(
      `Optimized: ${Math.round(processedBuffer.length / 1024)}KB (${Math.round((1 - processedBuffer.length / buffer.length) * 100)}% reduction)`,
    )
    // Small delay to ensure file is fully written
    await new Promise((resolve) => setTimeout(resolve, 100))

    if (process.env.NODE_ENV === 'production') {
      try {
        const { stdout: uidOut } = await execFileAsync('id', ['-u', 'www-data'])
        const { stdout: gidOut } = await execFileAsync('id', ['-g', 'www-data'])
        const uid = parseInt(uidOut.trim(), 10)
        const gid = parseInt(gidOut.trim(), 10)
        await chown(filepath, uid, gid)
      } catch (err) {
        console.error('chown failed', err)
      }
    }

    // ✅ 12. GET FINAL FILE SIZE
    const stats = await stat(filepath)

    const uploadTime = Date.now() - startTime
    console.log(
      `✅ Image uploaded in ${uploadTime}ms: ${filename} (${Math.round(stats.size / 1024)}KB)`,
    )

    return path.join(relativeUploadDir, filename).replace(/\\/g, '/')
  } catch (err) {
    console.error('Upload error:', err)
    return err instanceof Error ? err.message : 'Upload failed'
  }
}

// Enhanced filename sanitization
const sanitizeFilename = (filename: string): string => {
  // Remove extension first for processing
  const ext = path.extname(filename).toLowerCase()
  const basename = path.basename(filename, ext)

  // Multiple sanitization steps

  let sanitized = basename
    .replace(/_+/g, '_')
    .replace(/-+/g, '-')
    .replace(/^[_\-.]+|[_\-.]+$/g, '')
    .replace(/[^a-zA-Z0-9\s\-_.]/g, '')
    .replace(/\s+/g, '-')
    .substring(0, 100)

  if (!sanitized.trim()) sanitized = 'image'
  return sanitized
}
