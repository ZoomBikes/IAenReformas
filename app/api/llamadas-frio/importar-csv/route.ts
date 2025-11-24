import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
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

    // Función para extraer código postal de dirección
    const extraerCodigoPostal = (direccion: string): string | null => {
      if (!direccion) return null
      // Buscar patrón de 5 dígitos (código postal español)
      const match = direccion.match(/\b\d{5}\b/)
      return match ? match[0] : null
    }

    // Función para limpiar teléfono
    const limpiarTelefono = (telefono: string): string => {
      if (!telefono) return ''
      // Eliminar espacios, guiones, paréntesis y prefijos
      return telefono.toString().replace(/[\s\-\(\)\+]/g, '').trim()
    }

    for (const fila of csvData) {
      try {
        // Mapear columnas del CSV: name, agency, address, profile_url, phone
        const nombre = fila.name || fila.nombre || fila.Nombre || fila.NOMBRE || ''
        const telefono = limpiarTelefono(fila.phone || fila.telefono || fila.Telefono || fila.TELEFONO || '')
        const agencia = fila.agency || fila.agencia || fila.Agencia || fila.AGENCY || ''
        const direccion = fila.address || fila.adress || fila.direccion || fila.Direccion || fila.ADDRESS || ''
        const profileUrl = fila.profile_url || fila.profileUrl || fila.profile_url || ''

        if (!nombre || !telefono) {
          resultados.errores++
          resultados.erroresDetalle.push(`Fila sin nombre o teléfono: ${JSON.stringify(fila)}`)
          continue
        }

        // Extraer código postal de la dirección
        const codigoPostal = extraerCodigoPostal(direccion)

        // Verificar si ya existe (por teléfono)
        const existe = await prisma.llamadaFrio.findFirst({
          where: {
            telefono: telefono
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
            telefono: telefono,
            agencia: agencia.toString().trim() || null,
            direccion: direccion.toString().trim() || null,
            codigoPostal: codigoPostal,
            profileUrl: profileUrl.toString().trim() || null,
            origen: origen || 'csv',
            estado: 'PENDIENTE',
            haLlamado: false
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

