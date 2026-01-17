import { unlink } from "fs/promises";
import path from "path";

export const cleanImage = async (imagePath: string, uploadType: string) => {
  try {
    const urlParts = imagePath.split('/');
    const filename = urlParts[urlParts.length - 1];
    const filePath = path.join(process.cwd(), 'public', 'uploads', uploadType, filename);
    await unlink(filePath).catch(() => { });
  } catch (e) {
    console.error('Error deleting orphan image', e);
  }
}