// Sistema de Cálculos Puro - SIN IA
// Todos los cálculos se hacen con lógica de negocio

export interface CalculoTarimaInput {
  metros: number;
  calidad: 'basica' | 'estandar' | 'premium';
  tieneSoladoExistente: boolean;
  perimetro?: number; // Si no se proporciona, se calcula aproximado
}

export interface CalculoPinturaInput {
  metrosHabitacion: number;
  alturaTechos: number;
  perimetro?: number; // Si no se proporciona, se calcula aproximado
  numPuertas: number;
  numVentanas: number;
  anchoPuerta?: number;
  altoPuerta?: number;
  anchoVentana?: number;
  altoVentana?: number;
  necesitaAlisado: boolean;
  calidad: 'basica' | 'estandar' | 'premium';
  numManos: number;
}

export interface ComponenteCalculo {
  nombre: string;
  descripcion?: string;
  cantidad: number;
  unidad: string;
  precioUnitario: number;
  precioTotal: number;
}

export interface ResultadoCalculo {
  componentes: ComponenteCalculo[];
  subtotal: number;
  iva: number;
  total: number;
}

// Precios base por calidad (configurables desde DB)
export const PRECIOS_BASE = {
  tarima: {
    basica: {
      picado: 8,
      retiradaEscombros: 3,
      autonivelado: 10,
      preparacionSuelo: 5,
      tarima: 35,
      instalacion: 12,
      rodapies: 18
    },
    estandar: {
      picado: 8,
      retiradaEscombros: 3,
      autonivelado: 12,
      preparacionSuelo: 6,
      tarima: 45,
      instalacion: 15,
      rodapies: 25
    },
    premium: {
      picado: 8,
      retiradaEscombros: 3,
      autonivelado: 15,
      preparacionSuelo: 8,
      tarima: 65,
      instalacion: 18,
      rodapies: 35
    }
  },
  pintura: {
    basica: {
      alisado: 10,
      imprimacion: 3,
      pintura: 6, // Por mano
      manoObra: 8,
      materialesBase: 60,
      materialesExtra: 40
    },
    estandar: {
      alisado: 12,
      imprimacion: 4,
      pintura: 8,
      manoObra: 10,
      materialesBase: 80,
      materialesExtra: 50
    },
    premium: {
      alisado: 15,
      imprimacion: 5,
      pintura: 12,
      manoObra: 12,
      materialesBase: 100,
      materialesExtra: 60
    }
  }
};

const IVA_PORCENTAJE = 21;

/**
 * Calcula el perímetro aproximado de una habitación cuadrada
 */
export function calcularPerimetro(metrosCuadrados: number): number {
  const lado = Math.sqrt(metrosCuadrados);
  return lado * 4;
}

/**
 * Calcula la superficie neta a pintar
 */
export function calcularSuperficiePintura(input: CalculoPinturaInput): number {
  // Si no se proporciona perímetro, calcular aproximado
  const perimetro = input.perimetro || calcularPerimetro(input.metrosHabitacion);
  
  // Superficie bruta de paredes
  const superficieBruta = perimetro * input.alturaTechos;
  
  // Valores por defecto
  const anchoPuerta = input.anchoPuerta || 0.9;
  const altoPuerta = input.altoPuerta || 2.1;
  const anchoVentana = input.anchoVentana || 1.2;
  const altoVentana = input.altoVentana || 1.5;
  
  // Restar puertas
  const superficiePuertas = input.numPuertas * (anchoPuerta * altoPuerta);
  
  // Restar ventanas
  const superficieVentanas = input.numVentanas * (anchoVentana * altoVentana);
  
  // Superficie neta
  const superficieNeta = superficieBruta - superficiePuertas - superficieVentanas;
  
  // Mínimo razonable (si es muy pequeño, usar aproximación por metros²)
  return Math.max(superficieNeta, input.metrosHabitacion * 2.5);
}

/**
 * Calcula el cambio de tarima completo
 */
