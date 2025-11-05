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
      concepto,
      importe,
      fechaFactura,
      imagenBase64,
      notas,
      estado
    } = body

    // Validar campos requeridos
    if (!trabajadorNombre || !concepto || !importe || !fechaFactura) {
      return NextResponse.json({ 
        error: 'Datos incompletos. Se requieren: trabajadorNombre, concepto, importe y fechaFactura' 
      }, { status: 400 })
    }

    // Validar que importe sea un número válido
    const importeNum = parseFloat(importe)
    if (isNaN(importeNum) || importeNum <= 0) {
      return NextResponse.json({ 
        error: 'El importe debe ser un número mayor que 0' 
      }, { status: 400 })
    }

    // Validar fecha
    const fecha = new Date(fechaFactura)
    if (isNaN(fecha.getTime())) {
      return NextResponse.json({ 
        error: 'La fecha de factura no es válida' 
      }, { status: 400 })
    }

    const factura = await prisma.facturaTrabajador.create({
      data: {
        trabajadorNombre: trabajadorNombre.trim(),
        trabajadorDni: null,
        trabajadorTelefono: null,
        concepto: concepto.trim(),
        importe: importeNum,
        fechaFactura: fecha,
        imagenBase64: imagenBase64 || null,
        imagenUrl: null,
        obraId: null,
        notas: notas?.trim() || null,
        datosExtraidos: null,
        estado: estado || 'PENDIENTE',
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
  } catch (error: any) {
    console.error('Error creando factura:', error)
    // Mejorar mensaje de error
    const errorMessage = error.message || 'Error al crear factura'
    return NextResponse.json({ 
      error: errorMessage,
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    }, { status: 500 })
  }
}

