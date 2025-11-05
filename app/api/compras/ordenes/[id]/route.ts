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

    const orden = await prisma.ordenCompra.update({
      where: { id: params.id },
      data: {
        estado: body.estado,
        fechaEntregaReal: body.fechaEntregaReal ? new Date(body.fechaEntregaReal) : null,
        descripcion: body.descripcion || null
      },
      include: {
        proveedor: true,
        obra: true,
        items: true
      }
    })

    return NextResponse.json({ orden })
  } catch (error) {
    console.error('Error actualizando orden:', error)
    return NextResponse.json({ error: 'Error al actualizar orden' }, { status: 500 })
  }
}

