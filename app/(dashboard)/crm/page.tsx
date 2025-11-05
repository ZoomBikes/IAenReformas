'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { 
  Plus, 
  Search, 
  Users, 
  Phone, 
  Mail, 
  MapPin,
  ArrowRight,
  Edit,
  Trash2,
  X,
  CheckCircle2,
  AlertCircle,
  TrendingUp,
  Target,
  DollarSign
} from 'lucide-react'
import { toast } from 'sonner'

interface Cliente {
  id: string
  nombre: string
  telefono?: string
  email?: string
  direccion?: string
  tipo?: string
  notas?: string
  _count?: {
    presupuestos: number
    obras: number
    leads: number
  }
}

interface Lead {
  id: string
  nombre: string
  telefono?: string
  email?: string
  estado: string
  origen?: string
  valorEstimado?: number
  campana?: {
    nombre: string
  }
  createdAt: string
}

interface Campana {
  id: string
  nombre: string
  descripcion?: string
  tipo?: string
  fechaInicio?: string
  fechaFin?: string
  presupuesto?: number
  gastoReal?: number
  activa: boolean
  _count?: {
    leads: number
  }
}

export default function CRMPage() {
  const [activeTab, setActiveTab] = useState<'clientes' | 'leads' | 'campanas'>('clientes')
  const [clientes, setClientes] = useState<Cliente[]>([])
  const [leads, setLeads] = useState<Lead[]>([])
  const [campanas, setCampanas] = useState<Campana[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [modalType, setModalType] = useState<'cliente' | 'lead' | 'campana'>('cliente')
  const [editingItem, setEditingItem] = useState<any>(null)

  useEffect(() => {
    cargarDatos()
  }, [activeTab])

  const cargarDatos = async () => {
    setLoading(true)
    try {
      if (activeTab === 'clientes') {
        const res = await fetch('/api/crm/clientes')
        const data = await res.json()
        setClientes(data.clientes || [])
      } else if (activeTab === 'leads') {
        const res = await fetch('/api/crm/leads')
        const data = await res.json()
        setLeads(data.leads || [])
      } else if (activeTab === 'campanas') {
        const res = await fetch('/api/crm/campanas')
        const data = await res.json()
        setCampanas(data.campanas || [])
      }
    } catch (error) {
      toast.error('Error al cargar datos')
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  const handleCreate = () => {
    setEditingItem(null)
    setShowModal(true)
  }

  const handleEdit = (item: any) => {
    setEditingItem(item)
    setShowModal(true)
  }

  const handleDelete = async (id: string, tipo: string) => {
    if (!confirm('¿Estás seguro de eliminar este elemento?')) return

    try {
      const endpoint = tipo === 'cliente' ? `/api/crm/clientes/${id}` :
                      tipo === 'lead' ? `/api/crm/leads/${id}` : null
      
      if (!endpoint) return

      const res = await fetch(endpoint, { method: 'DELETE' })
      if (!res.ok) throw new Error('Error al eliminar')

      toast.success('Eliminado correctamente')
      cargarDatos()
    } catch (error) {
      toast.error('Error al eliminar')
      console.error(error)
    }
  }

  const handleSave = async (formData: any) => {
    try {
      let endpoint = ''
      let method = 'POST'

      if (modalType === 'cliente') {
        endpoint = editingItem ? `/api/crm/clientes/${editingItem.id}` : '/api/crm/clientes'
        method = editingItem ? 'PUT' : 'POST'
      } else if (modalType === 'lead') {
        endpoint = editingItem ? `/api/crm/leads/${editingItem.id}` : '/api/crm/leads'
        method = editingItem ? 'PUT' : 'POST'
      } else if (modalType === 'campana') {
        endpoint = '/api/crm/campanas'
      }

      const res = await fetch(endpoint, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      if (!res.ok) throw new Error('Error al guardar')

      toast.success(editingItem ? 'Actualizado correctamente' : 'Creado correctamente')
      setShowModal(false)
      cargarDatos()
    } catch (error) {
      toast.error('Error al guardar')
      console.error(error)
    }
  }

  const clientesFiltrados = clientes.filter(c =>
    c.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.telefono?.includes(searchTerm) ||
    c.email?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const leadsFiltrados = leads.filter(l =>
    l.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
    l.telefono?.includes(searchTerm) ||
    l.email?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const campanasFiltradas = campanas.filter(c =>
    c.nombre.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const stats = {
    totalClientes: clientes.length,
    totalLeads: leads.length,
    leadsNuevos: leads.filter(l => l.estado === 'NUEVO').length,
    campanasActivas: campanas.filter(c => c.activa).length
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-700 bg-clip-text text-transparent">
              CRM y Captación
            </h1>
            <p className="text-slate-600 mt-1">
              Gestiona tus clientes, leads y contactos comerciales
            </p>
          </div>
          <Button 
            size="lg" 
            className="rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg shadow-blue-500/30"
            onClick={() => {
              setModalType(activeTab === 'campanas' ? 'campana' : activeTab === 'leads' ? 'lead' : 'cliente')
              handleCreate()
            }}
          >
            <Plus className="h-5 w-5 mr-2" />
            Nuevo {activeTab === 'campanas' ? 'Campaña' : activeTab === 'leads' ? 'Lead' : 'Cliente'}
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="glass-white border-blue-200/50 rounded-2xl">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center">
                  <Users className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-slate-500">Total Clientes</p>
                  <p className="text-2xl font-bold text-slate-900">{stats.totalClientes}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="glass-white border-indigo-200/50 rounded-2xl">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-indigo-100 flex items-center justify-center">
                  <ArrowRight className="h-6 w-6 text-indigo-600" />
                </div>
                <div>
                  <p className="text-sm text-slate-500">Leads</p>
                  <p className="text-2xl font-bold text-slate-900">{stats.totalLeads}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="glass-white border-green-200/50 rounded-2xl">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-green-100 flex items-center justify-center">
                  <Target className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-slate-500">Leads Nuevos</p>
                  <p className="text-2xl font-bold text-slate-900">{stats.leadsNuevos}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="glass-white border-purple-200/50 rounded-2xl">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-purple-100 flex items-center justify-center">
                  <TrendingUp className="h-6 w-6 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm text-slate-500">Campañas Activas</p>
                  <p className="text-2xl font-bold text-slate-900">{stats.campanasActivas}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 border-b border-blue-200/50">
          <button
            onClick={() => setActiveTab('clientes')}
            className={`px-6 py-3 font-medium transition-all ${
              activeTab === 'clientes'
                ? 'border-b-2 border-blue-600 text-blue-600'
                : 'text-slate-600 hover:text-blue-600'
            }`}
          >
            Clientes
          </button>
          <button
            onClick={() => setActiveTab('leads')}
            className={`px-6 py-3 font-medium transition-all ${
              activeTab === 'leads'
                ? 'border-b-2 border-blue-600 text-blue-600'
                : 'text-slate-600 hover:text-blue-600'
            }`}
          >
            Leads
          </button>
          <button
            onClick={() => setActiveTab('campanas')}
            className={`px-6 py-3 font-medium transition-all ${
              activeTab === 'campanas'
                ? 'border-b-2 border-blue-600 text-blue-600'
                : 'text-slate-600 hover:text-blue-600'
            }`}
          >
            Campañas
          </button>
        </div>

        {/* Search */}
        <Card className="glass-white border-blue-200/50 rounded-2xl">
          <CardContent className="p-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400" />
                <Input
                  placeholder="Buscar..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 rounded-xl border-blue-200/50"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Content */}
        {loading ? (
          <Card className="glass-white border-blue-200/50 rounded-2xl">
            <CardContent className="p-12 text-center">
              <p className="text-slate-500">Cargando...</p>
            </CardContent>
          </Card>
        ) : activeTab === 'clientes' ? (
          <Card className="glass-white border-blue-200/50 rounded-2xl">
            <CardHeader>
              <CardTitle>Lista de Clientes</CardTitle>
              <CardDescription>{clientesFiltrados.length} clientes</CardDescription>
            </CardHeader>
            <CardContent>
              {clientesFiltrados.length === 0 ? (
                <div className="text-center py-12">
                  <Users className="h-12 w-12 text-slate-300 mx-auto mb-4" />
                  <p className="text-slate-500">No hay clientes registrados</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {clientesFiltrados.map((cliente) => (
                    <div key={cliente.id} className="p-4 rounded-xl border border-blue-200/50 hover:bg-blue-50/30 transition-all">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <h3 className="font-semibold text-slate-900">{cliente.nombre}</h3>
                          <div className="flex flex-wrap gap-4 mt-2 text-sm text-slate-600">
                            {cliente.telefono && (
                              <span className="flex items-center gap-1">
                                <Phone className="h-4 w-4" />
                                {cliente.telefono}
                              </span>
                            )}
                            {cliente.email && (
                              <span className="flex items-center gap-1">
                                <Mail className="h-4 w-4" />
                                {cliente.email}
                              </span>
                            )}
                            {cliente._count && (
                              <span className="flex items-center gap-1">
                                <DollarSign className="h-4 w-4" />
                                {cliente._count.presupuestos} presupuestos, {cliente._count.obras} obras
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setModalType('cliente')
                              handleEdit(cliente)
                            }}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-red-600 hover:text-red-700"
                            onClick={() => handleDelete(cliente.id, 'cliente')}
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
        ) : activeTab === 'leads' ? (
          <Card className="glass-white border-blue-200/50 rounded-2xl">
            <CardHeader>
              <CardTitle>Lista de Leads</CardTitle>
              <CardDescription>{leadsFiltrados.length} leads</CardDescription>
            </CardHeader>
            <CardContent>
              {leadsFiltrados.length === 0 ? (
                <div className="text-center py-12">
                  <Target className="h-12 w-12 text-slate-300 mx-auto mb-4" />
                  <p className="text-slate-500">No hay leads registrados</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {leadsFiltrados.map((lead) => (
                    <div key={lead.id} className="p-4 rounded-xl border border-blue-200/50 hover:bg-blue-50/30 transition-all">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="font-semibold text-slate-900">{lead.nombre}</h3>
                            <span className={`px-2 py-1 text-xs rounded-full ${
                              lead.estado === 'NUEVO' ? 'bg-blue-100 text-blue-800' :
                              lead.estado === 'CONVERTIDO' ? 'bg-green-100 text-green-800' :
                              'bg-slate-100 text-slate-800'
                            }`}>
                              {lead.estado}
                            </span>
                          </div>
                          <div className="flex flex-wrap gap-4 text-sm text-slate-600">
                            {lead.telefono && <span><Phone className="h-4 w-4 inline mr-1" />{lead.telefono}</span>}
                            {lead.email && <span><Mail className="h-4 w-4 inline mr-1" />{lead.email}</span>}
                            {lead.valorEstimado && <span><DollarSign className="h-4 w-4 inline mr-1" />€{lead.valorEstimado.toFixed(2)}</span>}
                            {lead.campana && <span className="text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded">{lead.campana.nombre}</span>}
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setModalType('lead')
                              handleEdit(lead)
                            }}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-red-600 hover:text-red-700"
                            onClick={() => handleDelete(lead.id, 'lead')}
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
        ) : (
          <Card className="glass-white border-blue-200/50 rounded-2xl">
            <CardHeader>
              <CardTitle>Lista de Campañas</CardTitle>
              <CardDescription>{campanasFiltradas.length} campañas</CardDescription>
            </CardHeader>
            <CardContent>
              {campanasFiltradas.length === 0 ? (
                <div className="text-center py-12">
                  <TrendingUp className="h-12 w-12 text-slate-300 mx-auto mb-4" />
                  <p className="text-slate-500">No hay campañas registradas</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {campanasFiltradas.map((campana) => (
                    <div key={campana.id} className="p-4 rounded-xl border border-blue-200/50 hover:bg-blue-50/30 transition-all">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="font-semibold text-slate-900">{campana.nombre}</h3>
                            {campana.activa && (
                              <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800">
                                Activa
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-slate-600 mb-2">{campana.descripcion}</p>
                          <div className="flex flex-wrap gap-4 text-sm text-slate-600">
                            {campana._count && <span>{campana._count.leads} leads</span>}
                            {campana.presupuesto && <span>Presupuesto: €{campana.presupuesto.toFixed(2)}</span>}
                            {campana.gastoReal && <span>Gasto: €{campana.gastoReal.toFixed(2)}</span>}
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setModalType('campana')
                              handleEdit(campana)
                            }}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Modal */}
        {showModal && (
          <ModalForm
            tipo={modalType}
            item={editingItem}
            onClose={() => setShowModal(false)}
            onSave={handleSave}
          />
        )}
      </div>
    </DashboardLayout>
  )
}

function ModalForm({ tipo, item, onClose, onSave }: any) {
  const [formData, setFormData] = useState<any>({
    nombre: item?.nombre || '',
    telefono: item?.telefono || '',
    email: item?.email || '',
    direccion: item?.direccion || '',
    tipo: item?.tipo || 'particular',
    notas: item?.notas || '',
    estado: item?.estado || 'NUEVO',
    origen: item?.origen || '',
    valorEstimado: item?.valorEstimado || '',
    descripcion: item?.descripcion || '',
    fechaInicio: item?.fechaInicio ? new Date(item.fechaInicio).toISOString().split('T')[0] : '',
    fechaFin: item?.fechaFin ? new Date(item.fechaFin).toISOString().split('T')[0] : '',
    presupuesto: item?.presupuesto || ''
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSave(formData)
  }

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto glass-white border-blue-200/50 rounded-2xl">
        <CardHeader className="flex flex-row justify-between items-center">
          <CardTitle>
            {item ? 'Editar' : 'Nuevo'} {tipo === 'cliente' ? 'Cliente' : tipo === 'lead' ? 'Lead' : 'Campaña'}
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

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-slate-700">Teléfono</label>
                <Input
                  value={formData.telefono}
                  onChange={(e) => setFormData({ ...formData, telefono: e.target.value })}
                  className="mt-1 rounded-xl"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700">Email</label>
                <Input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="mt-1 rounded-xl"
                />
              </div>
            </div>

            {tipo === 'cliente' && (
              <>
                <div>
                  <label className="text-sm font-medium text-slate-700">Dirección</label>
                  <Input
                    value={formData.direccion}
                    onChange={(e) => setFormData({ ...formData, direccion: e.target.value })}
                    className="mt-1 rounded-xl"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-700">Tipo</label>
                  <Input
                    value={formData.tipo}
                    onChange={(e) => setFormData({ ...formData, tipo: e.target.value })}
                    className="mt-1 rounded-xl"
                    placeholder="particular, empresa, etc."
                  />
                </div>
              </>
            )}

            {tipo === 'lead' && (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-slate-700">Estado</label>
                    <select
                      value={formData.estado}
                      onChange={(e) => setFormData({ ...formData, estado: e.target.value })}
                      className="mt-1 w-full rounded-xl border border-blue-200/50 p-2"
                    >
                      <option value="NUEVO">Nuevo</option>
                      <option value="CONTACTADO">Contactado</option>
                      <option value="CALIFICADO">Calificado</option>
                      <option value="CONVERTIDO">Convertido</option>
                      <option value="DESCARTADO">Descartado</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-slate-700">Origen</label>
                    <Input
                      value={formData.origen}
                      onChange={(e) => setFormData({ ...formData, origen: e.target.value })}
                      className="mt-1 rounded-xl"
                      placeholder="web, referencia, etc."
                    />
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-700">Valor Estimado (€)</label>
                  <Input
                    type="number"
                    value={formData.valorEstimado}
                    onChange={(e) => setFormData({ ...formData, valorEstimado: e.target.value })}
                    className="mt-1 rounded-xl"
                  />
                </div>
              </>
            )}

            {tipo === 'campana' && (
              <>
                <div>
                  <label className="text-sm font-medium text-slate-700">Descripción</label>
                  <textarea
                    value={formData.descripcion}
                    onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                    className="mt-1 w-full rounded-xl border border-blue-200/50 p-2"
                    rows={3}
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
                    <label className="text-sm font-medium text-slate-700">Fecha Fin</label>
                    <Input
                      type="date"
                      value={formData.fechaFin}
                      onChange={(e) => setFormData({ ...formData, fechaFin: e.target.value })}
                      className="mt-1 rounded-xl"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-700">Presupuesto (€)</label>
                  <Input
                    type="number"
                    value={formData.presupuesto}
                    onChange={(e) => setFormData({ ...formData, presupuesto: e.target.value })}
                    className="mt-1 rounded-xl"
                  />
                </div>
              </>
            )}

            <div>
              <label className="text-sm font-medium text-slate-700">Notas</label>
              <textarea
                value={formData.notas}
                onChange={(e) => setFormData({ ...formData, notas: e.target.value })}
                className="mt-1 w-full rounded-xl border border-blue-200/50 p-2"
                rows={3}
              />
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancelar
              </Button>
              <Button type="submit" className="rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600">
                Guardar
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
