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
    const factura = await prisma.facturaTrabajador.findUnique({
      where: { id: params.id },
      include: {
        obra: {
          include: {
            cliente: true
          }
        }
      }
    })

    if (!factura) {
      return NextResponse.json({ error: 'Factura no encontrada' }, { status: 404 })
    }

    return NextResponse.json({ factura })
  } catch (error) {
    console.error('Error obteniendo factura:', error)
    return NextResponse.json({ error: 'Error al obtener factura' }, { status: 500 })
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

    const factura = await prisma.facturaTrabajador.update({
      where: { id: params.id },
      data: {
        trabajadorNombre: body.trabajadorNombre,
        trabajadorDni: body.trabajadorDni || null,
        trabajadorTelefono: body.trabajadorTelefono || null,
        concepto: body.concepto,
        importe: body.importe ? parseFloat(body.importe) : undefined,
        fechaFactura: body.fechaFactura ? new Date(body.fechaFactura) : undefined,
        estado: body.estado,
        imagenBase64: body.imagenBase64 !== undefined ? body.imagenBase64 : undefined,
        imagenUrl: body.imagenUrl !== undefined ? body.imagenUrl : undefined,
        obraId: body.obraId || null,
        notas: body.notas || null,
        enviadoGestor: body.enviadoGestor !== undefined ? body.enviadoGestor : undefined,
        fechaEnvioGestor: body.enviadoGestor === true && !body.fechaEnvioGestor 
          ? new Date() 
          : body.fechaEnvioGestor ? new Date(body.fechaEnvioGestor) : undefined
      },
      include: {
        obra: true
      }
    })

    return NextResponse.json({ factura })
  } catch (error) {
    console.error('Error actualizando factura:', error)
    return NextResponse.json({ error: 'Error al actualizar factura' }, { status: 500 })
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
    await prisma.facturaTrabajador.delete({
      where: { id: params.id }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error eliminando factura:', error)
    return NextResponse.json({ error: 'Error al eliminar factura' }, { status: 500 })
  }
}

