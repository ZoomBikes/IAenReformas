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
    const cliente = await prisma.cliente.findUnique({
      where: { id: params.id },
      include: {
        presupuestos: {
          orderBy: { createdAt: 'desc' },
          take: 10
        },
        obras: {
          orderBy: { createdAt: 'desc' },
          take: 10
        },
        leads: {
          orderBy: { createdAt: 'desc' },
          take: 10
        }
      }
    })

    if (!cliente) {
      return NextResponse.json({ error: 'Cliente no encontrado' }, { status: 404 })
    }

    return NextResponse.json({ cliente })
  } catch (error) {
    console.error('Error obteniendo cliente:', error)
    return NextResponse.json({ error: 'Error al obtener cliente' }, { status: 500 })
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
    const { nombre, telefono, email, direccion, tipo, notas } = body

    const cliente = await prisma.cliente.update({
      where: { id: params.id },
      data: {
        nombre,
        telefono: telefono || null,
        email: email || null,
        direccion: direccion || null,
        tipo: tipo || null,
        notas: notas || null
      }
    })

    return NextResponse.json({ cliente })
  } catch (error) {
    console.error('Error actualizando cliente:', error)
    return NextResponse.json({ error: 'Error al actualizar cliente' }, { status: 500 })
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
    await prisma.cliente.delete({
      where: { id: params.id }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error eliminando cliente:', error)
    return NextResponse.json({ error: 'Error al eliminar cliente' }, { status: 500 })
  }
}

