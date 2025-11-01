'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { 
  ArrowLeft, 
  Download, 
  Mail, 
  Edit, 
  Share2, 
  Calendar,
  Phone,
  MapPin,
  Euro,
  CheckCircle,
  FileText,
  Building
} from 'lucide-react'
import { toast } from 'sonner'
import { GeneradorPlano } from '../nuevo/components/GeneradorPlano'
import type { Habitacion } from '../nuevo/components/FormHabitaciones'
import dynamic from 'next/dynamic'

// Cargar PDF dinámicamente para reducir bundle size
const PDFDownloadLink = dynamic(
  () => import('@react-pdf/renderer').then((mod) => mod.PDFDownloadLink),
  { ssr: false }
)
const PresupuestoPDF = dynamic(
  () => import('@/components/pdf/PresupuestoPDF').then((mod) => mod.PresupuestoPDF),
  { ssr: false }
)

interface PresupuestoDetalle {
  id: string
  cliente: {
    nombre: string
    telefono?: string
    email?: string
  }
  direccionObra: string
  tipoObra: string
  descripcionObra?: string
  fechaCreacion: string
  estado: string
  total: number
  subtotal: number
  iva: number
  habitaciones: Habitacion[]
  trabajos: Array<{
    habitacionId: string
    habitacionNombre?: string
    servicios: Array<{
      id: string
      tipo: string
      descripcion: string
      calculo?: {
        subtotal: number
        iva: number
        total: number
        componentes?: Array<{
          nombre: string
          cantidad: number
          unidad: string
          precioUnitario: number
          precioTotal: number
        }>
      }
      precioPorMetro?: number
    }>
  }>
}

