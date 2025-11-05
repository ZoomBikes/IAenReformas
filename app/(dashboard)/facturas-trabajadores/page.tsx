'use client'

import { useEffect, useState, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { 
  Receipt,
  Camera,
  Upload,
  Send,
  Search,
  Edit,
  Trash2,
  X,
  CheckCircle2,
  Clock,
  FileText,
  Image as ImageIcon,
  Scan
} from 'lucide-react'
import { toast } from 'sonner'

interface FacturaTrabajador {
  id: string
  trabajadorNombre: string
  trabajadorDni?: string
  concepto: string
  importe: number
  fechaFactura: string
  fechaRegistro: string
  estado: string
  imagenUrl?: string
  imagenBase64?: string
  enviadoGestor: boolean
  fechaEnvioGestor?: string
  obra?: {
    nombre: string
    cliente: {
      nombre: string
    }
  }
}

export default function FacturasTrabajadoresPage() {
  const [facturas, setFacturas] = useState<FacturaTrabajador[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [editingItem, setEditingItem] = useState<FacturaTrabajador | null>(null)
  const [showCamera, setShowCamera] = useState(false)
  const [previewImage, setPreviewImage] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const streamRef = useRef<MediaStream | null>(null)

  useEffect(() => {
    cargarFacturas()
  }, [])

  const cargarFacturas = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/facturas-trabajadores')
      const data = await res.json()
      setFacturas(data.facturas || [])
    } catch (error) {
      toast.error('Error al cargar facturas')
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (file.type.startsWith('image/')) {
        const reader = new FileReader()
        reader.onloadend = () => {
          setPreviewImage(reader.result as string)
          setShowCamera(false)
        }
        reader.readAsDataURL(file)
      } else {
        toast.error('Por favor, selecciona una imagen')
      }
    }
  }

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' } // Cámara trasera si está disponible
      })
      streamRef.current = stream
      if (videoRef.current) {
        videoRef.current.srcObject = stream
      }
      setShowCamera(true)
    } catch (error) {
      toast.error('No se pudo acceder a la cámara')
      console.error(error)
      // Si no hay cámara, abrir selector de archivos
      fileInputRef.current?.click()
    }
  }

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop())
      streamRef.current = null
    }
    setShowCamera(false)
  }

  const capturePhoto = () => {
    if (videoRef.current) {
      const canvas = document.createElement('canvas')
      canvas.width = videoRef.current.videoWidth
      canvas.height = videoRef.current.videoHeight
      const ctx = canvas.getContext('2d')
      if (ctx) {
        ctx.drawImage(videoRef.current, 0, 0)
        const imageData = canvas.toDataURL('image/jpeg', 0.8)
        setPreviewImage(imageData)
        stopCamera()
      }
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('¿Estás seguro de eliminar esta factura?')) return

    try {
      const res = await fetch(`/api/facturas-trabajadores/${id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('Error al eliminar')

      toast.success('Factura eliminada')
      cargarFacturas()
    } catch (error) {
      toast.error('Error al eliminar')
    }
  }

  const handleEnviarGestor = async (id: string) => {
    try {
      const res = await fetch(`/api/facturas-trabajadores/${id}/enviar-gestor`, {
        method: 'POST'
      })
      if (!res.ok) throw new Error('Error al enviar')

      toast.success('Factura enviada al gestor')
      cargarFacturas()
    } catch (error) {
      toast.error('Error al enviar factura')
    }
  }

  const handleSave = async (formData: any) => {
    try {
      const endpoint = editingItem 
        ? `/api/facturas-trabajadores/${editingItem.id}`
        : '/api/facturas-trabajadores'
      
      const method = editingItem ? 'PUT' : 'POST'

      const res = await fetch(endpoint, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          imagenBase64: previewImage
        })
      })

      if (!res.ok) throw new Error('Error al guardar')

      toast.success(editingItem ? 'Actualizada' : 'Creada')
      setShowModal(false)
      setPreviewImage(null)
      setEditingItem(null)
      cargarFacturas()
    } catch (error) {
      toast.error('Error al guardar')
    }
  }

  const facturasFiltradas = facturas.filter(f =>
    f.trabajadorNombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
    f.concepto.toLowerCase().includes(searchTerm.toLowerCase()) ||
    f.trabajadorDni?.includes(searchTerm)
  )

  const stats = {
    total: facturas.length,
    pendientes: facturas.filter(f => f.estado === 'PENDIENTE').length,
    enviadas: facturas.filter(f => f.enviadoGestor).length,
    totalImporte: facturas.reduce((sum, f) => sum + f.importe, 0)
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-orange-600 to-red-700 bg-clip-text text-transparent">
              Facturas de Trabajadores
            </h1>
            <p className="text-slate-600 mt-1">
              Escanea y gestiona facturas de trabajadores
            </p>
          </div>
          <Button 
            size="lg" 
            className="rounded-xl bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white shadow-lg shadow-orange-500/30"
            onClick={() => {
              setEditingItem(null)
              setPreviewImage(null)
              setShowModal(true)
            }}
          >
            <Receipt className="h-5 w-5 mr-2" />
            Nueva Factura
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="glass-white border-orange-200/50 rounded-2xl">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-orange-100 flex items-center justify-center">
                  <Receipt className="h-6 w-6 text-orange-600" />
                </div>
                <div>
                  <p className="text-sm text-slate-500">Total Facturas</p>
                  <p className="text-2xl font-bold text-slate-900">{stats.total}</p>
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
                  <Send className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-slate-500">Enviadas</p>
                  <p className="text-2xl font-bold text-slate-900">{stats.enviadas}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="glass-white border-purple-200/50 rounded-2xl">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-purple-100 flex items-center justify-center">
                  <Receipt className="h-6 w-6 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm text-slate-500">Total Importe</p>
                  <p className="text-2xl font-bold text-slate-900">€{stats.totalImporte.toFixed(2)}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search */}
        <Card className="glass-white border-orange-200/50 rounded-2xl">
          <CardContent className="p-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400" />
                <Input
                  placeholder="Buscar por trabajador, concepto o DNI..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 rounded-xl border-orange-200/50"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Facturas List */}
        <Card className="glass-white border-orange-200/50 rounded-2xl">
          <CardHeader>
            <CardTitle>Facturas Registradas</CardTitle>
            <CardDescription>{facturasFiltradas.length} facturas</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <p className="text-center py-8 text-slate-500">Cargando...</p>
            ) : facturasFiltradas.length === 0 ? (
              <div className="text-center py-12">
                <Receipt className="h-12 w-12 text-slate-300 mx-auto mb-4" />
                <p className="text-slate-500">No hay facturas registradas</p>
              </div>
            ) : (
              <div className="space-y-3">
                {facturasFiltradas.map((factura) => (
                  <div key={factura.id} className="p-4 rounded-xl border border-orange-200/50 hover:bg-orange-50/30 transition-all">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-semibold text-slate-900">{factura.trabajadorNombre}</h3>
                          <span className={`px-2 py-1 text-xs rounded-full ${
                            factura.estado === 'PAGADA' ? 'bg-green-100 text-green-800' :
                            factura.estado === 'ENVIADA' ? 'bg-blue-100 text-blue-800' :
                            factura.estado === 'RECHAZADA' ? 'bg-red-100 text-red-800' :
                            'bg-orange-100 text-orange-800'
                          }`}>
                            {factura.estado}
                          </span>
                          {factura.enviadoGestor && (
                            <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800">
                              Enviada al gestor
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-slate-600 mb-2">{factura.concepto}</p>
                        <div className="flex flex-wrap gap-4 text-sm text-slate-600">
                          <span className="font-semibold text-slate-900">€{factura.importe.toFixed(2)}</span>
                          {factura.trabajadorDni && <span>DNI: {factura.trabajadorDni}</span>}
                          <span>Fecha: {new Date(factura.fechaFactura).toLocaleDateString('es-ES')}</span>
                          {factura.obra && (
                            <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                              {factura.obra.nombre}
                            </span>
                          )}
                        </div>
                        {(factura.imagenBase64 || factura.imagenUrl) && (
                          <div className="mt-2">
                            <ImageIcon className="h-4 w-4 text-slate-400 inline mr-1" />
                            <span className="text-xs text-slate-500">Factura escaneada</span>
                          </div>
                        )}
                      </div>
                      <div className="flex flex-col gap-2">
                        {(factura.imagenBase64 || factura.imagenUrl) && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setEditingItem(factura)
                              setPreviewImage(factura.imagenBase64 || factura.imagenUrl || null)
                              setShowModal(true)
                            }}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                        )}
                        {!factura.enviadoGestor && (
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-green-600"
                            onClick={() => handleEnviarGestor(factura.id)}
                          >
                            <Send className="h-4 w-4" />
                          </Button>
                        )}
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-red-600"
                          onClick={() => handleDelete(factura.id)}
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

        {/* Modal */}
        {showModal && (
          <ModalFactura
            item={editingItem}
            previewImage={previewImage}
            onClose={() => {
              setShowModal(false)
              setPreviewImage(null)
              setEditingItem(null)
              stopCamera()
            }}
            onSave={handleSave}
            onFileSelect={handleFileSelect}
            onStartCamera={startCamera}
            onCapturePhoto={capturePhoto}
            onStopCamera={stopCamera}
            onRemoveImage={() => {
              setPreviewImage(null)
              if (fileInputRef.current) fileInputRef.current.value = ''
            }}
            showCamera={showCamera}
            videoRef={videoRef}
            fileInputRef={fileInputRef}
          />
        )}
      </div>
    </DashboardLayout>
  )
}

function ModalFactura({ 
  item, 
  previewImage, 
  onClose, 
  onSave, 
  onFileSelect,
  onStartCamera,
  onCapturePhoto,
  onStopCamera,
  onRemoveImage,
  showCamera,
  videoRef,
  fileInputRef
}: any) {
  const [formData, setFormData] = useState({
    trabajadorNombre: item?.trabajadorNombre || '',
    trabajadorDni: item?.trabajadorDni || '',
    trabajadorTelefono: item?.trabajadorTelefono || '',
    concepto: item?.concepto || '',
    importe: item?.importe || '',
    fechaFactura: item?.fechaFactura ? new Date(item.fechaFactura).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
    obraId: item?.obraId || '',
    notas: item?.notas || '',
    estado: item?.estado || 'PENDIENTE'
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSave(formData)
  }

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 overflow-y-auto">
      <Card className="w-full max-w-3xl max-h-[90vh] overflow-y-auto glass-white border-orange-200/50 rounded-2xl">
        <CardHeader className="flex flex-row justify-between items-center">
          <CardTitle>{item ? 'Editar' : 'Nueva'} Factura</CardTitle>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Sección de Escaneo */}
            <div className="border border-orange-200/50 rounded-xl p-4 bg-orange-50/30">
              <h3 className="font-semibold text-slate-900 mb-3 flex items-center gap-2">
                <Scan className="h-5 w-5" />
                Escanear o Subir Factura
              </h3>
              
              {showCamera ? (
                <div className="space-y-3">
                  <div className="relative bg-black rounded-xl overflow-hidden">
                    <video
                      ref={videoRef}
                      autoPlay
                      playsInline
                      className="w-full h-64 object-cover"
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={onStopCamera}
                      className="flex-1"
                    >
                      <X className="h-4 w-4 mr-2" />
                      Cancelar
                    </Button>
                    <Button
                      type="button"
                      onClick={onCapturePhoto}
                      className="flex-1 bg-gradient-to-r from-orange-600 to-red-600"
                    >
                      <Camera className="h-4 w-4 mr-2" />
                      Capturar
                    </Button>
                  </div>
                </div>
              ) : previewImage ? (
                <div className="space-y-3">
                  <div className="relative">
                    <img
                      src={previewImage}
                      alt="Vista previa"
                      className="w-full rounded-xl border border-orange-200/50 max-h-64 object-contain bg-white"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute top-2 right-2 bg-white/90"
                      onClick={onRemoveImage}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={onRemoveImage}
                      className="flex-1"
                    >
                      Cambiar Imagen
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={onStartCamera}
                      className="flex-1"
                    >
                      <Camera className="h-4 w-4 mr-2" />
                      Escanear de Nuevo
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="flex gap-3">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => fileInputRef.current?.click()}
                    className="flex-1"
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    Subir Foto
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={onStartCamera}
                    className="flex-1"
                  >
                    <Camera className="h-4 w-4 mr-2" />
                    Escanear Documento
                  </Button>
                </div>
              )}
              
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                capture="environment"
                onChange={onFileSelect}
                className="hidden"
              />
            </div>

            {/* Datos del Trabajador */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-slate-700">Nombre del Trabajador *</label>
                <Input
                  value={formData.trabajadorNombre}
                  onChange={(e) => setFormData({ ...formData, trabajadorNombre: e.target.value })}
                  className="mt-1 rounded-xl"
                  required
                />
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700">DNI</label>
                <Input
                  value={formData.trabajadorDni}
                  onChange={(e) => setFormData({ ...formData, trabajadorDni: e.target.value })}
                  className="mt-1 rounded-xl"
                />
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-slate-700">Teléfono</label>
              <Input
                value={formData.trabajadorTelefono}
                onChange={(e) => setFormData({ ...formData, trabajadorTelefono: e.target.value })}
                className="mt-1 rounded-xl"
              />
            </div>

            {/* Datos de la Factura */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-slate-700">Concepto *</label>
                <Input
                  value={formData.concepto}
                  onChange={(e) => setFormData({ ...formData, concepto: e.target.value })}
                  className="mt-1 rounded-xl"
                  required
                />
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700">Importe (€) *</label>
                <Input
                  type="number"
                  step="0.01"
                  value={formData.importe}
                  onChange={(e) => setFormData({ ...formData, importe: e.target.value })}
                  className="mt-1 rounded-xl"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-slate-700">Fecha de Factura *</label>
                <Input
                  type="date"
                  value={formData.fechaFactura}
                  onChange={(e) => setFormData({ ...formData, fechaFactura: e.target.value })}
                  className="mt-1 rounded-xl"
                  required
                />
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700">Estado</label>
                <select
                  value={formData.estado}
                  onChange={(e) => setFormData({ ...formData, estado: e.target.value })}
                  className="mt-1 w-full rounded-xl border border-orange-200/50 p-2"
                >
                  <option value="PENDIENTE">Pendiente</option>
                  <option value="ENVIADA">Enviada</option>
                  <option value="PAGADA">Pagada</option>
                  <option value="RECHAZADA">Rechazada</option>
                </select>
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-slate-700">Obra ID (opcional)</label>
              <Input
                value={formData.obraId}
                onChange={(e) => setFormData({ ...formData, obraId: e.target.value })}
                className="mt-1 rounded-xl"
                placeholder="ID de la obra relacionada"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-slate-700">Notas</label>
              <textarea
                value={formData.notas}
                onChange={(e) => setFormData({ ...formData, notas: e.target.value })}
                className="mt-1 w-full rounded-xl border border-orange-200/50 p-2"
                rows={3}
              />
            </div>

            {!previewImage && (
              <div className="p-3 bg-orange-50 border border-orange-200 rounded-xl">
                <p className="text-sm text-orange-800">
                  ⚠️ Se recomienda escanear o subir una foto de la factura para su registro
                </p>
              </div>
            )}

            <div className="flex justify-end gap-3 pt-4">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancelar
              </Button>
              <Button type="submit" className="rounded-xl bg-gradient-to-r from-orange-600 to-red-600">
                Guardar Factura
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

