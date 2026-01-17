import { cleanImage } from "@/lib/cleanImage";
import { saveFile } from "@/lib/fileUpload";
import { prisma } from "@/lib/prismaClient";
import { unlink } from "fs/promises";
import { NextResponse } from "next/server";
import path from "path";
import slugify from "slugify";

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: idString } = await params;

    const formData = await req.formData();
    const name = formData.get('name') as string;
    const displayName = (formData.get('displayName') as string) || null;
    const uploadType = (formData.get('uploadType') as string) || 'categories';
    const brandIdRaw = formData.get('brandId') as string;

    const currentCategory = await prisma.category.findUnique({
      where: { id: Number(idString) },
    })

    if (!currentCategory) {
      return NextResponse.json({ error: 'Category not found' }, { status: 404 })
    }

    let brandId: number | null = null;
    if (brandIdRaw && brandIdRaw !== 'null' && brandIdRaw !== 'undefined') {
      brandId = parseInt(brandIdRaw);
    }
    let slug = '';
    if (brandId) {
      const brand = await prisma.brand.findUnique({ where: { id: brandId } });
      if (!brand) return NextResponse.json({ error: 'Brand not found' }, { status: 404 });

      const existingCategory = await prisma.category.findFirst({
        where: { name, brandId, id: { not: Number(idString) } },
      })
      if (existingCategory) {
        return NextResponse.json({ error: `Category name already exists exists for brand ${brand.name}.` }, { status: 400 });
      }

      slug = `${brand.name.toLowerCase().replace(/\s+/g, '_')}_${slugify(name, { lower: true, replacement: '_' })}`;
    } else {
      const duplicateGeneric = await prisma.category.findFirst({
        where: { name: name, brandId: null, id: { not: Number(idString) } },
      })

      if (duplicateGeneric) return NextResponse.json({ error: `Generic category '${name}' already exists` }, { status: 400 });
      slug = slugify(name, { lower: true, replacement: '_' });
    }

    let imageUrl: string | null = null;
    const imageFile = formData.get('image');
    if (imageFile instanceof File) {
      imageUrl = await saveFile(imageFile, uploadType);
    }

    const updatedCategory = await prisma.category.update({
      where: { id: Number(idString) },
      data: {
        name,
        slug,
        brandId,
        displayName,
        image: imageUrl,
      },
      include: { brand: true },
    })

    if (currentCategory.image && currentCategory.image !== imageUrl) {
      try {
        const urlParts = currentCategory.image.split('/');
        const filename = urlParts[urlParts.length - 1];
        const filePath = path.join(process.cwd(), 'public', 'uploads', 'categories', filename);
        await unlink(filePath).catch(() => { });
      } catch (e) {
        console.error('Error deleting orphan image', e);
      }
    }


    return NextResponse.json(updatedCategory)
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: 'Failed to update category' }, { status: 500 })
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: idString } = await params;
    const category = await prisma.category.findUnique({
      where: { id: Number(idString) },
    })

    if (!category) {
      return NextResponse.json({ error: 'Category not found' }, { status: 404 })
    }

    await prisma.category.delete({
      where: { id: Number(idString) },
    })

    if (category.image) {
      await cleanImage(category.image, 'categories');
    }

    return NextResponse.json({ message: 'Category deleted successfully' })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: 'Failed to delete category' }, { status: 500 })
  }
}