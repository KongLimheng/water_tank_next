import { saveFile } from '@/lib/fileUpload';
import { prisma } from '@/lib/prismaClient'; // Now should verify
import { Prisma } from '@prisma/client';
import { unlink } from 'fs/promises';
import { NextResponse } from 'next/server';
import path from 'path';

export async function GET() {
  try {
    const settings = await prisma.siteSettings.findUnique({
      where: { id: 1 },
    });

    if (!settings) {
      return NextResponse.json({
        phone: '',
        email: '',
        address: '',
        mapUrl: '',
        banners: [],
      });
    }
    return NextResponse.json(settings);
  } catch (err) {
    return NextResponse.json(
      { error: 'Failed to fetch settings' },
      { status: 500 }
    );
  }
}

export async function PUT(req: Request) {
  try {
    const formData = await req.formData();
    const phone = formData.get('phone') as string;
    const email = formData.get('email') as string;
    const address = formData.get('address') as string;
    const mapUrl = formData.get('mapUrl') as string;
    const facebookUrl = formData.get('facebookUrl') as string;
    const youtubeUrl = formData.get('youtubeUrl') as string;
    const bannersMetadataRaw = formData.get('banners_metadata') as string;

    const oldSettings = await prisma.siteSettings.findUnique({
      where: { id: 1 },
    });

    if (!oldSettings) {
      return NextResponse.json({ msg: 'Settings not found' }, { status: 404 });
    }

    // Handle files logic from settingService (client) and server.ts
    // Client sends 'banner_files' for new uploads.
    // Client sends 'banners_metadata' JSON.

    let bannerMetadata: any[] = [];
    if (bannersMetadataRaw) {
      try {
        bannerMetadata = JSON.parse(bannersMetadataRaw);
      } catch (e) { }
    }

    // In Route Handler, we iterate the formData.
    const newFiles: File[] = [];
    for (const [key, value] of Array.from(formData.entries())) {
      if (key === 'banner_files' && value instanceof File) {
        newFiles.push(value);
      }
    }


    let fileIndex = 0;
    const finalBanners: any[] = [];

    for (const item of bannerMetadata) {
      if (item.isNewUpload) {
        if (fileIndex < newFiles.length) {
          const file = newFiles[fileIndex];
          fileIndex++;
          const savedPath = await saveFile(file, 'banners');
          finalBanners.push({
            name: item.name,
            banner_image: savedPath,
          });
        }
      } else {
        // Keep existing
        finalBanners.push({
          name: item.name,
          banner_image: item.banner_image
        });
      }
    }

    // Upsert settings
    const updated = await prisma.siteSettings.upsert({
      where: { id: 1 },
      update: {
        phone,
        email,
        address,
        mapUrl,
        facebookUrl,
        youtubeUrl,
        banners: finalBanners as Prisma.InputJsonValue,
      },
      create: {
        id: 1,
        phone,
        email,
        address,
        mapUrl,
        facebookUrl,
        youtubeUrl,
        banners: finalBanners as Prisma.InputJsonValue,
      },
    });


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

      for (const url of urlsToDelete) {
        try {
          const urlParts = url.split('/');
          const filename = urlParts[urlParts.length - 1];
          const filePath = path.join(process.cwd(), 'public', 'uploads', 'banners', filename);
          await unlink(filePath).catch(() => { });
        } catch (e) {
          console.error('Error deleting orphan image', e);
        }
      }
    }

    return NextResponse.json(updated);
  } catch (err) {
    console.error('Error updating settings:', err);
    return NextResponse.json(
      { error: 'Failed to update settings' },
      { status: 500 }
    );
  }
}