export default function PresupuestoDetallePage() {
  const params = useParams()
  const router = useRouter()
  const [presupuesto, setPresupuesto] = useState<PresupuestoDetalle | null>(null)
  const [loading, setLoading] = useState(true)

  const cargarPresupuesto = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/presupuestos/${params.id}`)
      if (!response.ok) throw new Error('Error al cargar')
      
      const data = await response.json()
      setPresupuesto(data.presupuesto)
    } catch (error) {
      toast.error('No se pudo cargar el presupuesto')
      console.error(error)
      router.push('/presupuestos')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    cargarPresupuesto()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.id])

  const formatearFecha = (fecha: string) => {
    return new Date(fecha).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const getEstadoColor = (estado: string) => {
    switch (estado) {
      case 'BORRADOR':
        return 'bg-slate-100 text-slate-800 border border-slate-200'
      case 'ENVIADO':
        return 'bg-blue-100 text-blue-800 border border-blue-200'
      case 'ACEPTADO':
        return 'bg-green-100 text-green-800 border border-green-200'
      case 'RECHAZADO':
        return 'bg-red-100 text-red-800 border border-red-200'
      default:
        return 'bg-slate-100 text-slate-800 border border-slate-200'
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center">
        <div className="text-center animate-fade-in">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-600">Cargando presupuesto...</p>
        </div>
      </div>
    )
  }

  if (!presupuesto) {
    return null
  }

  const totalTrabajos = presupuesto.trabajos.reduce((acc, t) => 
    acc + t.servicios.reduce((sum, s) => 
      sum + (s.calculo?.total || 0), 0
    ), 0
  )

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 p-4 md:p-8">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 animate-fade-in">
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              onClick={() => router.push('/presupuestos')}
              className="rounded-xl"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Volver
            </Button>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-700 bg-clip-text text-transparent">
                Presupuesto #{presupuesto.id.substring(0, 8)}
              </h1>
              <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium mt-2 ${getEstadoColor(presupuesto.estado)}`}>
                {presupuesto.estado}
              </span>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" size="sm" className="rounded-xl hover:bg-blue-50/50 transition-all">
              <Edit className="h-4 w-4 mr-2" />
              Editar
            </Button>
            <Button variant="outline" size="sm" className="rounded-xl hover:bg-blue-50/50 transition-all">
              <Share2 className="h-4 w-4 mr-2" />
              Compartir
            </Button>
            <Button variant="outline" size="sm" className="rounded-xl hover:bg-blue-50/50 transition-all">
              <Mail className="h-4 w-4 mr-2" />
              Enviar
            </Button>
            <Button size="sm" className="rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg shadow-blue-500/30 hover:shadow-xl hover:shadow-blue-500/40 transition-all">
              <Download className="h-4 w-4 mr-2" />
              PDF
            </Button>
          </div>
        </div>

        {/* Información Cliente */}
        <Card className="glass-white border-blue-200/50 shadow-lg shadow-blue-500/10 rounded-2xl animate-fade-in">
          <CardHeader>
            <CardTitle className="text-xl flex items-center gap-2">
              <Building className="h-5 w-5 text-blue-600" />
              Información del Cliente
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                  <div>
                    <p className="font-semibold text-slate-900">{presupuesto.cliente.nombre}</p>
                    <p className="text-sm text-slate-600">Cliente</p>
                  </div>
                </div>
                {presupuesto.cliente.telefono && (
                  <div className="flex items-start gap-3">
                    <Phone className="h-5 w-5 text-blue-500 mt-0.5" />
                    <div>
                      <p className="font-medium text-slate-900">{presupuesto.cliente.telefono}</p>
                      <p className="text-sm text-slate-600">Teléfono</p>
                    </div>
                  </div>
                )}
                {presupuesto.cliente.email && (
                  <div className="flex items-start gap-3">
                    <Mail className="h-5 w-5 text-blue-500 mt-0.5" />
                    <div>
                      <p className="font-medium text-slate-900">{presupuesto.cliente.email}</p>
                      <p className="text-sm text-slate-600">Email</p>
                    </div>
                  </div>
                )}
              </div>
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <MapPin className="h-5 w-5 text-red-500 mt-0.5" />
                  <div>
                    <p className="font-medium text-slate-900">{presupuesto.direccionObra}</p>
                    <p className="text-sm text-slate-600">Dirección de Obra</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <FileText className="h-5 w-5 text-purple-500 mt-0.5" />
                  <div>
                    <p className="font-medium text-slate-900">{presupuesto.tipoObra.replace('_', ' ')}</p>
                    <p className="text-sm text-slate-600">Tipo de Obra</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Calendar className="h-5 w-5 text-indigo-500 mt-0.5" />
                  <div>
                    <p className="font-medium text-slate-900">{formatearFecha(presupuesto.fechaCreacion)}</p>
                    <p className="text-sm text-slate-600">Fecha de Creación</p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Resumen Financiero */}
        <div className="grid md:grid-cols-3 gap-4 animate-fade-in">
          <Card className="glass-white border-blue-200/50 shadow-lg shadow-blue-500/10 rounded-2xl">
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center">
                  <Euro className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                    €{presupuesto.subtotal.toFixed(2)}
                  </p>
                  <p className="text-sm text-slate-600">Subtotal</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="glass-white border-blue-200/50 shadow-lg shadow-blue-500/10 rounded-2xl">
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-12 h-12 rounded-xl bg-indigo-100 flex items-center justify-center">
                  <Euro className="h-6 w-6 text-indigo-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                    €{presupuesto.iva.toFixed(2)}
                  </p>
                  <p className="text-sm text-slate-600">IVA (21%)</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="glass-white border-gradient-to-r from-blue-600 to-indigo-600 border-2 shadow-xl shadow-blue-500/20 rounded-2xl bg-gradient-to-br from-blue-50/50 to-indigo-50/50">
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center">
                  <Euro className="h-6 w-6 text-white" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-slate-900">
                    €{presupuesto.total.toFixed(2)}
                  </p>
                  <p className="text-sm text-slate-600 font-medium">TOTAL</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Trabajos por Habitación */}
        {presupuesto.trabajos.map((trabajo, idx) => {
          const habitacion = presupuesto.habitaciones.find(h => h.id === trabajo.habitacionId)
          const totalHabitacion = trabajo.servicios.reduce((sum, s) => sum + (s.calculo?.total || 0), 0)
          
          return (
            <Card key={idx} className="glass-white border-blue-200/50 shadow-lg shadow-blue-500/10 rounded-2xl animate-fade-in" style={{ animationDelay: `${idx * 0.1}s` }}>
              <CardHeader>
                <CardTitle className="text-xl">
                  {habitacion?.nombre || `Habitación ${idx + 1}`}
                  {habitacion && (
                    <span className="ml-3 text-base font-normal text-slate-600">
                      {habitacion.metrosCuadrados} m²
                    </span>
                  )}
                </CardTitle>
                <CardDescription>
                  {trabajo.servicios.length} servicio{trabajo.servicios.length !== 1 ? 's' : ''}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {trabajo.servicios.map((servicio, sIdx) => (
                    <div key={sIdx} className="border border-blue-200/50 rounded-xl p-4 hover:bg-blue-50/30 transition-colors">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h4 className="font-semibold text-slate-900">{servicio.descripcion}</h4>
                          <p className="text-sm text-slate-600 mt-1">{servicio.tipo.replace('_', ' ')}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-bold text-blue-600">
                            €{servicio.calculo?.total.toFixed(2) || '0.00'}
                          </p>
                          {servicio.calculo?.subtotal && (
                            <p className="text-xs text-slate-500 line-through">
                              €{servicio.calculo.subtotal.toFixed(2)}
                            </p>
                          )}
                        </div>
                      </div>
                      
                      {servicio.calculo?.componentes && servicio.calculo.componentes.length > 0 && (
                        <div className="mt-3 pt-3 border-t border-blue-200/30 space-y-2">
                          {servicio.calculo.componentes.map((comp, cIdx) => (
                            <div key={cIdx} className="flex justify-between text-sm">
                              <span className="text-slate-700">
                                {comp.nombre}
                                <span className="text-slate-500 ml-2">
                                  {comp.cantidad} {comp.unidad}
                                </span>
                              </span>
                              <span className="font-medium text-slate-900">
                                €{comp.precioTotal.toFixed(2)}
                              </span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                  
                  <Separator className="my-3" />
                  
                  <div className="flex justify-between items-center font-semibold text-lg pt-2">
                    <span>Total Habitación:</span>
                    <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                      €{totalHabitacion.toFixed(2)}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}

        {/* Plano (si hay habitaciones) */}
        {presupuesto.habitaciones && presupuesto.habitaciones.length > 0 && (
          <Card className="glass-white border-blue-200/50 shadow-lg shadow-blue-500/10 rounded-2xl animate-fade-in">
            <CardHeader>
              <CardTitle className="text-xl">Plano de la Vivienda</CardTitle>
              <CardDescription>
                Visualización interactiva de la distribución
              </CardDescription>
            </CardHeader>
            <CardContent>
              <GeneradorPlano
                habitaciones={presupuesto.habitaciones}
                trabajos={presupuesto.trabajos.map(t => ({
                  habitacionId: t.habitacionId,
                  servicios: t.servicios.map((s: any) => ({
                    tipo: s.tipo,
                    descripcion: s.descripcion
                  }))
                }))}
              />
            </CardContent>
          </Card>
        )}

        {/* Footer Actions */}
        <div className="flex flex-col sm:flex-row gap-4 pb-8">
          <Button
            variant="outline"
            onClick={() => router.push('/presupuestos')}
            className="flex-1 rounded-xl"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver a Presupuestos
          </Button>
          
          {presupuesto && (
            <PDFDownloadLink
              document={<PresupuestoPDF datos={{
                cliente: presupuesto.cliente,
                obra: {
                  tipo: presupuesto.tipoObra,
                  descripcion: presupuesto.descripcionObra
                },
                espacio: {
                  metrosTotales: presupuesto.total.toString(), // Placeholder
                  alturaTechos: '2.70',
                  estado: 'reciente'
                },
                habitaciones: presupuesto.habitaciones,
                trabajos: presupuesto.trabajos
              }} />}
              fileName={`presupuesto-${presupuesto.cliente.nombre}-${new Date().toISOString().split('T')[0]}.pdf`}
              className="flex-1"
            >
              {({ loading }) => (
                <Button
                  className="flex-1 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg shadow-blue-500/30 hover:shadow-xl hover:shadow-blue-500/40 transition-all"
                  disabled={loading}
                >
                  {loading ? (
                    <>Generando PDF...</>
                  ) : (
                    <>
                      <Download className="h-4 w-4 mr-2" />
                      Descargar PDF Completo
                    </>
                  )}
                </Button>
              )}
            </PDFDownloadLink>
          )}
        </div>
      </div>
    </div>
  )
}

