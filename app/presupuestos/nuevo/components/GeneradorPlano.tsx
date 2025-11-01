'use client'

import { useState, useMemo, useCallback, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Edit2, Maximize2, RotateCcw, ZoomIn, ZoomOut, Grid } from 'lucide-react'
import { toast } from 'sonner'
import type { Habitacion } from './FormHabitaciones'

interface GeneradorPlanoProps {
  habitaciones: Habitacion[]
  onEditHabitacion?: (habitacion: Habitacion) => void
  onUpdatePosiciones?: (posiciones: Record<string, { x: number, y: number }>) => void
}

interface PosicionHabitacion {
  x: number
  y: number
}

export function GeneradorPlano({ habitaciones, onEditHabitacion, onUpdatePosiciones }: GeneradorPlanoProps) {
  const [posiciones, setPosiciones] = useState<Record<string, PosicionHabitacion>>({})
  const [modoEdicion, setModoEdicion] = useState(false)
  const [zoom, setZoom] = useState(1)
  const [mostrarGrid, setMostrarGrid] = useState(true)
  const [habitacionArrastrando, setHabitacionArrastrando] = useState<string | null>(null)
  const [offsetArrastre, setOffsetArrastre] = useState({ x: 0, y: 0 })

  const escala = 25 // 1m = 25px para mejor visualización
  const anchoCanvas = 1400
  const altoCanvas = 1000

  // Calcular posiciones iniciales basadas en colindancias
  const posicionesIniciales = useMemo(() => {
    const pos: Record<string, PosicionHabitacion> = {}
    let currentX = 100
    let currentY = 100
    let maxY = 0

    habitaciones.forEach((hab) => {
      // Si ya tiene posición guardada, usarla
      if (posiciones[hab.id]) {
        pos[hab.id] = posiciones[hab.id]
        return
      }

      // Si colinda con otra habitación, posicionarla adyacente
      if (hab.colindaCon && hab.colindaCon.length > 0) {
        const colindanteId = hab.colindaCon[0]
        const colindante = habitaciones.find(h => h.id === colindanteId)
        
        if (colindante && pos[colindanteId]) {
          const colindantePos = pos[colindanteId]
          const colindanteAncho = parseFloat(colindante.ancho || '0') * escala || 100
          
          // Posicionar a la derecha de la colindante
          pos[hab.id] = {
            x: colindantePos.x + colindanteAncho,
            y: colindantePos.y
          }
          return
        }
      }

      // Posicionamiento automático
      const ancho = parseFloat(hab.ancho || '0') * escala || 100
      const largo = parseFloat(hab.largo || '0') * escala || 80

      if (currentX + ancho > anchoCanvas - 150) {
        currentX = 100
        currentY = maxY + 40
      }

      pos[hab.id] = { x: currentX, y: currentY }
      maxY = Math.max(maxY, currentY + largo)
      currentX += ancho + 40
    })

    return pos
  }, [habitaciones, posiciones])

  // Inicializar posiciones
  useEffect(() => {
    if (Object.keys(posiciones).length === 0 && habitaciones.length > 0) {
      setPosiciones(posicionesIniciales)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [habitaciones.length])

  const handleMouseDown = useCallback((e: React.MouseEvent, habitacionId: string) => {
    if (!modoEdicion) return

    const habPos = posiciones[habitacionId] || posicionesIniciales[habitacionId]
    if (!habPos) return

    const rect = (e.currentTarget as SVGRectElement).getBoundingClientRect()
    const svg = (e.currentTarget as SVGRectElement).closest('svg')
    if (!svg) return

    const svgRect = svg.getBoundingClientRect()
    const offsetX = e.clientX - svgRect.left - (habPos.x * zoom)
    const offsetY = e.clientY - svgRect.top - (habPos.y * zoom)

    setHabitacionArrastrando(habitacionId)
    setOffsetArrastre({ x: offsetX, y: offsetY })
  }, [modoEdicion, posiciones, posicionesIniciales, zoom])

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!modoEdicion || !habitacionArrastrando) return

    const svg = e.currentTarget as SVGSVGElement
    const svgRect = svg.getBoundingClientRect()
    const newX = (e.clientX - svgRect.left - offsetArrastre.x) / zoom
    const newY = (e.clientY - svgRect.top - offsetArrastre.y) / zoom

    setPosiciones(prev => ({
      ...prev,
      [habitacionArrastrando]: { x: Math.max(0, newX), y: Math.max(0, newY) }
    }))
  }, [modoEdicion, habitacionArrastrando, offsetArrastre, zoom])

  const handleMouseUp = useCallback(() => {
    if (habitacionArrastrando && onUpdatePosiciones) {
      onUpdatePosiciones(posiciones)
    }
    setHabitacionArrastrando(null)
  }, [habitacionArrastrando, posiciones, onUpdatePosiciones])

  // Calcular colindancias visuales (paredes compartidas)
  const calcularColindancias = useCallback((hab: Habitacion) => {
    if (!hab.colindaCon || hab.colindaCon.length === 0) return []

    const habPos = posiciones[hab.id] || posicionesIniciales[hab.id]
    if (!habPos) return []

    return hab.colindaCon.map(colindanteId => {
      const colindante = habitaciones.find(h => h.id === colindanteId)
      const colindantePos = posiciones[colindanteId] || posicionesIniciales[colindanteId]

      if (!colindante || !colindantePos) return null

      const habAncho = parseFloat(hab.ancho || '0') * escala || 100
      const habLargo = parseFloat(hab.largo || '0') * escala || 80
      const colAncho = parseFloat(colindante.ancho || '0') * escala || 100
      const colLargo = parseFloat(colindante.largo || '0') * escala || 80

      const tolerancia = 3 // px de tolerancia para considerar colindante

      // Pared derecha de hab con pared izquierda de colindante
      if (Math.abs((habPos.x + habAncho) - colindantePos.x) < tolerancia) {
        const inicioY = Math.max(habPos.y, colindantePos.y)
        const finY = Math.min(habPos.y + habLargo, colindantePos.y + colLargo)
        if (finY > inicioY) {
          return {
            tipo: 'vertical',
            x: habPos.x + habAncho,
            y1: inicioY,
            y2: finY,
          }
        }
      }

      // Pared izquierda de hab con pared derecha de colindante
      if (Math.abs(habPos.x - (colindantePos.x + colAncho)) < tolerancia) {
        const inicioY = Math.max(habPos.y, colindantePos.y)
        const finY = Math.min(habPos.y + habLargo, colindantePos.y + colLargo)
        if (finY > inicioY) {
          return {
            tipo: 'vertical',
            x: habPos.x,
            y1: inicioY,
            y2: finY,
          }
        }
      }

      // Pared inferior de hab con pared superior de colindante
      if (Math.abs((habPos.y + habLargo) - colindantePos.y) < tolerancia) {
        const inicioX = Math.max(habPos.x, colindantePos.x)
        const finX = Math.min(habPos.x + habAncho, colindantePos.x + colAncho)
        if (finX > inicioX) {
          return {
            tipo: 'horizontal',
            y: habPos.y + habLargo,
            x1: inicioX,
            x2: finX,
          }
        }
      }

      // Pared superior de hab con pared inferior de colindante
      if (Math.abs(habPos.y - (colindantePos.y + colLargo)) < tolerancia) {
        const inicioX = Math.max(habPos.x, colindantePos.x)
        const finX = Math.min(habPos.x + habAncho, colindantePos.x + colAncho)
        if (finX > inicioX) {
          return {
            tipo: 'horizontal',
            y: habPos.y,
            x1: inicioX,
            x2: finX,
          }
        }
      }

      return null
    }).filter(Boolean)
  }, [habitaciones, posiciones, posicionesIniciales, escala])

  const colores = {
    salon: { fill: '#e3f2fd', stroke: '#1976d2', text: '#0d47a1' },
    dormitorio: { fill: '#f3e5f5', stroke: '#7b1fa2', text: '#4a148c' },
    cocina: { fill: '#fff3e0', stroke: '#e65100', text: '#bf360c' },
    bano: { fill: '#e0f2f1', stroke: '#00695c', text: '#004d40' },
    pasillo: { fill: '#fafafa', stroke: '#616161', text: '#212121' },
    otros: { fill: '#f5f5f5', stroke: '#424242', text: '#212121' }
  }

  if (habitaciones.length === 0) {
    return (
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-sm text-blue-900">
          💡 Define habitaciones con sus medidas (ancho y largo) para generar el plano interactivo tipo AutoCAD.
        </p>
      </div>
    )
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <CardTitle className="flex items-center gap-2">
              📐 Plano Interactivo (Estilo AutoCAD)
            </CardTitle>
            <CardDescription>
              Arrastra habitaciones para organizarlas. Haz clic para editar. Las líneas verdes muestran colindancias exactas.
            </CardDescription>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button
              variant={modoEdicion ? "default" : "outline"}
              size="sm"
              onClick={() => {
                setModoEdicion(!modoEdicion)
                if (!modoEdicion) {
                  toast.info('Modo edición activado. Arrastra las habitaciones para moverlas.')
                } else {
                  toast.success('Posiciones guardadas')
                  if (onUpdatePosiciones) {
                    onUpdatePosiciones(posiciones)
                  }
                }
              }}
            >
              <Maximize2 className="h-4 w-4 mr-2" />
              {modoEdicion ? 'Guardar' : 'Editar Posición'}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setPosiciones({})
                toast.info('Posiciones restablecidas')
              }}
            >
              <RotateCcw className="h-4 w-4 mr-2" />
              Restablecer
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setMostrarGrid(!mostrarGrid)}
            >
              <Grid className="h-4 w-4 mr-2" />
              {mostrarGrid ? 'Ocultar' : 'Mostrar'} Grid
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="border-2 border-gray-300 rounded-lg bg-gray-50 overflow-auto relative" 
             style={{ height: `${altoCanvas}px`, width: '100%' }}>
          <svg
            width={anchoCanvas}
            height={altoCanvas}
            viewBox={`0 0 ${anchoCanvas} ${altoCanvas}`}
            style={{ background: mostrarGrid ? '#fafafa' : '#ffffff', transform: `scale(${zoom})`, transformOrigin: 'top left' }}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            className="cursor-crosshair"
          >
            {/* Grid de fondo */}
            {mostrarGrid && (
              <defs>
                <pattern id="grid" width="50" height="50" patternUnits="userSpaceOnUse">
                  <path d="M 50 0 L 0 0 0 50" fill="none" stroke="#e5e7eb" strokeWidth="0.5"/>
                </pattern>
              </defs>
            )}
            {mostrarGrid && <rect width="100%" height="100%" fill="url(#grid)" />}

            {/* Dibujar colindancias (paredes compartidas) */}
            {habitaciones.map((hab) => {
              const colindancias = calcularColindancias(hab)
              return colindancias.map((col, idx) => {
                if (!col) return null
                if (col.tipo === 'vertical') {
                  return (
                    <g key={`${hab.id}-col-${idx}`}>
                      {/* Línea de colindancia */}
                      <line
                        x1={col.x}
                        y1={col.y1}
                        x2={col.x}
                        y2={col.y2}
                        stroke="#22c55e"
                        strokeWidth="6"
                        strokeDasharray="8,4"
                        opacity={0.8}
                      />
                      {/* Etiqueta */}
                      <text
                        x={col.x}
                        y={((col as any).y1 + (col as any).y2) / 2}
                        textAnchor="middle"
                        dominantBaseline="middle"
                        fontSize="10"
                        fill="#166534"
                        fontWeight="bold"
                        className="pointer-events-none"
                      >
                        COLINDA
                      </text>
                    </g>
                  )
                } else {
                  return (
                    <g key={`${hab.id}-col-${idx}`}>
                      {/* Línea de colindancia */}
                      <line
                        x1={col.x1}
                        y1={col.y}
                        x2={col.x2}
                        y2={col.y}
                        stroke="#22c55e"
                        strokeWidth="6"
                        strokeDasharray="8,4"
                        opacity={0.8}
                      />
                      {/* Etiqueta */}
                      <text
                        x={((col as any).x1 + (col as any).x2) / 2}
                        y={(col as any).y}
                        textAnchor="middle"
                        dominantBaseline="middle"
                        fontSize="10"
                        fill="#166534"
                        fontWeight="bold"
                        className="pointer-events-none"
                      >
                        COLINDA
                      </text>
                    </g>
                  )
                }
              })
            })}

            {/* Habitaciones */}
            {habitaciones.map((hab) => {
              const habPos = posiciones[hab.id] || posicionesIniciales[hab.id]
              if (!habPos) return null

              const ancho = parseFloat(hab.ancho || '0') * escala || 100
              const largo = parseFloat(hab.largo || '0') * escala || 80
              const color = colores[hab.tipo] || colores.otros

              // Calcular medidas si no existen
              const anchoDisplay = hab.ancho || `${Math.sqrt(parseFloat(hab.metrosCuadrados || '0')).toFixed(1)}`
              const largoDisplay = hab.largo || `${Math.sqrt(parseFloat(hab.metrosCuadrados || '0')).toFixed(1)}`

              return (
                <g
                  key={hab.id}
                  style={{ cursor: modoEdicion ? 'grab' : 'pointer' }}
                  onMouseDown={(e) => handleMouseDown(e, hab.id)}
                  onClick={() => {
                    if (!modoEdicion && onEditHabitacion) {
                      onEditHabitacion(hab)
                    }
                  }}
                >
                  {/* Sombra (solo cuando se arrastra) */}
                  {habitacionArrastrando === hab.id && (
                    <rect
                      x={habPos.x + 3}
                      y={habPos.y + 3}
                      width={ancho}
                      height={largo}
                      fill="rgba(0,0,0,0.2)"
                      rx="4"
                    />
                  )}

                  {/* Habitación */}
                  <rect
                    x={habPos.x}
                    y={habPos.y}
                    width={ancho}
                    height={largo}
                    fill={color.fill}
                    stroke={color.stroke}
                    strokeWidth={modoEdicion ? "3" : "2"}
                    rx="4"
                    className={modoEdicion ? 'hover:opacity-80 transition-opacity' : ''}
                  />

                  {/* Puertas y Ventanas */}
                  {hab.puertasVentanas?.map((pv) => {
                    const anchoPVReal = pv.ancho || (pv.tipo === 'puerta' ? 0.9 : 1.2) // Metros
                    const anchoPV = anchoPVReal * escala // Pixels
                    const grosorLinea = 6 // Grosor de la línea de la pared en pixels
                    
                    let x = 0
                    let y = 0
                    let anchoRect = 0
                    let altoRect = 0

                    // Calcular posición según la pared
                    switch (pv.pared) {
                      case 'superior':
                        // Pared superior: posición horizontal
                        x = habPos.x + (ancho * pv.posicion / 100) - anchoPV / 2
                        y = habPos.y - grosorLinea / 2
                        anchoRect = anchoPV
                        altoRect = grosorLinea
                        break
                      case 'inferior':
                        // Pared inferior: posición horizontal
                        x = habPos.x + (ancho * pv.posicion / 100) - anchoPV / 2
                        y = habPos.y + largo - grosorLinea / 2
                        anchoRect = anchoPV
                        altoRect = grosorLinea
                        break
                      case 'izquierda':
                        // Pared izquierda: posición vertical
                        x = habPos.x - grosorLinea / 2
                        y = habPos.y + (largo * pv.posicion / 100) - anchoPV / 2
                        anchoRect = grosorLinea
                        altoRect = anchoPV
                        break
                      case 'derecha':
                        // Pared derecha: posición vertical
                        x = habPos.x + ancho - grosorLinea / 2
                        y = habPos.y + (largo * pv.posicion / 100) - anchoPV / 2
                        anchoRect = grosorLinea
                        altoRect = anchoPV
                        break
                    }

                    const centerX = x + anchoRect / 2
                    const centerY = y + altoRect / 2

                    return (
                      <g key={`pv-${pv.id}`}>
                        {/* Abertura en la pared - se muestra como una interrupción */}
                        <rect
                          x={x}
                          y={y}
                          width={anchoRect}
                          height={altoRect}
                          fill={pv.tipo === 'puerta' ? '#f3f4f6' : '#e0f2fe'}
                          stroke={pv.tipo === 'puerta' ? '#4b5563' : '#0284c7'}
                          strokeWidth={pv.tipo === 'puerta' ? "2.5" : "2"}
                          strokeDasharray={pv.tipo === 'ventana' ? '3,2' : '0'}
                          rx="1"
                          className="pointer-events-none"
                        />
                        {/* Símbolo */}
                        <text
                          x={centerX}
                          y={centerY}
                          textAnchor="middle"
                          dominantBaseline="middle"
                          fontSize={pv.tipo === 'puerta' ? "14" : "12"}
                          fill={pv.tipo === 'puerta' ? '#374151' : '#0284c7'}
                          fontWeight="bold"
                          className="pointer-events-none"
                        >
                          {pv.tipo === 'puerta' ? '🚪' : '🪟'}
                        </text>
                        {/* Etiqueta con medidas opcional */}
                        {(pv.ancho || pv.alto) && (
                          <text
                            x={centerX}
                            y={pv.pared === 'superior' || pv.pared === 'inferior' 
                              ? (pv.pared === 'superior' ? y - 5 : y + altoRect + 12)
                              : (pv.pared === 'izquierda' ? x - 8 : x + anchoRect + 8)}
                            textAnchor={pv.pared === 'superior' || pv.pared === 'inferior' ? "middle" : (pv.pared === 'izquierda' ? "end" : "start")}
                            dominantBaseline={pv.pared === 'superior' || pv.pared === 'inferior' ? "auto" : "middle"}
                            fontSize="8"
                            fill="#6b7280"
                            className="pointer-events-none"
                          >
                            {anchoPVReal}m
                          </text>
                        )}
                      </g>
                    )
                  })}

                  {/* Medidas - Ancho (superior) */}
                  <g className="pointer-events-none">
                    <line
                      x1={habPos.x}
                      y1={habPos.y - 15}
                      x2={habPos.x + ancho}
                      y2={habPos.y - 15}
                      stroke="#333"
                      strokeWidth="1.5"
                      markerEnd="url(#arrow-end)"
                      markerStart="url(#arrow-start)"
                    />
                    <text
                      x={habPos.x + ancho / 2}
                      y={habPos.y - 18}
                      textAnchor="middle"
                      dominantBaseline="middle"
                      fontSize="11"
                      fontWeight="bold"
                      fill="#1a1a1a"
                      className="font-mono"
                    >
                      {anchoDisplay}m
                    </text>
                  </g>

                  {/* Medidas - Largo (lateral izquierdo) */}
                  <g className="pointer-events-none">
                    <line
                      x1={habPos.x - 15}
                      y1={habPos.y}
                      x2={habPos.x - 15}
                      y2={habPos.y + largo}
                      stroke="#333"
                      strokeWidth="1.5"
                      markerEnd="url(#arrow-end-vert)"
                      markerStart="url(#arrow-start-vert)"
                    />
                    <text
                      x={habPos.x - 25}
                      y={habPos.y + largo / 2}
                      textAnchor="middle"
                      dominantBaseline="middle"
                      fontSize="11"
                      fontWeight="bold"
                      fill="#1a1a1a"
                      className="font-mono"
                      transform={`rotate(-90 ${habPos.x - 25} ${habPos.y + largo / 2})`}
                    >
                      {largoDisplay}m
                    </text>
                  </g>

                  {/* Nombre y m² en el centro */}
                  <text
                    x={habPos.x + ancho / 2}
                    y={habPos.y + largo / 2 - 8}
                    textAnchor="middle"
                    dominantBaseline="middle"
                    fontSize="14"
                    fontWeight="bold"
                    fill={color.text}
                    className="pointer-events-none"
                  >
                    {hab.nombre}
                  </text>
                  <text
                    x={habPos.x + ancho / 2}
                    y={habPos.y + largo / 2 + 10}
                    textAnchor="middle"
                    dominantBaseline="middle"
                    fontSize="12"
                    fontWeight="600"
                    fill={color.text}
                    className="pointer-events-none"
                  >
                    {hab.metrosCuadrados} m²
                  </text>

                  {/* Indicador de colindancias */}
                  {hab.colindaCon && hab.colindaCon.length > 0 && (
                    <circle
                      cx={habPos.x + ancho - 8}
                      cy={habPos.y + 8}
                      r="8"
                      fill="#22c55e"
                      stroke="white"
                      strokeWidth="2"
                      className="pointer-events-none"
                    />
                  )}
                  {hab.colindaCon && hab.colindaCon.length > 0 && (
                    <text
                      x={habPos.x + ancho - 8}
                      y={habPos.y + 8}
                      textAnchor="middle"
                      dominantBaseline="middle"
                      fontSize="8"
                      fontWeight="bold"
                      fill="white"
                      className="pointer-events-none"
                    >
                      {hab.colindaCon.length}
                    </text>
                  )}

                  {/* Botón editar (solo cuando no está en modo edición) */}
                  {!modoEdicion && (
                    <g
                      onClick={(e) => {
                        e.stopPropagation()
                        if (onEditHabitacion) {
                          onEditHabitacion(hab)
                        }
                      }}
                      style={{ cursor: 'pointer' }}
                    >
                      <circle
                        cx={habPos.x + ancho - 15}
                        cy={habPos.y + largo - 15}
                        r="12"
                        fill="white"
                        stroke={color.stroke}
                        strokeWidth="2"
                      />
                      <text
                        x={habPos.x + ancho - 15}
                        y={habPos.y + largo - 15}
                        textAnchor="middle"
                        dominantBaseline="middle"
                        fontSize="12"
                        fill={color.stroke}
                        fontWeight="bold"
                      >
                        ✎
                      </text>
                    </g>
                  )}
                </g>
              )
            })}

            {/* Marcadores de flecha para medidas */}
            <defs>
              <marker id="arrow-end" markerWidth="10" markerHeight="10" refX="9" refY="3" orient="auto" markerUnits="strokeWidth">
                <path d="M0,0 L0,6 L9,3 z" fill="#333" />
              </marker>
              <marker id="arrow-start" markerWidth="10" markerHeight="10" refX="0" refY="3" orient="auto" markerUnits="strokeWidth">
                <path d="M9,0 L9,6 L0,3 z" fill="#333" />
              </marker>
              <marker id="arrow-end-vert" markerWidth="10" markerHeight="10" refX="3" refY="9" orient="auto" markerUnits="strokeWidth">
                <path d="M0,0 L6,0 L3,9 z" fill="#333" />
              </marker>
              <marker id="arrow-start-vert" markerWidth="10" markerHeight="10" refX="3" refY="0" orient="auto" markerUnits="strokeWidth">
                <path d="M0,9 L6,9 L3,0 z" fill="#333" />
              </marker>
            </defs>
          </svg>
        </div>

        {/* Controles */}
        <div className="mt-4 flex flex-wrap justify-between items-center gap-4">
          {/* Zoom */}
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setZoom(Math.max(0.5, zoom - 0.1))}
              disabled={zoom <= 0.5}
            >
              <ZoomOut className="h-4 w-4" />
            </Button>
            <span className="px-4 py-2 text-sm font-medium min-w-[100px] text-center">
              {Math.round(zoom * 100)}%
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setZoom(Math.min(2, zoom + 0.1))}
              disabled={zoom >= 2}
            >
              <ZoomIn className="h-4 w-4" />
            </Button>
          </div>

          {/* Info */}
          <div className="text-sm text-muted-foreground">
            {habitaciones.length} habitación{habitaciones.length !== 1 ? 'es' : ''} | 
            Escala: 1m = {escala}px
          </div>
        </div>

        {/* Leyenda */}
        <div className="mt-4 grid grid-cols-2 md:grid-cols-3 gap-4">
          <div className="border rounded-lg p-3 bg-white">
            <h4 className="font-semibold mb-2 text-xs">Tipos de Habitación</h4>
            <div className="space-y-1 text-xs">
              {Object.entries(colores).slice(0, 3).map(([tipo, color]) => (
                <div key={tipo} className="flex items-center gap-2">
                  <div
                    className="w-3 h-3 rounded border"
                    style={{ backgroundColor: color.fill, borderColor: color.stroke }}
                  />
                  <span className="capitalize">{tipo}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="border rounded-lg p-3 bg-white">
            <h4 className="font-semibold mb-2 text-xs">Símbolos</h4>
            <div className="space-y-1 text-xs">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-green-500 rounded-full" />
                <span>Colindancia</span>
              </div>
              <div className="flex items-center gap-2">
                <Edit2 className="h-3 w-3" />
                <span>Editar habitación</span>
              </div>
            </div>
          </div>
          <div className="border rounded-lg p-3 bg-blue-50">
            <h4 className="font-semibold mb-2 text-xs text-blue-900">Consejos</h4>
            <ul className="text-xs text-blue-800 space-y-1">
              <li>• Activa &quot;Editar Posición&quot; para mover</li>
              <li>• Haz clic para editar datos</li>
              <li>• Líneas verdes = paredes compartidas</li>
              <li>• Medidas se actualizan automáticamente</li>
            </ul>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
