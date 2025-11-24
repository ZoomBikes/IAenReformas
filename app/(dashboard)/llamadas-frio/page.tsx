'use client'

import { useEffect, useState, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { 
  Phone,
  Upload,
  Search,
  Edit,
  Trash2,
  FileText,
  CheckCircle2,
  Clock,
  XCircle,
  TrendingUp,
  Users,
  Filter,
  Download,
  Plus
} from 'lucide-react'
import { toast } from 'sonner'

interface LlamadaFrio {
  id: string
  nombre: string
  telefono: string
  email?: string
  empresa?: string
  direccion?: string
  estado: string
  fechaLlamada?: string
  fechaAgendada?: string
  duracion?: number
  resultado?: string
  interesado?: boolean
  valorEstimado?: number
  siguienteAccion?: string
  notas?: string
  origen?: string
  createdAt: string
  cliente?: any
  lead?: any
}

interface Estadisticas {
  total: number
  completadas: number
  interesados: number
  pendientes: number
  tasaInteres: number
}

export default function LlamadasFrioPage() {
  const [llamadas, setLlamadas] = useState<LlamadaFrio[]>([])
  const [estadisticas, setEstadisticas] = useState<Estadisticas>({
    total: 0,
    completadas: 0,
    interesados: 0,
    pendientes: 0,
    tasaInteres: 0
  })
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filtroEstado, setFiltroEstado] = useState<string>('')
  const [filtroInteresado, setFiltroInteresado] = useState<string>('')
  const [showModal, setShowModal] = useState(false)
  const [showImportModal, setShowImportModal] = useState(false)
  const [editingItem, setEditingItem] = useState<LlamadaFrio | null>(null)
  const [importando, setImportando] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [formData, setFormData] = useState({
    nombre: '',
    telefono: '',
    email: '',
    empresa: '',
    direccion: '',
    notas: '',
    estado: 'PENDIENTE',
    fechaLlamada: '',
    fechaAgendada: '',
    duracion: '',
    resultado: '',
    interesado: false,
    valorEstimado: '',
    siguienteAccion: ''
  })

  useEffect(() => {
    cargarLlamadas()
  }, [filtroEstado, filtroInteresado])

  const cargarLlamadas = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (searchTerm) params.append('search', searchTerm)
      if (filtroEstado) params.append('estado', filtroEstado)
      if (filtroInteresado) params.append('interesado', filtroInteresado)

      const res = await fetch(`/api/llamadas-frio?${params.toString()}`)
      const data = await res.json()
      setLlamadas(data.llamadas || [])
      setEstadisticas(data.estadisticas || estadisticas)
    } catch (error) {
      toast.error('Error al cargar llamadas')
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = () => {
    cargarLlamadas()
  }

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.name.endsWith('.csv')) {
      toast.error('Por favor, selecciona un archivo CSV')
      return
    }

    setImportando(true)
    try {
      const text = await file.text()
      const lines = text.split('\n').filter(line => line.trim())
      
      if (lines.length < 2) {
        toast.error('El CSV debe tener al menos una fila de datos (además del encabezado)')
        return
      }

      // Parsear CSV (soporta comas y punto y coma)
      const delimiter = text.includes(';') ? ';' : ','
      const headers = lines[0].split(delimiter).map(h => h.trim().replace(/"/g, ''))
      
      const csvData = lines.slice(1).map(line => {
        const values = line.split(delimiter).map(v => v.trim().replace(/"/g, ''))
        const obj: any = {}
        headers.forEach((header, index) => {
          obj[header] = values[index] || ''
        })
        return obj
      }).filter(row => {
        // Filtrar filas vacías
        return Object.values(row).some(val => val && val.toString().trim())
      })

      if (csvData.length === 0) {
        toast.error('No se encontraron datos válidos en el CSV')
        return
      }

      // Importar a la base de datos
      const res = await fetch('/api/llamadas-frio/importar-csv', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ csvData, origen: 'csv' })
      })

      const result = await res.json()

      if (!res.ok) {
        throw new Error(result.error || 'Error al importar CSV')
      }

      toast.success(`CSV importado: ${result.resultados.exitosos} exitosos, ${result.resultados.duplicados} duplicados, ${result.resultados.errores} errores`)
      
      if (result.resultados.errores > 0 && result.resultados.erroresDetalle.length > 0) {
        console.warn('Errores de importación:', result.resultados.erroresDetalle)
      }

      setShowImportModal(false)
      cargarLlamadas()
    } catch (error: any) {
      toast.error(error.message || 'Error al importar CSV')
      console.error(error)
    } finally {
      setImportando(false)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  const handleSave = async () => {
    if (!formData.nombre || !formData.telefono) {
      toast.error('Nombre y teléfono son obligatorios')
      return
    }

    try {
      const url = editingItem 
        ? `/api/llamadas-frio/${editingItem.id}`
        : '/api/llamadas-frio'
      
      const method = editingItem ? 'PUT' : 'POST'
      
      const body: any = {
        nombre: formData.nombre,
        telefono: formData.telefono,
        email: formData.email || null,
        empresa: formData.empresa || null,
        direccion: formData.direccion || null,
        notas: formData.notas || null
      }

      if (editingItem) {
        body.estado = formData.estado
        if (formData.fechaLlamada) body.fechaLlamada = formData.fechaLlamada
        if (formData.fechaAgendada) body.fechaAgendada = formData.fechaAgendada
        if (formData.duracion) body.duracion = parseInt(formData.duracion)
        body.resultado = formData.resultado || null
        body.interesado = formData.interesado
        if (formData.valorEstimado) body.valorEstimado = parseFloat(formData.valorEstimado)
        body.siguienteAccion = formData.siguienteAccion || null
      }

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      })

      if (!res.ok) {
        const error = await res.json()
        throw new Error(error.error || 'Error al guardar')
      }

      toast.success(editingItem ? 'Llamada actualizada' : 'Llamada creada')
      setShowModal(false)
      resetForm()
      cargarLlamadas()
    } catch (error: any) {
      toast.error(error.message || 'Error al guardar')
      console.error(error)
    }
  }

  const handleEdit = (llamada: LlamadaFrio) => {
    setEditingItem(llamada)
    setFormData({
      nombre: llamada.nombre,
      telefono: llamada.telefono,
      email: llamada.email || '',
      empresa: llamada.empresa || '',
      direccion: llamada.direccion || '',
      notas: llamada.notas || '',
      estado: llamada.estado,
      fechaLlamada: llamada.fechaLlamada ? new Date(llamada.fechaLlamada).toISOString().slice(0, 16) : '',
      fechaAgendada: llamada.fechaAgendada ? new Date(llamada.fechaAgendada).toISOString().slice(0, 16) : '',
      duracion: llamada.duracion?.toString() || '',
      resultado: llamada.resultado || '',
      interesado: llamada.interesado || false,
      valorEstimado: llamada.valorEstimado?.toString() || '',
      siguienteAccion: llamada.siguienteAccion || ''
    })
    setShowModal(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('¿Estás seguro de eliminar esta llamada?')) return

    try {
      const res = await fetch(`/api/llamadas-frio/${id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('Error al eliminar')
      toast.success('Llamada eliminada')
      cargarLlamadas()
    } catch (error) {
      toast.error('Error al eliminar llamada')
    }
  }

  const resetForm = () => {
    setFormData({
      nombre: '',
      telefono: '',
      email: '',
      empresa: '',
      direccion: '',
      notas: '',
      estado: 'PENDIENTE',
      fechaLlamada: '',
      fechaAgendada: '',
      duracion: '',
      resultado: '',
      interesado: false,
      valorEstimado: '',
      siguienteAccion: ''
    })
    setEditingItem(null)
  }

  const getEstadoColor = (estado: string) => {
    switch (estado) {
      case 'COMPLETADA': return 'bg-green-100 text-green-800'
      case 'INTERESADO': return 'bg-blue-100 text-blue-800'
      case 'NO_INTERESADO': return 'bg-red-100 text-red-800'
      case 'AGENDADA': return 'bg-yellow-100 text-yellow-800'
      case 'PENDIENTE': return 'bg-gray-100 text-gray-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const llamadasFiltradas = llamadas.filter(llamada => {
    if (!searchTerm) return true
    const term = searchTerm.toLowerCase()
    return (
      llamada.nombre.toLowerCase().includes(term) ||
      llamada.telefono.includes(term) ||
      llamada.email?.toLowerCase().includes(term) ||
      llamada.empresa?.toLowerCase().includes(term)
    )
  })

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Llamadas en Frío</h1>
            <p className="text-slate-600 mt-1">Gestiona tus 500 llamadas y mide resultados</p>
          </div>
          <div className="flex gap-3">
            <Button
              onClick={() => setShowImportModal(true)}
              className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
            >
              <Upload className="h-4 w-4 mr-2" />
              Importar CSV
            </Button>
            <Button
              onClick={() => {
                resetForm()
                setShowModal(true)
              }}
              className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
            >
              <Plus className="h-4 w-4 mr-2" />
              Nueva Llamada
            </Button>
          </div>
        </div>

        {/* Estadísticas */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600">Total</p>
                  <p className="text-2xl font-bold text-slate-900">{estadisticas.total}</p>
                </div>
                <Users className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600">Pendientes</p>
                  <p className="text-2xl font-bold text-yellow-600">{estadisticas.pendientes}</p>
                </div>
                <Clock className="h-8 w-8 text-yellow-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600">Completadas</p>
                  <p className="text-2xl font-bold text-green-600">{estadisticas.completadas}</p>
                </div>
                <CheckCircle2 className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600">Interesados</p>
                  <p className="text-2xl font-bold text-blue-600">{estadisticas.interesados}</p>
                </div>
                <TrendingUp className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600">Tasa Interés</p>
                  <p className="text-2xl font-bold text-indigo-600">
                    {estadisticas.tasaInteres.toFixed(1)}%
                  </p>
                </div>
                <TrendingUp className="h-8 w-8 text-indigo-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Búsqueda y Filtros */}
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400" />
                <Input
                  placeholder="Buscar por nombre, teléfono, email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                  className="pl-10"
                />
              </div>
              <select
                value={filtroEstado}
                onChange={(e) => setFiltroEstado(e.target.value)}
                className="px-4 py-2 rounded-lg border border-blue-200 bg-white focus:border-blue-400 focus:outline-none"
              >
                <option value="">Todos los estados</option>
                <option value="PENDIENTE">Pendiente</option>
                <option value="COMPLETADA">Completada</option>
                <option value="INTERESADO">Interesado</option>
                <option value="NO_INTERESADO">No Interesado</option>
                <option value="AGENDADA">Agendada</option>
              </select>
              <select
                value={filtroInteresado}
                onChange={(e) => setFiltroInteresado(e.target.value)}
                className="px-4 py-2 rounded-lg border border-blue-200 bg-white focus:border-blue-400 focus:outline-none"
              >
                <option value="">Todos</option>
                <option value="true">Interesados</option>
                <option value="false">No Interesados</option>
              </select>
              <Button onClick={handleSearch} variant="outline">
                <Search className="h-4 w-4 mr-2" />
                Buscar
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Lista de Llamadas */}
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <p className="mt-2 text-slate-600">Cargando llamadas...</p>
          </div>
        ) : llamadasFiltradas.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <Phone className="h-12 w-12 text-slate-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-slate-900 mb-2">No hay llamadas</h3>
              <p className="text-slate-600 mb-4">Importa un CSV o crea una llamada manualmente</p>
              <Button
                onClick={() => setShowImportModal(true)}
                className="bg-gradient-to-r from-blue-600 to-indigo-600"
              >
                <Upload className="h-4 w-4 mr-2" />
                Importar CSV
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {llamadasFiltradas.map((llamada) => (
              <Card key={llamada.id} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold text-slate-900">{llamada.nombre}</h3>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getEstadoColor(llamada.estado)}`}>
                          {llamada.estado}
                        </span>
                        {llamada.interesado && (
                          <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            Interesado
                          </span>
                        )}
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-slate-600">
                        <div><strong>Teléfono:</strong> {llamada.telefono}</div>
                        {llamada.email && <div><strong>Email:</strong> {llamada.email}</div>}
                        {llamada.empresa && <div><strong>Empresa:</strong> {llamada.empresa}</div>}
                        {llamada.fechaLlamada && (
                          <div><strong>Fecha llamada:</strong> {new Date(llamada.fechaLlamada).toLocaleDateString()}</div>
                        )}
                        {llamada.duracion && (
                          <div><strong>Duración:</strong> {Math.floor(llamada.duracion / 60)}m {llamada.duracion % 60}s</div>
                        )}
                        {llamada.valorEstimado && (
                          <div><strong>Valor estimado:</strong> {llamada.valorEstimado.toFixed(2)}€</div>
                        )}
                      </div>
                      {llamada.resultado && (
                        <div className="mt-2 text-sm text-slate-700">
                          <strong>Resultado:</strong> {llamada.resultado}
                        </div>
                      )}
                      {llamada.siguienteAccion && (
                        <div className="mt-2 text-sm text-blue-700">
                          <strong>Próxima acción:</strong> {llamada.siguienteAccion}
                        </div>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEdit(llamada)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(llamada.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Modal Importar CSV */}
        {showImportModal && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <Card className="w-full max-w-md">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Importar CSV</CardTitle>
                  <Button variant="ghost" size="sm" onClick={() => setShowImportModal(false)}>
                    <XCircle className="h-5 w-5" />
                  </Button>
                </div>
                <CardDescription>
                  Selecciona un archivo CSV con columnas: nombre, telefono, email (opcional), empresa (opcional)
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".csv"
                  onChange={handleFileSelect}
                  className="hidden"
                />
                <Button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={importando}
                  className="w-full"
                >
                  <Upload className="h-4 w-4 mr-2" />
                  {importando ? 'Importando...' : 'Seleccionar CSV'}
                </Button>
                {importando && (
                  <div className="text-center">
                    <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                    <p className="mt-2 text-sm text-slate-600">Procesando archivo...</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {/* Modal Nueva/Editar Llamada */}
        {showModal && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 overflow-y-auto">
            <Card className="w-full max-w-2xl my-8">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>{editingItem ? 'Editar Llamada' : 'Nueva Llamada'}</CardTitle>
                  <Button variant="ghost" size="sm" onClick={() => {
                    setShowModal(false)
                    resetForm()
                  }}>
                    <XCircle className="h-5 w-5" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4 max-h-[70vh] overflow-y-auto">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Nombre *</label>
                    <Input
                      value={formData.nombre}
                      onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                      placeholder="Nombre completo"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Teléfono *</label>
                    <Input
                      value={formData.telefono}
                      onChange={(e) => setFormData({ ...formData, telefono: e.target.value })}
                      placeholder="600000000"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
                    <Input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="email@ejemplo.com"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Empresa</label>
                    <Input
                      value={formData.empresa}
                      onChange={(e) => setFormData({ ...formData, empresa: e.target.value })}
                      placeholder="Nombre de empresa"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-slate-700 mb-1">Dirección</label>
                    <Input
                      value={formData.direccion}
                      onChange={(e) => setFormData({ ...formData, direccion: e.target.value })}
                      placeholder="Dirección completa"
                    />
                  </div>
                </div>

                {editingItem && (
                  <>
                    <div className="border-t pt-4 mt-4">
                      <h3 className="font-semibold text-slate-900 mb-4">Seguimiento de Llamada</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-slate-700 mb-1">Estado</label>
                          <select
                            value={formData.estado}
                            onChange={(e) => setFormData({ ...formData, estado: e.target.value })}
                            className="w-full px-3 py-2 rounded-lg border border-blue-200 bg-white focus:border-blue-400 focus:outline-none"
                          >
                            <option value="PENDIENTE">Pendiente</option>
                            <option value="COMPLETADA">Completada</option>
                            <option value="INTERESADO">Interesado</option>
                            <option value="NO_INTERESADO">No Interesado</option>
                            <option value="AGENDADA">Agendada</option>
                            <option value="NO_CONTESTA">No Contesta</option>
                            <option value="RECHAZADA">Rechazada</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-slate-700 mb-1">Fecha Llamada</label>
                          <Input
                            type="datetime-local"
                            value={formData.fechaLlamada}
                            onChange={(e) => setFormData({ ...formData, fechaLlamada: e.target.value })}
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-slate-700 mb-1">Fecha Agendada</label>
                          <Input
                            type="datetime-local"
                            value={formData.fechaAgendada}
                            onChange={(e) => setFormData({ ...formData, fechaAgendada: e.target.value })}
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-slate-700 mb-1">Duración (segundos)</label>
                          <Input
                            type="number"
                            value={formData.duracion}
                            onChange={(e) => setFormData({ ...formData, duracion: e.target.value })}
                            placeholder="300"
                          />
                        </div>
                        <div className="md:col-span-2">
                          <label className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              checked={formData.interesado}
                              onChange={(e) => setFormData({ ...formData, interesado: e.target.checked })}
                              className="rounded"
                            />
                            <span className="text-sm font-medium text-slate-700">Mostró interés</span>
                          </label>
                        </div>
                        {formData.interesado && (
                          <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Valor Estimado (€)</label>
                            <Input
                              type="number"
                              step="0.01"
                              value={formData.valorEstimado}
                              onChange={(e) => setFormData({ ...formData, valorEstimado: e.target.value })}
                              placeholder="0.00"
                            />
                          </div>
                        )}
                        <div className="md:col-span-2">
                          <label className="block text-sm font-medium text-slate-700 mb-1">Resultado</label>
                          <textarea
                            value={formData.resultado}
                            onChange={(e) => setFormData({ ...formData, resultado: e.target.value })}
                            className="w-full px-3 py-2 rounded-lg border border-blue-200 bg-white focus:border-blue-400 focus:outline-none"
                            rows={3}
                            placeholder="Resultado de la llamada..."
                          />
                        </div>
                        <div className="md:col-span-2">
                          <label className="block text-sm font-medium text-slate-700 mb-1">Próxima Acción</label>
                          <textarea
                            value={formData.siguienteAccion}
                            onChange={(e) => setFormData({ ...formData, siguienteAccion: e.target.value })}
                            className="w-full px-3 py-2 rounded-lg border border-blue-200 bg-white focus:border-blue-400 focus:outline-none"
                            rows={2}
                            placeholder="Qué hacer a continuación..."
                          />
                        </div>
                      </div>
                    </div>
                  </>
                )}

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Notas</label>
                  <textarea
                    value={formData.notas}
                    onChange={(e) => setFormData({ ...formData, notas: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-blue-200 bg-white focus:border-blue-400 focus:outline-none"
                    rows={3}
                    placeholder="Notas adicionales..."
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <Button
                    onClick={handleSave}
                    className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600"
                  >
                    {editingItem ? 'Actualizar' : 'Crear'}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setShowModal(false)
                      resetForm()
                    }}
                  >
                    Cancelar
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}

