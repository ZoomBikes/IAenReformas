'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { 
  Users, 
  Calendar, 
  ShoppingCart, 
  DollarSign,
  FileText,
  Plus,
  TrendingUp,
  AlertCircle,
  CheckCircle2,
  Clock,
  ArrowRight
} from 'lucide-react'

export default function DashboardPage() {
  const modules = [
    {
      name: 'CRM y Captación',
      description: 'Gestiona clientes, leads y contactos',
      href: '/crm',
      icon: Users,
      color: 'from-blue-600 to-blue-700',
      stats: { label: 'Clientes activos', value: '0' }
    },
    {
      name: 'Planificación',
      description: 'Calendario de obras y tareas pendientes',
      href: '/planificacion',
      icon: Calendar,
      color: 'from-indigo-600 to-indigo-700',
      stats: { label: 'Obras activas', value: '0' }
    },
    {
      name: 'Compras y Subcontratas',
      description: 'Órdenes de compra y proveedores',
      href: '/compras',
      icon: ShoppingCart,
      color: 'from-purple-600 to-purple-700',
      stats: { label: 'Pedidos pendientes', value: '0' }
    },
    {
      name: 'Control de Costes',
      description: 'Métricas y seguimiento financiero',
      href: '/costes',
      icon: DollarSign,
      color: 'from-green-600 to-green-700',
      stats: { label: 'Margen estimado', value: '0%' }
    }
  ]

  const quickActions = [
    { icon: Plus, label: 'Nueva Obra', href: '/presupuestos/nuevo', color: 'bg-gradient-to-r from-blue-600 to-indigo-600' },
    { icon: FileText, label: 'Ver Presupuestos', href: '/presupuestos', color: 'bg-gradient-to-r from-indigo-600 to-purple-600' },
    { icon: Users, label: 'Nuevo Cliente', href: '/crm', color: 'bg-gradient-to-r from-purple-600 to-pink-600' },
  ]

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-700 bg-clip-text text-transparent">
              Panel de Control
            </h1>
            <p className="text-slate-600 mt-1">
              Gestiona tus proyectos de reformas desde un solo lugar
            </p>
          </div>
          <Link href="/presupuestos/nuevo">
            <Button size="lg" className="rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg shadow-blue-500/30">
              <Plus className="h-5 w-5 mr-2" />
              Nueva Obra
            </Button>
          </Link>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {quickActions.map((action, idx) => (
            <Link key={idx} href={action.href}>
              <Card className="hover:shadow-lg hover:shadow-blue-500/20 hover:-translate-y-0.5 transition-all duration-300 rounded-2xl cursor-pointer border-blue-200/50">
                <CardContent className="p-6 flex items-center gap-4">
                  <div className={`w-14 h-14 rounded-xl ${action.color} p-3 shadow-lg`}>
                    <action.icon className="h-8 w-8 text-white" />
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-slate-900">{action.label}</p>
                    <p className="text-sm text-slate-500">Acceso directo</p>
                  </div>
                  <ArrowRight className="h-5 w-5 text-slate-400" />
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>

        {/* Main Modules */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {modules.map((module, idx) => (
            <Link key={idx} href={module.href}>
              <Card className="hover:shadow-xl hover:shadow-blue-500/20 hover:-translate-y-1 transition-all duration-300 rounded-2xl cursor-pointer border-blue-200/50 group">
                <CardHeader className="pb-4">
                  <div className="flex items-start justify-between mb-4">
                    <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${module.color} p-4 shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                      <module.icon className="h-8 w-8 text-white" />
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-slate-900">{module.stats.value}</p>
                      <p className="text-xs text-slate-500">{module.stats.label}</p>
                    </div>
                  </div>
                  <CardTitle className="text-xl font-bold text-slate-900 mb-2">
                    {module.name}
                  </CardTitle>
                  <p className="text-slate-600 text-sm leading-relaxed">
                    {module.description}
                  </p>
                </CardHeader>
                <CardContent className="pt-0">
                  <Button variant="ghost" className="text-blue-600 hover:text-blue-700 hover:bg-blue-50/50 p-0 h-auto font-medium">
                    Acceder al módulo
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>

        {/* Quick Summary */}
        <Card className="glass-white border-blue-200/50 rounded-2xl">
          <CardHeader>
            <CardTitle className="text-lg font-bold text-slate-900">
              Resumen Rápido
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center">
                  <TrendingUp className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-slate-500">Obras activas</p>
                  <p className="text-2xl font-bold text-slate-900">0</p>
                </div>
              </div>
              
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-green-100 flex items-center justify-center">
                  <CheckCircle2 className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-slate-500">Completadas</p>
                  <p className="text-2xl font-bold text-slate-900">0</p>
                </div>
              </div>
              
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-yellow-100 flex items-center justify-center">
                  <AlertCircle className="h-6 w-6 text-yellow-600" />
                </div>
                <div>
                  <p className="text-sm text-slate-500">Pendientes</p>
                  <p className="text-2xl font-bold text-slate-900">0</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card className="glass-white border-blue-200/50 rounded-2xl">
          <CardHeader>
            <CardTitle className="text-lg font-bold text-slate-900">
              Actividad Reciente
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-center py-12 text-center">
              <div>
                <Clock className="h-12 w-12 text-slate-300 mx-auto mb-4" />
                <p className="text-slate-500">No hay actividad reciente</p>
                <p className="text-sm text-slate-400 mt-1">
                  Los últimos movimientos aparecerán aquí
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}

