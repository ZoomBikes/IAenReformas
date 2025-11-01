'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Plus, X, Edit2 } from 'lucide-react'

export interface Habitacion {
  id: string
  nombre: string
  tipo: 'salon' | 'dormitorio' | 'cocina' | 'bano' | 'pasillo' | 'otros'
  metrosCuadrados: string
  alturaTechos: string
  ancho?: string
  largo?: string
  perimetro?: string
  numPuertas: string
  numVentanas: string
  colindaCon?: string[] // IDs de habitaciones que colindan
  notas?: string
}

interface FormHabitacionesProps {
  habitaciones: Habitacion[]
  onChange: (habitaciones: Habitacion[]) => void
  alturaTechosGeneral: string // Para usar como valor por defecto
}

export function FormHabitaciones({ habitaciones, onChange, alturaTechosGeneral }: FormHabitacionesProps) {
  const [editando, setEditando] = useState<string | null>(null)
  const [mostrarFormulario, setMostrarFormulario] = useState(false)

  const añadirHabitacion = () => {
    const nueva: Habitacion = {
      id: Date.now().toString(),
      nombre: '',
      tipo: 'salon',
      metrosCuadrados: '',
      alturaTechos: alturaTechosGeneral,
      ancho: '',
      largo: '',
      perimetro: '',
      numPuertas: '0',
      numVentanas: '0'
    }
    onChange([...habitaciones, nueva])
    setEditando(nueva.id)
    setMostrarFormulario(false)
  }

  const actualizarHabitacion = (id: string, datos: Partial<Habitacion>) => {
    onChange(
      habitaciones.map(h => 
        h.id === id ? { ...h, ...datos } : h
      )
    )
  }

  const eliminarHabitacion = (id: string) => {
    onChange(habitaciones.filter(h => h.id !== id))
  }

  const tiposHabitacion = [
    { value: 'salon', label: '🏠 Salón', icon: '🏠' },
    { value: 'dormitorio', label: '🛏️ Dormitorio', icon: '🛏️' },
    { value: 'cocina', label: '🍳 Cocina', icon: '🍳' },
    { value: 'bano', label: '🚿 Baño', icon: '🚿' },
    { value: 'pasillo', label: '🚪 Pasillo', icon: '🚪' },
    { value: 'otros', label: '🔧 Otros', icon: '🔧' },
  ]

  return (
    <div className="space-y-4">
      <div className="mb-4">
        <p className="text-sm text-muted-foreground mb-2">
          Define cada habitación con sus medidas exactas. Esto permite cálculos precisos para cada trabajo.
        </p>
        <p className="text-xs text-muted-foreground">
          <strong>Importante:</strong> La altura de techos puede variar por habitación. Si no conoces las medidas exactas, puedes dejarlas en blanco y se usarán aproximaciones.
        </p>
      </div>

      {/* Lista de habitaciones */}
      {habitaciones.map((habitacion) => (
        <Card key={habitacion.id}>
          <CardContent className="p-4">
            {editando === habitacion.id ? (
              <FormHabitacionDetalle
                habitacion={habitacion}
                todasHabitaciones={habitaciones}
                onSave={(datos) => {
                  actualizarHabitacion(habitacion.id, datos)
                  setEditando(null)
                }}
                onCancel={() => setEditando(null)}
              />
            ) : (
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <h3 className="font-semibold">
                    {tiposHabitacion.find(t => t.value === habitacion.tipo)?.icon} {habitacion.nombre || 'Habitación sin nombre'}
                  </h3>
                  <div className="text-sm text-muted-foreground mt-1 space-y-1">
                    <p>{habitacion.metrosCuadrados} m²</p>
                    {habitacion.alturaTechos && (
                      <p>Altura techos: {habitacion.alturaTechos} m</p>
                    )}
                    {habitacion.perimetro && (
                      <p>Perímetro: {habitacion.perimetro} m</p>
                    )}
                    {(habitacion.numPuertas !== '0' || habitacion.numVentanas !== '0') && (
                      <p>
                        {habitacion.numPuertas} puerta(s), {habitacion.numVentanas} ventana(s)
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setEditando(habitacion.id)}
                  >
                    <Edit2 className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => eliminarHabitacion(habitacion.id)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      ))}

      {/* Botón para añadir habitación */}
      {!mostrarFormulario && (
        <Button
          variant="outline"
          onClick={añadirHabitacion}
          className="w-full"
        >
          <Plus className="h-4 w-4 mr-2" />
          Añadir Habitación
        </Button>
      )}
    </div>
  )
}

function FormHabitacionDetalle({ 
  habitacion, 
  onSave, 
  onCancel,
  todasHabitaciones
}: { 
  habitacion: Habitacion
  onSave: (datos: Partial<Habitacion>) => void
  onCancel: () => void
  todasHabitaciones: Habitacion[]
}) {
  const [datos, setDatos] = useState(habitacion)

  const tiposHabitacion = [
    { value: 'salon', label: '🏠 Salón' },
    { value: 'dormitorio', label: '🛏️ Dormitorio' },
    { value: 'cocina', label: '🍳 Cocina' },
    { value: 'bano', label: '🚿 Baño' },
    { value: 'pasillo', label: '🚪 Pasillo' },
    { value: 'otros', label: '🔧 Otros' },
  ]

  // Calcular metros cuadrados y perímetro si hay ancho y largo
  const calcularDesdeMedidas = () => {
    if (datos.ancho && datos.largo) {
      const ancho = parseFloat(datos.ancho)
      const largo = parseFloat(datos.largo)
      if (!isNaN(ancho) && !isNaN(largo)) {
        const metrosCuadrados = (ancho * largo).toFixed(2)
        const perimetro = ((ancho + largo) * 2).toFixed(2)
        setDatos({ 
          ...datos, 
          metrosCuadrados: metrosCuadrados,
          perimetro: perimetro
        })
      }
    }
  }

  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="nombre-hab">Nombre de la habitación *</Label>
        <Input
          id="nombre-hab"
          value={datos.nombre}
          onChange={(e) => setDatos({ ...datos, nombre: e.target.value })}
          placeholder="Salón principal, Dormitorio 1, etc."
          required
        />
      </div>

      <div>
        <Label>Tipo de habitación *</Label>
        <div className="grid grid-cols-2 gap-2 mt-2">
          {tiposHabitacion.map((tipo) => (
            <button
              key={tipo.value}
              type="button"
              onClick={() => setDatos({ ...datos, tipo: tipo.value as any })}
              className={`p-3 border rounded-lg text-left transition-all ${
                datos.tipo === tipo.value
                  ? 'border-primary bg-primary/5'
                  : 'border-input hover:border-primary/50'
              }`}
            >
              {tipo.label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="metros-hab">Metros cuadrados *</Label>
          <Input
            id="metros-hab"
            type="number"
            step="0.1"
            value={datos.metrosCuadrados}
            onChange={(e) => {
              setDatos({ ...datos, metrosCuadrados: e.target.value })
            }}
            placeholder="25"
            required
            disabled={datos.ancho && datos.largo ? true : false}
          />
          {datos.ancho && datos.largo && (
            <p className="text-xs text-green-700 mt-1">
              ✓ Calculado automáticamente desde ancho × largo
            </p>
          )}
          {!datos.ancho || !datos.largo ? (
            <p className="text-xs text-muted-foreground mt-1">
              O ingresa ancho y largo abajo para calcularlo automáticamente
            </p>
          ) : null}
        </div>
        <div>
          <Label htmlFor="altura-hab">Altura de techos (metros) *</Label>
          <Input
            id="altura-hab"
            type="number"
            step="0.1"
            value={datos.alturaTechos}
            onChange={(e) => setDatos({ ...datos, alturaTechos: e.target.value })}
            placeholder="2.70"
            required
          />
          <p className="text-xs text-muted-foreground mt-1">
            Puede variar por habitación
          </p>
        </div>
      </div>

      <div className="border-t pt-4">
        <p className="text-sm font-medium mb-2">
          📐 Medidas exactas (recomendado - calculará m² automáticamente)
        </p>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="ancho-hab">Ancho (metros)</Label>
            <Input
              id="ancho-hab"
              type="number"
              step="0.1"
              value={datos.ancho || ''}
              onChange={(e) => {
                setDatos({ ...datos, ancho: e.target.value })
                calcularDesdeMedidas()
              }}
              placeholder="4.5"
            />
          </div>
          <div>
            <Label htmlFor="largo-hab">Largo (metros)</Label>
            <Input
              id="largo-hab"
              type="number"
              step="0.1"
              value={datos.largo || ''}
              onChange={(e) => {
                setDatos({ ...datos, largo: e.target.value })
                calcularDesdeMedidas()
              }}
              placeholder="5.5"
            />
          </div>
        </div>
        {datos.ancho && datos.largo && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-3 mt-2">
            <p className="text-sm text-green-900">
              <strong>✓ Cálculos automáticos:</strong><br />
              • Metros cuadrados: {datos.metrosCuadrados} m²<br />
              {datos.perimetro && `• Perímetro: ${datos.perimetro} m`}
            </p>
          </div>
        )}
      </div>

      <div>
        <Label htmlFor="perimetro-hab">O especifica perímetro directamente (metros lineales)</Label>
        <Input
          id="perimetro-hab"
          type="number"
          step="0.1"
          value={datos.perimetro || ''}
          onChange={(e) => setDatos({ ...datos, perimetro: e.target.value })}
          placeholder="18"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="puertas-hab">Número de puertas</Label>
          <Input
            id="puertas-hab"
            type="number"
            value={datos.numPuertas}
            onChange={(e) => setDatos({ ...datos, numPuertas: e.target.value })}
            placeholder="1"
          />
        </div>
        <div>
          <Label htmlFor="ventanas-hab">Número de ventanas</Label>
          <Input
            id="ventanas-hab"
            type="number"
            value={datos.numVentanas}
            onChange={(e) => setDatos({ ...datos, numVentanas: e.target.value })}
            placeholder="2"
          />
        </div>
      </div>

      <div>
        <Label htmlFor="colinda-con">Colinda con (selecciona habitaciones adyacentes)</Label>
        <div className="mt-2 space-y-2 border rounded-lg p-3 bg-slate-50">
          {todasHabitaciones.filter(h => h.id !== habitacion.id).length > 0 ? (
            todasHabitaciones
              .filter(h => h.id !== habitacion.id)
              .map((hab) => {
                const colinda = datos.colindaCon?.includes(hab.id) || false
                return (
                  <label key={hab.id} className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={colinda}
                      onChange={(e) => {
                        const colindaCon = datos.colindaCon || []
                        if (e.target.checked) {
                          setDatos({ ...datos, colindaCon: [...colindaCon, hab.id] })
                        } else {
                          setDatos({ ...datos, colindaCon: colindaCon.filter(id => id !== hab.id) })
                        }
                      }}
                      className="w-4 h-4"
                    />
                    <span className="text-sm">{hab.nombre}</span>
                  </label>
                )
              })
          ) : (
            <p className="text-xs text-muted-foreground">
              Añade más habitaciones para poder seleccionar colindancias
            </p>
          )}
        </div>
        <p className="text-xs text-muted-foreground mt-1">
          Esto ayudará a generar un plano automático de la vivienda
        </p>
      </div>

      <div>
        <Label htmlFor="notas-hab">Notas adicionales (opcional)</Label>
        <textarea
          id="notas-hab"
          value={datos.notas || ''}
          onChange={(e) => setDatos({ ...datos, notas: e.target.value })}
          placeholder="Características especiales de esta habitación..."
          className="flex min-h-[60px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          rows={2}
        />
      </div>

      <div className="flex gap-2">
        <Button onClick={() => onSave(datos)}>Guardar</Button>
        <Button variant="outline" onClick={onCancel}>Cancelar</Button>
      </div>
    </div>
  )
}

