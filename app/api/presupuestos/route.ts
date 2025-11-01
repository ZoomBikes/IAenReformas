import { NextRequest, NextResponse } from 'next/server'

// Temporal: Si no hay DB configurada, devolver error amigable
let prisma: any = null
try {
  const { prisma: prismaClient } = require('@/lib/prisma')
  prisma = prismaClient
} catch (error) {
  console.warn('Prisma no está configurado aún')
}

export async function POST(request: NextRequest) {
  if (!prisma) {
    return NextResponse.json(
      { error: 'Base de datos no configurada. Por favor, configura DATABASE_URL en las variables de entorno.' },
      { status: 503 }
    )
  }

  try {
    const body = await request.json()

    // Validar datos básicos
    if (!body.cliente?.nombre || !body.cliente?.telefono) {
      return NextResponse.json(
        { error: 'Datos del cliente incompletos' },
        { status: 400 }
      )
    }

    if (!body.obra?.tipo) {
      return NextResponse.json(
        { error: 'Tipo de obra no especificado' },
        { status: 400 }
      )
    }

    // Calcular totales
    let subtotal = 0
    body.trabajos?.forEach((trabajo: any) => {
      trabajo.servicios?.forEach((servicio: any) => {
        if (servicio.calculo) {
          subtotal += servicio.calculo.subtotal || 0
        } else if (servicio.precioPorMetro) {
          const habitacion = body.habitaciones.find((h: any) => h.id === trabajo.habitacionId)
          if (habitacion) {
            const metros = parseFloat(habitacion.metrosCuadrados) || 0
            subtotal += metros * servicio.precioPorMetro
          }
        }
      })
    })

    const iva = subtotal * 0.21
    const total = subtotal + iva

    // Crear o buscar cliente
    let cliente = await prisma.cliente.findFirst({
      where: {
        OR: [
          { telefono: body.cliente.telefono },
          { email: body.cliente.email || undefined }
        ]
      }
    })

    if (!cliente) {
      cliente = await prisma.cliente.create({
        data: {
          nombre: body.cliente.nombre,
          telefono: body.cliente.telefono,
          email: body.cliente.email || null,
          direccion: body.cliente.direccion || null,
          tipo: body.cliente.tipo || 'particular',
        }
      })
    } else {
      // Actualizar datos del cliente si existen
      cliente = await prisma.cliente.update({
        where: { id: cliente.id },
        data: {
          nombre: body.cliente.nombre,
          email: body.cliente.email || cliente.email,
          direccion: body.cliente.direccion || cliente.direccion,
        }
      })
    }

    // Crear presupuesto
    const presupuesto = await prisma.presupuesto.create({
      data: {
        clienteId: cliente.id,
        direccionObra: body.cliente.direccion || '',
        tipoObra: body.obra.tipo.toUpperCase().replace('_', '_') as any,
        descripcionObra: body.obra.descripcion || null,
        metrosTotales: parseFloat(body.espacio.metrosTotales) || 0,
        numHabitaciones: body.habitaciones?.length || 0,
        numBanos: body.habitaciones?.filter((h: any) => h.tipo === 'bano').length || 0,
        alturaTechos: parseFloat(body.espacio.alturaTechos) || 2.70,
        estadoInmueble: body.espacio.estado.toUpperCase() as any,
        habitaciones: body.habitaciones || null,
        subtotal,
        iva,
        total,
        estado: 'BORRADOR',
      }
    })

    // Crear trabajos y servicios
    for (const trabajo of body.trabajos || []) {
      for (const servicio of trabajo.servicios || []) {
        const habitacion = body.habitaciones.find((h: any) => h.id === trabajo.habitacionId)
        
        await prisma.trabajoPresupuesto.create({
          data: {
            presupuestoId: presupuesto.id,
            tipoTrabajo: servicio.tipo.toUpperCase().replace('_', '_') as any,
            descripcion: `Servicio de ${servicio.tipo} en ${habitacion?.nombre || 'habitación'}`,
            cantidad: parseFloat(habitacion?.metrosCuadrados || '0'),
            unidad: 'METROS_CUADRADOS' as any,
            precioUnitario: servicio.precioPorMetro || servicio.calculo?.componentes?.[0]?.precioUnitario || 0,
            precioTotal: servicio.calculo?.total || (servicio.precioPorMetro && habitacion ? parseFloat(habitacion.metrosCuadrados) * servicio.precioPorMetro * 1.21 : 0),
            calidad: servicio.datos?.calidad?.toUpperCase() || 'ESTANDAR' as any,
            necesitaAlisado: servicio.datos?.necesitaAlisado || false,
            necesitaPicado: servicio.datos?.tieneSoladoExistente || false,
          }
        })
      }
    }

    return NextResponse.json({
      success: true,
      presupuestoId: presupuesto.id,
      message: 'Presupuesto guardado correctamente'
    })

  } catch (error) {
    console.error('Error guardando presupuesto:', error)
    return NextResponse.json(
      { error: 'Error al guardar el presupuesto' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  if (!prisma) {
    return NextResponse.json(
      { presupuestos: [] },
      { status: 200 }
    )
  }

  try {
    const presupuestos = await prisma.presupuesto.findMany({
      include: {
        cliente: true,
        trabajos: true
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: 50
    })

    return NextResponse.json({ presupuestos })
  } catch (error) {
    console.error('Error obteniendo presupuestos:', error)
    return NextResponse.json(
      { error: 'Error al obtener presupuestos' },
      { status: 500 }
    )
  }
}

