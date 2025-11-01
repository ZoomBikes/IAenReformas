'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent } from '@/components/ui/card'
import { X } from 'lucide-react'
import { calcularTarima, calcularPintura, type CalculoTarimaInput, type CalculoPinturaInput } from '@/lib/calculos'
import type { Habitacion } from './FormHabitaciones'

type TipoTrabajo = 'cambio_tarima' | 'pintura_paredes' | 'alicatado_azulejos' | 'fontaneria' | 'electricidad' | 'carpinteria' | 'otros'

interface Trabajo {
  id: string
  tipo: TipoTrabajo
  habitacionId?: string // ID de la habitación donde se realiza
  datos: any
  calculo?: any
}

interface FormTrabajosProps {
  trabajos: Trabajo[]
  onChange: (trabajos: Trabajo[]) => void
  habitaciones: Habitacion[]
  datosEspacio: {
    metrosTotales: string
    alturaTechos: string
    estado: 'nuevo' | 'reciente' | 'antiguo'
  }
}

export function FormTrabajos({ trabajos, onChange, habitaciones, datosEspacio }: FormTrabajosProps) {
  const [mostrarFormulario, setMostrarFormulario] = useState(false)
  const [trabajoActual, setTrabajoActual] = useState<TipoTrabajo>('pintura_paredes')

  const añadirTrabajo = () => {
    const nuevoTrabajo: Trabajo = {
      id: Date.now().toString(),
      tipo: trabajoActual,
      datos: {}
    }
    onChange([...trabajos, nuevoTrabajo])
    setMostrarFormulario(false)
  }

  const eliminarTrabajo = (id: string) => {
    onChange(trabajos.filter(t => t.id !== id))
  }

  const actualizarTrabajo = (id: string, datos: any) => {
    // Obtener datos de la habitación seleccionada
    const habitacion = habitaciones.find(h => h.id === datos.habitacionId)
    
    // Calcular automáticamente cuando hay datos suficientes
    let calculo = null
    
    if (datos.tipo === 'cambio_tarima' && datos.metros && datos.calidad) {
      const input: CalculoTarimaInput = {
        metros: parseFloat(datos.metros),
        calidad: datos.calidad,
        tieneSoladoExistente: datos.tieneSoladoExistente || false,
        perimetro: habitacion?.perimetro ? parseFloat(habitacion.perimetro) : 
                   datos.perimetro ? parseFloat(datos.perimetro) : undefined
      }
      calculo = calcularTarima(input)
    }
    
    if (datos.tipo === 'pintura_paredes' && datos.metrosHabitacion && habitacion?.alturaTechos) {
      const input: CalculoPinturaInput = {
        metrosHabitacion: parseFloat(datos.metrosHabitacion || habitacion.metrosCuadrados),
        alturaTechos: parseFloat(habitacion.alturaTechos),
        perimetro: habitacion?.perimetro ? parseFloat(habitacion.perimetro) :
                   datos.perimetro ? parseFloat(datos.perimetro) : undefined,
        numPuertas: parseInt(habitacion?.numPuertas || datos.numPuertas || '0'),
        numVentanas: parseInt(habitacion?.numVentanas || datos.numVentanas || '0'),
        anchoPuerta: datos.anchoPuerta ? parseFloat(datos.anchoPuerta) : undefined,
        altoPuerta: datos.altoPuerta ? parseFloat(datos.altoPuerta) : undefined,
        anchoVentana: datos.anchoVentana ? parseFloat(datos.anchoVentana) : undefined,
        altoVentana: datos.altoVentana ? parseFloat(datos.altoVentana) : undefined,
        necesitaAlisado: datos.necesitaAlisado || false,
        calidad: datos.calidad || 'estandar',
        numManos: parseInt(datos.numManos || '2')
      }
      calculo = calcularPintura(input)
    }

    onChange(
      trabajos.map(t => 
        t.id === id 
          ? { ...t, datos: { ...t.datos, ...datos }, calculo, habitacionId: datos.habitacionId }
          : t
      )
    )
  }

  const tiposTrabajo = [
    { value: 'pintura_paredes', label: '🎨 Pintura de Paredes', icon: '🎨' },
    { value: 'cambio_tarima', label: '🪵 Cambio de Tarima/Suelo', icon: '🪵' },
    { value: 'alicatado_azulejos', label: '🧱 Alicatado/Azulejos', icon: '🧱' },
    { value: 'fontaneria', label: '🚿 Fontanería', icon: '🚿' },
    { value: 'electricidad', label: '⚡ Electricidad', icon: '⚡' },
    { value: 'carpinteria', label: '🪚 Carpintería', icon: '🪚' },
    { value: 'otros', label: '🔧 Otros', icon: '🔧' },
  ]

  return (
    <div className="space-y-4">
      <div className="mb-4">
        <p className="text-sm text-muted-foreground mb-2">
          Añade los trabajos que se realizarán. <strong>Selecciona la habitación</strong> para cada trabajo 
          y el sistema usará las medidas exactas de esa habitación.
        </p>
        {habitaciones.length === 0 && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mt-2">
            <p className="text-sm text-yellow-900">
              ⚠️ <strong>Atención:</strong> Necesitas definir al menos una habitación en el paso anterior para poder añadir trabajos.
            </p>
          </div>
        )}
      </div>

      {/* Lista de trabajos añadidos */}
      {trabajos.map((trabajo) => {
        const habitacion = habitaciones.find(h => h.id === trabajo.habitacionId)
        return (
          <Card key={trabajo.id}>
            <CardContent className="p-4">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="font-semibold">
                    {tiposTrabajo.find(t => t.value === trabajo.tipo)?.icon} {' '}
                    {tiposTrabajo.find(t => t.value === trabajo.tipo)?.label}
                  </h3>
                  {habitacion && (
                    <p className="text-sm text-muted-foreground mt-1">
                      📍 {habitacion.nombre}
                    </p>
                  )}
                  {trabajo.calculo && (
                    <p className="text-sm font-medium text-green-700 mt-1">
                      Total: €{trabajo.calculo.total.toFixed(2)}
                    </p>
                  )}
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => eliminarTrabajo(trabajo.id)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>

              {/* Formulario específico según tipo */}
              {trabajo.tipo === 'cambio_tarima' && (
                <FormTarima
                  datos={trabajo.datos}
                  habitacion={habitacion}
                  habitaciones={habitaciones}
                  onChange={(d: any) => actualizarTrabajo(trabajo.id, { ...trabajo.datos, ...d, tipo: 'cambio_tarima' })}
                />
              )}
              {trabajo.tipo === 'pintura_paredes' && (
                <FormPintura
                  datos={trabajo.datos}
                  habitacion={habitacion}
                  habitaciones={habitaciones}
                  onChange={(d: any) => actualizarTrabajo(trabajo.id, { ...trabajo.datos, ...d, tipo: 'pintura_paredes' })}
                />
              )}
              {trabajo.tipo === 'alicatado_azulejos' && (
                <FormAlicatado
                  datos={trabajo.datos}
                  habitacion={habitacion}
                  habitaciones={habitaciones}
                  onChange={(d: any) => actualizarTrabajo(trabajo.id, { ...trabajo.datos, ...d, tipo: 'alicatado_azulejos' })}
                />
              )}
              {trabajo.tipo === 'fontaneria' && (
                <FormFontaneria
                  datos={trabajo.datos}
                  habitacion={habitacion}
                  habitaciones={habitaciones}
                  onChange={(d: any) => actualizarTrabajo(trabajo.id, { ...trabajo.datos, ...d, tipo: 'fontaneria' })}
                />
              )}
              {trabajo.tipo === 'electricidad' && (
                <FormElectricidad
                  datos={trabajo.datos}
                  habitacion={habitacion}
                  habitaciones={habitaciones}
                  onChange={(d: any) => actualizarTrabajo(trabajo.id, { ...trabajo.datos, ...d, tipo: 'electricidad' })}
                />
              )}
              {trabajo.tipo === 'carpinteria' && (
                <FormCarpinteria
                  datos={trabajo.datos}
                  habitacion={habitacion}
                  habitaciones={habitaciones}
                  onChange={(d: any) => actualizarTrabajo(trabajo.id, { ...trabajo.datos, ...d, tipo: 'carpinteria' })}
                />
              )}
            </CardContent>
          </Card>
        )
      })}

      {/* Botón para añadir trabajo */}
      {habitaciones.length > 0 && !mostrarFormulario && (
        <Button
          variant="outline"
          onClick={() => setMostrarFormulario(true)}
          className="w-full"
          disabled={habitaciones.length === 0}
        >
          + Añadir Trabajo
        </Button>
      )}

      {/* Selector de tipo de trabajo */}
      {mostrarFormulario && habitaciones.length > 0 && (
        <Card>
          <CardContent className="p-4">
            <Label>Tipo de trabajo</Label>
            <div className="grid grid-cols-2 gap-2 mt-2">
              {tiposTrabajo.map((tipo) => (
                <button
                  key={tipo.value}
                  type="button"
                  onClick={() => setTrabajoActual(tipo.value as TipoTrabajo)}
                  className={`p-3 border rounded-lg text-left transition-all ${
                    trabajoActual === tipo.value
                      ? 'border-primary bg-primary/5'
                      : 'border-input hover:border-primary/50'
                  }`}
                >
                  {tipo.label}
                </button>
              ))}
            </div>
            <div className="flex gap-2 mt-4">
              <Button onClick={añadirTrabajo}>Añadir</Button>
              <Button variant="outline" onClick={() => setMostrarFormulario(false)}>
                Cancelar
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

// Selector de habitación (componente reutilizable)
function SelectorHabitacion({ 
  habitaciones, 
  habitacionId, 
  onChange 
}: { 
  habitaciones: Habitacion[]
  habitacionId?: string
  onChange: (id: string) => void
}) {
  if (habitaciones.length === 0) return null

  return (
    <div>
      <Label>Habitación *</Label>
      <select
        value={habitacionId || ''}
        onChange={(e) => onChange(e.target.value)}
        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
        required
      >
        <option value="">Selecciona una habitación</option>
        {habitaciones.map((hab) => (
          <option key={hab.id} value={hab.id}>
            {hab.nombre} ({hab.metrosCuadrados} m², techos: {hab.alturaTechos}m)
          </option>
        ))}
      </select>
      <p className="text-xs text-muted-foreground mt-1">
        El sistema usará las medidas exactas de esta habitación
      </p>
    </div>
  )
}

function FormTarima({ datos, habitacion, habitaciones, onChange }: any) {
  return (
    <div className="space-y-4 mt-4">
      <SelectorHabitacion
        habitaciones={habitaciones}
        habitacionId={datos.habitacionId}
        onChange={(id) => onChange({ habitacionId: id })}
      />
      <div>
        <Label htmlFor="metros-tarima">Metros cuadrados *</Label>
        <Input
          id="metros-tarima"
          type="number"
          step="0.1"
          value={datos.metros || habitacion?.metrosCuadrados || ''}
          onChange={(e) => onChange({ metros: e.target.value })}
          placeholder={habitacion?.metrosCuadrados || "50"}
          required
        />
        {habitacion && (
          <p className="text-xs text-muted-foreground mt-1">
            Valor sugerido de la habitación: {habitacion.metrosCuadrados} m²
          </p>
        )}
      </div>
      <div>
        <Label htmlFor="perimetro-tarima">Perímetro (metros lineales)</Label>
        <Input
          id="perimetro-tarima"
          type="number"
          step="0.1"
          value={datos.perimetro || habitacion?.perimetro || ''}
          onChange={(e) => onChange({ perimetro: e.target.value })}
          placeholder={habitacion?.perimetro || "28"}
        />
        {habitacion?.perimetro && (
          <p className="text-xs text-muted-foreground mt-1">
            Valor de la habitación: {habitacion.perimetro} m
          </p>
        )}
      </div>
      <div>
        <Label>Calidad *</Label>
        <div className="space-y-2 mt-2">
          {['basica', 'estandar', 'premium'].map((calidad) => (
            <label key={calidad} className="flex items-center space-x-2 cursor-pointer">
              <input
                type="radio"
                name="calidad-tarima"
                value={calidad}
                checked={datos.calidad === calidad}
                onChange={(e) => onChange({ calidad: e.target.value })}
                className="w-4 h-4"
              />
              <span className="capitalize">{calidad}</span>
            </label>
          ))}
        </div>
      </div>
      <div>
        <label className="flex items-center space-x-2 cursor-pointer">
          <input
            type="checkbox"
            checked={datos.tieneSoladoExistente || false}
            onChange={(e) => onChange({ tieneSoladoExistente: e.target.checked })}
            className="w-4 h-4"
          />
          <span>Hay solado existente que necesita picarse</span>
        </label>
      </div>
    </div>
  )
}

function FormPintura({ datos, habitacion, habitaciones, onChange }: any) {
  return (
    <div className="space-y-4 mt-4">
      <SelectorHabitacion
        habitaciones={habitaciones}
        habitacionId={datos.habitacionId}
        onChange={(id) => onChange({ habitacionId: id })}
      />
      {habitacion && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
          <p className="text-sm text-blue-900">
            <strong>Datos de la habitación seleccionada:</strong><br />
            - Metros: {habitacion.metrosCuadrados} m²<br />
            - Altura techos: {habitacion.alturaTechos} m<br />
            {habitacion.perimetro && `- Perímetro: ${habitacion.perimetro} m`}<br />
            - {habitacion.numPuertas} puerta(s), {habitacion.numVentanas} ventana(s)
          </p>
        </div>
      )}
      <div>
        <Label htmlFor="metros-pintura">Metros cuadrados de la habitación *</Label>
        <Input
          id="metros-pintura"
          type="number"
          step="0.1"
          value={datos.metrosHabitacion || habitacion?.metrosCuadrados || ''}
          onChange={(e) => onChange({ metrosHabitacion: e.target.value })}
          placeholder={habitacion?.metrosCuadrados || "35"}
          required
        />
      </div>
      <div>
        <Label htmlFor="perimetro-pintura">Perímetro de la habitación (metros lineales)</Label>
        <Input
          id="perimetro-pintura"
          type="number"
          step="0.1"
          value={datos.perimetro || habitacion?.perimetro || ''}
          onChange={(e) => onChange({ perimetro: e.target.value })}
          placeholder={habitacion?.perimetro || "18"}
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="num-puertas">Número de puertas</Label>
          <Input
            id="num-puertas"
            type="number"
            value={datos.numPuertas || habitacion?.numPuertas || '0'}
            onChange={(e) => onChange({ numPuertas: e.target.value })}
            placeholder={habitacion?.numPuertas || "1"}
          />
        </div>
        <div>
          <Label htmlFor="num-ventanas">Número de ventanas</Label>
          <Input
            id="num-ventanas"
            type="number"
            value={datos.numVentanas || habitacion?.numVentanas || '0'}
            onChange={(e) => onChange({ numVentanas: e.target.value })}
            placeholder={habitacion?.numVentanas || "2"}
          />
        </div>
      </div>
      <div>
        <Label>Calidad *</Label>
        <div className="space-y-2 mt-2">
          {['basica', 'estandar', 'premium'].map((calidad) => (
            <label key={calidad} className="flex items-center space-x-2 cursor-pointer">
              <input
                type="radio"
                name="calidad-pintura"
                value={calidad}
                checked={datos.calidad === calidad}
                onChange={(e) => onChange({ calidad: e.target.value })}
                className="w-4 h-4"
              />
              <span className="capitalize">{calidad}</span>
            </label>
          ))}
        </div>
      </div>
      <div>
        <label className="flex items-center space-x-2 cursor-pointer">
          <input
            type="checkbox"
            checked={datos.necesitaAlisado || false}
            onChange={(e) => onChange({ necesitaAlisado: e.target.checked })}
            className="w-4 h-4"
          />
          <span>Necesita alisado previo</span>
        </label>
      </div>
      <div>
        <Label htmlFor="num-manos">Número de manos de pintura *</Label>
        <Input
          id="num-manos"
          type="number"
          min="1"
          max="3"
          value={datos.numManos || '2'}
          onChange={(e) => onChange({ numManos: e.target.value })}
          placeholder="2"
          required
        />
      </div>
    </div>
  )
}

// Placeholders para otros tipos de trabajos (por implementar)
function FormAlicatado({ datos, habitacion, habitaciones, onChange }: any) {
  return (
    <div className="space-y-4 mt-4">
      <SelectorHabitacion
        habitaciones={habitaciones}
        habitacionId={datos.habitacionId}
        onChange={(id) => onChange({ habitacionId: id })}
      />
      <div>
        <Label htmlFor="metros-alicatado">Metros cuadrados a alicatar *</Label>
        <Input
          id="metros-alicatado"
          type="number"
          step="0.1"
          value={datos.metros || ''}
          onChange={(e) => onChange({ metros: e.target.value })}
          placeholder="15"
          required
        />
      </div>
      <div>
        <Label>Calidad *</Label>
        <div className="space-y-2 mt-2">
          {['basica', 'estandar', 'premium'].map((calidad) => (
            <label key={calidad} className="flex items-center space-x-2 cursor-pointer">
              <input
                type="radio"
                name="calidad-alicatado"
                value={calidad}
                checked={datos.calidad === calidad}
                onChange={(e) => onChange({ calidad: e.target.value })}
                className="w-4 h-4"
              />
              <span className="capitalize">{calidad}</span>
            </label>
          ))}
        </div>
      </div>
      <p className="text-xs text-muted-foreground">
        ⚠️ Cálculo de alicatado por implementar
      </p>
    </div>
  )
}

function FormFontaneria({ datos, habitacion, habitaciones, onChange }: any) {
  return (
    <div className="space-y-4 mt-4">
      <SelectorHabitacion
        habitaciones={habitaciones}
        habitacionId={datos.habitacionId}
        onChange={(id) => onChange({ habitacionId: id })}
      />
      <div>
        <Label htmlFor="descripcion-fontaneria">Descripción del trabajo *</Label>
        <textarea
          id="descripcion-fontaneria"
          value={datos.descripcion || ''}
          onChange={(e) => onChange({ descripcion: e.target.value })}
          placeholder="Instalación de grifería, cambio de sanitarios, etc."
          className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
          required
        />
      </div>
      <p className="text-xs text-muted-foreground">
        ⚠️ Cálculo de fontanería por implementar
      </p>
    </div>
  )
}

function FormElectricidad({ datos, habitacion, habitaciones, onChange }: any) {
  return (
    <div className="space-y-4 mt-4">
      <SelectorHabitacion
        habitaciones={habitaciones}
        habitacionId={datos.habitacionId}
        onChange={(id) => onChange({ habitacionId: id })}
      />
      <div>
        <Label htmlFor="descripcion-electricidad">Descripción del trabajo *</Label>
        <textarea
          id="descripcion-electricidad"
          value={datos.descripcion || ''}
          onChange={(e) => onChange({ descripcion: e.target.value })}
          placeholder="Instalación de puntos de luz, enchufes, etc."
          className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
          required
        />
      </div>
      <p className="text-xs text-muted-foreground">
        ⚠️ Cálculo de electricidad por implementar
      </p>
    </div>
  )
}

function FormCarpinteria({ datos, habitacion, habitaciones, onChange }: any) {
  return (
    <div className="space-y-4 mt-4">
      <SelectorHabitacion
        habitaciones={habitaciones}
        habitacionId={datos.habitacionId}
        onChange={(id) => onChange({ habitacionId: id })}
      />
      <div>
        <Label htmlFor="descripcion-carpinteria">Descripción del trabajo *</Label>
        <textarea
          id="descripcion-carpinteria"
          value={datos.descripcion || ''}
          onChange={(e) => onChange({ descripcion: e.target.value })}
          placeholder="Instalación de puertas, muebles, etc."
          className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
          required
        />
      </div>
      <p className="text-xs text-muted-foreground">
        ⚠️ Cálculo de carpintería por implementar
      </p>
    </div>
  )
}
