'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { 
  ShoppingCart, 
  Package,
  Truck,
  DollarSign,
  Plus,
  Search,
  Edit,
  Trash2,
  X,
  Building2,
  FileText
} from 'lucide-react'
import { toast } from 'sonner'

interface Proveedor {
  id: string
  nombre: string
  contacto?: string
  telefono?: string
  email?: string
  tipo?: string
  activo: boolean
  _count?: {
    ordenes: number
    contratos: number
  }
}

interface OrdenCompra {
  id: string
  numero: string
  descripcion?: string
  estado: string
  fechaEmision: string
  fechaEntregaReal?: string
  subtotal: number
  iva: number
  total: number
  proveedor: {
    nombre: string
  }
  obra?: {
    nombre: string
    cliente: {
      nombre: string
    }
  }
  items: Array<{
    descripcion: string
    cantidad: number
    precioTotal: number
  }>
}

interface ContratoSubcontrata {
  id: string
  nombre: string
  tipoTrabajo?: string
  estado: string
  importeTotal: number
  importePagado?: number
  porcentajeAvance?: number
  proveedor: {
    nombre: string
  }
  obra: {
    nombre: string
    cliente: {
      nombre: string
    }
  }
}

export default function ComprasPage() {
  const [activeTab, setActiveTab] = useState<'ordenes' | 'proveedores' | 'subcontratas'>('ordenes')
  const [proveedores, setProveedores] = useState<Proveedor[]>([])
  const [ordenes, setOrdenes] = useState<OrdenCompra[]>([])
  const [contratos, setContratos] = useState<ContratoSubcontrata[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [modalType, setModalType] = useState<'proveedor' | 'orden' | 'subcontrata'>('proveedor')
  const [editingItem, setEditingItem] = useState<any>(null)

  useEffect(() => {
    cargarDatos()
  }, [activeTab])

  const cargarDatos = async () => {
    setLoading(true)
    try {
      if (activeTab === 'proveedores') {
        const res = await fetch('/api/compras/proveedores')
        const data = await res.json()
        setProveedores(data.proveedores || [])
      } else if (activeTab === 'ordenes') {
        const res = await fetch('/api/compras/ordenes')
        const data = await res.json()
        setOrdenes(data.ordenes || [])
      } else if (activeTab === 'subcontratas') {
        const res = await fetch('/api/compras/subcontratas')
        const data = await res.json()
        setContratos(data.contratos || [])
      }
    } catch (error) {
      toast.error('Error al cargar datos')
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string, tipo: string) => {
    if (!confirm('¿Estás seguro de eliminar?')) return

    try {
      const endpoint = tipo === 'proveedor' ? `/api/compras/proveedores/${id}` : null
      if (!endpoint) return

      const res = await fetch(endpoint, { method: 'DELETE' })
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

      if (modalType === 'proveedor') {
        endpoint = editingItem ? `/api/compras/proveedores/${editingItem.id}` : '/api/compras/proveedores'
        method = editingItem ? 'PUT' : 'POST'
      } else if (modalType === 'orden') {
        endpoint = '/api/compras/ordenes'
      } else if (modalType === 'subcontrata') {
        endpoint = '/api/compras/subcontratas'
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

  const ordenesFiltradas = ordenes.filter(o =>
    o.numero.toLowerCase().includes(searchTerm.toLowerCase()) ||
    o.proveedor.nombre.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const proveedoresFiltrados = proveedores.filter(p =>
    p.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.telefono?.includes(searchTerm)
  )

  const contratosFiltrados = contratos.filter(c =>
    c.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.proveedor.nombre.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const stats = {
    totalOrdenes: ordenes.length,
    pendientes: ordenes.filter(o => o.estado === 'ENVIADA' || o.estado === 'CONFIRMADA').length,
    enTransito: ordenes.filter(o => o.estado === 'EN_TRANSITO').length,
    totalProveedores: proveedores.filter(p => p.activo).length
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-700 bg-clip-text text-transparent">
              Compras y Subcontratas
            </h1>
            <p className="text-slate-600 mt-1">
              Gestiona órdenes de compra y proveedores
            </p>
          </div>
          <Button 
            size="lg" 
            className="rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white shadow-lg shadow-purple-500/30"
            onClick={() => {
              const tipo = activeTab === 'proveedores' ? 'proveedor' : 
                          activeTab === 'subcontratas' ? 'subcontrata' : 'orden'
              setModalType(tipo as any)
              setEditingItem(null)
              setShowModal(true)
            }}
          >
            <Plus className="h-5 w-5 mr-2" />
            Nuevo {activeTab === 'proveedores' ? 'Proveedor' : activeTab === 'subcontratas' ? 'Contrato' : 'Orden'}
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="glass-white border-purple-200/50 rounded-2xl">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-purple-100 flex items-center justify-center">
                  <ShoppingCart className="h-6 w-6 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm text-slate-500">Órdenes</p>
                  <p className="text-2xl font-bold text-slate-900">{stats.totalOrdenes}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="glass-white border-blue-200/50 rounded-2xl">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center">
                  <Package className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-slate-500">Pendientes</p>
                  <p className="text-2xl font-bold text-slate-900">{stats.pendientes}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="glass-white border-green-200/50 rounded-2xl">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-green-100 flex items-center justify-center">
                  <Truck className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-slate-500">En tránsito</p>
                  <p className="text-2xl font-bold text-slate-900">{stats.enTransito}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="glass-white border-orange-200/50 rounded-2xl">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-orange-100 flex items-center justify-center">
                  <DollarSign className="h-6 w-6 text-orange-600" />
                </div>
                <div>
                  <p className="text-sm text-slate-500">Proveedores</p>
                  <p className="text-2xl font-bold text-slate-900">{stats.totalProveedores}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 border-b border-purple-200/50">
          <button
            onClick={() => setActiveTab('ordenes')}
            className={`px-6 py-3 font-medium transition-all ${
              activeTab === 'ordenes'
                ? 'border-b-2 border-purple-600 text-purple-600'
                : 'text-slate-600 hover:text-purple-600'
            }`}
          >
            Órdenes
          </button>
          <button
            onClick={() => setActiveTab('proveedores')}
            className={`px-6 py-3 font-medium transition-all ${
              activeTab === 'proveedores'
                ? 'border-b-2 border-purple-600 text-purple-600'
                : 'text-slate-600 hover:text-purple-600'
            }`}
          >
            Proveedores
          </button>
          <button
            onClick={() => setActiveTab('subcontratas')}
            className={`px-6 py-3 font-medium transition-all ${
              activeTab === 'subcontratas'
                ? 'border-b-2 border-purple-600 text-purple-600'
                : 'text-slate-600 hover:text-purple-600'
            }`}
          >
            Subcontratas
          </button>
        </div>

        {/* Search */}
        <Card className="glass-white border-purple-200/50 rounded-2xl">
          <CardContent className="p-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400" />
                <Input
                  placeholder="Buscar..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 rounded-xl border-purple-200/50"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Content */}
        {loading ? (
          <Card className="glass-white border-purple-200/50 rounded-2xl">
            <CardContent className="p-12 text-center">
              <p className="text-slate-500">Cargando...</p>
            </CardContent>
          </Card>
        ) : activeTab === 'ordenes' ? (
          <Card className="glass-white border-purple-200/50 rounded-2xl">
            <CardHeader>
              <CardTitle>Órdenes de Compra</CardTitle>
              <CardDescription>{ordenesFiltradas.length} órdenes</CardDescription>
            </CardHeader>
            <CardContent>
              {ordenesFiltradas.length === 0 ? (
                <div className="text-center py-12">
                  <ShoppingCart className="h-12 w-12 text-slate-300 mx-auto mb-4" />
                  <p className="text-slate-500">No hay órdenes registradas</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {ordenesFiltradas.map((orden) => (
                    <div key={orden.id} className="p-4 rounded-xl border border-purple-200/50 hover:bg-purple-50/30 transition-all">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="font-semibold text-slate-900">#{orden.numero}</h3>
                            <span className={`px-2 py-1 text-xs rounded-full ${
                              orden.estado === 'RECIBIDA' ? 'bg-green-100 text-green-800' :
                              orden.estado === 'EN_TRANSITO' ? 'bg-blue-100 text-blue-800' :
                              'bg-orange-100 text-orange-800'
                            }`}>
                              {orden.estado.replace('_', ' ')}
                            </span>
                          </div>
                          <p className="text-sm text-slate-600 mb-2">{orden.proveedor.nombre}</p>
                          {orden.obra && (
                            <p className="text-sm text-slate-500 mb-2">
                              {orden.obra.nombre} - {orden.obra.cliente.nombre}
                            </p>
                          )}
                          <div className="flex gap-4 text-sm text-slate-600">
                            <span>{orden.items.length} items</span>
                            <span className="font-semibold">Total: €{orden.total.toFixed(2)}</span>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setModalType('orden')
                              setEditingItem(orden)
                              setShowModal(true)
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
        ) : activeTab === 'proveedores' ? (
          <Card className="glass-white border-purple-200/50 rounded-2xl">
            <CardHeader>
              <CardTitle>Proveedores</CardTitle>
              <CardDescription>{proveedoresFiltrados.length} proveedores</CardDescription>
            </CardHeader>
            <CardContent>
              {proveedoresFiltrados.length === 0 ? (
                <div className="text-center py-12">
                  <DollarSign className="h-12 w-12 text-slate-300 mx-auto mb-4" />
                  <p className="text-slate-500">No hay proveedores registrados</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {proveedoresFiltrados.map((proveedor) => (
                    <div key={proveedor.id} className="p-4 rounded-xl border border-purple-200/50 hover:bg-purple-50/30 transition-all">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="font-semibold text-slate-900">{proveedor.nombre}</h3>
                            {!proveedor.activo && (
                              <span className="px-2 py-1 text-xs rounded-full bg-slate-100 text-slate-800">
                                Inactivo
                              </span>
                            )}
                          </div>
                          <div className="flex flex-wrap gap-4 text-sm text-slate-600">
                            {proveedor.contacto && <span>Contacto: {proveedor.contacto}</span>}
                            {proveedor.telefono && <span>📞 {proveedor.telefono}</span>}
                            {proveedor.email && <span>✉️ {proveedor.email}</span>}
                            {proveedor._count && (
                              <span>{proveedor._count.ordenes} órdenes, {proveedor._count.contratos} contratos</span>
                            )}
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setModalType('proveedor')
                              setEditingItem(proveedor)
                              setShowModal(true)
                            }}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-red-600"
                            onClick={() => handleDelete(proveedor.id, 'proveedor')}
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
          <Card className="glass-white border-purple-200/50 rounded-2xl">
            <CardHeader>
              <CardTitle>Contratos de Subcontratas</CardTitle>
              <CardDescription>{contratosFiltrados.length} contratos</CardDescription>
            </CardHeader>
            <CardContent>
              {contratosFiltrados.length === 0 ? (
                <div className="text-center py-12">
                  <FileText className="h-12 w-12 text-slate-300 mx-auto mb-4" />
                  <p className="text-slate-500">No hay contratos registrados</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {contratosFiltrados.map((contrato) => (
                    <div key={contrato.id} className="p-4 rounded-xl border border-purple-200/50 hover:bg-purple-50/30 transition-all">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="font-semibold text-slate-900">{contrato.nombre}</h3>
                            <span className={`px-2 py-1 text-xs rounded-full ${
                              contrato.estado === 'ACTIVO' ? 'bg-green-100 text-green-800' :
                              contrato.estado === 'COMPLETADO' ? 'bg-blue-100 text-blue-800' :
                              'bg-slate-100 text-slate-800'
                            }`}>
                              {contrato.estado}
                            </span>
                          </div>
                          <p className="text-sm text-slate-600 mb-2">
                            {contrato.proveedor.nombre} - {contrato.obra.nombre}
                          </p>
                          <div className="flex gap-4 text-sm text-slate-600">
                            <span>Total: €{contrato.importeTotal.toFixed(2)}</span>
                            {contrato.importePagado && (
                              <span>Pagado: €{contrato.importePagado.toFixed(2)}</span>
                            )}
                            {contrato.porcentajeAvance !== undefined && (
                              <span>Avance: {contrato.porcentajeAvance.toFixed(0)}%</span>
                            )}
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setModalType('subcontrata')
                              setEditingItem(contrato)
                              setShowModal(true)
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
            proveedores={proveedores}
            onClose={() => setShowModal(false)}
            onSave={handleSave}
          />
        )}
      </div>
    </DashboardLayout>
  )
}

function ModalForm({ tipo, item, proveedores, onClose, onSave }: any) {
  const [formData, setFormData] = useState<any>({
    nombre: item?.nombre || '',
    contacto: item?.contacto || '',
    telefono: item?.telefono || '',
    email: item?.email || '',
    direccion: item?.direccion || '',
    tipo: item?.tipo || '',
    notas: item?.notas || '',
    proveedorId: item?.proveedorId || '',
    obraId: item?.obraId || '',
    numero: item?.numero || `ORD-${Date.now()}`,
    descripcion: item?.descripcion || '',
    fechaEntregaPrevista: item?.fechaEntregaPrevista ? new Date(item.fechaEntregaPrevista).toISOString().split('T')[0] : '',
    items: item?.items || [{ descripcion: '', cantidad: '', unidad: 'unidades', precioUnitario: '' }],
    tipoTrabajo: item?.tipoTrabajo || '',
    fechaInicio: item?.fechaInicio ? new Date(item.fechaInicio).toISOString().split('T')[0] : '',
    fechaFinPrevista: item?.fechaFinPrevista ? new Date(item.fechaFinPrevista).toISOString().split('T')[0] : '',
    importeTotal: item?.importeTotal || '',
    activo: item?.activo !== undefined ? item.activo : true
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSave(formData)
  }

  const addItem = () => {
    setFormData({
      ...formData,
      items: [...formData.items, { descripcion: '', cantidad: '', unidad: 'unidades', precioUnitario: '' }]
    })
  }

  const removeItem = (index: number) => {
    setFormData({
      ...formData,
      items: formData.items.filter((_: any, i: number) => i !== index)
    })
  }

  const updateItem = (index: number, field: string, value: any) => {
    const newItems = [...formData.items]
    newItems[index] = { ...newItems[index], [field]: value }
    setFormData({ ...formData, items: newItems })
  }

  if (tipo === 'proveedor') {
    return (
      <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto glass-white border-purple-200/50 rounded-2xl">
          <CardHeader className="flex flex-row justify-between items-center">
            <CardTitle>{item ? 'Editar' : 'Nuevo'} Proveedor</CardTitle>
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
                  <label className="text-sm font-medium text-slate-700">Contacto</label>
                  <Input
                    value={formData.contacto}
                    onChange={(e) => setFormData({ ...formData, contacto: e.target.value })}
                    className="mt-1 rounded-xl"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-700">Teléfono</label>
                  <Input
                    value={formData.telefono}
                    onChange={(e) => setFormData({ ...formData, telefono: e.target.value })}
                    className="mt-1 rounded-xl"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-slate-700">Email</label>
                  <Input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="mt-1 rounded-xl"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-700">Tipo</label>
                  <Input
                    value={formData.tipo}
                    onChange={(e) => setFormData({ ...formData, tipo: e.target.value })}
                    className="mt-1 rounded-xl"
                    placeholder="materiales, herramientas, etc."
                  />
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700">Dirección</label>
                <Input
                  value={formData.direccion}
                  onChange={(e) => setFormData({ ...formData, direccion: e.target.value })}
                  className="mt-1 rounded-xl"
                />
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <Button type="button" variant="outline" onClick={onClose}>
                  Cancelar
                </Button>
                <Button type="submit" className="rounded-xl bg-gradient-to-r from-purple-600 to-pink-600">
                  Guardar
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Simplified forms for orden and subcontrata - can be expanded
  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto glass-white border-purple-200/50 rounded-2xl">
        <CardHeader className="flex flex-row justify-between items-center">
          <CardTitle>{item ? 'Editar' : 'Nueva'} {tipo === 'orden' ? 'Orden' : 'Subcontrata'}</CardTitle>
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
            <div>
              <label className="text-sm font-medium text-slate-700">Proveedor *</label>
              <select
                value={formData.proveedorId}
                onChange={(e) => setFormData({ ...formData, proveedorId: e.target.value })}
                className="mt-1 w-full rounded-xl border border-purple-200/50 p-2"
                required
              >
                <option value="">Seleccionar...</option>
                {proveedores.map((p: any) => (
                  <option key={p.id} value={p.id}>{p.nombre}</option>
                ))}
              </select>
            </div>
            {tipo === 'orden' && (
              <>
                <div>
                  <label className="text-sm font-medium text-slate-700">Número *</label>
                  <Input
                    value={formData.numero}
                    onChange={(e) => setFormData({ ...formData, numero: e.target.value })}
                    className="mt-1 rounded-xl"
                    required
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-700">Items</label>
                  {formData.items.map((item: any, index: number) => (
                    <div key={index} className="grid grid-cols-12 gap-2 mb-2">
                      <Input
                        placeholder="Descripción"
                        value={item.descripcion}
                        onChange={(e) => updateItem(index, 'descripcion', e.target.value)}
                        className="col-span-5 rounded-xl"
                      />
                      <Input
                        type="number"
                        placeholder="Cantidad"
                        value={item.cantidad}
                        onChange={(e) => updateItem(index, 'cantidad', e.target.value)}
                        className="col-span-2 rounded-xl"
                      />
                      <Input
                        placeholder="Unidad"
                        value={item.unidad}
                        onChange={(e) => updateItem(index, 'unidad', e.target.value)}
                        className="col-span-2 rounded-xl"
                      />
                      <Input
                        type="number"
                        placeholder="Precio"
                        value={item.precioUnitario}
                        onChange={(e) => updateItem(index, 'precioUnitario', e.target.value)}
                        className="col-span-2 rounded-xl"
                      />
                      <Button type="button" variant="ghost" size="sm" onClick={() => removeItem(index)}>
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                  <Button type="button" variant="outline" onClick={addItem} className="mt-2">
                    <Plus className="h-4 w-4 mr-2" />
                    Añadir Item
                  </Button>
                </div>
              </>
            )}
            {tipo === 'subcontrata' && (
              <>
                <div>
                  <label className="text-sm font-medium text-slate-700">Obra ID *</label>
                  <Input
                    value={formData.obraId}
                    onChange={(e) => setFormData({ ...formData, obraId: e.target.value })}
                    className="mt-1 rounded-xl"
                    required
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-700">Importe Total (€)</label>
                  <Input
                    type="number"
                    value={formData.importeTotal}
                    onChange={(e) => setFormData({ ...formData, importeTotal: e.target.value })}
                    className="mt-1 rounded-xl"
                  />
                </div>
              </>
            )}
            <div className="flex justify-end gap-3 pt-4">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancelar
              </Button>
              <Button type="submit" className="rounded-xl bg-gradient-to-r from-purple-600 to-pink-600">
                Guardar
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
