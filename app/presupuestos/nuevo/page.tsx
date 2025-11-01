'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { FormTrabajos } from './components/FormTrabajos'

type Paso = 'cliente' | 'obra' | 'espacio' | 'trabajos' | 'revision'

export default function NuevoPresupuestoPage() {
  const [paso, setPaso] = useState<Paso>('cliente')
  const [datos, setDatos] = useState({
    // Paso 1: Cliente
    cliente: {
      nombre: '',
      telefono: '',
      email: '',
      direccion: '',
      tipo: 'particular'
    },
    // Paso 2: Obra
    obra: {
      tipo: '',
      descripcion: ''
    },
    // Paso 3: Espacio
    espacio: {
      metrosTotales: '',
      numHabitaciones: '',
      numBanos: '',
      alturaTechos: '',
      estado: 'reciente' as 'nuevo' | 'reciente' | 'antiguo'
    },
    // Paso 4: Trabajos
    trabajos: [] as any[]
  })

  const porcentajeProgreso = {
    cliente: 0,
    obra: 20,
    espacio: 40,
    trabajos: 70,
    revision: 90
  }[paso]

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header con progreso */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Nuevo Presupuesto</h1>
          <div className="w-full bg-slate-200 rounded-full h-2">
            <div 
              className="bg-primary h-2 rounded-full transition-all duration-300"
              style={{ width: `${porcentajeProgreso}%` }}
            />
          </div>
          <p className="text-sm text-muted-foreground mt-2">
            Paso {Object.keys(porcentajeProgreso).indexOf(paso) + 1} de 5
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>
              {paso === 'cliente' && 'Información del Cliente'}
              {paso === 'obra' && 'Tipo de Obra'}
              {paso === 'espacio' && 'Características del Espacio'}
              {paso === 'trabajos' && 'Trabajos a Realizar'}
              {paso === 'revision' && 'Revisión Final'}
            </CardTitle>
            <CardDescription>
              {paso === 'cliente' && 'Necesitamos los datos del cliente para el presupuesto'}
              {paso === 'obra' && '¿Qué tipo de reforma se va a realizar?'}
              {paso === 'espacio' && 'Información detallada del inmueble para cálculos exactos'}
              {paso === 'trabajos' && 'Añade los trabajos que se van a realizar'}
              {paso === 'revision' && 'Revisa toda la información antes de generar el presupuesto'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {paso === 'cliente' && (
              <FormCliente 
                datos={datos.cliente}
                onChange={(cliente) => setDatos({ ...datos, cliente })}
              />
            )}
            {paso === 'obra' && (
              <FormObra 
                datos={datos.obra}
                onChange={(obra) => setDatos({ ...datos, obra })}
              />
            )}
            {paso === 'espacio' && (
              <FormEspacio 
                datos={datos.espacio}
                onChange={(espacio) => setDatos({ ...datos, espacio })}
              />
            )}
            {paso === 'trabajos' && (
              <FormTrabajos 
                trabajos={datos.trabajos}
                onChange={(trabajos) => setDatos({ ...datos, trabajos })}
                datosEspacio={datos.espacio}
              />
            )}
            {paso === 'revision' && (
              <div>
                <p className="text-muted-foreground">Revisión en desarrollo...</p>
              </div>
            )}

            {/* Navegación */}
            <div className="flex justify-between mt-8">
              <Button
                variant="outline"
                onClick={() => {
                  const pasos: Paso[] = ['cliente', 'obra', 'espacio', 'trabajos', 'revision']
                  const indice = pasos.indexOf(paso)
                  if (indice > 0) setPaso(pasos[indice - 1])
                }}
                disabled={paso === 'cliente'}
              >
                ← Atrás
              </Button>
              <Button
                onClick={() => {
                  const pasos: Paso[] = ['cliente', 'obra', 'espacio', 'trabajos', 'revision']
                  const indice = pasos.indexOf(paso)
                  if (indice < pasos.length - 1) setPaso(pasos[indice + 1])
                }}
                disabled={paso === 'revision'}
              >
                Siguiente →
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

function FormCliente({ datos, onChange }: { datos: any, onChange: (data: any) => void }) {
  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="nombre">Nombre completo *</Label>
        <Input
          id="nombre"
          value={datos.nombre}
          onChange={(e) => onChange({ ...datos, nombre: e.target.value })}
          placeholder="Juan García Pérez"
          required
        />
      </div>
      <div>
        <Label htmlFor="telefono">Teléfono *</Label>
        <Input
          id="telefono"
          type="tel"
          value={datos.telefono}
          onChange={(e) => onChange({ ...datos, telefono: e.target.value })}
          placeholder="+34 600 123 456"
          required
        />
      </div>
      <div>
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          value={datos.email}
          onChange={(e) => onChange({ ...datos, email: e.target.value })}
          placeholder="cliente@email.com"
        />
      </div>
      <div>
        <Label htmlFor="direccion">Dirección de la obra *</Label>
        <Input
          id="direccion"
          value={datos.direccion}
          onChange={(e) => onChange({ ...datos, direccion: e.target.value })}
          placeholder="Calle Mayor 123, Madrid"
          required
        />
      </div>
      <div>
        <Label htmlFor="tipo">Tipo de cliente</Label>
        <select
          id="tipo"
          value={datos.tipo}
          onChange={(e) => onChange({ ...datos, tipo: e.target.value })}
          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
        >
          <option value="particular">Particular</option>
          <option value="empresa">Empresa</option>
        </select>
      </div>
    </div>
  )
}

function FormObra({ datos, onChange }: { datos: any, onChange: (data: any) => void }) {
  const tipos = [
    { value: 'cocina', label: '🍳 Cocina' },
    { value: 'bano', label: '🚿 Baño' },
    { value: 'suelos', label: '🪵 Suelos' },
    { value: 'pintura', label: '🎨 Pintura' },
    { value: 'reforma_completa', label: '🏗️ Reforma Completa' },
    { value: 'otros', label: '✨ Otros' },
  ]

  return (
    <div className="space-y-4">
      <div>
        <Label>Tipo de obra *</Label>
        <div className="grid grid-cols-2 gap-4 mt-2">
          {tipos.map((tipo) => (
            <button
              key={tipo.value}
              type="button"
              onClick={() => onChange({ ...datos, tipo: tipo.value })}
              className={`p-4 border rounded-lg text-left transition-all ${
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
      <div>
        <Label htmlFor="descripcion">Descripción breve</Label>
        <textarea
          id="descripcion"
          value={datos.descripcion}
          onChange={(e) => onChange({ ...datos, descripcion: e.target.value })}
          placeholder="Reforma completa del baño principal..."
          className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          rows={3}
        />
      </div>
    </div>
  )
}

function FormEspacio({ datos, onChange }: { datos: any, onChange: (data: any) => void }) {
  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="metrosTotales">Metros cuadrados totales *</Label>
        <Input
          id="metrosTotales"
          type="number"
          step="0.1"
          value={datos.metrosTotales}
          onChange={(e) => onChange({ ...datos, metrosTotales: e.target.value })}
          placeholder="85"
          required
        />
        <p className="text-xs text-muted-foreground mt-1">Aproximado está bien si no se conoce exacto</p>
      </div>
      <div>
        <Label htmlFor="numHabitaciones">Número de habitaciones</Label>
        <Input
          id="numHabitaciones"
          type="number"
          value={datos.numHabitaciones}
          onChange={(e) => onChange({ ...datos, numHabitaciones: e.target.value })}
          placeholder="3"
        />
      </div>
      <div>
        <Label htmlFor="numBanos">Número de baños</Label>
        <Input
          id="numBanos"
          type="number"
          value={datos.numBanos}
          onChange={(e) => onChange({ ...datos, numBanos: e.target.value })}
          placeholder="2"
        />
      </div>
      <div>
        <Label htmlFor="alturaTechos">Altura de techos (metros) *</Label>
        <Input
          id="alturaTechos"
          type="number"
          step="0.1"
          value={datos.alturaTechos}
          onChange={(e) => onChange({ ...datos, alturaTechos: e.target.value })}
          placeholder="2.70"
          required
        />
        <p className="text-xs text-muted-foreground mt-1">Necesario para calcular superficie de pintura exacta</p>
      </div>
      <div>
        <Label>Estado actual del inmueble *</Label>
        <div className="space-y-2 mt-2">
          {[
            { value: 'nuevo', label: 'Nuevo (menos de 5 años)' },
            { value: 'reciente', label: 'Reciente (5-20 años)' },
            { value: 'antiguo', label: 'Antiguo (más de 20 años)' },
          ].map((estado) => (
            <label key={estado.value} className="flex items-center space-x-2 cursor-pointer">
              <input
                type="radio"
                name="estado"
                value={estado.value}
                checked={datos.estado === estado.value}
                onChange={(e) => onChange({ ...datos, estado: e.target.value })}
                className="w-4 h-4"
              />
              <span>{estado.label}</span>
            </label>
          ))}
        </div>
      </div>
    </div>
  )
}

