import { prisma } from "@/lib/prismaClient";
import { Brand } from "@/types";
import { NextResponse } from "next/server";

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: idString } = await params;
    const data = await req.json() as Brand;
    const brand = await prisma.brand.findUnique({ where: { id: Number(idString) } });

    if (!brand) {
      return NextResponse.json({ error: 'Brand not found' }, { status: 404 });
    }

    const brandExist = await prisma.brand.findFirst({ where: { name: data.name, id: { not: Number(idString) } } });

    if (brandExist) {
      return NextResponse.json({ error: 'Brand already exists' }, { status: 400 });
    }

    const updatedBrand = await prisma.brand.update({
      where: { id: Number(idString) },
      data: {
        name: data.name,
      },
    });

    return NextResponse.json(updatedBrand);
  }
  catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: idString } = await params;
    const brand = await prisma.brand.findUnique({ where: { id: Number(idString) } });

    if (!brand) {
      return NextResponse.json({ error: 'Brand not found' }, { status: 404 });
    }

    await prisma.brand.delete({ where: { id: Number(idString) } });
    return NextResponse.json({ message: 'Brand deleted successfully' });
  }
  catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}