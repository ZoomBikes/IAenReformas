'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { 
  Calendar as CalendarIcon, 
  Clock, 
  CheckCircle2,
  AlertCircle,
  Plus,
  Edit,
  Trash2,
  X,
  Building2,
  User
} from 'lucide-react'
import { toast } from 'sonner'

interface Obra {
  id: string
  nombre: string
  direccion: string
  estado: string
  fechaInicio?: string
  fechaFinPrevista?: string
  presupuestoTotal: number
  costeReal?: number
  avance?: number
  cliente: {
    nombre: string
  }
  _count?: {
    tareas: number
  }
}

interface Tarea {
  id: string
  nombre: string
  descripcion?: string
  estado: string
  prioridad?: number
  fechaFinPrevista?: string
  responsable?: string
  obra: {
    nombre: string
    cliente: {
      nombre: string
    }
  }
}

export default function PlanificacionPage() {
  const [obras, setObras] = useState<Obra[]>([])
  const [tareas, setTareas] = useState<Tarea[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [modalType, setModalType] = useState<'obra' | 'tarea'>('tarea')
  const [editingItem, setEditingItem] = useState<any>(null)

  useEffect(() => {
    cargarDatos()
  }, [])

  const cargarDatos = async () => {
    setLoading(true)
    try {
      const [obrasRes, tareasRes] = await Promise.all([
        fetch('/api/planificacion/obras'),
        fetch('/api/planificacion/tareas')
      ])
      
      const obrasData = await obrasRes.json()
      const tareasData = await tareasRes.json()
      
      setObras(obrasData.obras || [])
      setTareas(tareasData.tareas || [])
    } catch (error) {
      toast.error('Error al cargar datos')
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  const tareasPorEstado = {
    pendientes: tareas.filter(t => t.estado === 'PENDIENTE'),
    enProgreso: tareas.filter(t => t.estado === 'EN_PROGRESO'),
    completadas: tareas.filter(t => t.estado === 'COMPLETADA')
  }

  const obrasPorEstado = {
    planificadas: obras.filter(o => o.estado === 'PLANIFICADA'),
    enProgreso: obras.filter(o => o.estado === 'EN_PROGRESO'),
    completadas: obras.filter(o => o.estado === 'COMPLETADA')
  }

  const handleDelete = async (id: string, tipo: string) => {
    if (!confirm('¿Estás seguro de eliminar?')) return

    try {
      const res = await fetch(`/api/planificacion/${tipo}/${id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('Error al eliminar')
      
      toast.success('Eliminado correctamente')
      cargarDatos()
    } catch (error) {
      toast.error('Error al eliminar')
    }
  }

  const handleSave = async (formData: any) => {
    try {
      let endpoint = ''
      let method = 'POST'

      if (modalType === 'obra') {
        endpoint = editingItem ? `/api/planificacion/obras/${editingItem.id}` : '/api/planificacion/obras'
        method = editingItem ? 'PUT' : 'POST'
      } else {
        endpoint = editingItem ? `/api/planificacion/tareas/${editingItem.id}` : '/api/planificacion/tareas'
        method = editingItem ? 'PUT' : 'POST'
      }

      const res = await fetch(endpoint, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      if (!res.ok) throw new Error('Error al guardar')

      toast.success(editingItem ? 'Actualizado' : 'Creado')
      setShowModal(false)
      cargarDatos()
    } catch (error) {
      toast.error('Error al guardar')
    }
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-700 bg-clip-text text-transparent">
              Planificación
            </h1>
            <p className="text-slate-600 mt-1">
              Calendario de obras y tareas programadas
            </p>
          </div>
          <div className="flex gap-2">
            <Button 
              size="lg" 
              className="rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white shadow-lg shadow-indigo-500/30"
              onClick={() => {
                setModalType('tarea')
                setEditingItem(null)
                setShowModal(true)
              }}
            >
            <Plus className="h-5 w-5 mr-2" />
            Nueva Tarea
          </Button>
            <Button 
              size="lg" 
              variant="outline"
              className="rounded-xl border-indigo-200/50"
              onClick={() => {
                setModalType('obra')
                setEditingItem(null)
                setShowModal(true)
              }}
            >
              <Plus className="h-5 w-5 mr-2" />
              Nueva Obra
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="glass-white border-indigo-200/50 rounded-2xl">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-indigo-100 flex items-center justify-center">
                  <Building2 className="h-6 w-6 text-indigo-600" />
                </div>
                <div>
                  <p className="text-sm text-slate-500">Total Obras</p>
                  <p className="text-2xl font-bold text-slate-900">{obras.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="glass-white border-blue-200/50 rounded-2xl">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center">
                  <Clock className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-slate-500">Tareas Pendientes</p>
                  <p className="text-2xl font-bold text-slate-900">{tareasPorEstado.pendientes.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="glass-white border-orange-200/50 rounded-2xl">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-orange-100 flex items-center justify-center">
                  <AlertCircle className="h-6 w-6 text-orange-600" />
                </div>
                <div>
                  <p className="text-sm text-slate-500">En Progreso</p>
                  <p className="text-2xl font-bold text-slate-900">{tareasPorEstado.enProgreso.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="glass-white border-green-200/50 rounded-2xl">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-green-100 flex items-center justify-center">
                  <CheckCircle2 className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-slate-500">Completadas</p>
                  <p className="text-2xl font-bold text-slate-900">{tareasPorEstado.completadas.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Obras */}
        <Card className="glass-white border-indigo-200/50 rounded-2xl">
          <CardHeader>
            <CardTitle>Obras Activas</CardTitle>
            <CardDescription>{obras.length} obras registradas</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <p className="text-center py-8 text-slate-500">Cargando...</p>
            ) : obras.length === 0 ? (
              <div className="text-center py-12">
                <Building2 className="h-12 w-12 text-slate-300 mx-auto mb-4" />
                <p className="text-slate-500">No hay obras registradas</p>
              </div>
            ) : (
              <div className="space-y-3">
                {obras.map((obra) => (
                  <div key={obra.id} className="p-4 rounded-xl border border-indigo-200/50 hover:bg-indigo-50/30 transition-all">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-semibold text-slate-900">{obra.nombre}</h3>
                          <span className={`px-2 py-1 text-xs rounded-full ${
                            obra.estado === 'EN_PROGRESO' ? 'bg-orange-100 text-orange-800' :
                            obra.estado === 'COMPLETADA' ? 'bg-green-100 text-green-800' :
                            'bg-blue-100 text-blue-800'
                          }`}>
                            {obra.estado.replace('_', ' ')}
                          </span>
                        </div>
                        <p className="text-sm text-slate-600 mb-2">{obra.cliente.nombre} - {obra.direccion}</p>
                        <div className="flex gap-4 text-sm text-slate-600">
                          <span>Presupuesto: €{obra.presupuestoTotal.toFixed(2)}</span>
                          {obra.avance !== undefined && <span>Avance: {obra.avance.toFixed(0)}%</span>}
                          {obra._count && <span>{obra._count.tareas} tareas</span>}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setModalType('obra')
                            setEditingItem(obra)
                            setShowModal(true)
                          }}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-red-600"
                          onClick={() => handleDelete(obra.id, 'obras')}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
            </div>
            )}
          </CardContent>
        </Card>

        {/* Tareas por Estado */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="glass-white border-blue-200/50 rounded-2xl">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-yellow-600" />
                <CardTitle className="text-lg">Pendientes</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              {tareasPorEstado.pendientes.length === 0 ? (
                <p className="text-center py-8 text-slate-400 text-sm">Sin tareas pendientes</p>
              ) : (
                <div className="space-y-2">
                  {tareasPorEstado.pendientes.map((tarea) => (
                    <div key={tarea.id} className="p-3 rounded-xl border border-blue-200/50 bg-blue-50/30">
                      <h4 className="font-medium text-sm text-slate-900">{tarea.nombre}</h4>
                      <p className="text-xs text-slate-600 mt-1">{tarea.obra.nombre}</p>
                      {tarea.responsable && (
                        <p className="text-xs text-slate-500 mt-1 flex items-center gap-1">
                          <User className="h-3 w-3" />
                          {tarea.responsable}
                        </p>
                      )}
                    </div>
                  ))}
              </div>
              )}
            </CardContent>
          </Card>

          <Card className="glass-white border-blue-200/50 rounded-2xl">
            <CardHeader>
              <div className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-orange-600" />
                <CardTitle className="text-lg">En Progreso</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              {tareasPorEstado.enProgreso.length === 0 ? (
                <p className="text-center py-8 text-slate-400 text-sm">Sin obras en progreso</p>
              ) : (
                <div className="space-y-2">
                  {tareasPorEstado.enProgreso.map((tarea) => (
                    <div key={tarea.id} className="p-3 rounded-xl border border-orange-200/50 bg-orange-50/30">
                      <h4 className="font-medium text-sm text-slate-900">{tarea.nombre}</h4>
                      <p className="text-xs text-slate-600 mt-1">{tarea.obra.nombre}</p>
                      {tarea.responsable && (
                        <p className="text-xs text-slate-500 mt-1 flex items-center gap-1">
                          <User className="h-3 w-3" />
                          {tarea.responsable}
                        </p>
                      )}
                    </div>
                  ))}
              </div>
              )}
            </CardContent>
          </Card>

          <Card className="glass-white border-blue-200/50 rounded-2xl">
            <CardHeader>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-green-600" />
                <CardTitle className="text-lg">Completadas</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              {tareasPorEstado.completadas.length === 0 ? (
                <p className="text-center py-8 text-slate-400 text-sm">Sin obras completadas</p>
              ) : (
                <div className="space-y-2">
                  {tareasPorEstado.completadas.map((tarea) => (
                    <div key={tarea.id} className="p-3 rounded-xl border border-green-200/50 bg-green-50/30">
                      <h4 className="font-medium text-sm text-slate-900">{tarea.nombre}</h4>
                      <p className="text-xs text-slate-600 mt-1">{tarea.obra.nombre}</p>
                    </div>
                  ))}
              </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Modal */}
        {showModal && (
          <ModalForm
            tipo={modalType}
            item={editingItem}
            obras={obras}
            onClose={() => setShowModal(false)}
            onSave={handleSave}
          />
        )}
      </div>
    </DashboardLayout>
  )
}

function ModalForm({ tipo, item, obras, onClose, onSave }: any) {
  const [formData, setFormData] = useState<any>({
    nombre: item?.nombre || '',
    direccion: item?.direccion || '',
    descripcion: item?.descripcion || '',
    estado: item?.estado || (tipo === 'obra' ? 'PLANIFICADA' : 'PENDIENTE'),
    fechaInicio: item?.fechaInicio ? new Date(item.fechaInicio).toISOString().split('T')[0] : '',
    fechaFinPrevista: item?.fechaFinPrevista ? new Date(item.fechaFinPrevista).toISOString().split('T')[0] : '',
    presupuestoTotal: item?.presupuestoTotal || '',
    clienteId: item?.clienteId || '',
    obraId: item?.obraId || '',
    prioridad: item?.prioridad || 3,
    responsable: item?.responsable || '',
    horasEstimadas: item?.horasEstimadas || '',
    costeEstimado: item?.costeEstimado || ''
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSave(formData)
  }

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto glass-white border-indigo-200/50 rounded-2xl">
        <CardHeader className="flex flex-row justify-between items-center">
          <CardTitle>
            {item ? 'Editar' : 'Nueva'} {tipo === 'obra' ? 'Obra' : 'Tarea'}
          </CardTitle>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-sm font-medium text-slate-700">Nombre *</label>
              <Input
                value={formData.nombre}
                onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                className="mt-1 rounded-xl"
                required
              />
            </div>

            {tipo === 'obra' ? (
              <>
                <div>
                  <label className="text-sm font-medium text-slate-700">Dirección *</label>
                  <Input
                    value={formData.direccion}
                    onChange={(e) => setFormData({ ...formData, direccion: e.target.value })}
                    className="mt-1 rounded-xl"
                    required
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-700">Cliente ID *</label>
                  <Input
                    value={formData.clienteId}
                    onChange={(e) => setFormData({ ...formData, clienteId: e.target.value })}
                    className="mt-1 rounded-xl"
                    required
                    placeholder="ID del cliente"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-700">Presupuesto Total (€)</label>
                  <Input
                    type="number"
                    value={formData.presupuestoTotal}
                    onChange={(e) => setFormData({ ...formData, presupuestoTotal: e.target.value })}
                    className="mt-1 rounded-xl"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-slate-700">Fecha Inicio</label>
                    <Input
                      type="date"
                      value={formData.fechaInicio}
                      onChange={(e) => setFormData({ ...formData, fechaInicio: e.target.value })}
                      className="mt-1 rounded-xl"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-slate-700">Fecha Fin Prevista</label>
                    <Input
                      type="date"
                      value={formData.fechaFinPrevista}
                      onChange={(e) => setFormData({ ...formData, fechaFinPrevista: e.target.value })}
                      className="mt-1 rounded-xl"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-700">Estado</label>
                  <select
                    value={formData.estado}
                    onChange={(e) => setFormData({ ...formData, estado: e.target.value })}
                    className="mt-1 w-full rounded-xl border border-blue-200/50 p-2"
                  >
                    <option value="PLANIFICADA">Planificada</option>
                    <option value="EN_PROGRESO">En Progreso</option>
                    <option value="PAUSADA">Pausada</option>
                    <option value="COMPLETADA">Completada</option>
                  </select>
                </div>
              </>
            ) : (
              <>
                <div>
                  <label className="text-sm font-medium text-slate-700">Obra *</label>
                  <select
                    value={formData.obraId}
                    onChange={(e) => setFormData({ ...formData, obraId: e.target.value })}
                    className="mt-1 w-full rounded-xl border border-blue-200/50 p-2"
                    required
                  >
                    <option value="">Seleccionar obra...</option>
                    {obras.map((obra: any) => (
                      <option key={obra.id} value={obra.id}>{obra.nombre}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-700">Responsable</label>
                  <Input
                    value={formData.responsable}
                    onChange={(e) => setFormData({ ...formData, responsable: e.target.value })}
                    className="mt-1 rounded-xl"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-slate-700">Prioridad</label>
                    <select
                      value={formData.prioridad}
                      onChange={(e) => setFormData({ ...formData, prioridad: parseInt(e.target.value) })}
                      className="mt-1 w-full rounded-xl border border-blue-200/50 p-2"
                    >
                      <option value="1">Alta</option>
                      <option value="2">Media</option>
                      <option value="3">Baja</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-slate-700">Estado</label>
                    <select
                      value={formData.estado}
                      onChange={(e) => setFormData({ ...formData, estado: e.target.value })}
                      className="mt-1 w-full rounded-xl border border-blue-200/50 p-2"
                    >
                      <option value="PENDIENTE">Pendiente</option>
                      <option value="EN_PROGRESO">En Progreso</option>
                      <option value="COMPLETADA">Completada</option>
                    </select>
                  </div>
                </div>
              </>
            )}

            <div>
              <label className="text-sm font-medium text-slate-700">Descripción</label>
              <textarea
                value={formData.descripcion}
                onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                className="mt-1 w-full rounded-xl border border-blue-200/50 p-2"
                rows={3}
              />
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancelar
              </Button>
              <Button type="submit" className="rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600">
                Guardar
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
