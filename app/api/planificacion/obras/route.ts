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
    return NextResponse.json({ obras: [] }, { status: 200 })
  }

  try {
    const { searchParams } = new URL(request.url)
    const estado = searchParams.get('estado')

    const obras = await prisma.obra.findMany({
      where: estado ? { estado } : {},
      include: {
        cliente: true,
        presupuesto: true,
        _count: {
          select: {
            tareas: true,
            contratos: true
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      take: 100
    })

    return NextResponse.json({ obras })
  } catch (error) {
    console.error('Error obteniendo obras:', error)
    return NextResponse.json({ error: 'Error al obtener obras' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  if (!prisma) {
    return NextResponse.json({ error: 'Base de datos no configurada' }, { status: 503 })
  }

  try {
    const body = await request.json()
    const { presupuestoId, clienteId, nombre, direccion, descripcion, fechaInicio, fechaFinPrevista, presupuestoTotal } = body

    if (!clienteId || !nombre || !direccion) {
      return NextResponse.json({ error: 'Datos incompletos' }, { status: 400 })
    }

    const obra = await prisma.obra.create({
      data: {
        presupuestoId: presupuestoId || null,
        clienteId,
        nombre,
        direccion,
        descripcion: descripcion || null,
        fechaInicio: fechaInicio ? new Date(fechaInicio) : null,
        fechaFinPrevista: fechaFinPrevista ? new Date(fechaFinPrevista) : null,
        presupuestoTotal: presupuestoTotal ? parseFloat(presupuestoTotal) : 0,
        costeReal: 0,
        avance: 0,
        estado: 'PLANIFICADA'
      },
      include: {
        cliente: true,
        presupuesto: true
      }
    })

    return NextResponse.json({ obra }, { status: 201 })
  } catch (error) {
    console.error('Error creando obra:', error)
    return NextResponse.json({ error: 'Error al crear obra' }, { status: 500 })
  }
}

