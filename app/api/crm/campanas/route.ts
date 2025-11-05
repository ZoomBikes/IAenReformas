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
    return NextResponse.json({ campanas: [] }, { status: 200 })
  }

  try {
    const campanas = await prisma.campana.findMany({
      include: {
        _count: {
          select: { leads: true }
        }
      },
      orderBy: { createdAt: 'desc' },
      take: 100
    })

    return NextResponse.json({ campanas })
  } catch (error) {
    console.error('Error obteniendo campañas:', error)
    return NextResponse.json({ error: 'Error al obtener campañas' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  if (!prisma) {
    return NextResponse.json({ error: 'Base de datos no configurada' }, { status: 503 })
  }

  try {
    const body = await request.json()
    const { nombre, descripcion, tipo, fechaInicio, fechaFin, presupuesto } = body

    if (!nombre) {
      return NextResponse.json({ error: 'El nombre es obligatorio' }, { status: 400 })
    }

    const campana = await prisma.campana.create({
      data: {
        nombre,
        descripcion: descripcion || null,
        tipo: tipo || null,
        fechaInicio: fechaInicio ? new Date(fechaInicio) : null,
        fechaFin: fechaFin ? new Date(fechaFin) : null,
        presupuesto: presupuesto ? parseFloat(presupuesto) : null,
        gastoReal: 0,
        activa: true
      }
    })

    return NextResponse.json({ campana }, { status: 201 })
  } catch (error) {
    console.error('Error creando campaña:', error)
    return NextResponse.json({ error: 'Error al crear campaña' }, { status: 500 })
  }
}

