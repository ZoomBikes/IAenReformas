import type { Metadata } from 'next'
import { ReactNode } from 'react'
import './globals.css'

export const metadata: Metadata = {
  title: 'IA en Reformas',
  description: 'Aplicación web desarrollada con Next.js y Vercel',
}

export default function RootLayout({
  children,
}: {
  children: ReactNode
}) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  )
}

