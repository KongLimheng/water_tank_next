import { prisma } from '@/lib/prismaClient'
import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  try {
    const { password } = await req.json()

    if (!password) {
      return NextResponse.json(
        { valid: false, message: 'Password is required' },
        { status: 400 },
      )
    }

    // Fetch settings from database
    const settings = await prisma.siteSettings.findUnique({
      where: { id: 1 },
    })

    if (!settings || !(settings.aboutUs as any)?.section1?.dealerPassword) {
      return NextResponse.json(
        { valid: false, message: 'Dealer password is not configured' },
        { status: 404 },
      )
    }

    const hashedPassword = (settings.aboutUs as any).section1.dealerPassword

    // Verify the password
    const isValid = password === hashedPassword

    if (isValid) {
      return NextResponse.json({
        valid: true,
        message: 'Authentication successful',
      })
    } else {
      return NextResponse.json(
        { valid: false, message: 'Invalid password' },
        { status: 401 },
      )
    }
  } catch (err) {
    console.error('Error verifying dealer password:', err)
    return NextResponse.json(
      { valid: false, message: 'Failed to verify password' },
      { status: 500 },
    )
  }
}
