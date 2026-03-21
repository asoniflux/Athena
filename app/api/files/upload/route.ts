import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { writeFile, mkdir } from 'fs/promises'
import path from 'path'

export async function POST(req: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const formData = await req.formData()
    const file = formData.get('file') as File | null
    const folderId = formData.get('folderId') as string | null

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    // Create upload directory
    const uploadDir = path.join(process.cwd(), 'data', 'uploads', session.user.id)
    await mkdir(uploadDir, { recursive: true })

    // Generate unique filename
    const timestamp = Date.now()
    const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_')
    const filename = `${timestamp}-${safeName}`
    const storagePath = path.join('data', 'uploads', session.user.id, filename)
    const fullPath = path.join(process.cwd(), storagePath)

    // Write file to disk
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    await writeFile(fullPath, buffer)

    // Create DB record
    const fileRecord = await prisma.file.create({
      data: {
        userId: session.user.id,
        folderId: folderId || null,
        originalName: file.name,
        storagePath,
        mimeType: file.type || 'application/octet-stream',
        size: file.size,
      },
    })

    return NextResponse.json({ success: true, data: fileRecord })
  } catch (error) {
    console.error('File upload error:', error)
    return NextResponse.json({ error: 'Failed to upload file' }, { status: 500 })
  }
}
