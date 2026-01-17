import { prisma } from '@/lib/prismaClient';
import { NextResponse } from 'next/server';
import slugify from 'slugify';

export async function GET() {
  try {
    const brands = await prisma.brand.findMany({ orderBy: { name: 'asc' } });
    return NextResponse.json(brands);
  } catch (err) {
    return NextResponse.json({ error: 'Failed to fetch brands' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name } = body;

    const existingBrand = await prisma.brand.findFirst({ where: { name } });
    if (existingBrand) {
      return NextResponse.json({ error: 'Brand already exists' }, { status: 400 });
    }

    const slug = slugify(name, { lower: true });

    const brand = await prisma.brand.create({
      data: { name, slug },
    });
    return NextResponse.json(brand);
  } catch (err) {
    console.log(err);
    return NextResponse.json({ error: 'Failed to create brand' }, { status: 500 });
  }
}
