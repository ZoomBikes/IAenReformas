import { z } from 'zod'

// Validación de cliente
export const clienteSchema = z.object({
  nombre: z.string().min(3, 'El nombre debe tener al menos 3 caracteres'),
  telefono: z.string().min(9, 'Teléfono no válido'),
  email: z.string().email('Email no válido').optional().or(z.literal('')),
  direccion: z.string().min(5, 'La dirección debe tener al menos 5 caracteres'),
  tipo: z.enum(['particular', 'empresa']).optional(),
})

// Validación de obra
export const obraSchema = z.object({
  tipo: z.string().min(1, 'Debes seleccionar un tipo de obra'),
  descripcion: z.string().optional(),
})

// Validación de espacio
export const espacioSchema = z.object({
  metrosTotales: z.string().optional(),
  alturaTechos: z.string().min(1, 'La altura de techos es requerida'),
  estado: z.enum(['nuevo', 'reciente', 'antiguo']),
})

// Validación de habitación
export const habitacionSchema = z.object({
  id: z.string(),
  nombre: z.string().min(2, 'El nombre de la habitación debe tener al menos 2 caracteres'),
  tipo: z.enum(['salon', 'dormitorio', 'cocina', 'bano', 'pasillo', 'otros']),
  metrosCuadrados: z.string().refine((val) => {
    const num = parseFloat(val)
    return !isNaN(num) && num > 0
  }, 'Los metros cuadrados deben ser un número mayor que 0'),
  alturaTechos: z.string().refine((val) => {
    const num = parseFloat(val)
    return !isNaN(num) && num > 0 && num < 10
  }, 'La altura de techos debe ser un número válido entre 0 y 10 metros'),
  ancho: z.string().optional(),
  largo: z.string().optional(),
  perimetro: z.string().optional(),
  numPuertas: z.string().default('0'),
  numVentanas: z.string().default('0'),
  colindaCon: z.array(z.string()).optional(),
  notas: z.string().optional(),
})

// Validación de servicio
export const servicioSchema = z.object({
  id: z.string(),
  tipo: z.enum(['pintura_paredes', 'cambio_tarima', 'alicatado_azulejos', 'fontaneria', 'electricidad', 'carpinteria', 'otros']),
  precioPorMetro: z.number().min(0.01, 'El precio debe ser mayor que 0').optional(),
  precioTotal: z.number().optional(),
  datos: z.any().optional(),
  calculo: z.any().optional(),
})

// Validación completa del presupuesto
export const presupuestoSchema = z.object({
  cliente: clienteSchema,
  obra: obraSchema,
  espacio: espacioSchema,
  habitaciones: z.array(habitacionSchema).min(1, 'Debe haber al menos una habitación'),
  trabajos: z.array(z.object({
    habitacionId: z.string(),
    servicios: z.array(servicioSchema).min(1, 'Cada habitación debe tener al menos un servicio')
  })).min(1, 'Debe haber al menos un trabajo asignado'),
})

export type ClienteInput = z.infer<typeof clienteSchema>
export type ObraInput = z.infer<typeof obraSchema>
export type EspacioInput = z.infer<typeof espacioSchema>
export type HabitacionInput = z.infer<typeof habitacionSchema>
export type ServicioInput = z.infer<typeof servicioSchema>
export type PresupuestoInput = z.infer<typeof presupuestoSchema>

