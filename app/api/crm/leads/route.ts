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
    return NextResponse.json({ leads: [] }, { status: 200 })
  }

  try {
    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search') || ''
    const estado = searchParams.get('estado')

    const leads = await prisma.lead.findMany({
      where: {
        ...(search ? {
          OR: [
            { nombre: { contains: search, mode: 'insensitive' } },
            { telefono: { contains: search } },
            { email: { contains: search, mode: 'insensitive' } }
          ]
        } : {}),
        ...(estado ? { estado } : {})
      },
      include: {
        campana: true,
        cliente: true
      },
      orderBy: { updatedAt: 'desc' },
      take: 100
    })

    return NextResponse.json({ leads })
  } catch (error) {
    console.error('Error obteniendo leads:', error)
    return NextResponse.json({ error: 'Error al obtener leads' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  if (!prisma) {
    return NextResponse.json({ error: 'Base de datos no configurada' }, { status: 503 })
  }

  try {
    const body = await request.json()
    const { nombre, telefono, email, direccion, origen, estado, notas, valorEstimado, campanaId } = body

    if (!nombre) {
      return NextResponse.json({ error: 'El nombre es obligatorio' }, { status: 400 })
    }

    const lead = await prisma.lead.create({
      data: {
        nombre,
        telefono: telefono || null,
        email: email || null,
        direccion: direccion || null,
        origen: origen || null,
        estado: estado || 'NUEVO',
        notas: notas || null,
        valorEstimado: valorEstimado ? parseFloat(valorEstimado) : null,
        campanaId: campanaId || null
      },
      include: {
        campana: true
      }
    })

    return NextResponse.json({ lead }, { status: 201 })
  } catch (error) {
    console.error('Error creando lead:', error)
    return NextResponse.json({ error: 'Error al crear lead' }, { status: 500 })
  }
}

