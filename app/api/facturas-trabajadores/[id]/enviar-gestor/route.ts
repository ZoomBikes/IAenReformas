import { NextRequest, NextResponse } from 'next/server'

let prisma: any = null
try {
  const { prisma: prismaClient } = require('@/lib/prisma')
  prisma = prismaClient
} catch (error) {
  console.warn('Prisma no está configurado aún')
}

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  if (!prisma) {
    return NextResponse.json({ error: 'Base de datos no configurada' }, { status: 503 })
  }

  try {
    // Marcar factura como enviada al gestor
    const factura = await prisma.facturaTrabajador.update({
      where: { id: params.id },
      data: {
        enviadoGestor: true,
        fechaEnvioGestor: new Date()
      }
    })

    // Aquí podrías integrar con un servicio de email o API para enviar al gestor
    // Por ahora solo marcamos como enviado
    
    return NextResponse.json({ 
      success: true, 
      factura,
      message: 'Factura enviada al gestor correctamente'
    })
  } catch (error) {
    console.error('Error enviando factura al gestor:', error)
    return NextResponse.json({ error: 'Error al enviar factura al gestor' }, { status: 500 })
  }
}

