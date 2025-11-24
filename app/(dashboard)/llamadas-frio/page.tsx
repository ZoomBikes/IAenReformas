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
  CheckCircle2,
  Clock,
  XCircle,
  TrendingUp,
  Users,
  Filter,
  Calendar,
  MapPin,
  Building2,
  BarChart3,
  Target,
  AlertCircle
} from 'lucide-react'
import { toast } from 'sonner'

interface LlamadaFrio {
  id: string
  nombre: string
  telefono: string
  email?: string
  agencia?: string
  direccion?: string
  codigoPostal?: string
  profileUrl?: string
  estado: string
  haLlamado: boolean
  fechaLlamada?: string
  fechaAgendada?: string
  duracion?: number
  resultado?: string
  resultadoDetalle?: string
  interesado?: boolean
  valorEstimado?: number
  siguienteAccion?: string
  notas?: string
  historialLlamadas?: any[]
  origen?: string
  createdAt: string
}

interface Estadisticas {
  total: number
  llamadasRealizadas: number
  llamadasExitosas: number
  llamadasSinExito: number
  reunionesAgendadas: number
  solicitaInfo: number
  noInteres: number
  pendientes: number
  tasaConversion: number
  tasaReunion: number
  llamadasPorReunion: number
}

interface Filtros {
  codigosPostales: string[]
  agencias: string[]
}

