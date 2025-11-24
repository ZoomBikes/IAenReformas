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
    const llamada = await prisma.llamadaFrio.findUnique({
      where: { id: params.id },
      include: {
        cliente: true,
        lead: true
      }
    })

    if (!llamada) {
      return NextResponse.json({ error: 'Llamada no encontrada' }, { status: 404 })
    }

    return NextResponse.json({ llamada })
  } catch (error) {
    console.error('Error obteniendo llamada:', error)
    return NextResponse.json({ error: 'Error al obtener llamada' }, { status: 500 })
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
    const {
      nombre,
      telefono,
      email,
      empresa,
      direccion,
      notas,
      estado,
      fechaLlamada,
      fechaAgendada,
      duracion,
      resultado,
      interesado,
      valorEstimado,
      siguienteAccion
    } = body

    const llamada = await prisma.llamadaFrio.update({
      where: { id: params.id },
      data: {
        ...(nombre && { nombre: nombre.trim() }),
        ...(telefono && { telefono: telefono.trim() }),
        ...(email !== undefined && { email: email?.trim() || null }),
        ...(empresa !== undefined && { empresa: empresa?.trim() || null }),
        ...(direccion !== undefined && { direccion: direccion?.trim() || null }),
        ...(notas !== undefined && { notas: notas?.trim() || null }),
        ...(estado && { estado }),
        ...(fechaLlamada && { fechaLlamada: new Date(fechaLlamada) }),
        ...(fechaAgendada && { fechaAgendada: new Date(fechaAgendada) }),
        ...(duracion !== undefined && { duracion }),
        ...(resultado !== undefined && { resultado: resultado?.trim() || null }),
        ...(interesado !== undefined && { interesado }),
        ...(valorEstimado !== undefined && { valorEstimado }),
        ...(siguienteAccion !== undefined && { siguienteAccion: siguienteAccion?.trim() || null })
      },
      include: {
        cliente: true,
        lead: true
      }
    })

    return NextResponse.json({ llamada })
  } catch (error: any) {
    console.error('Error actualizando llamada:', error)
    return NextResponse.json({ 
      error: error.message || 'Error al actualizar llamada'
    }, { status: 500 })
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
    await prisma.llamadaFrio.delete({
      where: { id: params.id }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error eliminando llamada:', error)
    return NextResponse.json({ error: 'Error al eliminar llamada' }, { status: 500 })
  }
}

