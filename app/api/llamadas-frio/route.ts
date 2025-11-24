import { NextRequest, NextResponse } from 'next/server'

let prisma: any = null
try {
  const { prisma: prismaClient } = require('@/lib/prisma')
  prisma = prismaClient
} catch (error) {
  console.warn('Prisma no está configurado aún')
}

export async function GET(request: NextRequest) {
  if (!prisma) {
    return NextResponse.json({ llamadas: [] }, { status: 200 })
  }

  try {
    const { searchParams } = new URL(request.url)
    const estado = searchParams.get('estado')
    const interesado = searchParams.get('interesado')
    const search = searchParams.get('search')

    const where: any = {}
    if (estado) where.estado = estado
    if (interesado !== null) where.interesado = interesado === 'true'
    if (search) {
      where.OR = [
        { nombre: { contains: search, mode: 'insensitive' } },
        { telefono: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { empresa: { contains: search, mode: 'insensitive' } }
      ]
    }

    const llamadas = await prisma.llamadaFrio.findMany({
      where,
      include: {
        cliente: true,
        lead: true
      },
      orderBy: { createdAt: 'desc' },
      take: 1000
    })

    // Estadísticas
    const total = await prisma.llamadaFrio.count()
    const completadas = await prisma.llamadaFrio.count({ where: { estado: 'COMPLETADA' } })
    const interesados = await prisma.llamadaFrio.count({ where: { interesado: true } })
    const pendientes = await prisma.llamadaFrio.count({ where: { estado: 'PENDIENTE' } })

    return NextResponse.json({ 
      llamadas,
      estadisticas: {
        total,
        completadas,
        interesados,
        pendientes,
        tasaInteres: total > 0 ? (interesados / total) * 100 : 0
      }
    })
  } catch (error) {
    console.error('Error obteniendo llamadas:', error)
    return NextResponse.json({ error: 'Error al obtener llamadas' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  if (!prisma) {
    return NextResponse.json({ error: 'Base de datos no configurada' }, { status: 503 })
  }

  try {
    const body = await request.json()
    const { nombre, telefono, email, empresa, direccion, notas, origen } = body

    if (!nombre || !telefono) {
      return NextResponse.json({ 
        error: 'Se requieren nombre y teléfono' 
      }, { status: 400 })
    }

    const llamada = await prisma.llamadaFrio.create({
      data: {
        nombre: nombre.trim(),
        telefono: telefono.trim(),
        email: email?.trim() || null,
        empresa: empresa?.trim() || null,
        direccion: direccion?.trim() || null,
        notas: notas?.trim() || null,
        origen: origen || 'manual',
        estado: 'PENDIENTE'
      }
    })

    return NextResponse.json({ llamada }, { status: 201 })
  } catch (error: any) {
    console.error('Error creando llamada:', error)
    return NextResponse.json({ 
      error: error.message || 'Error al crear llamada'
    }, { status: 500 })
  }
}