export function calcularTarima(input: CalculoTarimaInput): ResultadoCalculo {
  const precios = PRECIOS_BASE.tarima[input.calidad];
  const componentes: ComponenteCalculo[] = [];
  
  // Calcular perímetro si no se proporciona
  const perimetro = input.perimetro || calcularPerimetro(input.metros);
  
  // 1. Picado de solado (si hay solado existente)
  if (input.tieneSoladoExistente) {
    componentes.push({
      nombre: 'Picado de solado existente',
      descripcion: 'Retirada del solado anterior',
      cantidad: input.metros,
      unidad: 'm²',
      precioUnitario: precios.picado,
      precioTotal: input.metros * precios.picado
    });
    
    // Retirada de escombros
    componentes.push({
      nombre: 'Retirada de escombros',
      descripcion: 'Transporte y gestión de residuos',
      cantidad: input.metros,
      unidad: 'm²',
      precioUnitario: precios.retiradaEscombros,
      precioTotal: input.metros * precios.retiradaEscombros
    });
  }
  
  // 2. Autonivelado
  componentes.push({
    nombre: 'Autonivelado',
    descripcion: 'Preparación del suelo para instalación',
    cantidad: input.metros,
    unidad: 'm²',
    precioUnitario: precios.autonivelado,
    precioTotal: input.metros * precios.autonivelado
  });
  
  // 3. Preparación de suelo
  componentes.push({
    nombre: 'Preparación de suelo',
    descripcion: 'Cemento y materiales de preparación',
    cantidad: input.metros,
    unidad: 'm²',
    precioUnitario: precios.preparacionSuelo,
    precioTotal: input.metros * precios.preparacionSuelo
  });
  
  // 4. Tarima
  componentes.push({
    nombre: `Tarima ${input.calidad}`,
    descripcion: 'Material de tarima',
    cantidad: input.metros,
    unidad: 'm²',
    precioUnitario: precios.tarima,
    precioTotal: input.metros * precios.tarima
  });
  
  // 5. Instalación
  componentes.push({
    nombre: 'Instalación de tarima',
    descripcion: 'Mano de obra de instalación',
    cantidad: input.metros,
    unidad: 'm²',
    precioUnitario: precios.instalacion,
    precioTotal: input.metros * precios.instalacion
  });
  
  // 6. Rodapiés
  componentes.push({
    nombre: 'Rodapiés',
    descripcion: 'Instalación de rodapiés',
    cantidad: perimetro,
    unidad: 'm',
    precioUnitario: precios.rodapies,
    precioTotal: perimetro * precios.rodapies
  });
  
  // Calcular totales
  const subtotal = componentes.reduce((sum, c) => sum + c.precioTotal, 0);
  const iva = subtotal * (IVA_PORCENTAJE / 100);
  const total = subtotal + iva;
  
  return {
    componentes,
    subtotal,
    iva,
    total
  };
}

/**
 * Calcula la pintura de paredes
 */
export function calcularPintura(input: CalculoPinturaInput): ResultadoCalculo {
  const precios = PRECIOS_BASE.pintura[input.calidad];
  const componentes: ComponenteCalculo[] = [];
  
  // Calcular superficie a pintar
  const superficie = calcularSuperficiePintura(input);
  
  // 1. Alisado (si es necesario)
  if (input.necesitaAlisado) {
    componentes.push({
      nombre: 'Alisado de paredes',
      descripcion: 'Preparación y alisado de superficies',
      cantidad: superficie,
      unidad: 'm²',
      precioUnitario: precios.alisado,
      precioTotal: superficie * precios.alisado
    });
  }
  
  // 2. Imprimación
  componentes.push({
    nombre: 'Imprimación',
    descripcion: 'Capa de imprimación',
    cantidad: superficie,
    unidad: 'm²',
    precioUnitario: precios.imprimacion,
    precioTotal: superficie * precios.imprimacion
  });
  
  // 3. Pintura (según número de manos)
  componentes.push({
    nombre: `Pintura plástica (${input.numManos} manos)`,
    descripcion: `Aplicación de pintura en ${input.numManos} manos`,
    cantidad: superficie,
    unidad: 'm²',
    precioUnitario: precios.pintura,
    precioTotal: superficie * precios.pintura * input.numManos
  });
  
  // 4. Mano de obra
  componentes.push({
    nombre: 'Mano de obra',
    descripcion: 'Aplicación y preparación',
    cantidad: superficie,
    unidad: 'm²',
    precioUnitario: precios.manoObra,
    precioTotal: superficie * precios.manoObra
  });
  
  // 5. Materiales
  const materialesTotal = precios.materialesBase + 
    (superficie > 50 ? precios.materialesExtra : 0);
  
  componentes.push({
    nombre: 'Materiales',
    descripcion: 'Rodillos, brochas, cintas, etc.',
    cantidad: 1,
    unidad: 'lote',
    precioUnitario: materialesTotal,
    precioTotal: materialesTotal
  });
  
  // Calcular totales
  const subtotal = componentes.reduce((sum, c) => sum + c.precioTotal, 0);
  const iva = subtotal * (IVA_PORCENTAJE / 100);
  const total = subtotal + iva;
  
  return {
    componentes,
    subtotal,
    iva,
    total
  };
}

/**
 * Calcula el IVA sobre un subtotal
 */
export function calcularIVA(subtotal: number): number {
  return subtotal * (IVA_PORCENTAJE / 100);
}

/**
 * Calcula el total final (subtotal + IVA)
 */
export function calcularTotal(subtotal: number): number {
  const iva = calcularIVA(subtotal);
  return subtotal + iva;
}

/**
 * Multiplicador según estado del inmueble
 */
export function getMultiplicadorEstado(estado: 'nuevo' | 'reciente' | 'antiguo'): number {
  const multiplicadores = {
    nuevo: 1.0,
    reciente: 1.1,
    antiguo: 1.25
  };
  return multiplicadores[estado];
}

