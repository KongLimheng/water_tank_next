import { saveFile } from '@/lib/fileUpload';
import { prisma } from '@/lib/prismaClient';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const products = await prisma.product.findMany({
      include: {
        variants: true,
        category: {
          include: {
            brand: true,
          },
        },
      },
      orderBy: { id: 'desc' },
    });

    return NextResponse.json(products);
  } catch (err) {
    console.error('Failed to fetch products', err);
    return NextResponse.json(
      { error: 'Failed to fetch products' },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const name = formData.get('name') as string;
    const description = (formData.get('description') as string) || '';
    const price = parseFloat(formData.get('price') as string);
    const categoryId = parseInt(formData.get('categoryId') as string);
    const brand = (formData.get('brand') as string) || null; // Can be null in prisma?
    const volume = (formData.get('volume') as string) || null;
    const type = (formData.get('type') as string) || null;
    const group = (formData.get('group') as string) || null;
    const diameter = (formData.get('diameter') as string) || null;
    const height = (formData.get('height') as string) || null;
    const length = (formData.get('length') as string) || null;
    const variantsRaw = formData.get('variants') as string;
    const existingImage = formData.get('existingImage') as string; // From existing logic

    if (!name || isNaN(price)) {
      return NextResponse.json(
        { msg: 'Name and Price are required' },
        { status: 400 }
      );
    }

    let parsedVariants: any[] = [];
    try {
      parsedVariants = variantsRaw ? JSON.parse(variantsRaw) : [];
    } catch {
      return NextResponse.json(
        { error: 'Invalid variants JSON format' },
        { status: 400 }
      );
    }

    // Handle Files
    const galleryPaths: string[] = [];
    // Iterate all entries to find files. server.ts used upload.any() so any field could contain files.
    // However, usually they are grouped. Let's look for known file fields or just all Files.
    // server.ts logic: "const files = (req.files as Express.Multer.File[]) || []" -> multer captures ALL files.
    for (const [key, value] of formData.entries()) {
      if (value instanceof File && value.size > 0) {
        // Skip if it's empty or not actually a file we want?
        // Check mimetype if feasible, or rely on client.
        const path = await saveFile(value, 'products');
        galleryPaths.push(path);
      }
    }

    let imageList = galleryPaths;
    if (galleryPaths.length === 0 && existingImage) {
      imageList = [existingImage];
    }

    // Slug logic
    const slug =
      name.toLowerCase().replace(/\s+/g, '_') + `_${Date.now()}`;

    const newProduct = await prisma.product.create({
      data: {
        name,
        slug,
        description,
        price,
        brand,
        image: imageList,
        categoryId,
        volume,
        height,
        type,
        group,
        diameter,
        length,
        variants: {
          create: parsedVariants.map((v: any) => ({
            name: v.name,
            price: parseFloat(v.price),
            stock: parseInt(v.stock) || 0,
            sku: v.sku || null,
            image: v.image || null,
          })),
        },
      },
      include: { variants: true },
    });

    return NextResponse.json(newProduct);
  } catch (err) {
    console.error('Error creating product:', err);
    return NextResponse.json(
      { error: 'Failed to create product' },
      { status: 500 }
    );
  }
}
