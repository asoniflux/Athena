import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { readFile } from 'fs/promises'
import path from 'path'

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params

    const file = await prisma.file.findFirst({
      where: {
        id,
        userId: session.user.id,
        deletedAt: null,
      },
    })

    if (!file) {
      return NextResponse.json({ error: 'File not found' }, { status: 404 })
    }

    const fullPath = path.join(process.cwd(), file.storagePath)
    const fileBuffer = await readFile(fullPath)

    return new Response(fileBuffer, {
      headers: {
        'Content-Type': file.mimeType,
        'Content-Disposition': `attachment; filename="${file.originalName}"`,
        'Content-Length': file.size.toString(),
      },
    })
  } catch (error) {
    console.error('File download error:', error)
    return NextResponse.json({ error: 'Failed to download file' }, { status: 500 })
  }
}
