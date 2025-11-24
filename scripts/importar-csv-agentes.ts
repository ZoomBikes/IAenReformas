import { PrismaClient } from '@prisma/client'
import * as fs from 'fs'
import * as path from 'path'

const prisma = new PrismaClient()

// Función para extraer código postal
function extraerCodigoPostal(direccion: string): string | null {
  if (!direccion) return null
  const match = direccion.match(/\b\d{5}\b/)
  return match ? match[0] : null
}

// Función para limpiar teléfono
function limpiarTelefono(telefono: string): string {
  if (!telefono) return ''
  return telefono.toString().replace(/[\s\-\(\)\+]/g, '').trim()
}

// Función para parsear CSV
function parseCSV(content: string): any[] {
  const lines = content.split('\n').filter(line => line.trim())
  if (lines.length < 2) return []

  // Detectar delimitador
  const delimiter = content.includes(';') ? ';' : ','
  
  // Parsear headers
  const headers = lines[0].split(delimiter).map(h => h.trim().replace(/"/g, ''))
  
  // Parsear datos
  return lines.slice(1).map(line => {
    const values = line.split(delimiter).map(v => v.trim().replace(/"/g, ''))
    const obj: any = {}
    headers.forEach((header, index) => {
      obj[header] = values[index] || ''
    })
    return obj
  }).filter(row => {
    // Filtrar filas vacías
    return Object.values(row).some(val => val && val.toString().trim())
  })
}

async function importarCSV() {
  try {
    const csvPath = path.join(process.cwd(), '../Desktop/reformas/AGENTES EN MADRID/agentes_madrid copia.csv')
    
    if (!fs.existsSync(csvPath)) {
      console.error('❌ Archivo CSV no encontrado en:', csvPath)
      console.log('📋 Por favor, asegúrate de que el archivo existe en esa ruta')
      process.exit(1)
    }

    console.log('📂 Leyendo archivo CSV...')
    const content = fs.readFileSync(csvPath, 'utf-8')
    const csvData = parseCSV(content)

    console.log(`📊 Encontradas ${csvData.length} filas en el CSV`)

    const resultados = {
      exitosos: 0,
      errores: 0,
      duplicados: 0,
      erroresDetalle: [] as string[]
    }

    console.log('🔄 Importando datos...')

    for (let i = 0; i < csvData.length; i++) {
      const fila = csvData[i]
      try {
        const nombre = fila.name || ''
        const telefono = limpiarTelefono(fila.phone || '')
        const agencia = fila.agency || ''
        const direccion = fila.address || ''
        const profileUrl = fila.profile_url || ''

        if (!nombre || !telefono) {
          resultados.errores++
          resultados.erroresDetalle.push(`Fila ${i + 2}: Sin nombre o teléfono`)
          continue
        }

        // Extraer código postal
        const codigoPostal = extraerCodigoPostal(direccion)

        // Verificar si ya existe
        const existe = await prisma.llamadaFrio.findFirst({
          where: { telefono }
        })

        if (existe) {
          resultados.duplicados++
          continue
        }

        // Crear registro
        await prisma.llamadaFrio.create({
          data: {
            nombre: nombre.trim(),
            telefono,
            agencia: agencia.trim() || null,
            direccion: direccion.trim() || null,
            codigoPostal,
            profileUrl: profileUrl.trim() || null,
            origen: 'csv_agentes_madrid',
            estado: 'PENDIENTE',
            haLlamado: false
          }
        })

        resultados.exitosos++
        
        if ((i + 1) % 50 === 0) {
          console.log(`  Procesadas ${i + 1}/${csvData.length} filas...`)
        }
      } catch (error: any) {
        resultados.errores++
        resultados.erroresDetalle.push(`Fila ${i + 2}: ${error.message}`)
      }
    }

    console.log('\n✅ Importación completada:')
    console.log(`  ✅ Exitosos: ${resultados.exitosos}`)
    console.log(`  ⚠️  Duplicados: ${resultados.duplicados}`)
    console.log(`  ❌ Errores: ${resultados.errores}`)
    
    if (resultados.erroresDetalle.length > 0 && resultados.erroresDetalle.length <= 10) {
      console.log('\n📋 Detalles de errores:')
      resultados.erroresDetalle.forEach(err => console.log(`  - ${err}`))
    }

  } catch (error) {
    console.error('❌ Error:', error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

importarCSV()

