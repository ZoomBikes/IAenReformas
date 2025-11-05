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
    const { nombre, telefono, email, direccion, origen, estado, notas, valorEstimado, campanaId, clienteId } = body

    const lead = await prisma.lead.update({
      where: { id: params.id },
      data: {
        nombre,
        telefono: telefono || null,
        email: email || null,
        direccion: direccion || null,
        origen: origen || null,
        estado: estado || undefined,
        notas: notas || null,
        valorEstimado: valorEstimado ? parseFloat(valorEstimado) : null,
        campanaId: campanaId || null,
        clienteId: clienteId || null
      },
      include: {
        campana: true,
        cliente: true
      }
    })

    // Si se convierte en cliente, crear el cliente automáticamente
    if (estado === 'CONVERTIDO' && !clienteId) {
      const cliente = await prisma.cliente.create({
        data: {
          nombre: lead.nombre,
          telefono: lead.telefono,
          email: lead.email,
          direccion: lead.direccion,
          tipo: 'particular'
        }
      })

      await prisma.lead.update({
        where: { id: params.id },
        data: { clienteId: cliente.id }
      })

      return NextResponse.json({ lead: { ...lead, cliente }, cliente })
    }

    return NextResponse.json({ lead })
  } catch (error) {
    console.error('Error actualizando lead:', error)
    return NextResponse.json({ error: 'Error al actualizar lead' }, { status: 500 })
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
    await prisma.lead.delete({
      where: { id: params.id }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error eliminando lead:', error)
    return NextResponse.json({ error: 'Error al eliminar lead' }, { status: 500 })
  }
}

