import { saveFile } from '@/lib/fileUpload';
import { prisma } from '@/lib/prismaClient';
import { unlink } from 'fs/promises';
import { NextResponse } from 'next/server';
import path from 'path';

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: idString } = await params;
    const id = parseInt(idString);
    const product = await prisma.product.findUnique({
      where: { id },
      include: { variants: true },
    });

    if (!product) {
      return NextResponse.json({ msg: 'Product not found' }, { status: 404 });
    }

    return NextResponse.json(product);
  } catch (err) {
    console.error('Error fetching product:', err);
    return NextResponse.json(
      { error: 'Failed to fetch product' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: idString } = await params;
    const id = parseInt(idString);
    const product = await prisma.product.findUnique({
      where: { id },
      include: { variants: true },
    });

    if (!product) {
      return NextResponse.json({ msg: 'Product not found' }, { status: 404 });
    }

    // Delete associated images
    if (product.image && Array.isArray(product.image)) {
      for (const imageUrl of product.image) {
        try {
          const urlParts = imageUrl.split('/');
          const filename = urlParts[urlParts.length - 1];
          // Assuming /uploads/products/ structure
          const filePath = path.join(
            process.cwd(),
            'public',
            'uploads',
            'products',
            filename
          );
          await unlink(filePath).catch(() => {});
        } catch (e) {
          console.error('Error deleting image file', e);
        }
      }
    }

    await prisma.product.delete({ where: { id } });

    return NextResponse.json({ msg: 'Product deleted' });
  } catch (err) {
    console.error('Error deleting product:', err);
    return NextResponse.json(
      { error: 'Failed to delete product' },
      { status: 500 }
    );
  }
}

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: idString } = await params;
    const id = parseInt(idString);
    const formData = await req.formData();
    // Fields
    const name = formData.get('name') as string;
    const description = (formData.get('description') as string) || '';
    const price = parseFloat(formData.get('price') as string);
    const categoryId = parseInt(formData.get('categoryId') as string);
    const brand = (formData.get('brand') as string) || null;
    const volume = (formData.get('volume') as string) || null;
    const type = (formData.get('type') as string) || null;
    const group = (formData.get('group') as string) || null;
    const diameter = (formData.get('diameter') as string) || null;
    const height = (formData.get('height') as string) || null;
    const length = (formData.get('length') as string) || null;
    
    const variantsRaw = formData.get('variants') as string;
    const existingGalleryRaw = formData.get('existingGallery') as string;

    const currentProduct = await prisma.product.findUnique({
      where: { id },
      select: { image: true },
    });

    if (!currentProduct) {
      return NextResponse.json({ msg: 'Product not found' }, { status: 404 });
    }

    // Handle Image Deletion
    let keptImages: string[] = [];
        try {
          keptImages = existingGalleryRaw
            ? JSON.parse(existingGalleryRaw)
            : [];
        } catch {
          // Ignore parse error
        }

    const galleryPaths: string[] = [];
    for (const [key, value] of formData.entries()) {
      if (value instanceof File && value.size > 0) {
        const path = await saveFile(value, 'products');
        galleryPaths.push(path);
      }
    }

    const finalImageList = [...keptImages, ...galleryPaths];

    // Variants
    let parsedVariants: any[] = [];
    try {
      parsedVariants = variantsRaw ? JSON.parse(variantsRaw) : [];
    } catch {
       return NextResponse.json({ error: 'Invalid variants JSON' }, { status: 400 });
    }

    const updatedProduct = await prisma.product.update({
      where: { id },
      data: {
        name,
        description,
        price,
        categoryId,
        volume,
        brand,
        image: finalImageList,
        type,
        diameter,
        height,
        group,
        length,
        variants: {
          deleteMany: {},
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

    const imagesToDelete = currentProduct.image.filter(
      (oldUrl) => !keptImages.includes(oldUrl)
    );

    for (const imageUrl of imagesToDelete) {
       try {
          const urlParts = imageUrl.split('/');
          const filename = urlParts[urlParts.length - 1];
          const filePath = path.join(process.cwd(), 'public', 'uploads', 'products', filename);
          await unlink(filePath).catch(() => {});
       } catch (e) {
           console.error('Error deleting orphan image', e);
       }
    }

    return NextResponse.json(updatedProduct);

  } catch (err) {
    console.error('Error updating product:', err);
    return NextResponse.json(
      { error: 'Failed to update product' },
      { status: 500 }
    );
  }
}
