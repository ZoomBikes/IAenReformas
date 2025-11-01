'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import Link from 'next/link'
import { Plus, Search, FileText, Eye, Calendar } from 'lucide-react'
import { toast } from 'sonner'

interface Presupuesto {
  id: string
  cliente: {
    nombre: string
    telefono?: string
    email?: string
  }
  tipoObra: string
  total: number
  estado: string
  fechaCreacion: string
  createdAt: string
}

export default function PresupuestosPage() {
  const [presupuestos, setPresupuestos] = useState<Presupuesto[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    cargarPresupuestos()
  }, [])

  const cargarPresupuestos = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/presupuestos')
      if (!response.ok) throw new Error('Error al cargar')
      
      const data = await response.json()
      setPresupuestos(data.presupuestos || [])
    } catch (error) {
      toast.error('Error al cargar los presupuestos')
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  const presupuestosFiltrados = presupuestos.filter(p =>
    p.cliente.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.cliente.telefono?.includes(searchTerm) ||
    p.tipoObra.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const formatearFecha = (fecha: string) => {
    return new Date(fecha).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4 animate-fade-in">
          <div>
            <h1 className="text-3xl sm:text-4xl font-bold mb-2 bg-gradient-to-r from-blue-600 to-indigo-700 bg-clip-text text-transparent">Presupuestos</h1>
            <p className="text-slate-600">
              Gestiona todos tus presupuestos de reformas
            </p>
          </div>
          <Link href="/presupuestos/nuevo">
            <Button size="lg">
              <Plus className="h-4 w-4 mr-2" />
              Nuevo Presupuesto
            </Button>
          </Link>
        </div>

        {/* Búsqueda */}
        <div className="mb-6 animate-fade-in">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-blue-400 h-4 w-4 z-10" />
            <Input
              placeholder="Buscar por cliente, teléfono o tipo de obra..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Lista de presupuestos */}
        {loading ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Cargando presupuestos...</p>
          </div>
        ) : presupuestosFiltrados.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <FileText className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-semibold mb-2">
                {presupuestos.length === 0 ? 'No hay presupuestos aún' : 'No se encontraron resultados'}
              </h3>
              <p className="text-muted-foreground mb-4">
                {presupuestos.length === 0
                  ? 'Crea tu primer presupuesto para comenzar'
                  : 'Intenta con otros términos de búsqueda'}
              </p>
              {presupuestos.length === 0 && (
                <Link href="/presupuestos/nuevo">
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Crear Primer Presupuesto
                  </Button>
                </Link>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {presupuestosFiltrados.map((presupuesto, idx) => (
              <Card key={presupuesto.id} className="hover:shadow-lg hover:shadow-blue-500/20 hover:-translate-y-0.5 transition-all duration-300 rounded-2xl animate-fade-in" style={{ animationDelay: `${idx * 0.05}s` }}>
                <CardContent className="p-6">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold text-slate-900">{presupuesto.cliente.nombre}</h3>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getEstadoColor(presupuesto.estado)}`}>
                          {presupuesto.estado}
                        </span>
                      </div>
                      <div className="grid grid-cols-2 gap-4 text-sm text-muted-foreground mb-2">
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4" />
                          {formatearFecha(presupuesto.createdAt)}
                        </div>
                        <div>
                          📍 {presupuesto.tipoObra.replace('_', ' ')}
                        </div>
                      </div>
                      {presupuesto.cliente.telefono && (
                        <p className="text-sm text-muted-foreground">
                          📞 {presupuesto.cliente.telefono}
                        </p>
                      )}
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <div className="text-right">
                        <p className="text-xs text-slate-600 font-medium">Total</p>
                        <p className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                          €{presupuesto.total.toFixed(2)}
                        </p>
                      </div>
                      <Link href={`/presupuestos/${presupuesto.id}`}>
                        <Button variant="outline" size="sm" className="hover:bg-blue-50/50 transition-all">
                          <Eye className="h-4 w-4 mr-2" />
                          Ver Detalles
                        </Button>
                      </Link>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Estadísticas rápidas */}
        {presupuestos.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8 animate-fade-in">
            <Card className="glass-white border-blue-200/50 hover:shadow-lg hover:shadow-blue-500/10 transition-all duration-300 rounded-2xl">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-slate-600">Total Presupuestos</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">{presupuestos.length}</p>
              </CardContent>
            </Card>
            <Card className="glass-white border-blue-200/50 hover:shadow-lg hover:shadow-blue-500/10 transition-all duration-300 rounded-2xl">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-slate-600">Valor Total</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                  €{presupuestos.reduce((sum, p) => sum + p.total, 0).toFixed(2)}
                </p>
              </CardContent>
            </Card>
            <Card className="glass-white border-blue-200/50 hover:shadow-lg hover:shadow-blue-500/10 transition-all duration-300 rounded-2xl">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-slate-600">Promedio</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                  €{presupuestos.length > 0 
                    ? (presupuestos.reduce((sum, p) => sum + p.total, 0) / presupuestos.length).toFixed(2)
                    : '0.00'}
                </p>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  )
}

