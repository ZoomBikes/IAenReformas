import { NextRequest, NextResponse } from 'next/server'

let prisma: any = null
try {
  const { prisma: prismaClient } = require('@/lib/prisma')
  prisma = prismaClient
} catch (error) {
  console.warn('Prisma no está configurado aún')
}

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  if (!prisma) {
    return NextResponse.json({ error: 'Base de datos no configurada' }, { status: 503 })
  }

  try {
    const obra = await prisma.obra.findUnique({
      where: { id: params.id },
      include: {
        cliente: true,
        presupuesto: true,
        tareas: {
          orderBy: { createdAt: 'desc' }
        },
        contratos: {
          include: {
            proveedor: true
          }
        },
        seguimientoCostes: {
          orderBy: { fecha: 'desc' }
        },
        pagos: {
          orderBy: { fecha: 'desc' },
          include: {
            proveedor: true
          }
        }
      }
    })

    if (!obra) {
      return NextResponse.json({ error: 'Obra no encontrada' }, { status: 404 })
    }

    return NextResponse.json({ obra })
  } catch (error) {
    console.error('Error obteniendo obra:', error)
    return NextResponse.json({ error: 'Error al obtener obra' }, { status: 500 })
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  if (!prisma) {
    return NextResponse.json({ error: 'Base de datos no configurada' }, { status: 503 })
  }

  try {
    const body = await request.json()

    const obra = await prisma.obra.update({
      where: { id: params.id },
      data: {
        nombre: body.nombre,
        direccion: body.direccion,
        descripcion: body.descripcion || null,
        estado: body.estado,
        fechaInicio: body.fechaInicio ? new Date(body.fechaInicio) : null,
        fechaFinPrevista: body.fechaFinPrevista ? new Date(body.fechaFinPrevista) : null,
        fechaFinReal: body.fechaFinReal ? new Date(body.fechaFinReal) : null,
        presupuestoTotal: body.presupuestoTotal ? parseFloat(body.presupuestoTotal) : undefined,
        costeReal: body.costeReal !== undefined ? parseFloat(body.costeReal) : undefined,
        avance: body.avance !== undefined ? parseFloat(body.avance) : undefined
      },
      include: {
        cliente: true,
        presupuesto: true
      }
    })

    return NextResponse.json({ obra })
  } catch (error) {
    console.error('Error actualizando obra:', error)
    return NextResponse.json({ error: 'Error al actualizar obra' }, { status: 500 })
  }
}

