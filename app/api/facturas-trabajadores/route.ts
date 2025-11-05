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
    return NextResponse.json({ facturas: [] }, { status: 200 })
  }

  try {
    const { searchParams } = new URL(request.url)
    const estado = searchParams.get('estado')
    const obraId = searchParams.get('obraId')
    const enviadoGestor = searchParams.get('enviadoGestor')

    const facturas = await prisma.facturaTrabajador.findMany({
      where: {
        ...(estado ? { estado } : {}),
        ...(obraId ? { obraId } : {}),
        ...(enviadoGestor !== null ? { enviadoGestor: enviadoGestor === 'true' } : {})
      },
      include: {
        obra: {
          include: {
            cliente: true
          }
        }
      },
      orderBy: { fechaRegistro: 'desc' },
      take: 100
    })

    return NextResponse.json({ facturas })
  } catch (error) {
    console.error('Error obteniendo facturas:', error)
    return NextResponse.json({ error: 'Error al obtener facturas' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  if (!prisma) {
    return NextResponse.json({ error: 'Base de datos no configurada' }, { status: 503 })
  }

  try {
    const body = await request.json()
    const {
      trabajadorNombre,
      trabajadorDni,
      trabajadorTelefono,
      concepto,
      importe,
      fechaFactura,
      imagenBase64,
      imagenUrl,
      obraId,
      notas,
      datosExtraidos
    } = body

    if (!trabajadorNombre || !concepto || !importe || !fechaFactura) {
      return NextResponse.json({ error: 'Datos incompletos' }, { status: 400 })
    }

    const factura = await prisma.facturaTrabajador.create({
      data: {
        trabajadorNombre,
        trabajadorDni: trabajadorDni || null,
        trabajadorTelefono: trabajadorTelefono || null,
        concepto,
        importe: parseFloat(importe),
        fechaFactura: new Date(fechaFactura),
        imagenBase64: imagenBase64 || null,
        imagenUrl: imagenUrl || null,
        obraId: obraId || null,
        notas: notas || null,
        datosExtraidos: datosExtraidos || null,
        estado: 'PENDIENTE',
        enviadoGestor: false
      },
      include: {
        obra: {
          include: {
            cliente: true
          }
        }
      }
    })

    return NextResponse.json({ factura }, { status: 201 })
  } catch (error) {
    console.error('Error creando factura:', error)
    return NextResponse.json({ error: 'Error al crear factura' }, { status: 500 })
  }
}

