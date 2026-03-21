import { NextResponse } from 'next/server'
import { hash } from 'bcryptjs'
import { prisma } from '@/lib/prisma'

const GUEST_EMAIL = 'guest@athena.local'
const GUEST_PASSWORD = 'guest1234'
const GUEST_NAME = 'Guest User'

export async function POST() {
  try {
    // Check if guest user already exists
    let user = await prisma.user.findUnique({
      where: { email: GUEST_EMAIL },
    })

    if (!user) {
      const hashedPassword = await hash(GUEST_PASSWORD, 12)
      user = await prisma.user.create({
        data: {
          name: GUEST_NAME,
          email: GUEST_EMAIL,
          hashedPassword,
          timezone: 'Asia/Kolkata',
        },
      })
    }

    // Return credentials so the client can sign in
    return NextResponse.json({
      email: GUEST_EMAIL,
      password: GUEST_PASSWORD,
    })
  } catch (err) {
    console.error('Guest login error:', err)
    return NextResponse.json(
      { error: 'Failed to create guest account' },
      { status: 500 }
    )
  }
}
