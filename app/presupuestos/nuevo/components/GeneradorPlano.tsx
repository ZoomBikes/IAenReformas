'use client'

import { useState, useMemo, useCallback, useEffect, useRef } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Edit2, Maximize2, RotateCw, RotateCcw, ZoomIn, ZoomOut, Grid, Move, Info, Download, Layers, Ruler, CheckCircle, Sparkles, StickyNote, FileText, Box, Eye } from 'lucide-react'
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

interface Anotacion {
  id: string
  x: number
  y: number
  texto: string
  color: string
}

interface Plantilla {
  nombre: string
  descripcion: string
  habitaciones: Array<{
    nombre: string
    tipo: string
    ancho: string
    largo: string
    colindaCon?: string[]
  }>
}

export function GeneradorPlano({ habitaciones, onEditHabitacion, onUpdatePosiciones }: GeneradorPlanoProps) {
  const [posiciones, setPosiciones] = useState<Record<string, PosicionHabitacion>>({})
  const [modoEdicion, setModoEdicion] = useState(false)
  const [zoom, setZoom] = useState(1)
  const [pan, setPan] = useState({ x: 0, y: 0 })
  const [mostrarGrid, setMostrarGrid] = useState(true)
  const [mostrarParedes, setMostrarParedes] = useState(true)
  const [snapToGrid, setSnapToGrid] = useState(true)
  const [modoMedir, setModoMedir] = useState(false)
  const [puntosMedicion, setPuntosMedicion] = useState<Array<{x: number, y: number}>>([])
  const [capasVisibles, setCapasVisibles] = useState({
    salon: true,
    dormitorio: true,
    cocina: true,
    bano: true,
    pasillo: true,
    otros: true,
    medidas: true,
    colindancias: true,
    puertasVentanas: true
  })
  const [mostrarMenuCapas, setMostrarMenuCapas] = useState(false)
  const [modoAnotacion, setModoAnotacion] = useState(false)
  const [anotaciones, setAnotaciones] = useState<Anotacion[]>([])
  const [mostrarPlantillas, setMostrarPlantillas] = useState(false)
  const [vista3D, setVista3D] = useState(false)
  const [habitacionArrastrando, setHabitacionArrastrando] = useState<string | null>(null)
  const [habitacionSeleccionada, setHabitacionSeleccionada] = useState<string | null>(null)
  const [offsetArrastre, setOffsetArrastre] = useState({ x: 0, y: 0 })
  const [isPanning, setIsPanning] = useState(false)
  const [panStart, setPanStart] = useState({ x: 0, y: 0 })
  const svgRef = useRef<SVGSVGElement>(null)

  const escala = 25 // 1m = 25px para mejor visualización
  const grosorPared = 8 // Grosor de las paredes en pixels
  const gridSize = 25 // Tamaño del grid para snap (coincide con escala)

  // Calcular posiciones iniciales basadas en colindancias
  const posicionesIniciales = useMemo(() => {
    const pos: Record<string, PosicionHabitacion> = {}
    let currentX = 200
    let currentY = 200
    let maxY = 0

    habitaciones.forEach((hab) => {
      if (posiciones[hab.id]) {
        pos[hab.id] = posiciones[hab.id]
        return
      }

      if (hab.colindaCon && hab.colindaCon.length > 0) {
        const colindanteId = hab.colindaCon[0]
        const colindante = habitaciones.find(h => h.id === colindanteId)
        
        if (colindante && pos[colindanteId]) {
          const colindantePos = pos[colindanteId]
          const colindanteAncho = parseFloat(colindante.ancho || '0') * escala || 100
          
          pos[hab.id] = {
            x: colindantePos.x + colindanteAncho + grosorPared,
            y: colindantePos.y
          }
          return
        }
      }

      const ancho = parseFloat(hab.ancho || '0') * escala || 100
      const largo = parseFloat(hab.largo || '0') * escala || 80

      if (currentX + ancho > 2000) {
        currentX = 200
        currentY = maxY + 60
      }

      pos[hab.id] = { x: currentX, y: currentY }
      maxY = Math.max(maxY, currentY + largo)
      currentX += ancho + 60
    })

    return pos
  }, [habitaciones, posiciones])

  useEffect(() => {
    if (Object.keys(posiciones).length === 0 && habitaciones.length > 0) {
      setPosiciones(posicionesIniciales)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [habitaciones.length])

  // Zoom con rueda del ratón
  const handleWheel = useCallback((e: React.WheelEvent<SVGSVGElement>) => {
    if (!modoEdicion) {
      e.preventDefault()
      const delta = e.deltaY > 0 ? 0.9 : 1.1
      setZoom(prev => Math.max(0.3, Math.min(3, prev * delta)))
    }
  }, [modoEdicion])

  // Pan con arrastre del fondo
  const handleMouseDownPan = useCallback((e: React.MouseEvent<SVGSVGElement>) => {
    if (!modoEdicion && e.target === e.currentTarget) {
      setIsPanning(true)
      setPanStart({ x: e.clientX - pan.x, y: e.clientY - pan.y })
    }
  }, [modoEdicion, pan])

  const handleMouseMovePan = useCallback((e: React.MouseEvent<SVGSVGElement>) => {
    if (isPanning) {
      setPan({
        x: e.clientX - panStart.x,
        y: e.clientY - panStart.y
      })
    }
  }, [isPanning, panStart])

  const handleMouseUpPan = useCallback(() => {
    setIsPanning(false)
  }, [])

  const handleMouseDown = useCallback((e: React.MouseEvent, habitacionId: string) => {
    if (!modoEdicion) return

    const habPos = posiciones[habitacionId] || posicionesIniciales[habitacionId]
    if (!habPos) return

    const rect = (e.currentTarget as SVGRectElement).getBoundingClientRect()
    const svg = (e.currentTarget as SVGRectElement).closest('svg')
    if (!svg) return

    const svgRect = svg.getBoundingClientRect()
    const mouseX = (e.clientX - svgRect.left - pan.x) / zoom
    const mouseY = (e.clientY - svgRect.top - pan.y) / zoom

    setOffsetArrastre({
      x: mouseX - habPos.x,
      y: mouseY - habPos.y
    })
    setHabitacionArrastrando(habitacionId)
    e.stopPropagation()
  }, [modoEdicion, posiciones, posicionesIniciales, pan, zoom])

  const handleMouseMove = useCallback((e: React.MouseEvent<SVGSVGElement>) => {
    if (habitacionArrastrando && modoEdicion) {
      const svg = svgRef.current
      if (!svg) return

      const svgRect = svg.getBoundingClientRect()
      let mouseX = (e.clientX - svgRect.left - pan.x) / zoom
      let mouseY = (e.clientY - svgRect.top - pan.y) / zoom

      // Aplicar snap to grid si está activado
      if (snapToGrid) {
        mouseX = Math.round(mouseX / gridSize) * gridSize
        mouseY = Math.round(mouseY / gridSize) * gridSize
      }

      setPosiciones(prev => ({
        ...prev,
        [habitacionArrastrando]: {
          x: Math.max(0, mouseX - offsetArrastre.x),
          y: Math.max(0, mouseY - offsetArrastre.y)
        }
      }))
    }
  }, [habitacionArrastrando, modoEdicion, offsetArrastre, pan, zoom, snapToGrid, gridSize])

  const handleMouseUp = useCallback(() => {
    if (habitacionArrastrando) {
      onUpdatePosiciones?.(posiciones)
      setHabitacionArrastrando(null)
    }
  }, [habitacionArrastrando, posiciones, onUpdatePosiciones])

  // Calcular colindancias visuales
  const colindancias = useMemo(() => {
    const cols: Array<{
      hab1: Habitacion
      hab2: Habitacion
      pared: 'superior' | 'inferior' | 'izquierda' | 'derecha'
      pos: { x1: number, y1: number, x2: number, y2: number } | { x: number, y1: number, y2: number } | { y: number, x1: number, x2: number }
    }> = []

    habitaciones.forEach(hab1 => {
      if (!hab1.colindaCon) return

      hab1.colindaCon.forEach(colindanteId => {
        const hab2 = habitaciones.find(h => h.id === colindanteId)
        if (!hab2) return

        const pos1 = posiciones[hab1.id] || posicionesIniciales[hab1.id]
        const pos2 = posiciones[hab2.id] || posicionesIniciales[hab2.id]
        if (!pos1 || !pos2) return

        const ancho1 = parseFloat(hab1.ancho || '0') * escala || 100
        const largo1 = parseFloat(hab1.largo || '0') * escala || 80
        const ancho2 = parseFloat(hab2.ancho || '0') * escala || 100
        const largo2 = parseFloat(hab2.largo || '0') * escala || 80

        // Detectar qué paredes están adyacentes
        const distanciaX = Math.abs(pos1.x - pos2.x)
        const distanciaY = Math.abs(pos1.y - pos2.y)
        const margen = grosorPared * 2

        if (distanciaX < ancho1 / 2 && Math.abs(pos1.y + largo1 - pos2.y) < margen) {
          // hab1 inferior con hab2 superior
          const xInicio = Math.max(pos1.x, pos2.x)
          const xFin = Math.min(pos1.x + ancho1, pos2.x + ancho2)
          if (xFin > xInicio) {
            cols.push({
              hab1, hab2,
              pared: 'inferior',
              pos: {
                x: (xInicio + xFin) / 2,
                y1: pos1.y + largo1,
                y2: pos2.y
              }
            })
          }
        } else if (distanciaX < ancho1 / 2 && Math.abs(pos2.y + largo2 - pos1.y) < margen) {
          // hab1 superior con hab2 inferior
          const xInicio = Math.max(pos1.x, pos2.x)
          const xFin = Math.min(pos1.x + ancho1, pos2.x + ancho2)
          if (xFin > xInicio) {
            cols.push({
              hab1, hab2,
              pared: 'superior',
              pos: {
                x: (xInicio + xFin) / 2,
                y1: pos1.y,
                y2: pos2.y + largo2
              }
            })
          }
        } else if (distanciaY < largo1 / 2 && Math.abs(pos1.x + ancho1 - pos2.x) < margen) {
          // hab1 derecha con hab2 izquierda
          const yInicio = Math.max(pos1.y, pos2.y)
          const yFin = Math.min(pos1.y + largo1, pos2.y + largo2)
          if (yFin > yInicio) {
            cols.push({
              hab1, hab2,
              pared: 'derecha',
              pos: {
                y: (yInicio + yFin) / 2,
                x1: pos1.x + ancho1,
                x2: pos2.x
              }
            })
          }
        } else if (distanciaY < largo1 / 2 && Math.abs(pos2.x + ancho2 - pos1.x) < margen) {
          // hab1 izquierda con hab2 derecha
          const yInicio = Math.max(pos1.y, pos2.y)
          const yFin = Math.min(pos1.y + largo1, pos2.y + largo2)
          if (yFin > yInicio) {
            cols.push({
              hab1, hab2,
              pared: 'izquierda',
              pos: {
                y: (yInicio + yFin) / 2,
                x1: pos1.x,
                x2: pos2.x + ancho2
              }
            })
          }
        }
      })
    })

    return cols
  }, [habitaciones, posiciones, posicionesIniciales])

  const colores: Record<string, { fill: string, stroke: string, text: string }> = {
    salon: { fill: '#fef3c7', stroke: '#f59e0b', text: '#92400e' },
    dormitorio: { fill: '#e0e7ff', stroke: '#6366f1', text: '#3730a3' },
    cocina: { fill: '#fce7f3', stroke: '#ec4899', text: '#9f1239' },
    bano: { fill: '#dbeafe', stroke: '#3b82f6', text: '#1e3a8a' },
    pasillo: { fill: '#f3f4f6', stroke: '#6b7280', text: '#374151' },
    otros: { fill: '#f9fafb', stroke: '#9ca3af', text: '#6b7280' }
  }

  const resetView = () => {
    setZoom(1)
    setPan({ x: 0, y: 0 })
  }

  const centerView = () => {
    if (habitaciones.length === 0) return
    
    const bounds = habitaciones.reduce((acc, hab) => {
      const pos = posiciones[hab.id] || posicionesIniciales[hab.id]
      if (!pos) return acc
      
      const ancho = parseFloat(hab.ancho || '0') * escala || 100
      const largo = parseFloat(hab.largo || '0') * escala || 80
      
      return {
        minX: Math.min(acc.minX, pos.x),
        minY: Math.min(acc.minY, pos.y),
        maxX: Math.max(acc.maxX, pos.x + ancho),
        maxY: Math.max(acc.maxY, pos.y + largo)
      }
    }, { minX: Infinity, minY: Infinity, maxX: -Infinity, maxY: -Infinity })

    const centerX = (bounds.minX + bounds.maxX) / 2
    const centerY = (bounds.minY + bounds.maxY) / 2
    
    setPan({
      x: 700 - centerX,
      y: 500 - centerY
    })
    setZoom(1)
  }

  // Calcular ancho y alto del canvas dinámicamente
  const canvasBounds = useMemo(() => {
    if (habitaciones.length === 0) return { width: 1400, height: 1000 }

    const bounds = habitaciones.reduce((acc, hab) => {
      const pos = posiciones[hab.id] || posicionesIniciales[hab.id]
      if (!pos) return acc
      
      const ancho = parseFloat(hab.ancho || '0') * escala || 100
      const largo = parseFloat(hab.largo || '0') * escala || 80
      
      return {
        minX: Math.min(acc.minX, pos.x - 100),
        minY: Math.min(acc.minY, pos.y - 100),
        maxX: Math.max(acc.maxX, pos.x + ancho + 100),
        maxY: Math.max(acc.maxY, pos.y + largo + 100)
      }
    }, { minX: Infinity, minY: Infinity, maxX: -Infinity, maxY: -Infinity })

    return {
      width: Math.max(1400, bounds.maxX - bounds.minX),
      height: Math.max(1000, bounds.maxY - bounds.minY),
      minX: bounds.minX,
      minY: bounds.minY
    }
  }, [habitaciones, posiciones, posicionesIniciales])

  // Rotar habitación (intercambiar ancho/largo y ajustar posición)
  const rotarHabitacion = useCallback((habitacionId: string) => {
    const hab = habitaciones.find(h => h.id === habitacionId)
    if (!hab) return

    // Intercambiar ancho y largo
    const nuevoAncho = hab.largo || ''
    const nuevoLargo = hab.ancho || ''
    
    // Notificar al componente padre para actualizar la habitación
    if (onEditHabitacion) {
      const habActualizada = {
        ...hab,
        ancho: nuevoAncho,
        largo: nuevoLargo
      }
      onEditHabitacion(habActualizada)
    }

    toast.success('Habitación rotada (ancho ↔ largo)')
  }, [habitaciones, onEditHabitacion])

  // Auto-organizar habitaciones según colindancias
  const autoOrganizar = useCallback(() => {
    if (habitaciones.length === 0) return

    const nuevasPosiciones: Record<string, PosicionHabitacion> = {}
    let currentX = 200
    let currentY = 200
    let maxY = 200
    const procesadas = new Set<string>()

    // Procesar habitaciones con colindancias primero
    const procesarConColindantes = (hab: Habitacion, x: number, y: number) => {
      if (procesadas.has(hab.id)) return

      const ancho = parseFloat(hab.ancho || '0') * escala || 100
      const largo = parseFloat(hab.largo || '0') * escala || 80

      nuevasPosiciones[hab.id] = { x, y }
      procesadas.add(hab.id)

      // Procesar habitaciones colindantes
      if (hab.colindaCon && hab.colindaCon.length > 0) {
        hab.colindaCon.forEach((colindanteId, index) => {
          const colindante = habitaciones.find(h => h.id === colindanteId)
          if (colindante && !procesadas.has(colindanteId)) {
            // Colocar a la derecha
            procesarConColindantes(colindante, x + ancho + grosorPared, y)
          }
        })
      }
    }

    // Procesar todas las habitaciones
    habitaciones.forEach((hab) => {
      if (!procesadas.has(hab.id)) {
        if (currentX + parseFloat(hab.ancho || '0') * escala > 2000) {
          currentX = 200
          currentY = maxY + 60
        }
        procesarConColindantes(hab, currentX, currentY)
        const ancho = parseFloat(hab.ancho || '0') * escala || 100
        const largo = parseFloat(hab.largo || '0') * escala || 80
        maxY = Math.max(maxY, currentY + largo)
        currentX += ancho + 60
      }
    })

    setPosiciones(nuevasPosiciones)
    toast.success(`${Object.keys(nuevasPosiciones).length} habitaciones organizadas automáticamente`)
  }, [habitaciones])

  // Plantillas predefinidas
  const plantillas: Plantilla[] = [
    {
      nombre: 'L-Shape (Forma L)',
      descripcion: 'Distribución en L con salón y cocina',
      habitaciones: [
        { nombre: 'Salón', tipo: 'salon', ancho: '5', largo: '4' },
        { nombre: 'Cocina', tipo: 'cocina', ancho: '3', largo: '4', colindaCon: ['Salón'] },
        { nombre: 'Dormitorio 1', tipo: 'dormitorio', ancho: '4', largo: '3.5' },
        { nombre: 'Baño', tipo: 'bano', ancho: '2', largo: '2' }
      ]
    },
    {
      nombre: 'U-Shape (Forma U)',
      descripcion: 'Distribución en U alrededor de pasillo central',
      habitaciones: [
        { nombre: 'Pasillo', tipo: 'pasillo', ancho: '1.5', largo: '6' },
        { nombre: 'Salón', tipo: 'salon', ancho: '4', largo: '4', colindaCon: ['Pasillo'] },
        { nombre: 'Cocina', tipo: 'cocina', ancho: '3', largo: '3', colindaCon: ['Pasillo'] },
        { nombre: 'Dormitorio 1', tipo: 'dormitorio', ancho: '3.5', largo: '3.5', colindaCon: ['Pasillo'] },
        { nombre: 'Dormitorio 2', tipo: 'dormitorio', ancho: '3.5', largo: '3.5', colindaCon: ['Pasillo'] },
        { nombre: 'Baño', tipo: 'bano', ancho: '2', largo: '2', colindaCon: ['Pasillo'] }
      ]
    },
    {
      nombre: 'Rectangular Simple',
      descripcion: 'Distribución lineal simple',
      habitaciones: [
        { nombre: 'Salón', tipo: 'salon', ancho: '5', largo: '4' },
        { nombre: 'Cocina', tipo: 'cocina', ancho: '3', largo: '4', colindaCon: ['Salón'] },
        { nombre: 'Dormitorio', tipo: 'dormitorio', ancho: '4', largo: '3.5', colindaCon: ['Cocina'] },
        { nombre: 'Baño', tipo: 'bano', ancho: '2', largo: '2', colindaCon: ['Dormitorio'] }
      ]
    }
  ]

  // Aplicar plantilla
  const aplicarPlantilla = useCallback((plantilla: Plantilla) => {
    if (!onEditHabitacion) {
      toast.error('No se puede aplicar plantilla sin función de edición')
      return
    }

    toast.info(`Aplicando plantilla: ${plantilla.nombre}`)
    // Notificar al componente padre para crear las habitaciones
    plantilla.habitaciones.forEach((habTemplate, index) => {
      setTimeout(() => {
        const nuevaHab: Habitacion = {
          id: Date.now().toString() + index,
          nombre: habTemplate.nombre,
          tipo: habTemplate.tipo as any,
          metrosCuadrados: (parseFloat(habTemplate.ancho) * parseFloat(habTemplate.largo)).toFixed(2),
          alturaTechos: '2.70',
          ancho: habTemplate.ancho,
          largo: habTemplate.largo,
          numPuertas: '1',
          numVentanas: habTemplate.tipo === 'bano' ? '0' : '1',
          colindaCon: habTemplate.colindaCon || []
        }
        // Esto requeriría una función de creación desde el padre
        toast.info(`Crea "${habTemplate.nombre}" manualmente para usar la plantilla`)
      }, index * 100)
    })

    setMostrarPlantillas(false)
    toast.success(`Plantilla "${plantilla.nombre}" - Crea las habitaciones manualmente`)
  }, [onEditHabitacion])

  // Añadir anotación
  const añadirAnotacion = useCallback((x: number, y: number) => {
    const nuevaAnotacion: Anotacion = {
      id: Date.now().toString(),
      x,
      y,
      texto: 'Nueva nota',
      color: '#fef3c7'
    }
    setAnotaciones([...anotaciones, nuevaAnotacion])
    setModoAnotacion(false)
    toast.success('Anotación añadida - Haz clic para editar')
  }, [anotaciones])

  // Validar medidas y detectar inconsistencias
  const validarMedidas = useCallback(() => {
    const errores: string[] = []
    const advertencias: string[] = []

    habitaciones.forEach((hab) => {
      // Validar que ancho × largo = m²
      if (hab.ancho && hab.largo) {
        const anchoNum = parseFloat(hab.ancho)
        const largoNum = parseFloat(hab.largo)
        const m2Calculado = anchoNum * largoNum
        const m2Declarado = parseFloat(hab.metrosCuadrados || '0')

        if (Math.abs(m2Calculado - m2Declarado) > 0.5) {
          errores.push(`${hab.nombre}: m² calculados (${m2Calculado.toFixed(2)}) no coinciden con declarados (${m2Declarado.toFixed(2)})`)
        }
      }

      // Validar puertas/ventanas
      if (hab.puertasVentanas) {
        hab.puertasVentanas.forEach((pv) => {
          const posNum = parseFloat(pv.posicion.toString())
          if (posNum < 0 || posNum > 100) {
            advertencias.push(`${hab.nombre}: ${pv.tipo} fuera de rango (${posNum}%)`)
          }
        })
      }
    })

    if (errores.length > 0 || advertencias.length > 0) {
      toast.warning(`${errores.length} error(es) y ${advertencias.length} advertencia(s) encontrados`, {
        description: errores.slice(0, 2).join(', ') || advertencias.slice(0, 2).join(', ')
      })
    } else {
      toast.success('✓ Todas las medidas son consistentes')
    }

    return { errores, advertencias }
  }, [habitaciones])

  // Exportar plano como PNG
  const exportarAPNG = useCallback(() => {
    const svg = svgRef.current
    if (!svg) {
      toast.error('No se pudo exportar el plano')
      return
    }

    // Crear una copia del SVG sin transformaciones
    const svgClone = svg.cloneNode(true) as SVGSVGElement
    svgClone.setAttribute('width', canvasBounds.width.toString())
    svgClone.setAttribute('height', canvasBounds.height.toString())
    svgClone.setAttribute('viewBox', `0 0 ${canvasBounds.width} ${canvasBounds.height}`)
    svgClone.style.transform = 'none'
    
    // Convertir a canvas
    const svgData = new XMLSerializer().serializeToString(svgClone)
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    const img = new Image()
    
    canvas.width = canvasBounds.width * 2 // 2x para mejor calidad
    canvas.height = canvasBounds.height * 2
    
    img.onload = () => {
      if (ctx) {
        ctx.fillStyle = 'white'
        ctx.fillRect(0, 0, canvas.width, canvas.height)
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
        
        canvas.toBlob((blob) => {
          if (blob) {
            const url = URL.createObjectURL(blob)
            const link = document.createElement('a')
            link.href = url
            link.download = `plano-vivienda-${new Date().toISOString().split('T')[0]}.png`
            link.click()
            URL.revokeObjectURL(url)
            toast.success('Plano exportado como PNG')
          }
        }, 'image/png', 1.0)
      }
    }
    
    const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' })
    const url = URL.createObjectURL(svgBlob)
    img.src = url
  }, [canvasBounds])

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle>📐 Plano Interactivo de la Vivienda</CardTitle>
            <CardDescription>
              Visualiza y edita la distribución de las habitaciones. Haz clic en una habitación para editarla.
            </CardDescription>
          </div>
          <div className="flex gap-2">
            <Button
              variant={modoEdicion ? 'default' : 'outline'}
              size="sm"
              onClick={() => {
                setModoEdicion(!modoEdicion)
                if (modoEdicion) {
                  onUpdatePosiciones?.(posiciones)
                  toast.success('Posiciones guardadas')
                } else {
                  toast.info('Modo edición activado - arrastra las habitaciones')
                }
              }}
            >
              <Move className="h-4 w-4 mr-1" />
              {modoEdicion ? 'Guardar Posición' : 'Editar Posición'}
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {/* Controles superiores */}
        <div className="flex flex-wrap items-center gap-2 mb-4 p-3 bg-slate-50 rounded-lg">
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setZoom(prev => Math.min(3, prev + 0.1))}
              disabled={zoom >= 3}
            >
              <ZoomIn className="h-3 w-3" />
            </Button>
            <span className="text-sm font-medium min-w-[60px] text-center">
              {Math.round(zoom * 100)}%
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setZoom(prev => Math.max(0.3, prev - 0.1))}
              disabled={zoom <= 0.3}
            >
              <ZoomOut className="h-3 w-3" />
            </Button>
            <Button variant="outline" size="sm" onClick={resetView} title="Resetear zoom">
              <RotateCcw className="h-3 w-3" />
            </Button>
            <Button variant="outline" size="sm" onClick={centerView} title="Centrar vista">
              <Maximize2 className="h-3 w-3" />
            </Button>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant={snapToGrid ? 'default' : 'outline'}
              size="sm"
              onClick={() => {
                setSnapToGrid(!snapToGrid)
                toast.info(snapToGrid ? 'Snap desactivado' : 'Snap activado')
              }}
              title="Alinear al grid al arrastrar"
            >
              <Grid className="h-3 w-3 mr-1" />
              Snap
            </Button>
            <Button
              variant={mostrarGrid ? 'default' : 'outline'}
              size="sm"
              onClick={() => setMostrarGrid(!mostrarGrid)}
            >
              <Grid className="h-3 w-3 mr-1" />
              Grid
            </Button>
            <Button
              variant={mostrarParedes ? 'default' : 'outline'}
              size="sm"
              onClick={() => setMostrarParedes(!mostrarParedes)}
            >
              🧱 Paredes
            </Button>
            <Button
              variant={modoMedir ? 'default' : 'outline'}
              size="sm"
              onClick={() => {
                setModoMedir(!modoMedir)
                setPuntosMedicion([])
                if (!modoMedir) {
                  toast.info('Modo medir activado - Haz clic en dos puntos')
                }
              }}
              title="Medir distancias entre puntos"
            >
              <Ruler className="h-3 w-3 mr-1" />
              Medir
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={autoOrganizar}
              title="Auto-organizar habitaciones según colindancias"
            >
              <Sparkles className="h-3 w-3 mr-1" />
              Auto
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={validarMedidas}
              title="Validar medidas y detectar inconsistencias"
            >
              <CheckCircle className="h-3 w-3 mr-1" />
              Validar
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={exportarAPNG}
              title="Exportar plano como imagen PNG"
            >
              <Download className="h-3 w-3 mr-1" />
              PNG
            </Button>
            <Button
              variant={mostrarMenuCapas ? 'default' : 'outline'}
              size="sm"
              onClick={() => setMostrarMenuCapas(!mostrarMenuCapas)}
              title="Capas de visibilidad"
            >
              <Layers className="h-3 w-3 mr-1" />
              Capas
            </Button>
            <Button
              variant={modoAnotacion ? 'default' : 'outline'}
              size="sm"
              onClick={() => {
                setModoAnotacion(!modoAnotacion)
                if (!modoAnotacion) {
                  toast.info('Modo anotación - Haz clic en el plano para añadir notas')
                }
              }}
              title="Añadir anotaciones y notas"
            >
              <StickyNote className="h-3 w-3 mr-1" />
              Notas
            </Button>
            <Button
              variant={mostrarPlantillas ? 'default' : 'outline'}
              size="sm"
              onClick={() => setMostrarPlantillas(!mostrarPlantillas)}
              title="Aplicar plantillas de distribución"
            >
              <FileText className="h-3 w-3 mr-1" />
              Plantillas
            </Button>
            <Button
              variant={vista3D ? 'default' : 'outline'}
              size="sm"
              onClick={() => {
                setVista3D(!vista3D)
                if (!vista3D) {
                  toast.info('Vista 3D activada - Visualización isométrica')
                }
              }}
              title="Vista isométrica 3D"
            >
              <Eye className="h-3 w-3 mr-1" />
              3D
            </Button>
          </div>
          {/* Menú de Capas */}
          {mostrarMenuCapas && (
          <div className="absolute right-4 top-20 bg-white border rounded-lg shadow-lg p-4 z-50 min-w-[200px]">
            <h4 className="font-semibold mb-3 text-sm">Capas de Visibilidad</h4>
            <div className="space-y-2 text-sm">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={capasVisibles.medidas}
                  onChange={(e) => setCapasVisibles({...capasVisibles, medidas: e.target.checked})}
                />
                Medidas y dimensiones
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={capasVisibles.colindancias}
                  onChange={(e) => setCapasVisibles({...capasVisibles, colindancias: e.target.checked})}
                />
                Colindancias
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={capasVisibles.puertasVentanas}
                  onChange={(e) => setCapasVisibles({...capasVisibles, puertasVentanas: e.target.checked})}
                />
                Puertas y ventanas
              </label>
              <div className="border-t pt-2 mt-2">
                <p className="text-xs font-medium mb-2 text-muted-foreground">Tipos de habitaciones:</p>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={capasVisibles.salon}
                    onChange={(e) => setCapasVisibles({...capasVisibles, salon: e.target.checked})}
                  />
                  Salones
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={capasVisibles.dormitorio}
                    onChange={(e) => setCapasVisibles({...capasVisibles, dormitorio: e.target.checked})}
                  />
                  Dormitorios
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={capasVisibles.cocina}
                    onChange={(e) => setCapasVisibles({...capasVisibles, cocina: e.target.checked})}
                  />
                  Cocinas
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={capasVisibles.bano}
                    onChange={(e) => setCapasVisibles({...capasVisibles, bano: e.target.checked})}
                  />
                  Baños
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={capasVisibles.pasillo}
                    onChange={(e) => setCapasVisibles({...capasVisibles, pasillo: e.target.checked})}
                  />
                  Pasillos
                </label>
              </div>
            </div>
          </div>
          )}

          {/* Menú de Plantillas */}
          {mostrarPlantillas && (
          <div className="absolute right-4 top-20 bg-white border rounded-lg shadow-lg p-4 z-50 min-w-[300px] max-h-[500px] overflow-y-auto">
            <h4 className="font-semibold mb-3 text-sm flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Plantillas de Distribución
            </h4>
            <div className="space-y-3">
              {plantillas.map((plantilla) => (
                <div key={plantilla.nombre} className="border rounded-lg p-3 hover:bg-slate-50 transition-colors">
                  <h5 className="font-medium text-sm mb-1">{plantilla.nombre}</h5>
                  <p className="text-xs text-muted-foreground mb-2">{plantilla.descripcion}</p>
                  <div className="text-xs text-muted-foreground mb-2">
                    <p className="font-medium">Habitaciones:</p>
                    <ul className="list-disc list-inside ml-2">
                      {plantilla.habitaciones.map(h => (
                        <li key={h.nombre}>{h.nombre} ({h.ancho}m × {h.largo}m)</li>
                      ))}
                    </ul>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => aplicarPlantilla(plantilla)}
                    className="w-full"
                  >
                    Usar Plantilla
                  </Button>
                </div>
              ))}
            </div>
          </div>
          )}
        </div>

        {/* Viewport del plano */}
        <div className="border-2 border-slate-300 rounded-lg overflow-hidden bg-white relative" style={{ height: '600px' }}>
          <svg
            ref={svgRef}
            width="100%"
            height="100%"
            viewBox={`0 0 ${canvasBounds.width} ${canvasBounds.height}`}
            style={{
              transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
              transformOrigin: '0 0',
              cursor: modoEdicion ? (isPanning ? 'grabbing' : 'grab') : (isPanning ? 'grabbing' : 'default')
            }}
            onWheel={handleWheel}
            onMouseDown={handleMouseDownPan}
            onMouseMove={(e) => {
              handleMouseMove(e)
              handleMouseMovePan(e)
            }}
            onMouseUp={() => {
              handleMouseUp()
              handleMouseUpPan()
            }}
            onMouseLeave={() => {
              handleMouseUp()
              handleMouseUpPan()
            }}
            onClick={(e) => {
              const svg = svgRef.current
              if (!svg) return

              const svgRect = svg.getBoundingClientRect()
              const x = (e.clientX - svgRect.left - pan.x) / zoom
              const y = (e.clientY - svgRect.top - pan.y) / zoom

              if (modoMedir && e.target === e.currentTarget) {
                if (puntosMedicion.length < 2) {
                  setPuntosMedicion([...puntosMedicion, { x, y }])
                } else {
                  setPuntosMedicion([{ x, y }])
                }
              } else if (modoAnotacion && e.target === e.currentTarget) {
                añadirAnotacion(x, y)
              }
            }}
            className="select-none"
          >
            {/* Definiciones SVG */}
            <defs>
              <marker
                id="arrow-end"
                markerWidth="10"
                markerHeight="10"
                refX="9"
                refY="3"
                orient="auto"
                markerUnits="strokeWidth"
              >
                <path d="M0,0 L0,6 L9,3 z" fill="#333" />
              </marker>
              <marker
                id="arrow-start"
                markerWidth="10"
                markerHeight="10"
                refX="1"
                refY="3"
                orient="auto"
                markerUnits="strokeWidth"
              >
                <path d="M9,0 L9,6 L0,3 z" fill="#333" />
              </marker>
              <marker
                id="arrow-end-vert"
                markerWidth="10"
                markerHeight="10"
                refX="3"
                refY="9"
                orient="auto"
                markerUnits="strokeWidth"
              >
                <path d="M0,0 L6,0 L3,9 z" fill="#333" />
              </marker>
              <marker
                id="arrow-start-vert"
                markerWidth="10"
                markerHeight="10"
                refX="3"
                refY="1"
                orient="auto"
                markerUnits="strokeWidth"
              >
                <path d="M0,9 L6,9 L3,0 z" fill="#333" />
              </marker>
              
              {/* Filtros para sombras */}
              <filter id="shadow" x="-50%" y="-50%" width="200%" height="200%">
                <feGaussianBlur in="SourceAlpha" stdDeviation="2" />
                <feOffset dx="2" dy="2" result="offsetblur" />
                <feComponentTransfer>
                  <feFuncA type="linear" slope="0.3" />
                </feComponentTransfer>
                <feMerge>
                  <feMergeNode />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
              
              {/* Patrón de grid */}
              <pattern id="grid" width="50" height="50" patternUnits="userSpaceOnUse">
                <path d="M 50 0 L 0 0 0 50" fill="none" stroke="#e5e7eb" strokeWidth="0.5" />
              </pattern>
            </defs>

            {/* Grid de fondo */}
            {mostrarGrid && !vista3D && (
              <rect
                x={canvasBounds.minX || 0}
                y={canvasBounds.minY || 0}
                width={canvasBounds.width}
                height={canvasBounds.height}
                fill="url(#grid)"
                opacity="0.5"
              />
            )}

            {/* Vista 3D Isométrica */}
            {vista3D && habitaciones.map((hab) => {
              const habPos = posiciones[hab.id] || posicionesIniciales[hab.id]
              if (!habPos || !capasVisibles[hab.tipo]) return null

              const ancho = parseFloat(hab.ancho || '0') * escala || 100
              const largo = parseFloat(hab.largo || '0') * escala || 80
              const altura = parseFloat(hab.alturaTechos || '2.70') * escala * 0.3 // Altura en perspectiva
              const color = colores[hab.tipo] || colores.otros

              // Coordenadas isométricas
              const isoX = habPos.x + (ancho / 2)
              const isoY = habPos.y + (largo / 2)
              const isoOffsetX = ancho / 2 * 0.5 // Proyección isométrica
              const isoOffsetY = largo / 2 * 0.5

              return (
                <g key={`3d-${hab.id}`} opacity="0.9">
                  {/* Base (suelo) */}
                  <polygon
                    points={`
                      ${isoX - isoOffsetX},${isoY + isoOffsetY}
                      ${isoX + isoOffsetX},${isoY - isoOffsetY}
                      ${isoX + ancho/2 + isoOffsetX},${isoY + largo/2 - isoOffsetY}
                      ${isoX - ancho/2 + isoOffsetX},${isoY + largo/2 + isoOffsetY}
                    `}
                    fill={color.fill}
                    stroke={color.stroke}
                    strokeWidth="2"
                  />
                  {/* Paredes laterales en perspectiva */}
                  <polygon
                    points={`
                      ${isoX - ancho/2 + isoOffsetX},${isoY + largo/2 + isoOffsetY}
                      ${isoX - isoOffsetX},${isoY + isoOffsetY}
                      ${isoX - isoOffsetX},${isoY + isoOffsetY - altura}
                      ${isoX - ancho/2 + isoOffsetX},${isoY + largo/2 + isoOffsetY - altura}
                    `}
                    fill={color.stroke}
                    opacity="0.6"
                  />
                  <polygon
                    points={`
                      ${isoX + isoOffsetX},${isoY - isoOffsetY}
                      ${isoX + ancho/2 + isoOffsetX},${isoY + largo/2 - isoOffsetY}
                      ${isoX + ancho/2 + isoOffsetX},${isoY + largo/2 - isoOffsetY - altura}
                      ${isoX + isoOffsetX},${isoY - isoOffsetY - altura}
                    `}
                    fill={color.stroke}
                    opacity="0.6"
                  />
                  {/* Techo */}
                  <polygon
                    points={`
                      ${isoX - isoOffsetX},${isoY + isoOffsetY - altura}
                      ${isoX + isoOffsetX},${isoY - isoOffsetY - altura}
                      ${isoX + ancho/2 + isoOffsetX},${isoY + largo/2 - isoOffsetY - altura}
                      ${isoX - ancho/2 + isoOffsetX},${isoY + largo/2 + isoOffsetY - altura}
                    `}
                    fill={color.fill}
                    stroke={color.stroke}
                    strokeWidth="2"
                    opacity="0.7"
                  />
                  {/* Nombre en el techo */}
                  <text
                    x={isoX}
                    y={isoY - isoOffsetY - altura - 5}
                    textAnchor="middle"
                    fontSize="12"
                    fontWeight="bold"
                    fill={color.text}
                    className="pointer-events-none"
                  >
                    {hab.nombre}
                  </text>
                </g>
              )
            })}

            {/* Líneas de medición */}
            {modoMedir && puntosMedicion.length === 2 && (
              <g>
                <line
                  x1={puntosMedicion[0].x}
                  y1={puntosMedicion[0].y}
                  x2={puntosMedicion[1].x}
                  y2={puntosMedicion[1].y}
                  stroke="#ef4444"
                  strokeWidth="2"
                  strokeDasharray="5,5"
                />
                <text
                  x={(puntosMedicion[0].x + puntosMedicion[1].x) / 2}
                  y={(puntosMedicion[0].y + puntosMedicion[1].y) / 2 - 10}
                  textAnchor="middle"
                  fontSize="12"
                  fill="#ef4444"
                  fontWeight="bold"
                  className="pointer-events-none"
                >
                  {((Math.sqrt(Math.pow(puntosMedicion[1].x - puntosMedicion[0].x, 2) + 
                              Math.pow(puntosMedicion[1].y - puntosMedicion[0].y, 2)) / escala).toFixed(2))}m
                </text>
                <circle cx={puntosMedicion[0].x} cy={puntosMedicion[0].y} r="5" fill="#ef4444" />
                <circle cx={puntosMedicion[1].x} cy={puntosMedicion[1].y} r="5" fill="#ef4444" />
              </g>
            )}

            {/* Colindancias - Paredes compartidas */}
            {capasVisibles.colindancias && colindancias.map((col, idx) => {
              if ('x' in col.pos) {
                return (
                  <g key={`col-${idx}`}>
                    {mostrarParedes && (
                      <>
                        {/* Pared compartida */}
                        <line
                          x1={col.pos.x}
                          y1={col.pos.y1}
                          x2={col.pos.x}
                          y2={col.pos.y2}
                          stroke="#22c55e"
                          strokeWidth={grosorPared}
                          strokeLinecap="round"
                          opacity={0.6}
                        />
                        {/* Etiqueta */}
                        <text
                          x={col.pos.x}
                          y={(col.pos.y1 + col.pos.y2) / 2}
                          textAnchor="middle"
                          dominantBaseline="middle"
                          fontSize="9"
                          fill="#166534"
                          fontWeight="bold"
                          className="pointer-events-none"
                        >
                          COLINDA
                        </text>
                      </>
                    )}
                  </g>
                )
              } else if ('y' in col.pos) {
                return (
                  <g key={`col-${idx}`}>
                    {mostrarParedes && (
                      <>
                        <line
                          x1={(col.pos as any).x1}
                          y1={col.pos.y}
                          x2={(col.pos as any).x2}
                          y2={col.pos.y}
                          stroke="#22c55e"
                          strokeWidth={grosorPared}
                          strokeLinecap="round"
                          opacity={0.6}
                        />
                        <text
                          x={((col.pos as any).x1 + (col.pos as any).x2) / 2}
                          y={col.pos.y}
                          textAnchor="middle"
                          dominantBaseline="middle"
                          fontSize="9"
                          fill="#166534"
                          fontWeight="bold"
                          className="pointer-events-none"
                        >
                          COLINDA
                        </text>
                      </>
                    )}
                  </g>
                )
              }
              return null
            })}

            {/* Anotaciones */}
            {anotaciones.map((anot) => (
              <g key={anot.id}>
                <rect
                  x={anot.x - 50}
                  y={anot.y - 30}
                  width="100"
                  height="60"
                  fill={anot.color}
                  stroke="#f59e0b"
                  strokeWidth="2"
                  rx="4"
                  className="cursor-pointer"
                  onClick={() => {
                    const nuevoTexto = prompt('Editar nota:', anot.texto)
                    if (nuevoTexto !== null) {
                      setAnotaciones(anotaciones.map(a => 
                        a.id === anot.id ? { ...a, texto: nuevoTexto } : a
                      ))
                    }
                  }}
                />
                <text
                  x={anot.x}
                  y={anot.y}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fontSize="10"
                  fill="#92400e"
                  fontWeight="600"
                  className="pointer-events-none"
                >
                  {anot.texto.length > 15 ? anot.texto.substring(0, 15) + '...' : anot.texto}
                </text>
                <circle
                  cx={anot.x + 45}
                  cy={anot.y - 25}
                  r="8"
                  fill="#ef4444"
                  className="cursor-pointer"
                  onClick={() => {
                    setAnotaciones(anotaciones.filter(a => a.id !== anot.id))
                    toast.success('Anotación eliminada')
                  }}
                >
                  <title>Eliminar</title>
                </circle>
                <text
                  x={anot.x + 45}
                  y={anot.y - 25}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fontSize="8"
                  fill="white"
                  fontWeight="bold"
                  className="pointer-events-none"
                >
                  ×
                </text>
              </g>
            ))}

            {/* Habitaciones (vista 2D) */}
            {!vista3D && habitaciones.map((hab) => {
              // Filtrar por capas de visibilidad
              if (!capasVisibles[hab.tipo]) return null
              const habPos = posiciones[hab.id] || posicionesIniciales[hab.id]
              if (!habPos) return null

              const ancho = parseFloat(hab.ancho || '0') * escala || 100
              const largo = parseFloat(hab.largo || '0') * escala || 80
              const color = colores[hab.tipo] || colores.otros

              const anchoDisplay = hab.ancho || `${Math.sqrt(parseFloat(hab.metrosCuadrados || '0')).toFixed(1)}`
              const largoDisplay = hab.largo || `${Math.sqrt(parseFloat(hab.metrosCuadrados || '0')).toFixed(1)}`

              return (
                <g
                  key={hab.id}
                  style={{ cursor: modoEdicion ? 'grab' : 'pointer' }}
                  onMouseDown={(e) => handleMouseDown(e, hab.id)}
                  onClick={(e) => {
                    e.stopPropagation()
                    if (!modoEdicion && onEditHabitacion) {
                      setHabitacionSeleccionada(hab.id)
                      onEditHabitacion(hab)
                    }
                  }}
                  onContextMenu={(e) => {
                    e.preventDefault()
                    if (modoEdicion) {
                      rotarHabitacion(hab.id)
                    }
                  }}
                >
                  {/* Sombra */}
                  <rect
                    x={habPos.x + 4}
                    y={habPos.y + 4}
                    width={ancho}
                    height={largo}
                    fill="rgba(0,0,0,0.1)"
                    rx="6"
                    filter="url(#shadow)"
                  />

                  {/* Habitación */}
                  <rect
                    x={habPos.x}
                    y={habPos.y}
                    width={ancho}
                    height={largo}
                    fill={habitacionSeleccionada === hab.id ? color.fill + 'DD' : color.fill}
                    stroke={habitacionSeleccionada === hab.id ? '#3b82f6' : color.stroke}
                    strokeWidth={habitacionSeleccionada === hab.id ? "5" : (modoEdicion ? "4" : "3")}
                    rx="6"
                    className={modoEdicion ? 'hover:opacity-80 transition-opacity cursor-grab' : 'cursor-pointer'}
                  />

                  {/* Paredes visibles */}
                  {mostrarParedes && (
                    <>
                      {/* Pared superior */}
                      <line
                        x1={habPos.x}
                        y1={habPos.y}
                        x2={habPos.x + ancho}
                        y2={habPos.y}
                        stroke="#374151"
                        strokeWidth={grosorPared}
                        strokeLinecap="round"
                        opacity={0.8}
                      />
                      {/* Pared inferior */}
                      <line
                        x1={habPos.x}
                        y1={habPos.y + largo}
                        x2={habPos.x + ancho}
                        y2={habPos.y + largo}
                        stroke="#374151"
                        strokeWidth={grosorPared}
                        strokeLinecap="round"
                        opacity={0.8}
                      />
                      {/* Pared izquierda */}
                      <line
                        x1={habPos.x}
                        y1={habPos.y}
                        x2={habPos.x}
                        y2={habPos.y + largo}
                        stroke="#374151"
                        strokeWidth={grosorPared}
                        strokeLinecap="round"
                        opacity={0.8}
                      />
                      {/* Pared derecha */}
                      <line
                        x1={habPos.x + ancho}
                        y1={habPos.y}
                        x2={habPos.x + ancho}
                        y2={habPos.y + largo}
                        stroke="#374151"
                        strokeWidth={grosorPared}
                        strokeLinecap="round"
                        opacity={0.8}
                      />
                    </>
                  )}

                  {/* Puertas y Ventanas */}
                  {capasVisibles.puertasVentanas && hab.puertasVentanas?.map((pv) => {
                    const anchoPVReal = pv.ancho || (pv.tipo === 'puerta' ? 0.9 : 1.2)
                    const anchoPV = anchoPVReal * escala
                    
                    let x = 0
                    let y = 0
                    let anchoRect = 0
                    let altoRect = 0

                    switch (pv.pared) {
                      case 'superior':
                        x = habPos.x + (ancho * pv.posicion / 100) - anchoPV / 2
                        y = habPos.y - grosorPared / 2
                        anchoRect = anchoPV
                        altoRect = grosorPared
                        break
                      case 'inferior':
                        x = habPos.x + (ancho * pv.posicion / 100) - anchoPV / 2
                        y = habPos.y + largo - grosorPared / 2
                        anchoRect = anchoPV
                        altoRect = grosorPared
                        break
                      case 'izquierda':
                        x = habPos.x - grosorPared / 2
                        y = habPos.y + (largo * pv.posicion / 100) - anchoPV / 2
                        anchoRect = grosorPared
                        altoRect = anchoPV
                        break
                      case 'derecha':
                        x = habPos.x + ancho - grosorPared / 2
                        y = habPos.y + (largo * pv.posicion / 100) - anchoPV / 2
                        anchoRect = grosorPared
                        altoRect = anchoPV
                        break
                    }

                    const centerX = x + anchoRect / 2
                    const centerY = y + altoRect / 2

                    return (
                      <g key={`pv-${pv.id}`}>
                        {/* Abertura en la pared */}
                        <rect
                          x={x}
                          y={y}
                          width={anchoRect}
                          height={altoRect}
                          fill={pv.tipo === 'puerta' ? '#ffffff' : '#e0f2fe'}
                          stroke={pv.tipo === 'puerta' ? '#1f2937' : '#0284c7'}
                          strokeWidth={pv.tipo === 'puerta' ? "3" : "2"}
                          strokeDasharray={pv.tipo === 'ventana' ? '3,2' : '0'}
                          rx="2"
                          className="pointer-events-none"
                        />
                        {/* Símbolo */}
                        <text
                          x={centerX}
                          y={centerY}
                          textAnchor="middle"
                          dominantBaseline="middle"
                          fontSize={pv.tipo === 'puerta' ? "16" : "14"}
                          fill={pv.tipo === 'puerta' ? '#374151' : '#0284c7'}
                          fontWeight="bold"
                          className="pointer-events-none"
                        >
                          {pv.tipo === 'puerta' ? '🚪' : '🪟'}
                        </text>
                        {/* Etiqueta con medidas */}
                        {(pv.ancho || pv.alto) && (
                          <text
                            x={centerX}
                            y={pv.pared === 'superior' || pv.pared === 'inferior' 
                              ? (pv.pared === 'superior' ? y - 6 : y + altoRect + 14)
                              : (pv.pared === 'izquierda' ? x - 10 : x + anchoRect + 10)}
                            textAnchor={pv.pared === 'superior' || pv.pared === 'inferior' ? "middle" : (pv.pared === 'izquierda' ? "end" : "start")}
                            dominantBaseline={pv.pared === 'superior' || pv.pared === 'inferior' ? "auto" : "middle"}
                            fontSize="9"
                            fill="#6b7280"
                            fontWeight="600"
                            className="pointer-events-none"
                          >
                            {anchoPVReal}m
                          </text>
                        )}
                      </g>
                    )
                  })}

                  {/* Medidas - Ancho (superior) */}
                  {capasVisibles.medidas && (
                  <g className="pointer-events-none">
                    <line
                      x1={habPos.x}
                      y1={habPos.y - 20}
                      x2={habPos.x + ancho}
                      y2={habPos.y - 20}
                      stroke="#1f2937"
                      strokeWidth="2"
                      markerEnd="url(#arrow-end)"
                      markerStart="url(#arrow-start)"
                    />
                    <text
                      x={habPos.x + ancho / 2}
                      y={habPos.y - 23}
                      textAnchor="middle"
                      dominantBaseline="middle"
                      fontSize="12"
                      fontWeight="bold"
                      fill="#111827"
                      className="font-mono"
                    >
                      {anchoDisplay}m
                    </text>
                  </g>
                  )}

                  {/* Medidas - Largo (lateral izquierdo) */}
                  {capasVisibles.medidas && (
                  <g className="pointer-events-none">
                    <line
                      x1={habPos.x - 20}
                      y1={habPos.y}
                      x2={habPos.x - 20}
                      y2={habPos.y + largo}
                      stroke="#1f2937"
                      strokeWidth="2"
                      markerEnd="url(#arrow-end-vert)"
                      markerStart="url(#arrow-start-vert)"
                    />
                    <text
                      x={habPos.x - 30}
                      y={habPos.y + largo / 2}
                      textAnchor="middle"
                      dominantBaseline="middle"
                      fontSize="12"
                      fontWeight="bold"
                      fill="#111827"
                      className="font-mono"
                      transform={`rotate(-90 ${habPos.x - 30} ${habPos.y + largo / 2})`}
                    >
                      {largoDisplay}m
                    </text>
                  </g>
                  )}

                  {/* Nombre y m² en el centro */}
                  <text
                    x={habPos.x + ancho / 2}
                    y={habPos.y + largo / 2 - 10}
                    textAnchor="middle"
                    dominantBaseline="middle"
                    fontSize="16"
                    fontWeight="bold"
                    fill={color.text}
                    className="pointer-events-none"
                  >
                    {hab.nombre}
                  </text>
                  <text
                    x={habPos.x + ancho / 2}
                    y={habPos.y + largo / 2 + 12}
                    textAnchor="middle"
                    dominantBaseline="middle"
                    fontSize="13"
                    fontWeight="600"
                    fill={color.text}
                    className="pointer-events-none"
                  >
                    {hab.metrosCuadrados} m²
                  </text>

                  {/* Indicador de colindancias */}
                  {hab.colindaCon && hab.colindaCon.length > 0 && (
                    <circle
                      cx={habPos.x + ancho - 10}
                      cy={habPos.y + 10}
                      r="10"
                      fill="#22c55e"
                      stroke="white"
                      strokeWidth="2"
                      className="pointer-events-none"
                    >
                      <title>{hab.colindaCon.length} colindancia(s)</title>
                    </circle>
                  )}

                  {/* Botón de rotación (visible en modo edición) */}
                  {modoEdicion && (
                    <g
                      onClick={(e) => {
                        e.stopPropagation()
                        rotarHabitacion(hab.id)
                      }}
                      style={{ cursor: 'pointer' }}
                    >
                      <circle
                        cx={habPos.x + ancho - 10}
                        cy={habPos.y + largo - 10}
                        r="12"
                        fill="#3b82f6"
                        stroke="white"
                        strokeWidth="2"
                        className="hover:fill-blue-600 transition-colors"
                      />
                      <text
                        x={habPos.x + ancho - 10}
                        y={habPos.y + largo - 10}
                        textAnchor="middle"
                        dominantBaseline="middle"
                        fontSize="12"
                        fill="white"
                        fontWeight="bold"
                        className="pointer-events-none"
                      >
                        ↻
                      </text>
                    </g>
                  )}
                </g>
              )
            })}
          </svg>
        </div>

        {/* Leyenda y ayuda */}
        <div className="mt-4 grid md:grid-cols-2 gap-4">
          <div className="border rounded-lg p-4 bg-slate-50">
            <h4 className="font-semibold mb-3 text-sm text-slate-900 flex items-center gap-2">
              <Info className="h-4 w-4" />
              Leyenda
            </h4>
            <div className="space-y-2 text-xs">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded bg-yellow-100 border-2 border-yellow-500"></div>
                <span>Salón</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded bg-indigo-100 border-2 border-indigo-500"></div>
                <span>Dormitorio</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded bg-pink-100 border-2 border-pink-500"></div>
                <span>Cocina</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded bg-blue-100 border-2 border-blue-500"></div>
                <span>Baño</span>
              </div>
              <div className="flex items-center gap-2 mt-3 pt-2 border-t">
                <span className="text-green-600 font-bold">━━━</span>
                <span>Colindancias (paredes compartidas)</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-gray-600 font-bold">━━━</span>
                <span>Paredes externas</span>
              </div>
            </div>
          </div>
          <div className="border rounded-lg p-4 bg-blue-50">
            <h4 className="font-semibold mb-3 text-xs text-blue-900 flex items-center gap-2">
              💡 Consejos
            </h4>
            <ul className="text-xs text-blue-800 space-y-1">
              <li>• Usa la <strong>rueda del ratón</strong> para hacer zoom</li>
              <li>• <strong>Arrastra el fondo</strong> (fuera de habitaciones) para mover la vista</li>
              <li>• Activa &quot;Editar Posición&quot; para mover habitaciones</li>
              <li>• Haz <strong>clic en una habitación</strong> para editarla</li>
              <li>• <strong>Clic derecho</strong> o botón ↻ para rotar habitación</li>
              <li>• <strong>Snap activado</strong> alinea automáticamente al grid</li>
              <li>• <strong>Exporta PNG</strong> para guardar el plano</li>
              <li>• <strong>Notas</strong>: añade anotaciones haciendo clic</li>
              <li>• <strong>Plantillas</strong>: aplica distribuciones predefinidas</li>
              <li>• <strong>Vista 3D</strong>: visualización isométrica</li>
              <li>• <strong>Verde = colindancias</strong>, gris = paredes externas</li>
              <li>• Líneas con flechas muestran las medidas exactas</li>
            </ul>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
