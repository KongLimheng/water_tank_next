import { prisma } from '@/lib/prismaClient';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
       return NextResponse.json({ error: 'ID is required' }, { status: 400 });
    }

    const products = await prisma.product.findMany({
      where: {
        categoryId: Number(id),
      },
      include: { variants: true, category: { include: { brand: true } } },
      orderBy: { id: 'desc' },
    });
    return NextResponse.json(products);
  } catch (err) {
    console.error('Error fetching products by brand and category:', err);
    return NextResponse.json({ error: 'Failed to fetch products' }, { status: 500 });
  }
}
