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
    return NextResponse.json({ proveedores: [] }, { status: 200 })
  }

  try {
    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search')
    const activo = searchParams.get('activo')

    const proveedores = await prisma.proveedor.findMany({
      where: {
        ...(search ? {
          OR: [
            { nombre: { contains: search, mode: 'insensitive' } },
            { contacto: { contains: search, mode: 'insensitive' } },
            { telefono: { contains: search } }
          ]
        } : {}),
        ...(activo !== null ? { activo: activo === 'true' } : {})
      },
      include: {
        _count: {
          select: {
            ordenes: true,
            contratos: true
          }
        }
      },
      orderBy: { nombre: 'asc' },
      take: 100
    })

    return NextResponse.json({ proveedores })
  } catch (error) {
    console.error('Error obteniendo proveedores:', error)
    return NextResponse.json({ error: 'Error al obtener proveedores' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  if (!prisma) {
    return NextResponse.json({ error: 'Base de datos no configurada' }, { status: 503 })
  }

  try {
    const body = await request.json()
    const { nombre, contacto, telefono, email, direccion, tipo, notas } = body

    if (!nombre) {
      return NextResponse.json({ error: 'El nombre es obligatorio' }, { status: 400 })
    }

    const proveedor = await prisma.proveedor.create({
      data: {
        nombre,
        contacto: contacto || null,
        telefono: telefono || null,
        email: email || null,
        direccion: direccion || null,
        tipo: tipo || null,
        notas: notas || null,
        activo: true
      }
    })

    return NextResponse.json({ proveedor }, { status: 201 })
  } catch (error) {
    console.error('Error creando proveedor:', error)
    return NextResponse.json({ error: 'Error al crear proveedor' }, { status: 500 })
  }
}

