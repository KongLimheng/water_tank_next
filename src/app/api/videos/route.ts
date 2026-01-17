import { prisma } from '@/lib/prismaClient';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const videos = await prisma.video.findMany({
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json(videos);
  } catch (err) {
    return NextResponse.json({ error: 'Failed to fetch videos' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const video = await prisma.video.create({
      data: body,
    });
    return NextResponse.json(video);
  } catch (err) {
    return NextResponse.json({ error: 'Failed to create video' }, { status: 500 });
  }
}
