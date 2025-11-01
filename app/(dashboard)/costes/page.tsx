'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { 
  DollarSign, 
  TrendingUp,
  TrendingDown,
  Percent,
  AlertCircle
} from 'lucide-react'

export default function CostesPage() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-green-600 to-emerald-700 bg-clip-text text-transparent">
              Control de Costes y Avance
            </h1>
            <p className="text-slate-600 mt-1">
              Métricas financieras y seguimiento de obras
            </p>
          </div>
        </div>

        {/* Financial Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="glass-white border-green-200/50 rounded-2xl">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-xl bg-green-100 flex items-center justify-center">
                  <DollarSign className="h-6 w-6 text-green-600" />
                </div>
                <TrendingUp className="h-5 w-5 text-green-600" />
              </div>
              <p className="text-sm text-slate-500 mb-1">Presupuestado</p>
              <p className="text-3xl font-bold text-slate-900">€0</p>
              <p className="text-xs text-slate-400 mt-2">Total</p>
            </CardContent>
          </Card>
          
          <Card className="glass-white border-blue-200/50 rounded-2xl">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center">
                  <Percent className="h-6 w-6 text-blue-600" />
                </div>
                <TrendingUp className="h-5 w-5 text-blue-600" />
              </div>
              <p className="text-sm text-slate-500 mb-1">Ejecutado</p>
              <p className="text-3xl font-bold text-slate-900">€0</p>
              <p className="text-xs text-slate-400 mt-2">0% del total</p>
            </CardContent>
          </Card>
          
          <Card className="glass-white border-orange-200/50 rounded-2xl">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-xl bg-orange-100 flex items-center justify-center">
                  <AlertCircle className="h-6 w-6 text-orange-600" />
                </div>
                <TrendingDown className="h-5 w-5 text-orange-600" />
              </div>
              <p className="text-sm text-slate-500 mb-1">Margen</p>
              <p className="text-3xl font-bold text-slate-900">0%</p>
              <p className="text-xs text-slate-400 mt-2">Estimado</p>
            </CardContent>
          </Card>
          
          <Card className="glass-white border-purple-200/50 rounded-2xl">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-xl bg-purple-100 flex items-center justify-center">
                  <Percent className="h-6 w-6 text-purple-600" />
                </div>
                <TrendingUp className="h-5 w-5 text-purple-600" />
              </div>
              <p className="text-sm text-slate-500 mb-1">Avance</p>
              <p className="text-3xl font-bold text-slate-900">0%</p>
              <p className="text-xs text-slate-400 mt-2">Promedio</p>
            </CardContent>
          </Card>
        </div>

        {/* Active Projects */}
        <Card className="glass-white border-green-200/50 rounded-2xl">
          <CardHeader>
            <CardTitle className="text-lg font-bold text-slate-900">
              Obras Activas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-center py-12 text-center">
              <div>
                <DollarSign className="h-12 w-12 text-slate-300 mx-auto mb-4" />
                <p className="text-slate-500">No hay obras activas</p>
                <p className="text-sm text-slate-400 mt-1">
                  Las métricas aparecerán cuando tengas obras en progreso
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Cost Breakdown */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="glass-white border-green-200/50 rounded-2xl">
            <CardHeader>
              <CardTitle className="text-lg font-bold text-slate-900">
                Desglose de Costes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 rounded-xl bg-slate-50">
                  <span className="text-slate-600">Materiales</span>
                  <span className="font-bold text-slate-900">€0</span>
                </div>
                <div className="flex items-center justify-between p-4 rounded-xl bg-slate-50">
                  <span className="text-slate-600">Mano de obra</span>
                  <span className="font-bold text-slate-900">€0</span>
                </div>
                <div className="flex items-center justify-between p-4 rounded-xl bg-slate-50">
                  <span className="text-slate-600">Subcontratas</span>
                  <span className="font-bold text-slate-900">€0</span>
                </div>
                <div className="flex items-center justify-between p-4 rounded-xl bg-green-50 border border-green-200">
                  <span className="text-green-700 font-semibold">Total</span>
                  <span className="font-bold text-green-700">€0</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="glass-white border-green-200/50 rounded-2xl">
            <CardHeader>
              <CardTitle className="text-lg font-bold text-slate-900">
                Predicción Financiera
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-center py-12 text-center">
                <p className="text-slate-400 text-sm">
                  Gráficos y predicciones próximamente
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  )
}

