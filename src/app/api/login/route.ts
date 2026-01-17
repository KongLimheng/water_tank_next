import { comparePassword } from '@/lib/password';
import { prisma } from '@/lib/prismaClient';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    // Support both 'username' and 'email' fields from client
    const emailInput = body.email || body.username;
    const password = body.password;

    if (!emailInput || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    const user = await prisma.user.findFirst({
      where: { email: emailInput },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      );
    }

    const isPasswordValid = await comparePassword(password, user.password);

    if (!isPasswordValid) {
      return NextResponse.json(
        { error: 'Email or password is incorrect.' },
        { status: 400 }
      );
    }

    return NextResponse.json({
      user: { id: user.id, email: user.email, role: user.role },
    });
  } catch (err) {
    console.error('Login error:', err);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
