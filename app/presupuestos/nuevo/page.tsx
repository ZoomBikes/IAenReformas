'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { toast } from 'sonner'
import { ChefHat, Droplet, Square, Paintbrush, Hammer, MoreHorizontal } from 'lucide-react'
import { FormTrabajos } from './components/FormTrabajos'
import { FormHabitaciones } from './components/FormHabitaciones'
import { GeneradorPlano } from './components/GeneradorPlano'
import { RevisionFinal } from './components/RevisionFinal'

type Paso = 'cliente' | 'obra' | 'espacio' | 'habitaciones' | 'trabajos' | 'revision'

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
    // Paso 3: Espacio (info general)
    espacio: {
      metrosTotales: '',
      alturaTechos: '', // Valor por defecto para habitaciones
      estado: 'reciente' as 'nuevo' | 'reciente' | 'antiguo'
    },
    // Paso 4: Habitaciones (con medidas específicas)
    habitaciones: [] as any[],
    // Paso 5: Trabajos (servicios por habitación)
    trabajos: [] as Array<{ habitacionId: string, servicios: any[] }>
  })

  const porcentajeProgreso = {
    cliente: 0,
    obra: 15,
    espacio: 30,
    habitaciones: 50,
    trabajos: 75,
    revision: 90
  }[paso]

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header con progreso */}
        <div className="mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold mb-4 bg-gradient-to-r from-blue-600 to-indigo-700 bg-clip-text text-transparent">
            Nuevo Presupuesto
          </h1>
          <div className="w-full bg-blue-100/50 rounded-full h-3 overflow-hidden backdrop-blur-sm border border-blue-200/50 shadow-sm">
            <div 
              className="relative h-3 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 transition-all duration-500 ease-out shadow-lg shadow-blue-500/30"
              style={{ width: `${porcentajeProgreso}%` }}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer" />
            </div>
          </div>
          <p className="text-sm text-slate-600 mt-3 font-medium">
            Paso {['cliente', 'obra', 'espacio', 'habitaciones', 'trabajos', 'revision'].indexOf(paso) + 1} de 6 • {porcentajeProgreso}% completado
          </p>
        </div>

        <Card className="rounded-2xl glass-white border-blue-200/50 shadow-blue-lg">
          <CardHeader className="pb-4">
            <CardTitle className="text-2xl sm:text-3xl font-bold text-slate-900">
              {paso === 'cliente' && 'Información del Cliente'}
              {paso === 'obra' && 'Tipo de Obra'}
              {paso === 'espacio' && 'Características Generales'}
              {paso === 'habitaciones' && 'Habitaciones del Inmueble'}
              {paso === 'trabajos' && 'Trabajos a Realizar'}
              {paso === 'revision' && 'Revisión Final'}
            </CardTitle>
            <CardDescription className="text-base text-slate-600 mt-2">
              {paso === 'cliente' && 'Necesitamos los datos del cliente para el presupuesto'}
              {paso === 'obra' && '¿Qué tipo de reforma se va a realizar?'}
              {paso === 'espacio' && 'Información general del inmueble'}
              {paso === 'habitaciones' && 'Define cada habitación con sus medidas exactas para cálculos precisos'}
              {paso === 'trabajos' && 'Añade los trabajos que se van a realizar en cada habitación'}
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
            {paso === 'habitaciones' && (
              <>
                <FormHabitaciones 
                  habitaciones={datos.habitaciones}
                  onChange={(habitaciones) => setDatos({ ...datos, habitaciones })}
                  alturaTechosGeneral={datos.espacio.alturaTechos}
                  onEditFromPlano={(habitacion) => {
                    // Encontrar y editar la habitación desde el plano
                    const habIndex = datos.habitaciones.findIndex(h => h.id === habitacion.id)
                    if (habIndex >= 0) {
                      // Trigger edición - esto se manejará en FormHabitaciones
                      toast.info(`Edita "${habitacion.nombre}" en la lista de arriba`)
                    }
                  }}
                />
                {datos.habitaciones.length > 0 && (
                  <div className="mt-6">
                    <GeneradorPlano 
                      habitaciones={datos.habitaciones}
                      trabajos={datos.trabajos.map(t => ({
                        habitacionId: t.habitacionId,
                        servicios: t.servicios.map((s: any) => ({
                          tipo: s.tipo,
                          descripcion: s.datos?.descripcion || s.tipo
                        }))
                      }))}
                      onEditHabitacion={(habitacion) => {
                        // Scroll a la habitación y highlight
                        const element = document.getElementById(`habitacion-${habitacion.id}`)
                        if (element) {
                          element.scrollIntoView({ behavior: 'smooth', block: 'center' })
                          element.classList.add('ring-2', 'ring-primary', 'ring-offset-2')
                          setTimeout(() => {
                            element.classList.remove('ring-2', 'ring-primary', 'ring-offset-2')
                          }, 2000)
                        }
                        toast.info(`Edita "${habitacion.nombre}" arriba para cambiar sus datos`)
                      }}
                      onUpdatePosiciones={(posiciones) => {
                        // Guardar posiciones en el estado (opcional, para persistencia)
                        console.log('Posiciones actualizadas:', posiciones)
                      }}
                    />
                  </div>
                )}
              </>
            )}
            {paso === 'trabajos' && (
              <FormTrabajos 
                trabajos={datos.trabajos}
                onChange={(trabajos) => setDatos({ ...datos, trabajos })}
                habitaciones={datos.habitaciones}
                datosEspacio={datos.espacio}
              />
            )}
            {paso === 'revision' && (
              <RevisionFinal
                datos={datos}
                onGuardar={async () => {
                  // Se maneja internamente en RevisionFinal
                }}
                onGenerarPDF={async () => {
                  // TODO: Implementar generación de PDF
                  toast.info('Generación de PDF próximamente')
                }}
              />
            )}

                {/* Navegación */}
                <div className="flex flex-col sm:flex-row justify-between gap-4 mt-8 pt-6 border-t border-blue-100/50">
                  <Button
                    variant="outline"
                    onClick={() => {
                      const pasos: Paso[] = ['cliente', 'obra', 'espacio', 'habitaciones', 'trabajos', 'revision']
                      const indice = pasos.indexOf(paso)
                      if (indice > 0) setPaso(pasos[indice - 1])
                    }}
                    disabled={paso === 'cliente'}
                    className="w-full sm:w-auto"
                  >
                    ← Atrás
                  </Button>
                  {paso !== 'revision' && (
                    <Button
                      onClick={() => {
                        const pasos: Paso[] = ['cliente', 'obra', 'espacio', 'habitaciones', 'trabajos', 'revision']
                        const indice = pasos.indexOf(paso)
                        if (indice < pasos.length - 1) setPaso(pasos[indice + 1])
                      }}
                      className="w-full sm:w-auto"
                    >
                      Siguiente →
                    </Button>
                  )}
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
    { value: 'cocina', label: 'Cocina', icon: 'ChefHat' },
    { value: 'bano', label: 'Baño', icon: 'Droplet' },
    { value: 'suelos', label: 'Suelos', icon: 'Square' },
    { value: 'pintura', label: 'Pintura', icon: 'Paintbrush' },
    { value: 'reforma_completa', label: 'Reforma Completa', icon: 'Hammer' },
    { value: 'otros', label: 'Otros', icon: 'MoreHorizontal' },
  ]

  return (
    <div className="space-y-4">
      <div>
        <Label>Tipo de obra *</Label>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-2">
          {tipos.map((tipo) => {
            const Icon = tipo.icon === 'ChefHat' ? ChefHat :
                       tipo.icon === 'Droplet' ? Droplet :
                       tipo.icon === 'Square' ? Square :
                       tipo.icon === 'Paintbrush' ? Paintbrush :
                       tipo.icon === 'Hammer' ? Hammer : MoreHorizontal
            return (
              <button
                key={tipo.value}
                type="button"
                onClick={() => onChange({ ...datos, tipo: tipo.value })}
                className={`p-4 border-2 rounded-xl text-left transition-all flex flex-col items-center gap-2 ${
                  datos.tipo === tipo.value
                    ? 'border-blue-500 bg-gradient-to-br from-blue-50 to-indigo-50 shadow-md shadow-blue-500/20'
                    : 'border-blue-200/50 glass hover:border-blue-300/70 hover:shadow-md'
                }`}
              >
                <Icon className={`h-6 w-6 ${datos.tipo === tipo.value ? 'text-blue-600' : 'text-blue-400'}`} />
                <span className={`text-sm font-medium ${datos.tipo === tipo.value ? 'text-blue-700' : 'text-slate-600'}`}>
                  {tipo.label}
                </span>
              </button>
            )
          })}
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
      <div className="glass-blue border border-blue-200/50 rounded-2xl p-6 mb-6 shadow-md">
        <p className="text-sm text-blue-900">
          <strong>💡 Información:</strong> En el siguiente paso definirás cada habitación con sus medidas específicas. 
          Aquí solo necesitamos información general del inmueble.
        </p>
      </div>
      <div>
        <Label htmlFor="metrosTotales">Metros cuadrados totales (aprox.)</Label>
        <Input
          id="metrosTotales"
          type="number"
          step="0.1"
          value={datos.metrosTotales}
          onChange={(e) => onChange({ ...datos, metrosTotales: e.target.value })}
          placeholder="85"
        />
        <p className="text-xs text-muted-foreground mt-1">Aproximado para referencia general</p>
      </div>
      <div>
        <Label htmlFor="alturaTechos">Altura de techos general (metros)</Label>
        <Input
          id="alturaTechos"
          type="number"
          step="0.1"
          value={datos.alturaTechos}
          onChange={(e) => onChange({ ...datos, alturaTechos: e.target.value })}
          placeholder="2.70"
        />
        <p className="text-xs text-muted-foreground mt-1">
          Se usará como valor por defecto para las habitaciones. Podrás cambiarla individualmente en cada habitación.
        </p>
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
        <p className="text-xs text-muted-foreground mt-1">Afecta a los multiplicadores de precio</p>
      </div>
    </div>
  )
}

