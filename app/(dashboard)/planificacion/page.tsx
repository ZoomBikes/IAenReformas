'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { 
  Calendar as CalendarIcon, 
  Clock, 
  CheckCircle2,
  AlertCircle,
  Plus
} from 'lucide-react'

export default function PlanificacionPage() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-700 bg-clip-text text-transparent">
              Planificación
            </h1>
            <p className="text-slate-600 mt-1">
              Calendario de obras y tareas programadas
            </p>
          </div>
          <Button size="lg" className="rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white shadow-lg shadow-indigo-500/30">
            <Plus className="h-5 w-5 mr-2" />
            Nueva Tarea
          </Button>
        </div>

        {/* Calendar View Placeholder */}
        <Card className="glass-white border-indigo-200/50 rounded-2xl">
          <CardHeader>
            <CardTitle className="text-lg font-bold text-slate-900">
              Vista Mensual
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-center py-16 text-center">
              <div>
                <CalendarIcon className="h-16 w-16 text-slate-300 mx-auto mb-4" />
                <p className="text-slate-500 text-lg mb-2">Calendario de obras</p>
                <p className="text-sm text-slate-400">
                  Vista de calendario próximamente
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tasks List */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="glass-white border-blue-200/50 rounded-2xl">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-yellow-600" />
                <CardTitle className="text-lg font-bold text-slate-900">
                  Pendientes
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-center py-12 text-center">
                <p className="text-slate-400 text-sm">Sin tareas pendientes</p>
              </div>
            </CardContent>
          </Card>

          <Card className="glass-white border-blue-200/50 rounded-2xl">
            <CardHeader>
              <div className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-orange-600" />
                <CardTitle className="text-lg font-bold text-slate-900">
                  En Progreso
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-center py-12 text-center">
                <p className="text-slate-400 text-sm">Sin obras en progreso</p>
              </div>
            </CardContent>
          </Card>

          <Card className="glass-white border-blue-200/50 rounded-2xl">
            <CardHeader>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-green-600" />
                <CardTitle className="text-lg font-bold text-slate-900">
                  Completadas
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-center py-12 text-center">
                <p className="text-slate-400 text-sm">Sin obras completadas</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  )
}

