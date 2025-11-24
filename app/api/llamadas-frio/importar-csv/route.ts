import { NextRequest, NextResponse } from 'next/server'

let prisma: any = null
try {
  const { prisma: prismaClient } = require('@/lib/prisma')
  prisma = prismaClient
} catch (error) {
  console.warn('Prisma no está configurado aún')
}

export async function POST(request: NextRequest) {
  if (!prisma) {
    return NextResponse.json({ error: 'Base de datos no configurada' }, { status: 503 })
  }

  try {
    const body = await request.json()
    const { csvData, origen } = body

    if (!csvData || !Array.isArray(csvData)) {
      return NextResponse.json({ 
        error: 'Datos CSV inválidos. Se espera un array de objetos.' 
      }, { status: 400 })
    }

    const resultados = {
      exitosos: 0,
      errores: 0,
      duplicados: 0,
      erroresDetalle: [] as string[]
    }

    for (const fila of csvData) {
      try {
        // Validar campos mínimos
        const nombre = fila.nombre || fila.Nombre || fila.NOMBRE || ''
        const telefono = fila.telefono || fila.Telefono || fila.TELEFONO || fila.tel || fila.Tel || ''

        if (!nombre || !telefono) {
          resultados.errores++
          resultados.erroresDetalle.push(`Fila sin nombre o teléfono: ${JSON.stringify(fila)}`)
          continue
        }

        // Verificar si ya existe (por teléfono)
        const existe = await prisma.llamadaFrio.findFirst({
          where: {
            telefono: telefono.toString().trim()
          }
        })

        if (existe) {
          resultados.duplicados++
          continue
        }

        // Crear llamada
        await prisma.llamadaFrio.create({
          data: {
            nombre: nombre.toString().trim(),
            telefono: telefono.toString().trim(),
            email: (fila.email || fila.Email || fila.EMAIL || '').toString().trim() || null,
            empresa: (fila.empresa || fila.Empresa || fila.EMPRESA || '').toString().trim() || null,
            direccion: (fila.direccion || fila.Direccion || fila.DIRECCION || '').toString().trim() || null,
            origen: origen || 'csv',
            estado: 'PENDIENTE'
          }
        })

        resultados.exitosos++
      } catch (error: any) {
        resultados.errores++
        resultados.erroresDetalle.push(`Error en fila: ${error.message}`)
      }
    }

    return NextResponse.json({ 
      success: true,
      resultados
    }, { status: 200 })
  } catch (error: any) {
    console.error('Error importando CSV:', error)
    return NextResponse.json({ 
      error: error.message || 'Error al importar CSV'
    }, { status: 500 })
  }
}

