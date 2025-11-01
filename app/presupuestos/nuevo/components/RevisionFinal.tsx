'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { CheckCircle2, AlertCircle, FileText, Download, Mail } from 'lucide-react'
import { toast } from 'sonner'
import type { Habitacion } from './FormHabitaciones'

interface RevisionFinalProps {
  datos: {
    cliente: any
    obra: any
    espacio: any
    habitaciones: Habitacion[]
    trabajos: Array<{ habitacionId: string, servicios: any[] }>
  }
  onGuardar: () => Promise<void>
  onGenerarPDF: () => Promise<void>
}

export function RevisionFinal({ datos, onGuardar, onGenerarPDF }: RevisionFinalProps) {
  const [guardando, setGuardando] = useState(false)
  const [generandoPDF, setGenerandoPDF] = useState(false)

  // Calcular totales
  const calcularTotales = () => {
    let subtotal = 0
    let totalServicios = 0

    datos.trabajos.forEach(trabajo => {
      trabajo.servicios.forEach(servicio => {
        if (servicio.calculo) {
          subtotal += servicio.calculo.subtotal || 0
          totalServicios += servicio.calculo.total || 0
        } else if (servicio.precioPorMetro) {
          const habitacion = datos.habitaciones.find(h => h.id === trabajo.habitacionId)
          if (habitacion) {
            const metros = parseFloat(habitacion.metrosCuadrados) || 0
            const precioTotal = metros * servicio.precioPorMetro
            subtotal += precioTotal
            totalServicios += precioTotal * 1.21
          }
        }
      })
    })

    const iva = subtotal * 0.21
    const total = subtotal + iva

    return { subtotal, iva, total, totalServicios }
  }

  const totales = calcularTotales()

  const validarDatos = () => {
    const errores: string[] = []

    if (!datos.cliente.nombre || !datos.cliente.telefono) {
      errores.push('Datos del cliente incompletos')
    }

    if (!datos.obra.tipo) {
      errores.push('Tipo de obra no seleccionado')
    }

    if (datos.habitaciones.length === 0) {
      errores.push('No hay habitaciones definidas')
    }

    const tieneServicios = datos.trabajos.some(t => t.servicios.length > 0)
    if (!tieneServicios) {
      errores.push('No hay servicios añadidos')
    }

    return errores
  }

  const errores = validarDatos()
  const esValido = errores.length === 0

  const handleGuardar = async () => {
    if (!esValido) {
      toast.error('Por favor, completa todos los campos requeridos')
      return
    }

    setGuardando(true)
    try {
      const response = await fetch('/api/presupuestos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(datos)
      })

      if (!response.ok) {
        throw new Error('Error al guardar')
      }

      const result = await response.json()
      
      if (result.error && result.error.includes('Base de datos')) {
        toast.error('Base de datos no configurada. El presupuesto no se guardó.', {
          description: 'Configura DATABASE_URL en Vercel para habilitar el guardado.'
        })
        return
      }
      
      // Limpiar borrador después de guardar exitosamente
      localStorage.removeItem('presupuesto-borrador')
      
      toast.success('Presupuesto guardado correctamente', {
        description: `ID: ${result.presupuestoId}`
      })
      
      // Redirigir al dashboard después de guardar
      setTimeout(() => {
        window.location.href = '/presupuestos'
      }, 1500)
    } catch (error) {
      toast.error('Error al guardar el presupuesto')
      console.error(error)
    } finally {
      setGuardando(false)
    }
  }

  const handleGenerarPDF = async () => {
    if (!esValido) {
      toast.error('Por favor, completa todos los campos requeridos')
      return
    }

    setGenerandoPDF(true)
    try {
      await onGenerarPDF()
      toast.success('PDF generado correctamente')
    } catch (error) {
      toast.error('Error al generar el PDF')
      console.error(error)
    } finally {
      setGenerandoPDF(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Alerta de validación */}
      {!esValido && (
        <Card className="border-yellow-200 bg-yellow-50">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5" />
              <div>
                <h3 className="font-semibold text-yellow-900 mb-2">Hay campos incompletos:</h3>
                <ul className="list-disc list-inside space-y-1 text-sm text-yellow-800">
                  {errores.map((error, i) => (
                    <li key={i}>{error}</li>
                  ))}
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Resumen del Cliente */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-green-600" />
            Información del Cliente
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-muted-foreground">Nombre</p>
              <p className="font-medium">{datos.cliente.nombre || 'No especificado'}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Teléfono</p>
              <p className="font-medium">{datos.cliente.telefono || 'No especificado'}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Email</p>
              <p className="font-medium">{datos.cliente.email || 'No especificado'}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Dirección</p>
              <p className="font-medium">{datos.cliente.direccion || 'No especificada'}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Resumen del Proyecto */}
      <Card>
        <CardHeader>
          <CardTitle>Proyecto</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Tipo de obra:</span>
              <span className="font-medium">{datos.obra.tipo || 'No especificado'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Habitaciones:</span>
              <span className="font-medium">{datos.habitaciones.length}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Total m²:</span>
              <span className="font-medium">
                {datos.habitaciones.reduce((sum, h) => sum + (parseFloat(h.metrosCuadrados) || 0), 0).toFixed(2)} m²
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Estado del inmueble:</span>
              <span className="font-medium capitalize">{datos.espacio.estado}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Resumen de Trabajos por Habitación */}
      <Card>
        <CardHeader>
          <CardTitle>Trabajos por Habitación</CardTitle>
          <CardDescription>Desglose de servicios por habitación</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {datos.habitaciones.map((habitacion) => {
              const trabajosHabitacion = datos.trabajos.find(t => t.habitacionId === habitacion.id)
              const servicios = trabajosHabitacion?.servicios || []

              if (servicios.length === 0) return null

              return (
                <div key={habitacion.id} className="border rounded-lg p-4">
                  <h4 className="font-semibold mb-3">🏠 {habitacion.nombre} ({habitacion.metrosCuadrados} m²)</h4>
                  <div className="space-y-2">
                    {servicios.map((servicio) => {
                      const total = servicio.calculo?.total || 
                                   (servicio.precioPorMetro && habitacion.metrosCuadrados 
                                     ? parseFloat(habitacion.metrosCuadrados) * servicio.precioPorMetro * 1.21 
                                     : 0)
                      
                      return (
                        <div key={servicio.id} className="flex justify-between text-sm">
                          <span className="text-muted-foreground">
                            {servicio.tipo === 'pintura_paredes' && '🎨 Pintura'}
                            {servicio.tipo === 'cambio_tarima' && '🪵 Tarima/Suelo'}
                            {servicio.tipo === 'alicatado_azulejos' && '🧱 Alicatado'}
                            {servicio.tipo === 'fontaneria' && '🚿 Fontanería'}
                            {servicio.tipo === 'electricidad' && '⚡ Electricidad'}
                            {servicio.tipo === 'carpinteria' && '🪚 Carpintería'}
                            {servicio.tipo === 'otros' && '🔧 Otros'}
                          </span>
                          <span className="font-medium">€{total.toFixed(2)}</span>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Resumen Financiero */}
      <Card className="border-primary/20 bg-primary/5">
        <CardHeader>
          <CardTitle>Resumen Financiero</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex justify-between text-base">
              <span className="text-muted-foreground">Subtotal:</span>
              <span className="font-semibold">€{totales.subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-base">
              <span className="text-muted-foreground">IVA (21%):</span>
              <span className="font-semibold">€{totales.iva.toFixed(2)}</span>
            </div>
            <Separator />
            <div className="flex justify-between text-xl font-bold">
              <span>TOTAL:</span>
              <span className="text-primary">€{totales.total.toFixed(2)}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Acciones */}
      <div className="flex flex-col sm:flex-row gap-4">
        <Button
          onClick={handleGuardar}
          disabled={!esValido || guardando}
          className="flex-1"
          size="lg"
        >
          {guardando ? 'Guardando...' : '💾 Guardar Presupuesto'}
        </Button>
        <Button
          onClick={handleGenerarPDF}
          disabled={!esValido || generandoPDF}
          variant="outline"
          className="flex-1"
          size="lg"
        >
          {generandoPDF ? 'Generando...' : (
            <>
              <FileText className="h-4 w-4 mr-2" />
              Generar PDF
            </>
          )}
        </Button>
        <Button
          variant="outline"
          className="flex-1"
          size="lg"
          disabled
        >
          <Mail className="h-4 w-4 mr-2" />
          Enviar por Email
        </Button>
      </div>
    </div>
  )
}

