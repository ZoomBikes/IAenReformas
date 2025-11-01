'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent } from '@/components/ui/card'
import { Plus, X, DoorOpen, Square, Edit2 } from 'lucide-react'
import type { PuertaVentana } from './FormHabitaciones'

interface PuertasVentanasEditorProps {
  puertasVentanas: PuertaVentana[]
  onChange: (puertasVentanas: PuertaVentana[]) => void
  habitacionAncho?: string
  habitacionLargo?: string
}

export function PuertasVentanasEditor({ 
  puertasVentanas, 
  onChange, 
  habitacionAncho, 
  habitacionLargo 
}: PuertasVentanasEditorProps) {
  const [editando, setEditando] = useState<string | null>(null)

  const añadirPuertaVentana = (tipo: 'puerta' | 'ventana') => {
    const nueva: PuertaVentana = {
      id: Date.now().toString(),
      tipo,
      pared: 'superior',
      posicion: 50, // Centro por defecto
      ancho: tipo === 'puerta' ? 0.9 : 1.2,
      alto: tipo === 'puerta' ? 2.1 : 1.5
    }
    onChange([...puertasVentanas, nueva])
    setEditando(nueva.id)
  }

  const eliminar = (id: string) => {
    onChange(puertasVentanas.filter(pv => pv.id !== id))
  }

  const actualizar = (id: string, datos: Partial<PuertaVentana>) => {
    onChange(puertasVentanas.map(pv => 
      pv.id === id ? { ...pv, ...datos } : pv
    ))
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Label>Puertas y Ventanas</Label>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => añadirPuertaVentana('puerta')}
          >
            <Plus className="h-3 w-3 mr-1" />
            Puerta
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => añadirPuertaVentana('ventana')}
          >
            <Plus className="h-3 w-3 mr-1" />
            Ventana
          </Button>
        </div>
      </div>

      {puertasVentanas.length === 0 && (
        <p className="text-sm text-muted-foreground text-center py-4">
          Añade puertas y ventanas para mostrarlas en el plano
        </p>
      )}

      {puertasVentanas.map((pv) => (
        <Card key={pv.id} className="relative">
          <CardContent className="p-4">
            {editando === pv.id ? (
              <FormPuertaVentana
                pv={pv}
                habitacionAncho={habitacionAncho}
                habitacionLargo={habitacionLargo}
                onSave={(datos) => {
                  actualizar(pv.id, datos)
                  setEditando(null)
                }}
                onCancel={() => setEditando(null)}
              />
            ) : (
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-3">
                  {pv.tipo === 'puerta' ? (
                    <DoorOpen className="h-5 w-5 text-blue-600" />
                  ) : (
                    <Square className="h-5 w-5 text-green-600" />
                  )}
                  <div>
                    <p className="font-medium text-sm capitalize">
                      {pv.tipo === 'puerta' ? '🚪 Puerta' : '🪟 Ventana'}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Pared {pv.pared} • Posición: {pv.posicion}%
                      {pv.ancho && ` • ${pv.ancho}m × ${pv.alto || ''}m`}
                    </p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setEditando(pv.id)}
                  >
                    <Edit2 className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => eliminar(pv.id)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

function FormPuertaVentana({ 
  pv, 
  habitacionAncho, 
  habitacionLargo,
  onSave, 
  onCancel 
}: { 
  pv: PuertaVentana
  habitacionAncho?: string
  habitacionLargo?: string
  onSave: (datos: Partial<PuertaVentana>) => void
  onCancel: () => void
}) {
  const [datos, setDatos] = useState(pv)

  const paredes = [
    { value: 'superior', label: '🔝 Superior (arriba)' },
    { value: 'inferior', label: '🔽 Inferior (abajo)' },
    { value: 'izquierda', label: '◀️ Izquierda' },
    { value: 'derecha', label: '▶️ Derecha' },
  ]

  return (
    <div className="space-y-4">
      <div>
        <Label>Pared donde se ubica *</Label>
        <div className="grid grid-cols-2 gap-2 mt-2">
          {paredes.map((pared) => (
            <button
              key={pared.value}
              type="button"
              onClick={() => setDatos({ ...datos, pared: pared.value as any })}
              className={`p-2 border rounded text-sm transition-all ${
                datos.pared === pared.value
                  ? 'border-primary bg-primary/5'
                  : 'border-input hover:border-primary/50'
              }`}
            >
              {pared.label}
            </button>
          ))}
        </div>
      </div>

      <div>
        <Label htmlFor="posicion-pv">Posición en la pared (0-100%) *</Label>
        <Input
          id="posicion-pv"
          type="number"
          min="0"
          max="100"
          value={datos.posicion}
          onChange={(e) => setDatos({ ...datos, posicion: parseInt(e.target.value) || 0 })}
          placeholder="50"
          required
        />
        <p className="text-xs text-muted-foreground mt-1">
          0% = inicio de la pared, 100% = final de la pared, 50% = centro
        </p>
        <input
          type="range"
          min="0"
          max="100"
          value={datos.posicion}
          onChange={(e) => setDatos({ ...datos, posicion: parseInt(e.target.value) })}
          className="w-full mt-2"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="ancho-pv">Ancho (metros)</Label>
          <Input
            id="ancho-pv"
            type="number"
            step="0.1"
            value={datos.ancho || ''}
            onChange={(e) => setDatos({ ...datos, ancho: parseFloat(e.target.value) })}
            placeholder={pv.tipo === 'puerta' ? '0.9' : '1.2'}
          />
        </div>
        <div>
          <Label htmlFor="alto-pv">Alto (metros)</Label>
          <Input
            id="alto-pv"
            type="number"
            step="0.1"
            value={datos.alto || ''}
            onChange={(e) => setDatos({ ...datos, alto: parseFloat(e.target.value) })}
            placeholder={pv.tipo === 'puerta' ? '2.1' : '1.5'}
          />
        </div>
      </div>

      <div className="flex gap-2">
        <Button onClick={() => onSave(datos)} size="sm">Guardar</Button>
        <Button variant="outline" onClick={onCancel} size="sm">Cancelar</Button>
      </div>
    </div>
  )
}

