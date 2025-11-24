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
      agencia,
      direccion,
      codigoPostal,
      profileUrl,
      notas,
      estado,
      haLlamado,
      fechaLlamada,
      fechaAgendada,
      duracion,
      resultado,
      resultadoDetalle,
      interesado,
      valorEstimado,
      siguienteAccion,
      registrarLlamada // Flag para registrar nueva llamada en historial
    } = body

    // Obtener llamada actual para mantener historial
    const llamadaActual = await prisma.llamadaFrio.findUnique({
      where: { id: params.id }
    })

    // Si se registra una nueva llamada, añadir al historial oculto
    let historialLlamadas = llamadaActual?.historialLlamadas as any[] || []
    if (registrarLlamada && haLlamado) {
      const ahora = new Date()
      historialLlamadas.push({
        fecha: ahora.toISOString().split('T')[0],
        hora: ahora.toTimeString().split(' ')[0].substring(0, 5), // HH:MM
        timestamp: ahora.toISOString(),
        duracion: duracion || 0,
        resultado: resultado || 'NO_CONTESTA',
        estado: estado || 'LLAMADA_REALIZADA'
      })
    }

    const updateData: any = {
      ...(nombre && { nombre: nombre.trim() }),
      ...(telefono && { telefono: telefono.trim() }),
      ...(email !== undefined && { email: email?.trim() || null }),
      ...(agencia !== undefined && { agencia: agencia?.trim() || null }),
      ...(direccion !== undefined && { direccion: direccion?.trim() || null }),
      ...(codigoPostal !== undefined && { codigoPostal: codigoPostal?.trim() || null }),
      ...(profileUrl !== undefined && { profileUrl: profileUrl?.trim() || null }),
      ...(notas !== undefined && { notas: notas?.trim() || null }),
      ...(estado && { estado }),
      ...(haLlamado !== undefined && { haLlamado }),
      ...(fechaLlamada && { fechaLlamada: new Date(fechaLlamada) }),
      ...(fechaAgendada && { fechaAgendada: new Date(fechaAgendada) }),
      ...(duracion !== undefined && { duracion }),
      ...(resultado !== undefined && { resultado }),
      ...(resultadoDetalle !== undefined && { resultadoDetalle: resultadoDetalle?.trim() || null }),
      ...(interesado !== undefined && { interesado }),
      ...(valorEstimado !== undefined && { valorEstimado }),
      ...(siguienteAccion !== undefined && { siguienteAccion: siguienteAccion?.trim() || null }),
      ...(historialLlamadas.length > 0 && { historialLlamadas })
    }

    const llamada = await prisma.llamadaFrio.update({
      where: { id: params.id },
      data: updateData,
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

