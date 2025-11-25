import { NextRequest, NextResponse } from 'next/server'
import { put } from '@vercel/blob'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const audio = formData.get('audio') as File | null
    const llamadaId = formData.get('llamadaId') as string | null
    const duration = formData.get('duration') as string | null

    if (!audio || !llamadaId) {
      return NextResponse.json({ error: 'Audio y llamada son obligatorios' }, { status: 400 })
    }

    const extension = audio.name?.split('.').pop() || 'webm'
    const filename = `llamadas-audio/${llamadaId}-${Date.now()}.${extension}`

    const blob = await put(filename, audio, {
      access: 'public',
      addRandomSuffix: false
    })

    await prisma.llamadaFrio.update({
      where: { id: llamadaId },
      data: {
        audioUrl: blob.url,
        audioDuration: duration ? Math.round(parseFloat(duration)) : null
      }
    })

    return NextResponse.json({ success: true, url: blob.url })
  } catch (error: any) {
    console.error('Error subiendo audio:', error)
    return NextResponse.json({ error: error.message || 'Error al subir audio' }, { status: 500 })
  }
}

