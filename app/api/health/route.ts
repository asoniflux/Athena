import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { isOllamaAvailable } from '@/lib/ollama'

export async function GET() {
  const checks: Record<string, 'ok' | 'error'> = {
    app: 'ok',
    database: 'error',
    ollama: 'error',
  }

  // Check database
  try {
    await prisma.$queryRaw`SELECT 1`
    checks.database = 'ok'
  } catch {
    checks.database = 'error'
  }

  // Check Ollama
  try {
    const available = await isOllamaAvailable()
    checks.ollama = available ? 'ok' : 'error'
  } catch {
    checks.ollama = 'error'
  }

  const allHealthy = Object.values(checks).every((v) => v === 'ok')

  return NextResponse.json(
    {
      status: allHealthy ? 'healthy' : 'degraded',
      checks,
      timestamp: new Date().toISOString(),
    },
    { status: allHealthy ? 200 : 503 }
  )
}
