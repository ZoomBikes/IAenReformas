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
    return NextResponse.json({ llamadas: [] }, { status: 200 })
  }

  try {
    const { searchParams } = new URL(request.url)
    const estado = searchParams.get('estado')
    const interesado = searchParams.get('interesado')
    const codigoPostal = searchParams.get('codigoPostal')
    const agencia = searchParams.get('agencia')
    const haLlamado = searchParams.get('haLlamado')
    const resultado = searchParams.get('resultado')
    const search = searchParams.get('search')

    const where: any = {}
    if (estado) where.estado = estado
    if (interesado !== null) where.interesado = interesado === 'true'
    if (codigoPostal) where.codigoPostal = codigoPostal
    if (agencia) where.agencia = { contains: agencia, mode: 'insensitive' }
    if (haLlamado !== null) where.haLlamado = haLlamado === 'true'
    if (resultado) where.resultado = resultado
    if (search) {
      where.OR = [
        { nombre: { contains: search, mode: 'insensitive' } },
        { telefono: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { agencia: { contains: search, mode: 'insensitive' } }
      ]
    }

    const llamadas = await prisma.llamadaFrio.findMany({
      where,
      include: {
        cliente: true,
        lead: true
      },
      orderBy: { createdAt: 'desc' },
      take: 1000
    })

    // Estadísticas avanzadas para cold calling
    const total = await prisma.llamadaFrio.count()
    const llamadasRealizadas = await prisma.llamadaFrio.count({ where: { haLlamado: true } })
    const llamadasExitosas = await prisma.llamadaFrio.count({ 
      where: { 
        haLlamado: true,
        resultado: { in: ['REUNION', 'SOLICITA_INFO'] }
      } 
    })
    const llamadasSinExito = await prisma.llamadaFrio.count({ 
      where: { 
        haLlamado: true,
        resultado: { in: ['NO_INTERES', 'RECHAZADA', 'NO_CONTESTA'] }
      } 
    })
    const reunionesAgendadas = await prisma.llamadaFrio.count({ 
      where: { resultado: 'REUNION' } 
    })
    const solicitaInfo = await prisma.llamadaFrio.count({ 
      where: { resultado: 'SOLICITA_INFO' } 
    })
    const noInteres = await prisma.llamadaFrio.count({ 
      where: { resultado: 'NO_INTERES' } 
    })
    const pendientes = await prisma.llamadaFrio.count({ where: { estado: 'PENDIENTE', haLlamado: false } })

    // Calcular tasa de conversión
    const tasaConversion = llamadasRealizadas > 0 
      ? ((reunionesAgendadas + solicitaInfo) / llamadasRealizadas) * 100 
      : 0
    
    const tasaReunion = llamadasRealizadas > 0 
      ? (reunionesAgendadas / llamadasRealizadas) * 100 
      : 0

    // Obtener códigos postales únicos
    const codigosPostales = await prisma.llamadaFrio.findMany({
      select: { codigoPostal: true },
      distinct: ['codigoPostal'],
      where: { codigoPostal: { not: null } }
    })

    // Obtener agencias únicas
    const agencias = await prisma.llamadaFrio.findMany({
      select: { agencia: true },
      distinct: ['agencia'],
      where: { agencia: { not: null } }
    })

    return NextResponse.json({ 
      llamadas,
      estadisticas: {
        total,
        llamadasRealizadas,
        llamadasExitosas,
        llamadasSinExito,
        reunionesAgendadas,
        solicitaInfo,
        noInteres,
        pendientes,
        tasaConversion: Number(tasaConversion.toFixed(2)),
        tasaReunion: Number(tasaReunion.toFixed(2)),
        llamadasPorReunion: reunionesAgendadas > 0 
          ? Number((llamadasRealizadas / reunionesAgendadas).toFixed(1))
          : 0
      },
      filtros: {
        codigosPostales: codigosPostales.map(cp => cp.codigoPostal).filter(Boolean).sort(),
        agencias: agencias.map(a => a.agencia).filter(Boolean).sort()
      }
    })
  } catch (error) {
    console.error('Error obteniendo llamadas:', error)
    return NextResponse.json({ error: 'Error al obtener llamadas' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  if (!prisma) {
    return NextResponse.json({ error: 'Base de datos no configurada' }, { status: 503 })
  }

  try {
    const body = await request.json()
    const { nombre, telefono, email, empresa, direccion, notas, origen } = body

    if (!nombre || !telefono) {
      return NextResponse.json({ 
        error: 'Se requieren nombre y teléfono' 
      }, { status: 400 })
    }

    const llamada = await prisma.llamadaFrio.create({
      data: {
        nombre: nombre.trim(),
        telefono: telefono.trim(),
        email: email?.trim() || null,
        empresa: empresa?.trim() || null,
        direccion: direccion?.trim() || null,
        notas: notas?.trim() || null,
        origen: origen || 'manual',
        estado: 'PENDIENTE'
      }
    })

    return NextResponse.json({ llamada }, { status: 201 })
  } catch (error: any) {
    console.error('Error creando llamada:', error)
    return NextResponse.json({ 
      error: error.message || 'Error al crear llamada'
    }, { status: 500 })
  }
}

