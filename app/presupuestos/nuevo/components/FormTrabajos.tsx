'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { X, Plus } from 'lucide-react'
import { toast } from 'sonner'
import { calcularTarima, calcularPintura, type CalculoTarimaInput, type CalculoPinturaInput } from '@/lib/calculos'
import type { Habitacion } from './FormHabitaciones'

type TipoServicio = 'pintura_paredes' | 'cambio_tarima' | 'alicatado_azulejos' | 'fontaneria' | 'electricidad' | 'carpinteria' | 'otros'

interface Servicio {
  id: string
  tipo: TipoServicio
  precioPorMetro?: number // Precio personalizable por m²
  precioTotal?: number // Precio fijo total
  datos: any
  calculo?: any
}

interface ServiciosPorHabitacion {
  habitacionId: string
  servicios: Servicio[]
}

interface FormTrabajosProps {
  trabajos: ServiciosPorHabitacion[]
  onChange: (trabajos: ServiciosPorHabitacion[]) => void
  habitaciones: Habitacion[]
  datosEspacio: {
    metrosTotales: string
    alturaTechos: string
    estado: 'nuevo' | 'reciente' | 'antiguo'
  }
}

export function FormTrabajos({ trabajos, onChange, habitaciones, datosEspacio }: FormTrabajosProps) {
  // Si no hay trabajos inicializados para las habitaciones, inicializarlos
  const trabajosInicializados = trabajos.length === 0 && habitaciones.length > 0
    ? habitaciones.map(h => ({ habitacionId: h.id, servicios: [] }))
    : trabajos

  const añadirServicioAHabitacion = (habitacionId: string, tipoServicio: TipoServicio) => {
    const nuevoServicio: Servicio = {
      id: Date.now().toString(),
      tipo: tipoServicio,
      datos: {}
    }

    const trabajosActualizados = trabajosInicializados.map(t => 
      t.habitacionId === habitacionId
        ? { ...t, servicios: [...t.servicios, nuevoServicio] }
        : t
    )

    // Si la habitación no tenía entrada, añadirla
    if (!trabajosActualizados.find(t => t.habitacionId === habitacionId)) {
      trabajosActualizados.push({ habitacionId, servicios: [nuevoServicio] })
    }

    onChange(trabajosActualizados)
    
    const habitacion = habitaciones.find(h => h.id === habitacionId)
    const tiposNombre: Record<string, string> = {
      pintura_paredes: 'Pintura',
      cambio_tarima: 'Tarima',
      alicatado_azulejos: 'Alicatado',
      fontaneria: 'Fontanería',
      electricidad: 'Electricidad',
      carpinteria: 'Carpintería',
      otros: 'Otros trabajos'
    }
    
    toast.success(`Servicio añadido`, {
      description: `${tiposNombre[tipoServicio]} en ${habitacion?.nombre || 'habitación'}`,
      duration: 2000
    })
  }

  const eliminarServicio = (habitacionId: string, servicioId: string) => {
    const trabajo = trabajosInicializados.find(t => t.habitacionId === habitacionId)
    const servicio = trabajo?.servicios.find(s => s.id === servicioId)
    const habitacion = habitaciones.find(h => h.id === habitacionId)
    
    if (!servicio) return
    
    // Confirmación antes de eliminar
    if (window.confirm(`¿Eliminar ${servicio.tipo.replace('_', ' ')} en ${habitacion?.nombre || 'habitación'}?`)) {
      onChange(
        trabajosInicializados.map(t =>
          t.habitacionId === habitacionId
            ? { ...t, servicios: t.servicios.filter(s => s.id !== servicioId) }
            : t
        )
      )
      toast.success('Servicio eliminado')
    }
  }

  const actualizarServicio = (habitacionId: string, servicioId: string, datos: any) => {
    const habitacion = habitaciones.find(h => h.id === habitacionId)
    const servicio = trabajosInicializados
      .find(t => t.habitacionId === habitacionId)
      ?.servicios.find(s => s.id === servicioId)

    if (!servicio) return

    // Calcular automáticamente cuando hay datos suficientes
    let calculo = null
    let precioTotal = 0

    // Si hay precio personalizado por m², calcular total
    if (datos.precioPorMetro && habitacion) {
      const metros = parseFloat(habitacion.metrosCuadrados) || 0
      precioTotal = metros * parseFloat(datos.precioPorMetro)
      calculo = {
        subtotal: precioTotal,
        iva: precioTotal * 0.21,
        total: precioTotal * 1.21,
        componentes: [{
          nombre: `${servicio.tipo}`,
          cantidad: metros,
          unidad: 'm²',
          precioUnitario: parseFloat(datos.precioPorMetro),
          precioTotal: precioTotal
        }]
      }
    }

    // Cálculos específicos si no hay precio personalizado
    if (!datos.precioPorMetro) {
      if (servicio.tipo === 'cambio_tarima' && datos.metros && datos.calidad) {
        const input: CalculoTarimaInput = {
          metros: parseFloat(datos.metros),
          calidad: datos.calidad,
          tieneSoladoExistente: datos.tieneSoladoExistente || false,
          perimetro: habitacion?.perimetro ? parseFloat(habitacion.perimetro) : undefined
        }
        calculo = calcularTarima(input)
        // Si hay precio personalizado, sobrescribir
        if (datos.precioPorMetro) {
          const metros = parseFloat(datos.metros)
          precioTotal = metros * parseFloat(datos.precioPorMetro)
          calculo.subtotal = precioTotal
          calculo.iva = precioTotal * 0.21
          calculo.total = precioTotal * 1.21
        }
      }
      
      if (servicio.tipo === 'pintura_paredes' && habitacion?.alturaTechos) {
        const input: CalculoPinturaInput = {
          metrosHabitacion: parseFloat(habitacion.metrosCuadrados),
          alturaTechos: parseFloat(habitacion.alturaTechos),
          perimetro: habitacion?.perimetro ? parseFloat(habitacion.perimetro) : undefined,
          numPuertas: parseInt(habitacion?.numPuertas || '0'),
          numVentanas: parseInt(habitacion?.numVentanas || '0'),
          necesitaAlisado: datos.necesitaAlisado || false,
          calidad: datos.calidad || 'estandar',
          numManos: parseInt(datos.numManos || '2')
        }
        calculo = calcularPintura(input)
        // Si hay precio personalizado, sobrescribir
        if (datos.precioPorMetro) {
          const superficie = calcularSuperficiePintura(input)
          precioTotal = superficie * parseFloat(datos.precioPorMetro)
          calculo.subtotal = precioTotal
          calculo.iva = precioTotal * 0.21
          calculo.total = precioTotal * 1.21
        }
      }
    }

    onChange(
      trabajosInicializados.map(t =>
        t.habitacionId === habitacionId
          ? {
              ...t,
              servicios: t.servicios.map(s =>
                s.id === servicioId
                  ? { ...s, datos: { ...s.datos, ...datos }, calculo, precioTotal }
                  : s
              )
            }
          : t
      )
    )
  }

  const tiposServicio: Array<{ value: TipoServicio, label: string, icon: string }> = [
    { value: 'pintura_paredes', label: '🎨 Pintura', icon: '🎨' },
    { value: 'cambio_tarima', label: '🪵 Tarima/Suelo', icon: '🪵' },
    { value: 'alicatado_azulejos', label: '🧱 Alicatado', icon: '🧱' },
    { value: 'fontaneria', label: '🚿 Fontanería', icon: '🚿' },
    { value: 'electricidad', label: '⚡ Electricidad', icon: '⚡' },
    { value: 'carpinteria', label: '🪚 Carpintería', icon: '🪚' },
    { value: 'otros', label: '🔧 Otros', icon: '🔧' },
  ]

  function calcularSuperficiePintura(input: CalculoPinturaInput): number {
    const perimetro = input.perimetro || Math.sqrt(input.metrosHabitacion) * 4
    const superficieBruta = perimetro * input.alturaTechos
    const superficiePuertas = (input.numPuertas || 0) * 1.89 // 0.9 * 2.1
    const superficieVentanas = (input.numVentanas || 0) * 1.8 // 1.2 * 1.5
    return Math.max(superficieBruta - superficiePuertas - superficieVentanas, input.metrosHabitacion * 2.5)
  }

  if (habitaciones.length === 0) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <p className="text-sm text-yellow-900">
          ⚠️ <strong>Atención:</strong> Necesitas definir al menos una habitación en el paso anterior.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="mb-4">
        <p className="text-sm text-muted-foreground">
          Añade los <strong>servicios</strong> que se realizarán en cada habitación. Puedes añadir <strong>múltiples servicios</strong> por habitación.
        </p>
      </div>

      {habitaciones.map((habitacion) => {
        const serviciosHabitacion = trabajosInicializados.find(t => t.habitacionId === habitacion.id)?.servicios || []
        return (
          <Card key={habitacion.id}>
            <CardHeader>
              <CardTitle className="text-lg">
                🏠 {habitacion.nombre} ({habitacion.metrosCuadrados} m²)
              </CardTitle>
            </CardHeader>
            <CardContent>
              {/* Servicios existentes */}
              {serviciosHabitacion.map((servicio) => (
                <Card key={servicio.id} className="mb-4">
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h4 className="font-semibold">
                          {tiposServicio.find(t => t.value === servicio.tipo)?.icon} {' '}
                          {tiposServicio.find(t => t.value === servicio.tipo)?.label}
                        </h4>
                        {servicio.calculo && (
                          <p className="text-sm font-medium text-green-700 mt-1">
                            Total: €{servicio.calculo.total.toFixed(2)}
                          </p>
                        )}
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => eliminarServicio(habitacion.id, servicio.id)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>

                    {/* Campo de precio personalizable por m² */}
                    <div className="mb-4">
                      <Label htmlFor={`precio-${servicio.id}`}>
                        💰 Precio por metro cuadrado (personalizable) *
                      </Label>
                      <Input
                        id={`precio-${servicio.id}`}
                        type="number"
                        step="0.01"
                        value={servicio.precioPorMetro || servicio.datos.precioPorMetro || ''}
                        onChange={(e) => {
                          const precio = parseFloat(e.target.value)
                          actualizarServicio(habitacion.id, servicio.id, { 
                            ...servicio.datos, 
                            precioPorMetro: precio 
                          })
                        }}
                        placeholder="45.00"
                        required
                      />
                      <p className="text-xs text-muted-foreground mt-1">
                        Este precio se multiplicará por los m² de la habitación ({habitacion.metrosCuadrados} m²)
                      </p>
                      {servicio.precioPorMetro && habitacion.metrosCuadrados && (
                        <p className="text-xs text-green-700 mt-1">
                          Total: €{(parseFloat(habitacion.metrosCuadrados) * servicio.precioPorMetro).toFixed(2)}
                        </p>
                      )}
                    </div>

                    {/* Formulario específico según tipo (opcional - para ajustes adicionales) */}
                    {servicio.tipo === 'pintura_paredes' && (
                      <div className="space-y-2">
                        <label className="flex items-center space-x-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={servicio.datos.necesitaAlisado || false}
                            onChange={(e) => actualizarServicio(habitacion.id, servicio.id, {
                              ...servicio.datos,
                              necesitaAlisado: e.target.checked,
                              precioPorMetro: servicio.datos.precioPorMetro || servicio.precioPorMetro
                            })}
                            className="w-4 h-4"
                          />
                          <span className="text-sm">Necesita alisado previo</span>
                        </label>
                      </div>
                    )}

                    {servicio.tipo === 'cambio_tarima' && (
                      <div className="space-y-2">
                        <label className="flex items-center space-x-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={servicio.datos.tieneSoladoExistente || false}
                            onChange={(e) => actualizarServicio(habitacion.id, servicio.id, {
                              ...servicio.datos,
                              tieneSoladoExistente: e.target.checked,
                              precioPorMetro: servicio.datos.precioPorMetro || servicio.precioPorMetro
                            })}
                            className="w-4 h-4"
                          />
                          <span className="text-sm">Hay solado existente que necesita picarse</span>
                        </label>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}

              {/* Botón para añadir servicio a esta habitación */}
              <div className="mt-4">
                <ServicioSelector
                  habitacionId={habitacion.id}
                  onSeleccionar={(tipo) => añadirServicioAHabitacion(habitacion.id, tipo)}
                  tiposDisponibles={tiposServicio}
                />
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}

function ServicioSelector({ 
  habitacionId, 
  onSeleccionar, 
  tiposDisponibles 
}: { 
  habitacionId: string
  onSeleccionar: (tipo: TipoServicio) => void
  tiposDisponibles: Array<{ value: TipoServicio, label: string, icon: string }>
}) {
  const [mostrar, setMostrar] = useState(false)

  if (!mostrar) {
    return (
      <Button
        variant="outline"
        onClick={() => setMostrar(true)}
        className="w-full"
      >
        <Plus className="h-4 w-4 mr-2" />
        Añadir Servicio a esta Habitación
      </Button>
    )
  }

  return (
    <div className="border border-blue-200/50 rounded-2xl p-6 glass-blue shadow-md">
      <Label className="mb-2 block">Selecciona el tipo de servicio:</Label>
      <div className="grid grid-cols-2 gap-2 mb-4">
        {tiposDisponibles.map((tipo) => (
          <button
            key={tipo.value}
            type="button"
            onClick={() => {
              onSeleccionar(tipo.value)
              setMostrar(false)
            }}
            className="p-3 border rounded-lg text-left transition-all hover:border-primary hover:bg-primary/5"
          >
            <span className="text-lg mr-2">{tipo.icon}</span>
            {tipo.label.replace(/[🎨🪵🧱🚿⚡🪚🔧]/g, '').trim()}
          </button>
        ))}
      </div>
      <Button variant="ghost" size="sm" onClick={() => setMostrar(false)} className="w-full">
        Cancelar
      </Button>
    </div>
  )
}
