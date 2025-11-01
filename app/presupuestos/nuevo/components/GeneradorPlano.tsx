'use client'

import { useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import type { Habitacion } from './FormHabitaciones'

interface GeneradorPlanoProps {
  habitaciones: Habitacion[]
}

export function GeneradorPlano({ habitaciones }: GeneradorPlanoProps) {
  const plano = useMemo(() => {
    if (habitaciones.length === 0) return null

    // Crear un plano básico SVG
    const anchoSVG = 800
    const altoSVG = 600
    const escala = 10 // 1m = 10px aprox

    // Calcular posiciones aproximadas basadas en colindancias
    const posiciones = calcularPosiciones(habitaciones, escala)

    return (
      <svg 
        width={anchoSVG} 
        height={altoSVG} 
        viewBox={`0 0 ${anchoSVG} ${altoSVG}`}
        className="border rounded-lg bg-white"
      >
        {/* Fondo */}
        <rect width={anchoSVG} height={altoSVG} fill="#f8f9fa" />

        {/* Habitaciones */}
        {habitaciones.map((hab, index) => {
          const pos = posiciones[index]
          if (!pos) return null

          const ancho = parseFloat(hab.ancho || '0') * escala || 100
          const largo = parseFloat(hab.largo || '0') * escala || 80
          
          const colores = {
            salon: '#e3f2fd',
            dormitorio: '#f3e5f5',
            cocina: '#fff3e0',
            bano: '#e0f2f1',
            pasillo: '#fafafa',
            otros: '#f5f5f5'
          }

          return (
            <g key={hab.id}>
              {/* Habitación */}
              <rect
                x={pos.x}
                y={pos.y}
                width={ancho}
                height={largo}
                fill={colores[hab.tipo] || '#f5f5f5'}
                stroke="#333"
                strokeWidth="2"
                rx="4"
              />
              
              {/* Nombre de la habitación */}
              <text
                x={pos.x + ancho / 2}
                y={pos.y + largo / 2}
                textAnchor="middle"
                dominantBaseline="middle"
                fontSize="14"
                fontWeight="bold"
                fill="#333"
              >
                {hab.nombre}
              </text>
              
              {/* Metros cuadrados */}
              <text
                x={pos.x + ancho / 2}
                y={pos.y + largo / 2 + 18}
                textAnchor="middle"
                dominantBaseline="middle"
                fontSize="11"
                fill="#666"
              >
                {hab.metrosCuadrados} m²
              </text>

              {/* Indicadores de colindancia */}
              {hab.colindaCon && hab.colindaCon.length > 0 && (
                <circle
                  cx={pos.x + ancho - 10}
                  cy={pos.y + 10}
                  r="6"
                  fill="#4caf50"
                />
              )}
            </g>
          )
        })}

        {/* Leyenda */}
        <g transform={`translate(${anchoSVG - 150}, 20)`}>
          <rect width="130" height={habitaciones.length * 25 + 30} fill="white" stroke="#ddd" rx="4" />
          <text x="65" y="20" textAnchor="middle" fontSize="12" fontWeight="bold">
            Habitaciones
          </text>
          {habitaciones.map((hab, i) => (
            <g key={hab.id} transform={`translate(10, ${35 + i * 25})`}>
              <rect width="15" height="15" fill={hab.tipo ? '#e3f2fd' : '#f5f5f5'} stroke="#333" />
              <text x="20" y="12" fontSize="11" fill="#333">
                {hab.nombre} ({hab.metrosCuadrados} m²)
              </text>
            </g>
          ))}
        </g>
      </svg>
    )
  }, [habitaciones])

  if (habitaciones.length === 0) {
    return (
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-sm text-blue-900">
          💡 Define habitaciones con sus medidas (ancho y largo) para generar el plano automático.
        </p>
      </div>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>📐 Plano de la Vivienda</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-auto">
          {plano}
        </div>
        <p className="text-xs text-muted-foreground mt-4">
          Este plano se genera automáticamente desde las medidas de las habitaciones. 
          Las habitaciones con colindancias marcadas se mostrarán adyacentes en el plano.
        </p>
      </CardContent>
    </Card>
  )
}

function calcularPosiciones(habitaciones: Habitacion[], escala: number) {
  const posiciones: Array<{ x: number, y: number }> = []
  let currentX = 50
  let currentY = 50
  let maxY = 0

  habitaciones.forEach((hab) => {
    const ancho = parseFloat(hab.ancho || '0') * escala || 100
    const largo = parseFloat(hab.largo || '0') * escala || 80

    // Si tiene colindancias, intentar posicionar cerca de ellas
    if (hab.colindaCon && hab.colindaCon.length > 0) {
      const colindante = habitaciones.find(h => hab.colindaCon?.includes(h.id))
      const colindanteIndex = habitaciones.indexOf(colindante!)
      if (colindanteIndex >= 0 && posiciones[colindanteIndex]) {
        const posColindante = posiciones[colindanteIndex]
        // Posicionar a la derecha o abajo
        posiciones.push({
          x: posColindante.x + (parseFloat(colindante!.ancho || '0') * escala || 100) + 10,
          y: posColindante.y
        })
        return
      }
    }

    // Posicionamiento automático simple (grid)
    if (currentX + ancho > 700) {
      currentX = 50
      currentY = maxY + 20
    }

    posiciones.push({ x: currentX, y: currentY })
    maxY = Math.max(maxY, currentY + largo)
    currentX += ancho + 20
  })

  return posiciones
}

