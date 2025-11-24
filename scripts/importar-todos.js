const { PrismaClient } = require('@prisma/client')
const fs = require('fs')

const prisma = new PrismaClient()

// Función para extraer código postal
function extraerCodigoPostal(direccion) {
  if (!direccion) return null
  const match = direccion.match(/\b\d{5}\b/)
  return match ? match[0] : null
}

// Función para limpiar teléfono
function limpiarTelefono(telefono) {
  if (!telefono) return ''
  return telefono.toString().replace(/[\s\-\(\)\+]/g, '').trim()
}

// Función para parsear CSV mejorada
function parseCSV(content) {
  const lines = content.split('\n').filter(line => line.trim())
  if (lines.length < 2) return []

  const delimiter = ','
  const headers = lines[0].split(delimiter).map(h => h.trim().replace(/^"|"$/g, ''))
  
  const resultados = []
  
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i]
    if (!line.trim()) continue
    
    // Manejar comas dentro de comillas
    const values = []
    let current = ''
    let inQuotes = false
    
    for (let j = 0; j < line.length; j++) {
      const char = line[j]
      if (char === '"') {
        inQuotes = !inQuotes
      } else if (char === delimiter && !inQuotes) {
        values.push(current.trim().replace(/^"|"$/g, ''))
        current = ''
      } else {
        current += char
      }
    }
    values.push(current.trim().replace(/^"|"$/g, ''))
    
    const obj = {}
    headers.forEach((header, index) => {
      obj[header] = values[index] || ''
    })
    
    // Solo añadir si tiene nombre o teléfono
    if (obj.name || obj.phone) {
      resultados.push(obj)
    }
  }
  
  return resultados
}

async function importarTodos() {
  try {
    const csvPath = '/Users/FFLORESS/Desktop/reformas/AGENTES EN MADRID/agentes_madrid copia.csv'
    
    if (!fs.existsSync(csvPath)) {
      console.error('❌ Archivo CSV no encontrado')
      process.exit(1)
    }

    console.log('📂 Leyendo archivo CSV...')
    const content = fs.readFileSync(csvPath, 'utf-8')
    const csvData = parseCSV(content)

    console.log(`📊 Total de filas encontradas: ${csvData.length}\n`)

    // Limpiar todos los contactos existentes primero
    console.log('🧹 Limpiando contactos existentes...')
    const eliminados = await prisma.llamadaFrio.deleteMany({
      where: {
        origen: 'csv_agentes_madrid'
      }
    })
    console.log(`  ✅ Eliminados ${eliminados.count} contactos anteriores\n`)

    const resultados = {
      exitosos: 0,
      errores: 0,
      erroresDetalle: []
    }

    console.log('🔄 Importando todos los contactos...\n')

    for (let i = 0; i < csvData.length; i++) {
      const fila = csvData[i]
      try {
        const nombre = (fila.name || '').trim()
        const telefono = limpiarTelefono(fila.phone || '')
        const agencia = (fila.agency || '').trim()
        const direccion = (fila.address || '').trim()
        const profileUrl = (fila.profile_url || '').trim()

        if (!nombre || !telefono) {
          resultados.errores++
          resultados.erroresDetalle.push(`Fila ${i + 2}: Sin nombre o teléfono`)
          continue
        }

        // Extraer código postal
        const codigoPostal = extraerCodigoPostal(direccion)

        // Crear registro (sin verificar duplicados, importamos todos)
        await prisma.llamadaFrio.create({
          data: {
            nombre,
            telefono,
            agencia: agencia || null,
            direccion: direccion || null,
            codigoPostal,
            profileUrl: profileUrl || null,
            origen: 'csv_agentes_madrid',
            estado: 'PENDIENTE',
            haLlamado: false
          }
        })

        resultados.exitosos++
        
        if ((i + 1) % 50 === 0) {
          console.log(`  ✅ Procesadas ${i + 1}/${csvData.length} filas...`)
        }
      } catch (error) {
        resultados.errores++
        resultados.erroresDetalle.push(`Fila ${i + 2}: ${error.message}`)
        console.error(`  ❌ Error en fila ${i + 2}:`, error.message)
      }
    }

    console.log('\n' + '='.repeat(50))
    console.log('✅ IMPORTACIÓN COMPLETADA')
    console.log('='.repeat(50))
    console.log(`  ✅ Exitosos: ${resultados.exitosos}`)
    console.log(`  ❌ Errores: ${resultados.errores}`)
    console.log('='.repeat(50))
    
    if (resultados.erroresDetalle.length > 0 && resultados.erroresDetalle.length <= 20) {
      console.log('\n📋 Detalles de errores:')
      resultados.erroresDetalle.forEach(err => console.log(`  - ${err}`))
    }

    // Verificar total final
    const totalFinal = await prisma.llamadaFrio.count({
      where: { origen: 'csv_agentes_madrid' }
    })
    
    console.log(`\n🎉 Total de contactos en BD: ${totalFinal}`)
    console.log('📊 Puedes verlos en la sección "Llamadas en Frío" del menú')

  } catch (error) {
    console.error('❌ Error:', error.message)
    console.error(error.stack)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

importarTodos()