export default function LlamadasFrioPage() {
  const [llamadas, setLlamadas] = useState<LlamadaFrio[]>([])
  const [estadisticas, setEstadisticas] = useState<Estadisticas>({
    total: 0,
    llamadasRealizadas: 0,
    llamadasExitosas: 0,
    llamadasSinExito: 0,
    reunionesAgendadas: 0,
    solicitaInfo: 0,
    noInteres: 0,
    pendientes: 0,
    tasaConversion: 0,
    tasaReunion: 0,
    llamadasPorReunion: 0
  })
  const [filtros, setFiltros] = useState<Filtros>({ codigosPostales: [], agencias: [] })
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filtroEstado, setFiltroEstado] = useState<string>('')
  const [filtroCodigoPostal, setFiltroCodigoPostal] = useState<string>('')
  const [filtroAgencia, setFiltroAgencia] = useState<string>('')
  const [filtroResultado, setFiltroResultado] = useState<string>('')
  const [filtroHaLlamado, setFiltroHaLlamado] = useState<string>('')
  const [showModal, setShowModal] = useState(false)
  const [showImportModal, setShowImportModal] = useState(false)
  const [editingItem, setEditingItem] = useState<LlamadaFrio | null>(null)
  const [importando, setImportando] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [formData, setFormData] = useState({
    nombre: '',
    telefono: '',
    email: '',
    agencia: '',
    direccion: '',
    codigoPostal: '',
    profileUrl: '',
    notas: '',
    estado: 'PENDIENTE',
    haLlamado: false,
    fechaLlamada: '',
    fechaAgendada: '',
    duracion: '',
    resultado: '',
    resultadoDetalle: '',
    interesado: false,
    valorEstimado: '',
    siguienteAccion: ''
  })

  useEffect(() => {
    cargarLlamadas()
  }, [filtroEstado, filtroCodigoPostal, filtroAgencia, filtroResultado, filtroHaLlamado])

  const cargarLlamadas = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (searchTerm) params.append('search', searchTerm)
      if (filtroEstado) params.append('estado', filtroEstado)
      if (filtroCodigoPostal) params.append('codigoPostal', filtroCodigoPostal)
      if (filtroAgencia) params.append('agencia', filtroAgencia)
      if (filtroResultado) params.append('resultado', filtroResultado)
      if (filtroHaLlamado) params.append('haLlamado', filtroHaLlamado)

      const res = await fetch(`/api/llamadas-frio?${params.toString()}`)
      const data = await res.json()
      setLlamadas(data.llamadas || [])
      setEstadisticas(data.estadisticas || estadisticas)
      setFiltros(data.filtros || { codigosPostales: [], agencias: [] })
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
        return Object.values(row).some(val => val && val.toString().trim())
      })

      if (csvData.length === 0) {
        toast.error('No se encontraron datos válidos en el CSV')
        return
      }

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

  const handleRegistrarLlamada = async (llamada: LlamadaFrio) => {
    const ahora = new Date()
    const fechaHora = ahora.toISOString().slice(0, 16)
    
    setEditingItem(llamada)
    setFormData({
      nombre: llamada.nombre,
      telefono: llamada.telefono,
      email: llamada.email || '',
      agencia: llamada.agencia || '',
      direccion: llamada.direccion || '',
      codigoPostal: llamada.codigoPostal || '',
      profileUrl: llamada.profileUrl || '',
      notas: llamada.notas || '',
      estado: 'LLAMADA_REALIZADA',
      haLlamado: true,
      fechaLlamada: fechaHora,
      fechaAgendada: '',
      duracion: '',
      resultado: '',
      resultadoDetalle: '',
      interesado: false,
      valorEstimado: '',
      siguienteAccion: ''
    })
    setShowModal(true)
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
        agencia: formData.agencia || null,
        direccion: formData.direccion || null,
        codigoPostal: formData.codigoPostal || null,
        profileUrl: formData.profileUrl || null,
        notas: formData.notas || null
      }

      if (editingItem) {
        body.estado = formData.estado
        body.haLlamado = formData.haLlamado
        if (formData.fechaLlamada) body.fechaLlamada = formData.fechaLlamada
        if (formData.fechaAgendada) body.fechaAgendada = formData.fechaAgendada
        if (formData.duracion) body.duracion = parseInt(formData.duracion)
        body.resultado = formData.resultado || null
        body.resultadoDetalle = formData.resultadoDetalle || null
        body.interesado = formData.interesado
        if (formData.valorEstimado) body.valorEstimado = parseFloat(formData.valorEstimado)
        body.siguienteAccion = formData.siguienteAccion || null
        body.registrarLlamada = formData.haLlamado && !editingItem.haLlamado
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
      agencia: llamada.agencia || '',
      direccion: llamada.direccion || '',
      codigoPostal: llamada.codigoPostal || '',
      profileUrl: llamada.profileUrl || '',
      notas: llamada.notas || '',
      estado: llamada.estado,
      haLlamado: llamada.haLlamado,
      fechaLlamada: llamada.fechaLlamada ? new Date(llamada.fechaLlamada).toISOString().slice(0, 16) : '',
      fechaAgendada: llamada.fechaAgendada ? new Date(llamada.fechaAgendada).toISOString().slice(0, 16) : '',
      duracion: llamada.duracion?.toString() || '',
      resultado: llamada.resultado || '',
      resultadoDetalle: llamada.resultadoDetalle || '',
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
      agencia: '',
      direccion: '',
      codigoPostal: '',
      profileUrl: '',
      notas: '',
      estado: 'PENDIENTE',
      haLlamado: false,
      fechaLlamada: '',
      fechaAgendada: '',
      duracion: '',
      resultado: '',
      resultadoDetalle: '',
      interesado: false,
      valorEstimado: '',
      siguienteAccion: ''
    })
    setEditingItem(null)
  }

  const getEstadoColor = (estado: string) => {
    switch (estado) {
      case 'REUNION_AGENDADA': return 'bg-green-100 text-green-800'
      case 'SOLICITA_INFO': return 'bg-blue-100 text-blue-800'
      case 'NO_INTERESADO': return 'bg-red-100 text-red-800'
      case 'LLAMADA_REALIZADA': return 'bg-yellow-100 text-yellow-800'
      case 'PENDIENTE': return 'bg-gray-100 text-gray-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getResultadoColor = (resultado?: string) => {
    switch (resultado) {
      case 'REUNION': return 'bg-green-100 text-green-800'
      case 'SOLICITA_INFO': return 'bg-blue-100 text-blue-800'
      case 'NO_INTERES': return 'bg-red-100 text-red-800'
      case 'NO_CONTESTA': return 'bg-yellow-100 text-yellow-800'
      case 'RECHAZADA': return 'bg-orange-100 text-orange-800'
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
      llamada.agencia?.toLowerCase().includes(term)
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
              <Phone className="h-4 w-4 mr-2" />
              Nueva Llamada
            </Button>
          </div>
        </div>

        {/* Dashboard de Métricas Avanzadas */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="bg-gradient-to-br from-blue-50 to-blue-100">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600">Total Contactos</p>
                  <p className="text-2xl font-bold text-slate-900">{estadisticas.total}</p>
                </div>
                <Users className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-green-50 to-green-100">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600">Llamadas Realizadas</p>
                  <p className="text-2xl font-bold text-green-700">{estadisticas.llamadasRealizadas}</p>
                  <p className="text-xs text-slate-600 mt-1">
                    {estadisticas.total > 0 ? ((estadisticas.llamadasRealizadas / estadisticas.total) * 100).toFixed(1) : 0}% del total
                  </p>
                </div>
                <Phone className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-purple-50 to-purple-100">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600">Reuniones Agendadas</p>
                  <p className="text-2xl font-bold text-purple-700">{estadisticas.reunionesAgendadas}</p>
                  <p className="text-xs text-slate-600 mt-1">
                    {estadisticas.llamadasPorReunion > 0 ? `${estadisticas.llamadasPorReunion.toFixed(1)} llamadas/reunión` : 'N/A'}
                  </p>
                </div>
                <Calendar className="h-8 w-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-indigo-50 to-indigo-100">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600">Tasa Conversión</p>
                  <p className="text-2xl font-bold text-indigo-700">{estadisticas.tasaConversion.toFixed(1)}%</p>
                  <p className="text-xs text-slate-600 mt-1">
                    {estadisticas.llamadasExitosas} exitosas
                  </p>
                </div>
                <TrendingUp className="h-8 w-8 text-indigo-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Métricas Detalladas */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600">Solicitan Info</p>
                  <p className="text-2xl font-bold text-blue-600">{estadisticas.solicitaInfo}</p>
                </div>
                <Target className="h-6 w-6 text-blue-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600">Sin Éxito</p>
                  <p className="text-2xl font-bold text-red-600">{estadisticas.llamadasSinExito}</p>
                </div>
                <XCircle className="h-6 w-6 text-red-600" />
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
                <Clock className="h-6 w-6 text-yellow-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filtros Avanzados */}
        <Card>
          <CardContent className="p-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400" />
                <Input
                  placeholder="Buscar..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                  className="pl-10"
                />
              </div>
              <select
                value={filtroCodigoPostal}
                onChange={(e) => setFiltroCodigoPostal(e.target.value)}
                className="px-4 py-2 rounded-lg border border-blue-200 bg-white focus:border-blue-400 focus:outline-none"
              >
                <option value="">Todos los códigos postales</option>
                {filtros.codigosPostales.map(cp => (
                  <option key={cp} value={cp}>{cp}</option>
                ))}
              </select>
              <select
                value={filtroAgencia}
                onChange={(e) => setFiltroAgencia(e.target.value)}
                className="px-4 py-2 rounded-lg border border-blue-200 bg-white focus:border-blue-400 focus:outline-none"
              >
                <option value="">Todas las agencias</option>
                {filtros.agencias.map(ag => (
                  <option key={ag} value={ag}>{ag}</option>
                ))}
              </select>
              <select
                value={filtroResultado}
                onChange={(e) => setFiltroResultado(e.target.value)}
                className="px-4 py-2 rounded-lg border border-blue-200 bg-white focus:border-blue-400 focus:outline-none"
              >
                <option value="">Todos los resultados</option>
                <option value="REUNION">Reunión</option>
                <option value="SOLICITA_INFO">Solicita Info</option>
                <option value="NO_INTERES">No Interés</option>
                <option value="NO_CONTESTA">No Contesta</option>
                <option value="RECHAZADA">Rechazada</option>
              </select>
              <select
                value={filtroEstado}
                onChange={(e) => setFiltroEstado(e.target.value)}
                className="px-4 py-2 rounded-lg border border-blue-200 bg-white focus:border-blue-400 focus:outline-none"
              >
                <option value="">Todos los estados</option>
                <option value="PENDIENTE">Pendiente</option>
                <option value="LLAMADA_REALIZADA">Llamada Realizada</option>
                <option value="REUNION_AGENDADA">Reunión Agendada</option>
                <option value="SOLICITA_INFO">Solicita Info</option>
                <option value="NO_INTERESADO">No Interesado</option>
              </select>
              <select
                value={filtroHaLlamado}
                onChange={(e) => setFiltroHaLlamado(e.target.value)}
                className="px-4 py-2 rounded-lg border border-blue-200 bg-white focus:border-blue-400 focus:outline-none"
              >
                <option value="">Todas</option>
                <option value="true">Llamadas Realizadas</option>
                <option value="false">Sin Llamar</option>
              </select>
              <Button onClick={handleSearch} variant="outline" className="w-full">
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
                      <div className="flex items-center gap-3 mb-2 flex-wrap">
                        <h3 className="text-lg font-semibold text-slate-900">{llamada.nombre}</h3>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getEstadoColor(llamada.estado)}`}>
                          {llamada.estado.replace('_', ' ')}
                        </span>
                        {llamada.resultado && (
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getResultadoColor(llamada.resultado)}`}>
                            {llamada.resultado.replace('_', ' ')}
                          </span>
                        )}
                        {llamada.haLlamado && (
                          <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            ✓ Llamada realizada
                          </span>
                        )}
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 text-sm text-slate-600">
                        <div><strong>Teléfono:</strong> {llamada.telefono}</div>
                        {llamada.agencia && (
                          <div className="flex items-center gap-1">
                            <Building2 className="h-4 w-4" />
                            <strong>Agencia:</strong> {llamada.agencia}
                          </div>
                        )}
                        {llamada.codigoPostal && (
                          <div className="flex items-center gap-1">
                            <MapPin className="h-4 w-4" />
                            <strong>CP:</strong> {llamada.codigoPostal}
                          </div>
                        )}
                        {llamada.direccion && <div><strong>Dirección:</strong> {llamada.direccion}</div>}
                        {llamada.fechaLlamada && (
                          <div><strong>Última llamada:</strong> {new Date(llamada.fechaLlamada).toLocaleString('es-ES')}</div>
                        )}
                        {llamada.duracion && (
                          <div><strong>Duración:</strong> {Math.floor(llamada.duracion / 60)}m {llamada.duracion % 60}s</div>
                        )}
                        {llamada.fechaAgendada && (
                          <div className="flex items-center gap-1 text-green-700">
                            <Calendar className="h-4 w-4" />
                            <strong>Reunión:</strong> {new Date(llamada.fechaAgendada).toLocaleDateString('es-ES')}
                          </div>
                        )}
                      </div>
                      {llamada.resultadoDetalle && (
                        <div className="mt-2 text-sm text-slate-700">
                          <strong>Resultado:</strong> {llamada.resultadoDetalle}
                        </div>
                      )}
                      {llamada.siguienteAccion && (
                        <div className="mt-2 text-sm text-blue-700">
                          <strong>Próxima acción:</strong> {llamada.siguienteAccion}
                        </div>
                      )}
                      {llamada.notas && (
                        <div className="mt-2 text-sm text-slate-600 italic">
                          <strong>Notas:</strong> {llamada.notas}
                        </div>
                      )}
                    </div>
                    <div className="flex gap-2">
                      {!llamada.haLlamado && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleRegistrarLlamada(llamada)}
                          className="text-green-600 hover:text-green-700"
                        >
                          <Phone className="h-4 w-4 mr-1" />
                          Llamar
                        </Button>
                      )}
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
                  Formato esperado: name, agency, address, profile_url, phone
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
            <Card className="w-full max-w-3xl my-8">
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
              <CardContent className="space-y-4 max-h-[80vh] overflow-y-auto">
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
                    <label className="block text-sm font-medium text-slate-700 mb-1">Agencia</label>
                    <Input
                      value={formData.agencia}
                      onChange={(e) => setFormData({ ...formData, agencia: e.target.value })}
                      placeholder="Nombre de agencia"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Código Postal</label>
                    <Input
                      value={formData.codigoPostal}
                      onChange={(e) => setFormData({ ...formData, codigoPostal: e.target.value })}
                      placeholder="28001"
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
                      <h3 className="font-semibold text-slate-900 mb-4">Registro de Llamada</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="flex items-center gap-2 mb-2">
                            <input
                              type="checkbox"
                              checked={formData.haLlamado}
                              onChange={(e) => setFormData({ ...formData, haLlamado: e.target.checked })}
                              className="rounded"
                            />
                            <span className="text-sm font-medium text-slate-700">Llamada realizada</span>
                          </label>
                        </div>
                        {formData.haLlamado && (
                          <>
                            <div>
                              <label className="block text-sm font-medium text-slate-700 mb-1">Fecha/Hora Llamada</label>
                              <Input
                                type="datetime-local"
                                value={formData.fechaLlamada}
                                onChange={(e) => setFormData({ ...formData, fechaLlamada: e.target.value })}
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
                            <div>
                              <label className="block text-sm font-medium text-slate-700 mb-1">Resultado</label>
                              <select
                                value={formData.resultado}
                                onChange={(e) => setFormData({ ...formData, resultado: e.target.value })}
                                className="w-full px-3 py-2 rounded-lg border border-blue-200 bg-white focus:border-blue-400 focus:outline-none"
                              >
                                <option value="">Seleccionar resultado</option>
                                <option value="REUNION">Reunión Agendada</option>
                                <option value="SOLICITA_INFO">Solicita Más Información</option>
                                <option value="NO_INTERES">No Hay Interés</option>
                                <option value="NO_CONTESTA">No Contesta</option>
                                <option value="RECHAZADA">Rechazada</option>
                                <option value="OTRO">Otro</option>
                              </select>
                            </div>
                            {formData.resultado === 'REUNION' && (
                              <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Fecha Reunión</label>
                                <Input
                                  type="datetime-local"
                                  value={formData.fechaAgendada}
                                  onChange={(e) => setFormData({ ...formData, fechaAgendada: e.target.value })}
                                />
                              </div>
                            )}
                            <div className="md:col-span-2">
                              <label className="block text-sm font-medium text-slate-700 mb-1">Detalle del Resultado</label>
                              <textarea
                                value={formData.resultadoDetalle}
                                onChange={(e) => setFormData({ ...formData, resultadoDetalle: e.target.value })}
                                className="w-full px-3 py-2 rounded-lg border border-blue-200 bg-white focus:border-blue-400 focus:outline-none"
                                rows={3}
                                placeholder="Detalles de la conversación..."
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
                          </>
                        )}
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
