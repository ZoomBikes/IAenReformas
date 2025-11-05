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
    return NextResponse.json({ clientes: [] }, { status: 200 })
  }

  try {
    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search') || ''

    const clientes = await prisma.cliente.findMany({
      where: search ? {
        OR: [
          { nombre: { contains: search, mode: 'insensitive' } },
          { telefono: { contains: search } },
          { email: { contains: search, mode: 'insensitive' } }
        ]
      } : {},
      include: {
        _count: {
          select: {
            presupuestos: true,
            obras: true,
            leads: true
          }
        }
      },
      orderBy: { updatedAt: 'desc' },
      take: 100
    })

    return NextResponse.json({ clientes })
  } catch (error) {
    console.error('Error obteniendo clientes:', error)
    return NextResponse.json(
      { error: 'Error al obtener clientes' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  if (!prisma) {
    return NextResponse.json(
      { error: 'Base de datos no configurada' },
      { status: 503 }
    )
  }

  try {
    const body = await request.json()
    const { nombre, telefono, email, direccion, tipo, notas } = body

    if (!nombre) {
      return NextResponse.json(
        { error: 'El nombre es obligatorio' },
        { status: 400 }
      )
    }

    const cliente = await prisma.cliente.create({
      data: {
        nombre,
        telefono: telefono || null,
        email: email || null,
        direccion: direccion || null,
        tipo: tipo || 'particular',
        notas: notas || null
      }
    })

    return NextResponse.json({ cliente }, { status: 201 })
  } catch (error) {
    console.error('Error creando cliente:', error)
    return NextResponse.json(
      { error: 'Error al crear cliente' },
      { status: 500 }
    )
  }
}

