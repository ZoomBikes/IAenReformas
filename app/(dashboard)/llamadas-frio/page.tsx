'use client'

import { useEffect, useState, useRef, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { getCodigoPostalConZona } from '@/lib/codigos-postales-madrid'
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
  Calendar,
  MapPin,
  Building2,
  Target,
  X,
  MoreVertical,
  Table2,
  LayoutGrid,
  Zap,
  Info,
  CheckCircle,
  Ban
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

type VistaModo = 'tarjetas' | 'tabla'

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
  const [vistaModo, setVistaModo] = useState<VistaModo>('tabla')
  const [showModal, setShowModal] = useState(false)
  const [showQuickActionModal, setShowQuickActionModal] = useState(false)
  const [showImportModal, setShowImportModal] = useState(false)
  const [editingItem, setEditingItem] = useState<LlamadaFrio | null>(null)
  const [quickActionItem, setQuickActionItem] = useState<LlamadaFrio | null>(null)
  const [quickActionResult, setQuickActionResult] = useState<string>('')
  const [importando, setImportando] = useState(false)
  const [savingQuick, setSavingQuick] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const searchTimeoutRef = useRef<NodeJS.Timeout>()

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

  // Búsqueda en tiempo real con debounce
  useEffect(() => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current)
    }
    searchTimeoutRef.current = setTimeout(() => {
      cargarLlamadas()
    }, 300)
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current)
      }
    }
  }, [searchTerm])

  useEffect(() => {
    cargarLlamadas()
    // eslint-disable-next-line react-hooks/exhaustive-deps
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

  const handleQuickAction = (llamada: LlamadaFrio, resultado: string) => {
    setQuickActionItem(llamada)
    setQuickActionResult(resultado)
    setShowQuickActionModal(true)
  }

  const handleSaveQuickAction = async () => {
    if (!quickActionItem) return

    setSavingQuick(true)
    try {
      const ahora = new Date()
      const fechaHora = ahora.toISOString().slice(0, 16)
      
      // Duración por defecto según resultado
      const duracionDefault: Record<string, number> = {
        'REUNION': 600, // 10 min
        'SOLICITA_INFO': 300, // 5 min
        'NO_INTERES': 120, // 2 min
        'NO_CONTESTA': 30, // 30 seg
        'RECHAZADA': 60 // 1 min
      }

      const body: any = {
        estado: quickActionResult === 'REUNION' ? 'REUNION_AGENDADA' : 
                quickActionResult === 'SOLICITA_INFO' ? 'SOLICITA_INFO' : 
                quickActionResult === 'NO_INTERES' ? 'NO_INTERESADO' : 'LLAMADA_REALIZADA',
        haLlamado: true,
        fechaLlamada: fechaHora,
        duracion: duracionDefault[quickActionResult] || 180,
        resultado: quickActionResult,
        resultadoDetalle: formData.resultadoDetalle || null,
        registrarLlamada: true
      }

      // Si es reunión, pedir fecha
      if (quickActionResult === 'REUNION' && formData.fechaAgendada) {
        body.fechaAgendada = formData.fechaAgendada
      }

      const res = await fetch(`/api/llamadas-frio/${quickActionItem.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      })

      if (!res.ok) {
        const error = await res.json()
        throw new Error(error.error || 'Error al guardar')
      }

      toast.success('Llamada registrada correctamente')
      setShowQuickActionModal(false)
      setQuickActionItem(null)
      setQuickActionResult('')
      resetForm()
      cargarLlamadas()
    } catch (error: any) {
      toast.error(error.message || 'Error al guardar')
      console.error(error)
    } finally {
      setSavingQuick(false)
    }
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
      duracion: '180', // 3 minutos por defecto
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

  const limpiarFiltros = () => {
    setFiltroEstado('')
    setFiltroCodigoPostal('')
    setFiltroAgencia('')
    setFiltroResultado('')
    setFiltroHaLlamado('')
    setSearchTerm('')
  }

  const getEstadoColor = (estado: string) => {
    switch (estado) {
      case 'REUNION_AGENDADA': return 'bg-green-100 text-green-800 border-green-300'
      case 'SOLICITA_INFO': return 'bg-blue-100 text-blue-800 border-blue-300'
      case 'NO_INTERESADO': return 'bg-red-100 text-red-800 border-red-300'
      case 'LLAMADA_REALIZADA': return 'bg-yellow-100 text-yellow-800 border-yellow-300'
      case 'PENDIENTE': return 'bg-gray-100 text-gray-800 border-gray-300'
      default: return 'bg-gray-100 text-gray-800 border-gray-300'
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

  const tieneFiltrosActivos = filtroEstado || filtroCodigoPostal || filtroAgencia || filtroResultado || filtroHaLlamado || searchTerm

  return (
    <DashboardLayout>
      <div className="space-y-4">
        {/* Header Compacto */}
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-slate-900">Llamadas en Frío</h1>
            <p className="text-sm text-slate-600 mt-1">
              {estadisticas.total} contactos • {estadisticas.pendientes} pendientes
            </p>
          </div>
          <div className="flex gap-2 flex-wrap">
            <Button
              onClick={() => setShowImportModal(true)}
              variant="outline"
              size="sm"
            >
              <Upload className="h-4 w-4 mr-2" />
              Importar CSV
            </Button>
            <Button
              onClick={() => {
                resetForm()
                setShowModal(true)
              }}
              size="sm"
              className="bg-gradient-to-r from-blue-600 to-indigo-600"
            >
              <Phone className="h-4 w-4 mr-2" />
              Nuevo
            </Button>
          </div>
        </div>

        {/* Dashboard de Métricas Compacto */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
          <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
            <CardContent className="p-3">
              <p className="text-xs text-slate-600 mb-1">Total</p>
              <p className="text-xl font-bold text-slate-900">{estadisticas.total}</p>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
            <CardContent className="p-3">
              <p className="text-xs text-slate-600 mb-1">Realizadas</p>
              <p className="text-xl font-bold text-green-700">{estadisticas.llamadasRealizadas}</p>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
            <CardContent className="p-3">
              <p className="text-xs text-slate-600 mb-1">Reuniones</p>
              <p className="text-xl font-bold text-purple-700">{estadisticas.reunionesAgendadas}</p>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-indigo-50 to-indigo-100 border-indigo-200">
            <CardContent className="p-3">
              <p className="text-xs text-slate-600 mb-1">Conversión</p>
              <p className="text-xl font-bold text-indigo-700">{estadisticas.tasaConversion.toFixed(1)}%</p>
            </CardContent>
          </Card>
          <Card className="bg-blue-50 border-blue-200">
            <CardContent className="p-3">
              <p className="text-xs text-slate-600 mb-1">Info</p>
              <p className="text-xl font-bold text-blue-600">{estadisticas.solicitaInfo}</p>
            </CardContent>
          </Card>
          <Card className="bg-yellow-50 border-yellow-200">
            <CardContent className="p-3">
              <p className="text-xs text-slate-600 mb-1">Pendientes</p>
              <p className="text-xl font-bold text-yellow-700">{estadisticas.pendientes}</p>
            </CardContent>
          </Card>
        </div>

        {/* Búsqueda y Filtros Mejorados */}
        <Card>
          <CardContent className="p-4">
            <div className="space-y-3">
              {/* Búsqueda en tiempo real */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400" />
                <Input
                  placeholder="Buscar por nombre, teléfono, email, agencia..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>

              {/* Filtros como Chips */}
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-sm font-medium text-slate-700">Filtros:</span>
                
                {/* Filtro Código Postal con Zona */}
                <select
                  value={filtroCodigoPostal}
                  onChange={(e) => setFiltroCodigoPostal(e.target.value)}
                  className="px-3 py-1.5 text-sm rounded-lg border border-blue-200 bg-white focus:border-blue-400 focus:outline-none"
                >
                  <option value="">📍 Todas las zonas</option>
                  {filtros.codigosPostales.map(cp => (
                    <option key={cp} value={cp}>
                      {getCodigoPostalConZona(cp)}
                    </option>
                  ))}
                </select>

                {/* Filtro Agencia */}
                <select
                  value={filtroAgencia}
                  onChange={(e) => setFiltroAgencia(e.target.value)}
                  className="px-3 py-1.5 text-sm rounded-lg border border-blue-200 bg-white focus:border-blue-400 focus:outline-none"
                >
                  <option value="">🏢 Todas las agencias</option>
                  {filtros.agencias.map(ag => (
                    <option key={ag} value={ag}>{ag}</option>
                  ))}
                </select>

                {/* Filtro Resultado */}
                <select
                  value={filtroResultado}
                  onChange={(e) => setFiltroResultado(e.target.value)}
                  className="px-3 py-1.5 text-sm rounded-lg border border-blue-200 bg-white focus:border-blue-400 focus:outline-none"
                >
                  <option value="">📊 Todos los resultados</option>
                  <option value="REUNION">✓ Reunión</option>
                  <option value="SOLICITA_INFO">ℹ️ Solicita Info</option>
                  <option value="NO_INTERES">✗ No Interés</option>
                  <option value="NO_CONTESTA">📞 No Contesta</option>
                  <option value="RECHAZADA">🚫 Rechazada</option>
                </select>

                {/* Filtro Estado */}
                <select
                  value={filtroEstado}
                  onChange={(e) => setFiltroEstado(e.target.value)}
                  className="px-3 py-1.5 text-sm rounded-lg border border-blue-200 bg-white focus:border-blue-400 focus:outline-none"
                >
                  <option value="">🔄 Todos los estados</option>
                  <option value="PENDIENTE">⏳ Pendiente</option>
                  <option value="LLAMADA_REALIZADA">📞 Llamada Realizada</option>
                  <option value="REUNION_AGENDADA">📅 Reunión Agendada</option>
                  <option value="SOLICITA_INFO">ℹ️ Solicita Info</option>
                  <option value="NO_INTERESADO">✗ No Interesado</option>
                </select>

                {/* Filtro Ha Llamado */}
                <select
                  value={filtroHaLlamado}
                  onChange={(e) => setFiltroHaLlamado(e.target.value)}
                  className="px-3 py-1.5 text-sm rounded-lg border border-blue-200 bg-white focus:border-blue-400 focus:outline-none"
                >
                  <option value="">📋 Todas</option>
                  <option value="true">✅ Llamadas Realizadas</option>
                  <option value="false">⏸️ Sin Llamar</option>
                </select>

                {/* Limpiar Filtros */}
                {tieneFiltrosActivos && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={limpiarFiltros}
                    className="text-red-600 hover:text-red-700"
                  >
                    <X className="h-4 w-4 mr-1" />
                    Limpiar
                  </Button>
                )}

                {/* Toggle Vista */}
                <div className="ml-auto flex gap-1 border rounded-lg p-1">
                  <Button
                    variant={vistaModo === 'tabla' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setVistaModo('tabla')}
                    className="h-7 px-2"
                  >
                    <Table2 className="h-4 w-4" />
                  </Button>
                  <Button
                    variant={vistaModo === 'tarjetas' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setVistaModo('tarjetas')}
                    className="h-7 px-2"
                  >
                    <LayoutGrid className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Lista de Llamadas - Vista Tabla */}
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
        ) : vistaModo === 'tabla' ? (
          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-slate-50 border-b border-slate-200">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700 uppercase">Nombre</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700 uppercase">Teléfono</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700 uppercase">Agencia</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700 uppercase">Zona</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700 uppercase">Estado</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700 uppercase">Acciones Rápidas</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700 uppercase">Más</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {llamadasFiltradas.map((llamada) => (
                      <tr key={llamada.id} className="hover:bg-blue-50/50 transition-colors">
                        <td className="px-4 py-3">
                          <div className="font-medium text-slate-900">{llamada.nombre}</div>
                          {llamada.email && (
                            <div className="text-xs text-slate-500">{llamada.email}</div>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          <a href={`tel:${llamada.telefono}`} className="text-blue-600 hover:text-blue-700 font-medium">
                            {llamada.telefono}
                          </a>
                        </td>
                        <td className="px-4 py-3 text-sm text-slate-600">
                          {llamada.agencia || '-'}
                        </td>
                        <td className="px-4 py-3">
                          {llamada.codigoPostal && (
                            <div className="text-sm">
                              <span className="font-medium">{llamada.codigoPostal}</span>
                              <div className="text-xs text-slate-500">
                                {getCodigoPostalConZona(llamada.codigoPostal).replace(`${llamada.codigoPostal} - `, '')}
                              </div>
                            </div>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex flex-wrap gap-1">
                            <span className={`px-2 py-0.5 rounded-full text-xs font-medium border ${getEstadoColor(llamada.estado)}`}>
                              {llamada.estado.replace('_', ' ')}
                            </span>
                            {llamada.resultado && (
                              <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getResultadoColor(llamada.resultado)}`}>
                                {llamada.resultado.replace('_', ' ')}
                              </span>
                            )}
                            {!llamada.haLlamado && (
                              <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600 border border-gray-300">
                                Sin llamar
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          {!llamada.haLlamado ? (
                            <div className="flex gap-1 flex-wrap">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleQuickAction(llamada, 'REUNION')}
                                className="h-7 px-2 text-xs bg-green-50 text-green-700 border-green-300 hover:bg-green-100"
                                title="Reunión agendada"
                              >
                                <CheckCircle className="h-3 w-3 mr-1" />
                                Reunión
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleQuickAction(llamada, 'SOLICITA_INFO')}
                                className="h-7 px-2 text-xs bg-blue-50 text-blue-700 border-blue-300 hover:bg-blue-100"
                                title="Solicita información"
                              >
                                <Info className="h-3 w-3 mr-1" />
                                Info
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleQuickAction(llamada, 'NO_INTERES')}
                                className="h-7 px-2 text-xs bg-red-50 text-red-700 border-red-300 hover:bg-red-100"
                                title="No hay interés"
                              >
                                <Ban className="h-3 w-3 mr-1" />
                                No
                              </Button>
                            </div>
                          ) : (
                            <span className="text-xs text-green-600">✓ Llamada realizada</span>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEdit(llamada)}
                              className="h-7 w-7 p-0"
                              title="Editar"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDelete(llamada.id)}
                              className="h-7 w-7 p-0 text-red-600 hover:text-red-700"
                              title="Eliminar"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        ) : (
          /* Vista Tarjetas (mejorada) */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {llamadasFiltradas.map((llamada) => (
              <Card key={llamada.id} className="hover:shadow-lg transition-all">
                <CardContent className="p-4">
                  <div className="space-y-3">
                    {/* Header */}
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="font-semibold text-slate-900 mb-1">{llamada.nombre}</h3>
                        <a href={`tel:${llamada.telefono}`} className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                          {llamada.telefono}
                        </a>
                      </div>
                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEdit(llamada)}
                          className="h-7 w-7 p-0"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(llamada.id)}
                          className="h-7 w-7 p-0 text-red-600"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>

                    {/* Info Compacta */}
                    <div className="space-y-1.5 text-sm">
                      {llamada.agencia && (
                        <div className="flex items-center gap-1.5 text-slate-600">
                          <Building2 className="h-3.5 w-3.5" />
                          <span className="truncate">{llamada.agencia}</span>
                        </div>
                      )}
                      {llamada.codigoPostal && (
                        <div className="flex items-center gap-1.5 text-slate-600">
                          <MapPin className="h-3.5 w-3.5" />
                          <span className="font-medium">{llamada.codigoPostal}</span>
                          <span className="text-xs text-slate-500">
                            {getCodigoPostalConZona(llamada.codigoPostal).replace(`${llamada.codigoPostal} - `, '')}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Estados */}
                    <div className="flex flex-wrap gap-1">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium border ${getEstadoColor(llamada.estado)}`}>
                        {llamada.estado.replace('_', ' ')}
                      </span>
                      {llamada.resultado && (
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getResultadoColor(llamada.resultado)}`}>
                          {llamada.resultado.replace('_', ' ')}
                        </span>
                      )}
                    </div>

                    {/* Acciones Rápidas */}
                    {!llamada.haLlamado ? (
                      <div className="flex gap-1.5 pt-2 border-t">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleQuickAction(llamada, 'REUNION')}
                          className="flex-1 h-8 text-xs bg-green-50 text-green-700 border-green-300 hover:bg-green-100"
                        >
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Reunión
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleQuickAction(llamada, 'SOLICITA_INFO')}
                          className="flex-1 h-8 text-xs bg-blue-50 text-blue-700 border-blue-300 hover:bg-blue-100"
                        >
                          <Info className="h-3 w-3 mr-1" />
                          Info
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleQuickAction(llamada, 'NO_INTERES')}
                          className="flex-1 h-8 text-xs bg-red-50 text-red-700 border-red-300 hover:bg-red-100"
                        >
                          <Ban className="h-3 w-3 mr-1" />
                          No
                        </Button>
                      </div>
                    ) : (
                      <div className="text-xs text-green-600 pt-2 border-t">
                        ✓ Llamada realizada {llamada.fechaLlamada && new Date(llamada.fechaLlamada).toLocaleDateString('es-ES')}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Modal Acción Rápida */}
        {showQuickActionModal && quickActionItem && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <Card className="w-full max-w-md">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">Registro Rápido</CardTitle>
                  <Button variant="ghost" size="sm" onClick={() => {
                    setShowQuickActionModal(false)
                    setQuickActionItem(null)
                    setQuickActionResult('')
                  }}>
                    <X className="h-5 w-5" />
                  </Button>
                </div>
                <CardDescription>
                  {quickActionItem.nombre} • {quickActionItem.telefono}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Resultado: <span className="font-semibold">{quickActionResult === 'REUNION' ? 'Reunión Agendada' : quickActionResult === 'SOLICITA_INFO' ? 'Solicita Info' : 'No Interés'}</span>
                  </label>
                </div>

                {quickActionResult === 'REUNION' && (
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Fecha Reunión</label>
                    <Input
                      type="datetime-local"
                      value={formData.fechaAgendada}
                      onChange={(e) => setFormData({ ...formData, fechaAgendada: e.target.value })}
                    />
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Notas (opcional)</label>
                  <textarea
                    value={formData.resultadoDetalle}
                    onChange={(e) => setFormData({ ...formData, resultadoDetalle: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-blue-200 bg-white focus:border-blue-400 focus:outline-none"
                    rows={2}
                    placeholder="Notas rápidas..."
                  />
                </div>

                <div className="flex gap-3 pt-2">
                  <Button
                    onClick={handleSaveQuickAction}
                    disabled={savingQuick}
                    className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600"
                  >
                    {savingQuick ? 'Guardando...' : 'Guardar'}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setShowQuickActionModal(false)
                      setQuickActionItem(null)
                      setQuickActionResult('')
                    }}
                  >
                    Cancelar
                  </Button>
                </div>
              </CardContent>
            </Card>
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
                    <X className="h-5 w-5" />
                  </Button>
                </div>
                <CardDescription>
                  Formato: name, agency, address, profile_url, phone
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

        {/* Modal Completo (solo para edición detallada) */}
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
                    <X className="h-5 w-5" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4 max-h-[80vh] overflow-y-auto">
                {/* Solo mostrar campos básicos si es nueva */}
                {!editingItem ? (
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
                  </div>
                ) : (
                  /* Formulario completo para edición */
                  <>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Nombre *</label>
                        <Input
                          value={formData.nombre}
                          onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Teléfono *</label>
                        <Input
                          value={formData.telefono}
                          onChange={(e) => setFormData({ ...formData, telefono: e.target.value })}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Agencia</label>
                        <Input
                          value={formData.agencia}
                          onChange={(e) => setFormData({ ...formData, agencia: e.target.value })}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Código Postal</label>
                        <Input
                          value={formData.codigoPostal}
                          onChange={(e) => setFormData({ ...formData, codigoPostal: e.target.value })}
                        />
                        {formData.codigoPostal && (
                          <p className="text-xs text-slate-500 mt-1">
                            {getCodigoPostalConZona(formData.codigoPostal)}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Registro de Llamada - Solo si está editando */}
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
                              <label className="block text-sm font-medium text-slate-700 mb-1">Fecha/Hora</label>
                              <Input
                                type="datetime-local"
                                value={formData.fechaLlamada}
                                onChange={(e) => setFormData({ ...formData, fechaLlamada: e.target.value })}
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-slate-700 mb-1">Duración (seg)</label>
                              <Input
                                type="number"
                                value={formData.duracion}
                                onChange={(e) => setFormData({ ...formData, duracion: e.target.value })}
                                placeholder="180"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-slate-700 mb-1">Resultado</label>
                              <select
                                value={formData.resultado}
                                onChange={(e) => setFormData({ ...formData, resultado: e.target.value })}
                                className="w-full px-3 py-2 rounded-lg border border-blue-200 bg-white focus:border-blue-400 focus:outline-none"
                              >
                                <option value="">Seleccionar</option>
                                <option value="REUNION">Reunión Agendada</option>
                                <option value="SOLICITA_INFO">Solicita Info</option>
                                <option value="NO_INTERES">No Interés</option>
                                <option value="NO_CONTESTA">No Contesta</option>
                                <option value="RECHAZADA">Rechazada</option>
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
                              <label className="block text-sm font-medium text-slate-700 mb-1">Detalle</label>
                              <textarea
                                value={formData.resultadoDetalle}
                                onChange={(e) => setFormData({ ...formData, resultadoDetalle: e.target.value })}
                                className="w-full px-3 py-2 rounded-lg border border-blue-200 bg-white focus:border-blue-400 focus:outline-none"
                                rows={2}
                                placeholder="Detalles..."
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
                    rows={2}
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
