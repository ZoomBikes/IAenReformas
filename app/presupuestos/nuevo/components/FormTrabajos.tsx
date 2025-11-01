'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent } from '@/components/ui/card'
import { X } from 'lucide-react'
import { calcularTarima, calcularPintura, type CalculoTarimaInput, type CalculoPinturaInput } from '@/lib/calculos'

type TipoTrabajo = 'cambio_tarima' | 'pintura_paredes' | 'azulejos' | 'otros'

interface Trabajo {
  id: string
  tipo: TipoTrabajo
  datos: any
  calculo?: any
}

interface FormTrabajosProps {
  trabajos: Trabajo[]
  onChange: (trabajos: Trabajo[]) => void
  datosEspacio: {
    metrosTotales: string
    alturaTechos: string
    estado: 'nuevo' | 'reciente' | 'antiguo'
  }
}

export function FormTrabajos({ trabajos, onChange, datosEspacio }: FormTrabajosProps) {
  const [mostrarFormulario, setMostrarFormulario] = useState(false)
  const [trabajoActual, setTrabajoActual] = useState<TipoTrabajo>('cambio_tarima')

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
    // Calcular automáticamente cuando hay datos suficientes
    let calculo = null
    
    if (datos.tipo === 'cambio_tarima' && datos.metros && datos.calidad) {
      const input: CalculoTarimaInput = {
        metros: parseFloat(datos.metros),
        calidad: datos.calidad,
        tieneSoladoExistente: datos.tieneSoladoExistente || false,
        perimetro: datos.perimetro ? parseFloat(datos.perimetro) : undefined
      }
      calculo = calcularTarima(input)
    }
    
    if (datos.tipo === 'pintura_paredes' && datos.metrosHabitacion && datos.alturaTechos) {
      const input: CalculoPinturaInput = {
        metrosHabitacion: parseFloat(datos.metrosHabitacion),
        alturaTechos: parseFloat(datos.alturaTechos),
        perimetro: datos.perimetro ? parseFloat(datos.perimetro) : undefined,
        numPuertas: parseInt(datos.numPuertas || '0'),
        numVentanas: parseInt(datos.numVentanas || '0'),
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
          ? { ...t, datos: { ...t.datos, ...datos }, calculo }
          : t
      )
    )
  }

  return (
    <div className="space-y-4">
      {/* Lista de trabajos añadidos */}
      {trabajos.map((trabajo) => (
        <Card key={trabajo.id}>
          <CardContent className="p-4">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="font-semibold">
                  {trabajo.tipo === 'cambio_tarima' && '🪵 Cambio de Tarima'}
                  {trabajo.tipo === 'pintura_paredes' && '🎨 Pintura de Paredes'}
                  {trabajo.tipo === 'azulejos' && '🧱 Azulejos'}
                  {trabajo.tipo === 'otros' && '🔧 Otros'}
                </h3>
                {trabajo.calculo && (
                  <p className="text-sm text-muted-foreground">
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
                onChange={(d) => actualizarTrabajo(trabajo.id, { ...trabajo.datos, ...d, tipo: 'cambio_tarima' })}
              />
            )}
            {trabajo.tipo === 'pintura_paredes' && (
              <FormPintura
                datos={trabajo.datos}
                onChange={(d) => actualizarTrabajo(trabajo.id, { ...trabajo.datos, ...d, tipo: 'pintura_paredes' })}
                alturaTechos={datosEspacio.alturaTechos}
              />
            )}
          </CardContent>
        </Card>
      ))}

      {/* Botón para añadir trabajo */}
      {!mostrarFormulario && (
        <Button
          variant="outline"
          onClick={() => setMostrarFormulario(true)}
          className="w-full"
        >
          + Añadir Trabajo
        </Button>
      )}

      {/* Selector de tipo de trabajo */}
      {mostrarFormulario && (
        <Card>
          <CardContent className="p-4">
            <Label>Tipo de trabajo</Label>
            <div className="grid grid-cols-2 gap-2 mt-2">
              {[
                { value: 'cambio_tarima', label: '🪵 Cambio de Tarima' },
                { value: 'pintura_paredes', label: '🎨 Pintura' },
                { value: 'azulejos', label: '🧱 Azulejos' },
                { value: 'otros', label: '🔧 Otros' },
              ].map((tipo) => (
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

function FormTarima({ datos, onChange }: { datos: any, onChange: (d: any) => void }) {
  return (
    <div className="space-y-4 mt-4">
      <div>
        <Label htmlFor="metros-tarima">Metros cuadrados *</Label>
        <Input
          id="metros-tarima"
          type="number"
          step="0.1"
          value={datos.metros || ''}
          onChange={(e) => onChange({ metros: e.target.value })}
          placeholder="50"
          required
        />
      </div>
      <div>
        <Label htmlFor="perimetro-tarima">Perímetro (metros lineales)</Label>
        <Input
          id="perimetro-tarima"
          type="number"
          step="0.1"
          value={datos.perimetro || ''}
          onChange={(e) => onChange({ perimetro: e.target.value })}
          placeholder="28"
        />
        <p className="text-xs text-muted-foreground mt-1">
          Si no se conoce, se calculará aproximado. Especificar para mayor exactitud.
        </p>
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

function FormPintura({ datos, onChange, alturaTechos }: { datos: any, onChange: (d: any) => void, alturaTechos: string }) {
  return (
    <div className="space-y-4 mt-4">
      <div>
        <Label htmlFor="metros-pintura">Metros cuadrados de la habitación *</Label>
        <Input
          id="metros-pintura"
          type="number"
          step="0.1"
          value={datos.metrosHabitacion || ''}
          onChange={(e) => onChange({ metrosHabitacion: e.target.value })}
          placeholder="35"
          required
        />
      </div>
      <div>
        <Label htmlFor="altura-techos-pintura">Altura de techos (metros) *</Label>
        <Input
          id="altura-techos-pintura"
          type="number"
          step="0.1"
          value={datos.alturaTechos || alturaTechos}
          onChange={(e) => onChange({ alturaTechos: e.target.value })}
          placeholder={alturaTechos || "2.70"}
          required
        />
      </div>
      <div>
        <Label htmlFor="perimetro-pintura">Perímetro de la habitación (metros lineales)</Label>
        <Input
          id="perimetro-pintura"
          type="number"
          step="0.1"
          value={datos.perimetro || ''}
          onChange={(e) => onChange({ perimetro: e.target.value })}
          placeholder="18"
        />
        <p className="text-xs text-muted-foreground mt-1">
          Suma de todos los lados. Si no se conoce, se calculará aproximado.
        </p>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="num-puertas">Número de puertas</Label>
          <Input
            id="num-puertas"
            type="number"
            value={datos.numPuertas || ''}
            onChange={(e) => onChange({ numPuertas: e.target.value })}
            placeholder="1"
          />
        </div>
        <div>
          <Label htmlFor="num-ventanas">Número de ventanas</Label>
          <Input
            id="num-ventanas"
            type="number"
            value={datos.numVentanas || ''}
            onChange={(e) => onChange({ numVentanas: e.target.value })}
            placeholder="2"
          />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="ancho-puerta">Ancho puerta (metros)</Label>
          <Input
            id="ancho-puerta"
            type="number"
            step="0.1"
            value={datos.anchoPuerta || ''}
            onChange={(e) => onChange({ anchoPuerta: e.target.value })}
            placeholder="0.9"
          />
        </div>
        <div>
          <Label htmlFor="alto-puerta">Alto puerta (metros)</Label>
          <Input
            id="alto-puerta"
            type="number"
            step="0.1"
            value={datos.altoPuerta || ''}
            onChange={(e) => onChange({ altoPuerta: e.target.value })}
            placeholder="2.1"
          />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="ancho-ventana">Ancho ventana (metros)</Label>
          <Input
            id="ancho-ventana"
            type="number"
            step="0.1"
            value={datos.anchoVentana || ''}
            onChange={(e) => onChange({ anchoVentana: e.target.value })}
            placeholder="1.2"
          />
        </div>
        <div>
          <Label htmlFor="alto-ventana">Alto ventana (metros)</Label>
          <Input
            id="alto-ventana"
            type="number"
            step="0.1"
            value={datos.altoVentana || ''}
            onChange={(e) => onChange({ altoVentana: e.target.value })}
            placeholder="1.5"
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

