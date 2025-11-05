import { NextRequest, NextResponse } from 'next/server'

let prisma: any = null
try {
  const { prisma: prismaClient } = require('@/lib/prisma')
  prisma = prismaClient
} catch (error) {
  console.warn('Prisma no está configurado aún')
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

    const tarea = await prisma.tarea.update({
      where: { id: params.id },
      data: {
        nombre: body.nombre,
        descripcion: body.descripcion || null,
        tipo: body.tipo || null,
        estado: body.estado,
        prioridad: body.prioridad !== undefined ? body.prioridad : undefined,
        fechaInicio: body.fechaInicio ? new Date(body.fechaInicio) : null,
        fechaFinPrevista: body.fechaFinPrevista ? new Date(body.fechaFinPrevista) : null,
        fechaFinReal: body.fechaFinReal ? new Date(body.fechaFinReal) : null,
        responsable: body.responsable || null,
        horasEstimadas: body.horasEstimadas ? parseFloat(body.horasEstimadas) : null,
        horasReales: body.horasReales ? parseFloat(body.horasReales) : null,
        costeEstimado: body.costeEstimado ? parseFloat(body.costeEstimado) : null,
        costeReal: body.costeReal ? parseFloat(body.costeReal) : null
      },
      include: {
        obra: true
      }
    })

    return NextResponse.json({ tarea })
  } catch (error) {
    console.error('Error actualizando tarea:', error)
    return NextResponse.json({ error: 'Error al actualizar tarea' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  if (!prisma) {
    return NextResponse.json({ error: 'Base de datos no configurada' }, { status: 503 })
  }

  try {
    await prisma.tarea.delete({
      where: { id: params.id }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error eliminando tarea:', error)
    return NextResponse.json({ error: 'Error al eliminar tarea' }, { status: 500 })
  }
}

