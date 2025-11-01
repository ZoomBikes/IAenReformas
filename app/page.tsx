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
  ArrowRight
} from 'lucide-react'

export default function DashboardPage() {
  const modules = [
    {
      name: 'CRM y Captación',
      description: 'Gestiona clientes, leads y contactos comerciales',
      href: '/crm',
      icon: Users,
      color: 'from-blue-600 to-blue-700'
    },
    {
      name: 'Planificación',
      description: 'Calendario de obras y tareas pendientes',
      href: '/planificacion',
      icon: Calendar,
      color: 'from-indigo-600 to-indigo-700'
    },
    {
      name: 'Compras y Subcontratas',
      description: 'Órdenes de compra, proveedores y subcontratistas',
      href: '/compras',
      icon: ShoppingCart,
      color: 'from-purple-600 to-purple-700'
    },
    {
      name: 'Control de Costes',
      description: 'Métricas financieras y seguimiento de avances',
      href: '/costes',
      icon: DollarSign,
      color: 'from-green-600 to-green-700'
    },
    {
      name: 'Presupuestos',
      description: 'Crea y gestiona presupuestos de reformas',
      href: '/presupuestos',
      icon: FileText,
      color: 'from-cyan-600 to-cyan-700'
    }
  ]

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-700 bg-clip-text text-transparent">
            Panel de Control
          </h1>
          <p className="text-slate-600 mt-1">
            Accede a todas las funcionalidades de gestión de reformas
          </p>
        </div>

        {/* Modules Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {modules.map((module, idx) => (
            <Link key={idx} href={module.href}>
              <Card className="hover:shadow-xl hover:shadow-blue-500/20 hover:-translate-y-1 transition-all duration-300 rounded-2xl cursor-pointer border-blue-200/50 group">
                <CardHeader className="pb-4">
                  <div className="flex items-center gap-4 mb-4">
                    <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${module.color} p-4 shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                      <module.icon className="h-8 w-8 text-white" />
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
                  <div className="flex items-center text-blue-600 group-hover:text-blue-700 font-medium">
                    Acceder
                    <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </DashboardLayout>
  )
}

