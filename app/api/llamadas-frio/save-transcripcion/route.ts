import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      llamadaId,
      texto,
      segmentos,
      resumen,
      sentimiento,
      palabrasClave,
      analitica
    } = body

    if (!llamadaId || !texto) {
      return NextResponse.json({ error: 'Faltan datos de transcripción' }, { status: 400 })
    }

    await prisma.llamadaFrio.update({
      where: { id: llamadaId },
      data: {
        transcripcion: { texto, segmentos },
        resumenTranscripcion: resumen || texto.slice(0, 280),
        sentimientoGlobal: sentimiento || null,
        palabrasClave: palabrasClave || [],
        analiticaConversacion: analitica || {}
      }
    })

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Error guardando transcripción:', error)
    return NextResponse.json({ error: error.message || 'Error al guardar transcripción' }, { status: 500 })
  }
}

