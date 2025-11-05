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
    return NextResponse.json({
      presupuestado: 0,
      ejecutado: 0,
      margen: 0,
      avance: 0,
      obras: []
    }, { status: 200 })
  }

  try {
    const { searchParams } = new URL(request.url)
    const obraId = searchParams.get('obraId')

    if (obraId) {
      // Métricas de una obra específica
      const obra = await prisma.obra.findUnique({
        where: { id: obraId },
        include: {
          seguimientoCostes: true,
          pagos: true
        }
      })

      if (!obra) {
        return NextResponse.json({ error: 'Obra no encontrada' }, { status: 404 })
      }

      const ejecutado = obra.costeReal || 0
      const presupuestado = obra.presupuestoTotal || 0
      const margen = presupuestado > 0 ? ((presupuestado - ejecutado) / presupuestado) * 100 : 0
      const avance = obra.avance || 0

      return NextResponse.json({
        presupuestado,
        ejecutado,
        margen,
        avance,
        obra
      })
    } else {
      // Métricas globales
      const obras = await prisma.obra.findMany({
        where: {
          estado: {
            in: ['PLANIFICADA', 'EN_PROGRESO', 'PAUSADA']
          }
        },
        include: {
          cliente: true
        }
      })

      const presupuestado = obras.reduce((sum, o) => sum + (o.presupuestoTotal || 0), 0)
      const ejecutado = obras.reduce((sum, o) => sum + (o.costeReal || 0), 0)
      const margen = presupuestado > 0 ? ((presupuestado - ejecutado) / presupuestado) * 100 : 0
      const avance = obras.length > 0 
        ? obras.reduce((sum, o) => sum + (o.avance || 0), 0) / obras.length 
        : 0

      return NextResponse.json({
        presupuestado,
        ejecutado,
        margen,
        avance,
        obras: obras.map(o => ({
          id: o.id,
          nombre: o.nombre,
          cliente: o.cliente.nombre,
          presupuestado: o.presupuestoTotal,
          ejecutado: o.costeReal,
          avance: o.avance
        }))
      })
    }
  } catch (error) {
    console.error('Error obteniendo métricas:', error)
    return NextResponse.json({ error: 'Error al obtener métricas' }, { status: 500 })
  }
}

