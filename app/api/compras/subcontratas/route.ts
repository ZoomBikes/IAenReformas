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
    return NextResponse.json({ contratos: [] }, { status: 200 })
  }

  try {
    const { searchParams } = new URL(request.url)
    const obraId = searchParams.get('obraId')
    const estado = searchParams.get('estado')

    const contratos = await prisma.contratoSubcontrata.findMany({
      where: {
        ...(obraId ? { obraId } : {}),
        ...(estado ? { estado } : {})
      },
      include: {
        proveedor: true,
        obra: {
          include: {
            cliente: true
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      take: 100
    })

    return NextResponse.json({ contratos })
  } catch (error) {
    console.error('Error obteniendo contratos:', error)
    return NextResponse.json({ error: 'Error al obtener contratos' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  if (!prisma) {
    return NextResponse.json({ error: 'Base de datos no configurada' }, { status: 503 })
  }

  try {
    const body = await request.json()
    const { proveedorId, obraId, nombre, descripcion, tipoTrabajo, fechaInicio, fechaFinPrevista, importeTotal } = body

    if (!proveedorId || !obraId || !nombre || !importeTotal) {
      return NextResponse.json({ error: 'Datos incompletos' }, { status: 400 })
    }

    const contrato = await prisma.contratoSubcontrata.create({
      data: {
        proveedorId,
        obraId,
        nombre,
        descripcion: descripcion || null,
        tipoTrabajo: tipoTrabajo || null,
        fechaInicio: fechaInicio ? new Date(fechaInicio) : null,
        fechaFinPrevista: fechaFinPrevista ? new Date(fechaFinPrevista) : null,
        importeTotal: parseFloat(importeTotal),
        importePagado: 0,
        porcentajeAvance: 0,
        estado: 'BORRADOR'
      },
      include: {
        proveedor: true,
        obra: true
      }
    })

    return NextResponse.json({ contrato }, { status: 201 })
  } catch (error) {
    console.error('Error creando contrato:', error)
    return NextResponse.json({ error: 'Error al crear contrato' }, { status: 500 })
  }
}

