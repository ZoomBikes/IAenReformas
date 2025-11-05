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

    const proveedor = await prisma.proveedor.update({
      where: { id: params.id },
      data: {
        nombre: body.nombre,
        contacto: body.contacto || null,
        telefono: body.telefono || null,
        email: body.email || null,
        direccion: body.direccion || null,
        tipo: body.tipo || null,
        notas: body.notas || null,
        activo: body.activo !== undefined ? body.activo : undefined
      }
    })

    return NextResponse.json({ proveedor })
  } catch (error) {
    console.error('Error actualizando proveedor:', error)
    return NextResponse.json({ error: 'Error al actualizar proveedor' }, { status: 500 })
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
    await prisma.proveedor.update({
      where: { id: params.id },
      data: { activo: false }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error desactivando proveedor:', error)
    return NextResponse.json({ error: 'Error al desactivar proveedor' }, { status: 500 })
  }
}

