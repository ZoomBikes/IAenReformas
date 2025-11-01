import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const presupuesto = await prisma.presupuesto.findUnique({
      where: { id: params.id },
      include: {
        cliente: true,
        trabajos: {
          include: {
            componentes: true
          }
        }
      }
    })

    if (!presupuesto) {
      return NextResponse.json(
        { error: 'Presupuesto no encontrado' },
        { status: 404 }
      )
    }

    // Formatear la respuesta para que coincida con la interfaz del frontend
    const respuesta = {
      presupuesto: {
        id: presupuesto.id,
        cliente: {
          nombre: presupuesto.cliente.nombre,
          telefono: presupuesto.cliente.telefono,
          email: presupuesto.cliente.email
        },
        direccionObra: presupuesto.direccionObra,
        tipoObra: presupuesto.tipoObra,
        descripcionObra: presupuesto.descripcionObra,
        fechaCreacion: presupuesto.fechaCreacion.toISOString(),
        estado: presupuesto.estado,
        total: presupuesto.total,
        subtotal: presupuesto.subtotal,
        iva: presupuesto.iva,
        habitaciones: presupuesto.habitaciones ? JSON.parse(presupuesto.habitaciones as any) : [],
        trabajos: presupuesto.trabajos.map((trabajo: any) => ({
          habitacionId: trabajo.tipoTrabajo, // Usar como referencia temporal
          habitacionNombre: trabajo.descripcion,
          servicios: [{
            id: trabajo.id,
            tipo: trabajo.tipoTrabajo,
            descripcion: trabajo.descripcion,
            calculo: {
              subtotal: trabajo.precioTotal / 1.21,
              iva: trabajo.precioTotal * 0.21 / 1.21,
              total: trabajo.precioTotal,
              componentes: trabajo.componentes.map((comp: any) => ({
                nombre: comp.nombre,
                cantidad: comp.cantidad,
                unidad: comp.unidad,
                precioUnitario: comp.precioUnitario,
                precioTotal: comp.precioTotal
              }))
            }
          }]
        }))
      }
    }

    return NextResponse.json(respuesta)
  } catch (error) {
    console.error('Error al obtener presupuesto:', error)
    return NextResponse.json(
      { error: 'Error al obtener el presupuesto' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Eliminar en cascada: primero componentes, luego trabajos, después presupuesto y cliente
    const presupuesto = await prisma.presupuesto.findUnique({
      where: { id: params.id },
      include: {
        trabajos: {
          include: {
            componentes: true
          }
        }
      }
    })

    if (!presupuesto) {
      return NextResponse.json(
        { error: 'Presupuesto no encontrado' },
        { status: 404 }
      )
    }

    // Eliminar componentes
    for (const trabajo of presupuesto.trabajos) {
      if (trabajo.componentes.length > 0) {
        await prisma.componenteTrabajo.deleteMany({
          where: { trabajoId: trabajo.id }
        })
      }
    }

    // Eliminar trabajos
    await prisma.trabajoPresupuesto.deleteMany({
      where: { presupuestoId: params.id }
    })

    // Eliminar presupuesto
    await prisma.presupuesto.delete({
      where: { id: params.id }
    })

    // Eliminar cliente (si no tiene más presupuestos)
    const otrosPresupuestos = await prisma.presupuesto.findFirst({
      where: { 
        clienteId: presupuesto.clienteId,
        id: { not: params.id }
      }
    })

    if (!otrosPresupuestos) {
      await prisma.cliente.delete({
        where: { id: presupuesto.clienteId }
      })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error al eliminar presupuesto:', error)
    return NextResponse.json(
      { error: 'Error al eliminar el presupuesto' },
      { status: 500 }
    )
  }
}

