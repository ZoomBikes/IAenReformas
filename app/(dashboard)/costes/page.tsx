'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { 
  DollarSign, 
  TrendingUp,
  TrendingDown,
  Percent,
  AlertCircle,
  Plus,
  X,
  Receipt
} from 'lucide-react'
import { toast } from 'sonner'

interface Metricas {
  presupuestado: number
  ejecutado: number
  margen: number
  avance: number
  obras: Array<{
    id: string
    nombre: string
    cliente: string
    presupuestado: number
    ejecutado: number
    avance: number
  }>
}

interface Pago {
  id: string
  concepto: string
  tipo: string
  importe: number
  fecha: string
  metodo?: string
  obra: {
    nombre: string
    cliente: {
      nombre: string
    }
  }
  proveedor?: {
    nombre: string
  }
}

export default function CostesPage() {
  const [metricas, setMetricas] = useState<Metricas>({
    presupuestado: 0,
    ejecutado: 0,
    margen: 0,
    avance: 0,
    obras: []
  })
  const [pagos, setPagos] = useState<Pago[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)

  useEffect(() => {
    cargarDatos()
  }, [])

  const cargarDatos = async () => {
    setLoading(true)
    try {
      const [metricasRes, pagosRes] = await Promise.all([
        fetch('/api/costes/metricas'),
        fetch('/api/costes/pagos')
      ])
      
      const metricasData = await metricasRes.json()
      const pagosData = await pagosRes.json()
      
      setMetricas(metricasData)
      setPagos(pagosData.pagos || [])
    } catch (error) {
      toast.error('Error al cargar datos')
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  const handleSavePago = async (formData: any) => {
    try {
      const res = await fetch('/api/costes/pagos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      if (!res.ok) throw new Error('Error al guardar')

      toast.success('Pago registrado')
      setShowModal(false)
      cargarDatos()
    } catch (error) {
      toast.error('Error al guardar pago')
    }
  }

  const desgloseCostes = {
    materiales: pagos.filter(p => p.tipo === 'MATERIALES').reduce((sum, p) => sum + p.importe, 0),
    manoObra: pagos.filter(p => p.tipo === 'MANO_OBRA').reduce((sum, p) => sum + p.importe, 0),
    subcontratas: pagos.filter(p => p.tipo === 'SUBCONTRATA').reduce((sum, p) => sum + p.importe, 0),
    otros: pagos.filter(p => p.tipo === 'OTROS').reduce((sum, p) => sum + p.importe, 0)
  }

  const totalCostes = Object.values(desgloseCostes).reduce((sum, val) => sum + val, 0)

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-green-600 to-emerald-700 bg-clip-text text-transparent">
              Control de Costes y Avance
            </h1>
            <p className="text-slate-600 mt-1">
              Métricas financieras y seguimiento de obras
            </p>
          </div>
          <Button 
            size="lg" 
            className="rounded-xl bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white shadow-lg shadow-green-500/30"
            onClick={() => setShowModal(true)}
          >
            <Plus className="h-5 w-5 mr-2" />
            Registrar Pago
          </Button>
        </div>

        {/* Financial Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="glass-white border-green-200/50 rounded-2xl">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-xl bg-green-100 flex items-center justify-center">
                  <DollarSign className="h-6 w-6 text-green-600" />
                </div>
                <TrendingUp className="h-5 w-5 text-green-600" />
              </div>
              <p className="text-sm text-slate-500 mb-1">Presupuestado</p>
              <p className="text-3xl font-bold text-slate-900">
                €{loading ? '0' : metricas.presupuestado.toFixed(2)}
              </p>
              <p className="text-xs text-slate-400 mt-2">Total</p>
            </CardContent>
          </Card>
          
          <Card className="glass-white border-blue-200/50 rounded-2xl">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center">
                  <Percent className="h-6 w-6 text-blue-600" />
                </div>
                <TrendingUp className="h-5 w-5 text-blue-600" />
              </div>
              <p className="text-sm text-slate-500 mb-1">Ejecutado</p>
              <p className="text-3xl font-bold text-slate-900">
                €{loading ? '0' : metricas.ejecutado.toFixed(2)}
              </p>
              <p className="text-xs text-slate-400 mt-2">
                {metricas.presupuestado > 0 
                  ? `${((metricas.ejecutado / metricas.presupuestado) * 100).toFixed(1)}% del total`
                  : '0% del total'}
              </p>
            </CardContent>
          </Card>
          
          <Card className={`glass-white rounded-2xl ${
            metricas.margen >= 0 ? 'border-green-200/50' : 'border-red-200/50'
          }`}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                  metricas.margen >= 0 ? 'bg-green-100' : 'bg-red-100'
                }`}>
                  <AlertCircle className={`h-6 w-6 ${
                    metricas.margen >= 0 ? 'text-green-600' : 'text-red-600'
                  }`} />
                </div>
                {metricas.margen >= 0 ? (
                  <TrendingUp className="h-5 w-5 text-green-600" />
                ) : (
                  <TrendingDown className="h-5 w-5 text-red-600" />
                )}
              </div>
              <p className="text-sm text-slate-500 mb-1">Margen</p>
              <p className={`text-3xl font-bold ${
                metricas.margen >= 0 ? 'text-green-700' : 'text-red-700'
              }`}>
                {loading ? '0' : metricas.margen.toFixed(1)}%
              </p>
              <p className="text-xs text-slate-400 mt-2">Estimado</p>
            </CardContent>
          </Card>
          
          <Card className="glass-white border-purple-200/50 rounded-2xl">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-xl bg-purple-100 flex items-center justify-center">
                  <Percent className="h-6 w-6 text-purple-600" />
                </div>
                <TrendingUp className="h-5 w-5 text-purple-600" />
              </div>
              <p className="text-sm text-slate-500 mb-1">Avance</p>
              <p className="text-3xl font-bold text-slate-900">
                {loading ? '0' : metricas.avance.toFixed(1)}%
              </p>
              <p className="text-xs text-slate-400 mt-2">Promedio</p>
            </CardContent>
          </Card>
        </div>

        {/* Active Projects */}
        <Card className="glass-white border-green-200/50 rounded-2xl">
          <CardHeader>
            <CardTitle className="text-lg font-bold text-slate-900">
              Obras Activas
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <p className="text-center py-8 text-slate-500">Cargando...</p>
            ) : metricas.obras.length === 0 ? (
              <div className="flex items-center justify-center py-12 text-center">
                <div>
                  <DollarSign className="h-12 w-12 text-slate-300 mx-auto mb-4" />
                  <p className="text-slate-500">No hay obras activas</p>
                  <p className="text-sm text-slate-400 mt-1">
                    Las métricas aparecerán cuando tengas obras en progreso
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                {metricas.obras.map((obra) => {
                  const diferencia = obra.ejecutado - obra.presupuestado
                  const porcentajeEjecutado = obra.presupuestado > 0 
                    ? (obra.ejecutado / obra.presupuestado) * 100 
                    : 0
                  
                  return (
                    <div key={obra.id} className="p-4 rounded-xl border border-green-200/50 hover:bg-green-50/30 transition-all">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h3 className="font-semibold text-slate-900">{obra.nombre}</h3>
                          <p className="text-sm text-slate-600">{obra.cliente}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-xs text-slate-500">Avance</p>
                          <p className="text-lg font-bold text-slate-900">{obra.avance.toFixed(0)}%</p>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-slate-600">Presupuestado:</span>
                          <span className="font-semibold">€{obra.presupuestado.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-slate-600">Ejecutado:</span>
                          <span className={`font-semibold ${
                            diferencia > 0 ? 'text-red-600' : 'text-green-600'
                          }`}>
                            €{obra.ejecutado.toFixed(2)} ({porcentajeEjecutado.toFixed(1)}%)
                          </span>
                        </div>
                        <div className="w-full bg-slate-200 rounded-full h-2">
                          <div 
                            className={`h-2 rounded-full transition-all ${
                              porcentajeEjecutado > 100 ? 'bg-red-500' : 'bg-green-500'
                            }`}
                            style={{ width: `${Math.min(porcentajeEjecutado, 100)}%` }}
                          />
                        </div>
                        {diferencia !== 0 && (
                          <div className={`text-xs ${
                            diferencia > 0 ? 'text-red-600' : 'text-green-600'
                          }`}>
                            {diferencia > 0 ? '↑' : '↓'} {Math.abs(diferencia).toFixed(2)}€ vs presupuesto
                          </div>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Cost Breakdown */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="glass-white border-green-200/50 rounded-2xl">
            <CardHeader>
              <CardTitle className="text-lg font-bold text-slate-900">
                Desglose de Costes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 rounded-xl bg-slate-50">
                  <span className="text-slate-600">Materiales</span>
                  <span className="font-bold text-slate-900">
                    €{desgloseCostes.materiales.toFixed(2)}
                  </span>
                </div>
                <div className="flex items-center justify-between p-4 rounded-xl bg-slate-50">
                  <span className="text-slate-600">Mano de obra</span>
                  <span className="font-bold text-slate-900">
                    €{desgloseCostes.manoObra.toFixed(2)}
                  </span>
                </div>
                <div className="flex items-center justify-between p-4 rounded-xl bg-slate-50">
                  <span className="text-slate-600">Subcontratas</span>
                  <span className="font-bold text-slate-900">
                    €{desgloseCostes.subcontratas.toFixed(2)}
                  </span>
                </div>
                <div className="flex items-center justify-between p-4 rounded-xl bg-slate-50">
                  <span className="text-slate-600">Otros</span>
                  <span className="font-bold text-slate-900">
                    €{desgloseCostes.otros.toFixed(2)}
                  </span>
                </div>
                <div className="flex items-center justify-between p-4 rounded-xl bg-green-50 border border-green-200">
                  <span className="text-green-700 font-semibold">Total</span>
                  <span className="font-bold text-green-700">
                    €{totalCostes.toFixed(2)}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="glass-white border-green-200/50 rounded-2xl">
            <CardHeader>
              <CardTitle className="text-lg font-bold text-slate-900">
                Últimos Pagos
              </CardTitle>
            </CardHeader>
            <CardContent>
              {pagos.length === 0 ? (
                <div className="text-center py-8">
                  <Receipt className="h-12 w-12 text-slate-300 mx-auto mb-4" />
                  <p className="text-slate-500 text-sm">No hay pagos registrados</p>
                </div>
              ) : (
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {pagos.slice(0, 10).map((pago) => (
                    <div key={pago.id} className="p-3 rounded-xl border border-green-200/50 bg-green-50/30">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <h4 className="font-medium text-sm text-slate-900">{pago.concepto}</h4>
                          <p className="text-xs text-slate-600 mt-1">
                            {pago.obra.nombre} - {pago.obra.cliente.nombre}
                          </p>
                          <div className="flex gap-2 mt-1">
                            <span className="text-xs px-2 py-0.5 bg-blue-100 text-blue-800 rounded">
                              {pago.tipo.replace('_', ' ')}
                            </span>
                            {pago.proveedor && (
                              <span className="text-xs text-slate-500">{pago.proveedor.nombre}</span>
                            )}
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-slate-900">€{pago.importe.toFixed(2)}</p>
                          <p className="text-xs text-slate-500">
                            {new Date(pago.fecha).toLocaleDateString('es-ES')}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Modal Pago */}
        {showModal && (
          <ModalPago
            onClose={() => setShowModal(false)}
            onSave={handleSavePago}
          />
        )}
      </div>
    </DashboardLayout>
  )
}

function ModalPago({ onClose, onSave }: any) {
  const [formData, setFormData] = useState({
    obraId: '',
    concepto: '',
    tipo: 'MATERIALES',
    importe: '',
    fecha: new Date().toISOString().split('T')[0],
    metodo: 'TRANSFERENCIA',
    proveedorId: '',
    notas: ''
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSave(formData)
  }

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl glass-white border-green-200/50 rounded-2xl">
        <CardHeader className="flex flex-row justify-between items-center">
          <CardTitle>Registrar Pago</CardTitle>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-sm font-medium text-slate-700">Obra ID *</label>
              <input
                value={formData.obraId}
                onChange={(e) => setFormData({ ...formData, obraId: e.target.value })}
                className="mt-1 w-full rounded-xl border border-green-200/50 p-2"
                required
                placeholder="ID de la obra"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-slate-700">Concepto *</label>
              <input
                value={formData.concepto}
                onChange={(e) => setFormData({ ...formData, concepto: e.target.value })}
                className="mt-1 w-full rounded-xl border border-green-200/50 p-2"
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-slate-700">Tipo *</label>
                <select
                  value={formData.tipo}
                  onChange={(e) => setFormData({ ...formData, tipo: e.target.value })}
                  className="mt-1 w-full rounded-xl border border-green-200/50 p-2"
                  required
                >
                  <option value="MATERIALES">Materiales</option>
                  <option value="MANO_OBRA">Mano de Obra</option>
                  <option value="SUBCONTRATA">Subcontrata</option>
                  <option value="OTROS">Otros</option>
                </select>
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700">Importe (€) *</label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.importe}
                  onChange={(e) => setFormData({ ...formData, importe: e.target.value })}
                  className="mt-1 w-full rounded-xl border border-green-200/50 p-2"
                  required
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-slate-700">Fecha</label>
                <input
                  type="date"
                  value={formData.fecha}
                  onChange={(e) => setFormData({ ...formData, fecha: e.target.value })}
                  className="mt-1 w-full rounded-xl border border-green-200/50 p-2"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700">Método</label>
                <select
                  value={formData.metodo}
                  onChange={(e) => setFormData({ ...formData, metodo: e.target.value })}
                  className="mt-1 w-full rounded-xl border border-green-200/50 p-2"
                >
                  <option value="TRANSFERENCIA">Transferencia</option>
                  <option value="EFECTIVO">Efectivo</option>
                  <option value="CHEQUE">Cheque</option>
                  <option value="TARJETA">Tarjeta</option>
                </select>
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-slate-700">Proveedor ID (opcional)</label>
              <input
                value={formData.proveedorId}
                onChange={(e) => setFormData({ ...formData, proveedorId: e.target.value })}
                className="mt-1 w-full rounded-xl border border-green-200/50 p-2"
                placeholder="ID del proveedor"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-slate-700">Notas</label>
              <textarea
                value={formData.notas}
                onChange={(e) => setFormData({ ...formData, notas: e.target.value })}
                className="mt-1 w-full rounded-xl border border-green-200/50 p-2"
                rows={3}
              />
            </div>
            <div className="flex justify-end gap-3 pt-4">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancelar
              </Button>
              <Button type="submit" className="rounded-xl bg-gradient-to-r from-green-600 to-emerald-600">
                Guardar
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
