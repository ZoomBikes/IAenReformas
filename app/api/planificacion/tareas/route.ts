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
    return NextResponse.json({ tareas: [] }, { status: 200 })
  }

  try {
    const { searchParams } = new URL(request.url)
    const obraId = searchParams.get('obraId')
    const estado = searchParams.get('estado')

    const tareas = await prisma.tarea.findMany({
      where: {
        ...(obraId ? { obraId } : {}),
        ...(estado ? { estado } : {})
      },
      include: {
        obra: {
          include: {
            cliente: true
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      take: 200
    })

    return NextResponse.json({ tareas })
  } catch (error) {
    console.error('Error obteniendo tareas:', error)
    return NextResponse.json({ error: 'Error al obtener tareas' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  if (!prisma) {
    return NextResponse.json({ error: 'Base de datos no configurada' }, { status: 503 })
  }

  try {
    const body = await request.json()
    const { obraId, nombre, descripcion, tipo, prioridad, fechaInicio, fechaFinPrevista, responsable, horasEstimadas, costeEstimado } = body

    if (!obraId || !nombre) {
      return NextResponse.json({ error: 'Datos incompletos' }, { status: 400 })
    }

    const tarea = await prisma.tarea.create({
      data: {
        obraId,
        nombre,
        descripcion: descripcion || null,
        tipo: tipo || null,
        prioridad: prioridad || 3,
        fechaInicio: fechaInicio ? new Date(fechaInicio) : null,
        fechaFinPrevista: fechaFinPrevista ? new Date(fechaFinPrevista) : null,
        responsable: responsable || null,
        horasEstimadas: horasEstimadas ? parseFloat(horasEstimadas) : null,
        costeEstimado: costeEstimado ? parseFloat(costeEstimado) : null,
        estado: 'PENDIENTE'
      },
      include: {
        obra: true
      }
    })

    return NextResponse.json({ tarea }, { status: 201 })
  } catch (error) {
    console.error('Error creando tarea:', error)
    return NextResponse.json({ error: 'Error al crear tarea' }, { status: 500 })
  }
}

