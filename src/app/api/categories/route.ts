import { saveFile } from '@/lib/fileUpload';
import { prisma } from '@/lib/prismaClient';
import { NextResponse } from 'next/server';
import slugify from 'slugify';

export async function GET() {
  try {
    const categories = await prisma.category.findMany({
      include: { brand: true },
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json(categories);
  } catch (err) {
    return NextResponse.json({ error: 'Failed to fetch categories' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const name = formData.get('name') as string;
    const displayName = (formData.get('displayName') as string) || null;
    const uploadType = (formData.get('uploadType') as string) || 'categories';
    const brandIdRaw = formData.get('brandId') as string;

    let brandId: number | null = null;
    if (brandIdRaw && brandIdRaw !== 'null' && brandIdRaw !== 'undefined') {
      brandId = parseInt(brandIdRaw);
    }

    let slug = '';
    if (brandId) {
      const brand = await prisma.brand.findUnique({ where: { id: brandId } });
      if (!brand) return NextResponse.json({ error: 'Brand not found' }, { status: 404 });

      const existingCategory = await prisma.category.findFirst({
        where: { name, brandId },
      })

      if (existingCategory) {
        return NextResponse.json({ error: `Category name already exists exists for brand ${brand.name}.` }, { status: 400 });
      }

      slug = `${brand.name.toLowerCase().replace(/\s+/g, '_')}_${slugify(name, { lower: true, replacement: '_' })}`;
    } else {
      const duplicateGeneric = await prisma.category.findFirst({
        where: { name: name, brandId: null },
      })

      if (duplicateGeneric) return NextResponse.json({ error: `Generic category '${name}' already exists` }, { status: 400 });
      slug = slugify(name, { lower: true, replacement: '_' });
    }

    let imageUrl: string | null = null;
    const imageFile = formData.get('image');
    if (imageFile instanceof File) {
      imageUrl = await saveFile(imageFile, uploadType);
    }

    const newCat = await prisma.category.create({
      data: {
        name,
        slug,
        brandId,
        displayName,
        image: imageUrl,
      },
      include: { brand: true },
    });

    return NextResponse.json(newCat);

  } catch (err) {
    return NextResponse.json({ error: 'Failed to create category' }, { status: 500 });
  }
}
