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
        return 'bg-gray-100 text-gray-800'
      case 'ENVIADO':
        return 'bg-blue-100 text-blue-800'
      case 'ACEPTADO':
        return 'bg-green-100 text-green-800'
      case 'RECHAZADO':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold mb-2">Presupuestos</h1>
            <p className="text-muted-foreground">
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
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
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
            {presupuestosFiltrados.map((presupuesto) => (
              <Card key={presupuesto.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold">{presupuesto.cliente.nombre}</h3>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getEstadoColor(presupuesto.estado)}`}>
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
                        <p className="text-xs text-muted-foreground">Total</p>
                        <p className="text-2xl font-bold text-primary">
                          €{presupuesto.total.toFixed(2)}
                        </p>
                      </div>
                      <Link href={`/presupuestos/${presupuesto.id}`}>
                        <Button variant="outline" size="sm">
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
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">Total Presupuestos</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold">{presupuestos.length}</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">Valor Total</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold">
                  €{presupuestos.reduce((sum, p) => sum + p.total, 0).toFixed(2)}
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">Promedio</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold">
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

