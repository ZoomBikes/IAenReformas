import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold mb-4">
            🏗️ <span className="text-primary">IA en Reformas</span>
          </h1>
          <p className="text-xl text-muted-foreground mb-8">
            Generador inteligente de presupuestos para reformas
          </p>
          <Link href="/presupuestos/nuevo">
            <Button size="lg" className="text-lg px-8 py-6">
              Crear Nuevo Presupuesto
            </Button>
          </Link>
        </div>

        <div className="grid md:grid-cols-3 gap-6 mt-12">
          <Card>
            <CardHeader>
              <CardTitle>🎯 Cálculos Inteligentes</CardTitle>
              <CardDescription>
                El sistema calcula automáticamente todos los componentes necesarios para cada trabajo
              </CardDescription>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>🤖 Explicaciones con IA</CardTitle>
              <CardDescription>
                Genera descripciones profesionales optimizadas para cada presupuesto
              </CardDescription>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>📄 PDFs Profesionales</CardTitle>
              <CardDescription>
                Genera documentos PDF detallados con todos los cálculos y explicaciones
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </div>
    </main>
  )
}

