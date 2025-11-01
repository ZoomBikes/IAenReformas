import type { Metadata } from 'next'
import { ReactNode } from 'react'
import './globals.css'
import { Providers } from './providers'

export const metadata: Metadata = {
  title: 'IA en Reformas - Generador de Presupuestos',
  description: 'Aplicación profesional para generar presupuestos inteligentes de reformas',
}

export default function RootLayout({
  children,
}: {
  children: ReactNode
}) {
  return (
    <html lang="es">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}

