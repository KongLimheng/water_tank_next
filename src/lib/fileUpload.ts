import { mkdir, writeFile } from 'fs/promises';
import path from 'path';

export async function saveFile(file: File, folder: string): Promise<string> {
  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);

  const relativeUploadDir = `/uploads/${folder}`;
  const uploadDir = path.join(process.cwd(), 'public', relativeUploadDir);

  try {
    await mkdir(uploadDir, { recursive: true });
  } catch (e) {
    // Ignore error if directory exists
    console.error('Error creating directory', e);
  }

  const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
  const originalName = file.name.replace(/[^a-zA-Z0-9.\-_]/g, '_');
  const nameWithoutExt = path.parse(originalName).name;
  const ext = path.extname(originalName).toLowerCase();
  const filename = `${nameWithoutExt}-${uniqueSuffix}${ext}`;
  const filepath = path.join(uploadDir, filename);

  await writeFile(filepath, buffer);

  return path.join(relativeUploadDir, filename).replace(/\\/g, '/');
}
