import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { 
  Calculator, 
  Sparkles, 
  FileText, 
  Zap, 
  ArrowRight, 
  LayoutDashboard,
  TrendingUp,
  Shield,
  Clock
} from 'lucide-react'

export default function Home() {
  const features = [
    {
      icon: Calculator,
      title: 'Cálculos Precisos',
      description: 'Sistema inteligente que calcula automáticamente todos los componentes necesarios para cada trabajo de reforma',
      color: 'from-blue-500 to-blue-600'
    },
    {
      icon: Sparkles,
      title: 'Explicaciones con IA',
      description: 'Genera descripciones profesionales optimizadas para cada presupuesto usando inteligencia artificial',
      color: 'from-indigo-500 to-indigo-600'
    },
    {
      icon: FileText,
      title: 'PDFs Profesionales',
      description: 'Genera documentos PDF detallados con todos los cálculos, explicaciones y planos interactivos',
      color: 'from-cyan-500 to-cyan-600'
    },
    {
      icon: LayoutDashboard,
      title: 'Plano Interactivo',
      description: 'Visualiza y edita la distribución de habitaciones con herramientas profesionales tipo CAD',
      color: 'from-sky-500 to-sky-600'
    },
    {
      icon: TrendingUp,
      title: 'Gestión Avanzada',
      description: 'Organiza y gestiona múltiples presupuestos con herramientas de seguimiento y análisis',
      color: 'from-blue-600 to-indigo-600'
    },
    {
      icon: Shield,
      title: 'Seguro y Confiable',
      description: 'Datos protegidos y respaldados, con validaciones automáticas para garantizar precisión',
      color: 'from-indigo-600 to-purple-600'
    }
  ]

  const stats = [
    { icon: Clock, label: 'Tiempo ahorrado', value: '80%' },
    { icon: Zap, label: 'Precisión', value: '99%' },
    { icon: FileText, label: 'Presupuestos', value: 'Ilimitados' }
  ]

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        {/* Background decorative elements */}
        <div className="absolute inset-0 opacity-30" style={{
          backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(59, 130, 246, 0.15) 1px, transparent 0)',
          backgroundSize: '20px 20px'
        }} />
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-400/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-indigo-400/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16 sm:pt-24 sm:pb-20 lg:pt-32 lg:pb-28">
          <div className="text-center animate-fade-in">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-blue text-blue-700 text-sm font-medium mb-8 animate-scale-in">
              <Zap className="h-4 w-4" />
              <span>Plataforma Profesional de Presupuestos</span>
            </div>

            {/* Main Heading */}
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold mb-6 bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-700 bg-clip-text text-transparent">
              IA en Reformas
            </h1>
            
            <p className="text-lg sm:text-xl md:text-2xl text-slate-600 mb-8 max-w-3xl mx-auto leading-relaxed">
              Generador inteligente de presupuestos profesionales para reformas
              <br className="hidden sm:block" />
              <span className="text-blue-600 font-medium">Precisión, velocidad y profesionalismo</span>
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
              <Link href="/presupuestos/nuevo">
                <Button 
                  size="lg" 
                  className="group rounded-xl px-8 py-6 text-lg font-semibold bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg shadow-blue-500/30 hover:shadow-xl hover:shadow-blue-500/40 transition-all duration-300 hover:scale-105"
                >
                  Crear Nuevo Presupuesto
                  <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
              <Link href="/presupuestos">
                <Button 
                  size="lg" 
                  variant="outline"
                  className="rounded-xl px-8 py-6 text-lg font-semibold glass border-blue-200/50 hover:bg-blue-50/50 hover:border-blue-300/50 text-blue-700 shadow-md transition-all duration-300"
                >
                  Ver Presupuestos
                </Button>
              </Link>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-3xl mx-auto mb-16">
              {stats.map((stat, idx) => (
                <div 
                  key={idx}
                  className="glass-white rounded-2xl p-6 border border-blue-100/50 animate-scale-in"
                  style={{ animationDelay: `${idx * 0.1}s` }}
                >
                  <stat.icon className="h-8 w-8 text-blue-600 mx-auto mb-3" />
                  <div className="text-3xl font-bold text-blue-700 mb-1">{stat.value}</div>
                  <div className="text-sm text-slate-600">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20 lg:py-24">
        <div className="text-center mb-12 sm:mb-16">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-slate-900 mb-4">
            Funcionalidades Potentes
          </h2>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            Todo lo que necesitas para crear presupuestos profesionales y gestionar tus reformas
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
          {features.map((feature, idx) => (
            <Card
              key={idx}
              className="group glass-white border-blue-100/50 hover:border-blue-200/70 rounded-2xl overflow-hidden transition-all duration-300 hover:shadow-blue-lg hover:-translate-y-1 animate-fade-in"
              style={{ animationDelay: `${idx * 0.1}s` }}
            >
              <CardHeader className="pb-4">
                <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${feature.color} p-3 mb-4 group-hover:scale-110 transition-transform duration-300 shadow-lg`}>
                  <feature.icon className="h-8 w-8 text-white" />
                </div>
                <CardTitle className="text-xl font-bold text-slate-900 mb-2">
                  {feature.title}
                </CardTitle>
                <CardDescription className="text-slate-600 leading-relaxed">
                  {feature.description}
                </CardDescription>
              </CardHeader>
            </Card>
          ))}
        </div>
      </section>

      {/* CTA Final Section */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20 mb-16">
        <div className="glass-blue rounded-3xl p-8 sm:p-12 text-center border border-blue-200/50 shadow-blue-lg">
          <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-4">
            ¿Listo para comenzar?
          </h2>
          <p className="text-lg text-slate-600 mb-8 max-w-2xl mx-auto">
            Crea tu primer presupuesto profesional en minutos y descubre todas las funcionalidades avanzadas
          </p>
          <Link href="/presupuestos/nuevo">
            <Button 
              size="lg"
              className="rounded-xl px-8 py-6 text-lg font-semibold bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg shadow-blue-500/30 hover:shadow-xl hover:shadow-blue-500/40 transition-all duration-300 hover:scale-105"
            >
              Empezar Ahora
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
        </div>
      </section>
    </main>
  )
}
