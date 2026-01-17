import { prisma } from '@/lib/prismaClient';
import { NextResponse } from 'next/server';

export async function PUT(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id);
    const { title, description, videoUrl, thumbnail } = await req.json();

    const updatedVideo = await prisma.video.update({
      where: { id },
      data: { title, description, videoUrl, thumbnail },
    });

    return NextResponse.json(updatedVideo);
  } catch (err) {
    return NextResponse.json(
      { error: 'Failed to update video' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id);
    await prisma.video.delete({
      where: { id },
    });

    return NextResponse.json({ msg: 'Video deleted' });
  } catch (err) {
    return NextResponse.json(
      { error: 'Failed to delete video' },
      { status: 500 }
    );
  }
}
