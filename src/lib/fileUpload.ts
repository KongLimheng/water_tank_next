import { mkdir, writeFile } from 'fs/promises'
import path from 'path'

export async function saveFile(file: File, folder: string): Promise<string> {
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

  // Enhanced filename sanitization
  const sanitizeFilename = (filename: string): string => {
    // Remove extension first for processing
    const ext = path.extname(filename).toLowerCase()
    const basename = path.basename(filename, ext)

    // Multiple sanitization steps
    let sanitized = basename

    // 1. Replace sequences of underscores or hyphens with a single one
    sanitized = sanitized.replace(/_+/g, '_').replace(/-+/g, '-')

    // 2. Remove leading/trailing special characters
    sanitized = sanitized.replace(/^[_\-.]+|[_\-.]+$/g, '')

    // 3. Remove any remaining non-alphanumeric except hyphen and underscore
    // but keep spaces and some common symbols if needed
    sanitized = sanitized.replace(/[^a-zA-Z0-9\s\-_.]/g, '')

    // 4. Replace spaces with hyphens
    sanitized = sanitized.replace(/\s+/g, '-')

    // 5. If name becomes empty after sanitization, use a default
    if (!sanitized.trim()) {
      sanitized = 'file'
    }

    // 6. Limit length to avoid issues with filesystems
    sanitized = sanitized.substring(0, 100)

    return sanitized + ext
  }

  const sanitizedName = sanitizeFilename(file.name)
  const nameWithoutExt = path.parse(sanitizedName).name
  const ext = path.extname(sanitizedName).toLowerCase()

  // Handle edge case where name might still have only underscores/hyphens
  let cleanNameWithoutExt = nameWithoutExt
  if (!cleanNameWithoutExt.replace(/[_-]/g, '').trim()) {
    cleanNameWithoutExt = 'file'
  }

  const filename = `${cleanNameWithoutExt}-${uniqueSuffix}${ext}`
  const filepath = path.join(uploadDir, filename)

  await writeFile(filepath, buffer)

  return path.join(relativeUploadDir, filename).replace(/\\/g, '/')
}
