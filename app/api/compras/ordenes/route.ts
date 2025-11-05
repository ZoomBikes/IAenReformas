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
    return NextResponse.json({ ordenes: [] }, { status: 200 })
  }

  try {
    const { searchParams } = new URL(request.url)
    const estado = searchParams.get('estado')
    const obraId = searchParams.get('obraId')

    const ordenes = await prisma.ordenCompra.findMany({
      where: {
        ...(estado ? { estado } : {}),
        ...(obraId ? { obraId } : {})
      },
      include: {
        proveedor: true,
        obra: {
          include: {
            cliente: true
          }
        },
        items: true
      },
      orderBy: { createdAt: 'desc' },
      take: 100
    })

    return NextResponse.json({ ordenes })
  } catch (error) {
    console.error('Error obteniendo órdenes:', error)
    return NextResponse.json({ error: 'Error al obtener órdenes' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  if (!prisma) {
    return NextResponse.json({ error: 'Base de datos no configurada' }, { status: 503 })
  }

  try {
    const body = await request.json()
    const { proveedorId, obraId, numero, descripcion, fechaEntregaPrevista, items } = body

    if (!proveedorId || !numero || !items || items.length === 0) {
      return NextResponse.json({ error: 'Datos incompletos' }, { status: 400 })
    }

    // Calcular totales
    const subtotal = items.reduce((sum: number, item: any) => 
      sum + (parseFloat(item.cantidad) * parseFloat(item.precioUnitario)), 0)
    const iva = subtotal * 0.21
    const total = subtotal + iva

    const orden = await prisma.ordenCompra.create({
      data: {
        proveedorId,
        obraId: obraId || null,
        numero,
        descripcion: descripcion || null,
        fechaEntregaPrevista: fechaEntregaPrevista ? new Date(fechaEntregaPrevista) : null,
        subtotal,
        iva,
        total,
        estado: 'BORRADOR',
        items: {
          create: items.map((item: any) => ({
            descripcion: item.descripcion,
            cantidad: parseFloat(item.cantidad),
            unidad: item.unidad || 'unidades',
            precioUnitario: parseFloat(item.precioUnitario),
            precioTotal: parseFloat(item.cantidad) * parseFloat(item.precioUnitario),
            recibido: false,
            cantidadRecibida: 0
          }))
        }
      },
      include: {
        proveedor: true,
        obra: true,
        items: true
      }
    })

    return NextResponse.json({ orden }, { status: 201 })
  } catch (error) {
    console.error('Error creando orden:', error)
    return NextResponse.json({ error: 'Error al crear orden' }, { status: 500 })
  }
}

