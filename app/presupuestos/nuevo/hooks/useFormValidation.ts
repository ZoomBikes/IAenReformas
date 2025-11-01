'use client'

import { useState } from 'react'
import { clienteSchema, obraSchema, espacioSchema } from '@/lib/validations'
import { toast } from 'sonner'

export function useFormValidation() {
  const [errores, setErrores] = useState<Record<string, string[]>>({})

  const validarPaso = (paso: string, datos: any): boolean => {
    const nuevosErrores: Record<string, string[]> = {}

    try {
      switch (paso) {
        case 'cliente':
          clienteSchema.parse(datos)
          break
        case 'obra':
          obraSchema.parse(datos)
          break
        case 'espacio':
          espacioSchema.parse(datos)
          break
      }
      setErrores({})
      return true
    } catch (error: any) {
      if (error.errors) {
        error.errors.forEach((err: any) => {
          const campo = err.path[0]
          if (!nuevosErrores[campo]) {
            nuevosErrores[campo] = []
          }
          nuevosErrores[campo].push(err.message)
        })
        setErrores(nuevosErrores)
        toast.error('Por favor, corrige los errores en el formulario')
      }
      return false
    }
  }

  const limpiarErrores = () => {
    setErrores({})
  }

  const getError = (campo: string): string | undefined => {
    return errores[campo]?.[0]
  }

  return {
    errores,
    validarPaso,
    limpiarErrores,
    getError,
  }
}

