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
    return NextResponse.json({ pagos: [] }, { status: 200 })
  }

  try {
    const { searchParams } = new URL(request.url)
    const obraId = searchParams.get('obraId')
    const tipo = searchParams.get('tipo')

    const pagos = await prisma.pago.findMany({
      where: {
        ...(obraId ? { obraId } : {}),
        ...(tipo ? { tipo } : {})
      },
      include: {
        obra: {
          include: {
            cliente: true
          }
        },
        proveedor: true
      },
      orderBy: { fecha: 'desc' },
      take: 200
    })

    return NextResponse.json({ pagos })
  } catch (error) {
    console.error('Error obteniendo pagos:', error)
    return NextResponse.json({ error: 'Error al obtener pagos' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  if (!prisma) {
    return NextResponse.json({ error: 'Base de datos no configurada' }, { status: 503 })
  }

  try {
    const body = await request.json()
    const { obraId, concepto, tipo, importe, fecha, metodo, proveedorId, notas } = body

    if (!obraId || !concepto || !tipo || !importe) {
      return NextResponse.json({ error: 'Datos incompletos' }, { status: 400 })
    }

    const pago = await prisma.pago.create({
      data: {
        obraId,
        concepto,
        tipo,
        importe: parseFloat(importe),
        fecha: fecha ? new Date(fecha) : new Date(),
        metodo: metodo || null,
        proveedorId: proveedorId || null,
        notas: notas || null
      },
      include: {
        obra: true,
        proveedor: true
      }
    })

    // Actualizar coste real de la obra
    const obra = await prisma.obra.findUnique({ where: { id: obraId } })
    if (obra) {
      const pagosObra = await prisma.pago.aggregate({
        where: { obraId },
        _sum: { importe: true }
      })
      await prisma.obra.update({
        where: { id: obraId },
        data: { costeReal: pagosObra._sum.importe || 0 }
      })
    }

    return NextResponse.json({ pago }, { status: 201 })
  } catch (error) {
    console.error('Error creando pago:', error)
    return NextResponse.json({ error: 'Error al crear pago' }, { status: 500 })
  }
}

