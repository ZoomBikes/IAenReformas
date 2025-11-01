# 🧮 Sistema de Cálculos Inteligentes

## 📐 Reglas de Cálculo por Tipo de Trabajo

### **1. CAMBIO DE TARIMA/SUELO**

#### **Componentes Automáticos:**
```typescript
interface CalculoTarima {
  metros: number;
  calidad: 'basica' | 'estandar' | 'premium';
  
  // Trabajos que se activan automáticamente:
  trabajos: {
    picado?: boolean;        // Si hay solado existente
    retiradaEscombros?: boolean;
    autonivelado?: boolean;
    preparacionSuelo?: boolean;
    tarima?: boolean;        // Siempre
    instalacion?: boolean;   // Mano de obra
    rodapies?: boolean;      // Calculado automático
  }
}

function calcularTarima(input: CalculoTarima): Desglose {
  const precios = PRECIOS_BASE.tarima[input.calidad];
  const perimetro = calcularPerimetro(input.metros); // Aprox. √metros × 4
  
  return {
    picado: input.trabajos.picado 
      ? input.metros * precios.picado 
      : 0,
    
    retiradaEscombros: input.trabajos.retiradaEscombros
      ? input.metros * precios.retiradaEscombros
      : 0,
    
    autonivelado: input.trabajos.autonivelado
      ? input.metros * precios.autonivelado
      : 0,
    
    preparacionSuelo: input.trabajos.preparacionSuelo
      ? input.metros * precios.preparacionSuelo
      : 0,
    
    tarima: input.metros * precios.tarima[input.calidad],
    
    instalacion: input.metros * precios.instalacion,
    
    rodapies: perimetro * precios.rodapies[input.calidad],
    
    subtotal: calcularSubtotal(...),
    total: calcularTotal(...)
  };
}
```

#### **Precios Base (ejemplo):**
```typescript
const PRECIOS_BASE = {
  tarima: {
    basica: {
      picado: 8,           // €/m²
      retiradaEscombros: 3,
      autonivelado: 10,
      preparacionSuelo: 5,
      tarima: 35,          // €/m²
      instalacion: 12,
      rodapies: 18         // €/m lineal
    },
    estandar: {
      picado: 8,
      retiradaEscombros: 3,
      autonivelado: 12,
      preparacionSuelo: 6,
      tarima: 45,          // €/m²
      instalacion: 15,
      rodapies: 25         // €/m lineal
    },
    premium: {
      picado: 8,
      retiradaEscombros: 3,
      autonivelado: 15,
      preparacionSuelo: 8,
      tarima: 65,          // €/m²
      instalacion: 18,
      rodapies: 35         // €/m lineal
    }
  }
};
```

---

### **2. PINTURA DE PAREDES**

#### **Cálculo de Superficie:**
```typescript
interface CalculoPintura {
  habitacion: string;
  metrosHabitacion: number;      // m² de suelo
  alturaTechos: number;          // metros
  numPuertas: number;
  numVentanas: number;
  anchoPuerta: number;           // metros (default: 0.9)
  altoPuerta: number;            // metros (default: 2.1)
  anchoVentana: number;           // metros (default: 1.2)
  altoVentana: number;           // metros (default: 1.5)
  necesitaAlisado: boolean;
  calidad: 'basica' | 'estandar' | 'premium';
}

function calcularSuperficiePintura(input: CalculoPintura): number {
  // Asumir habitación rectangular (aproximación)
  const lado = Math.sqrt(input.metrosHabitacion);
  const perimetro = lado * 4;
  
  // Superficie total de paredes
  const superficieBruta = perimetro * input.alturaTechos;
  
  // Restar puertas
  const superficiePuertas = input.numPuertas * 
    (input.anchoPuerta * input.altoPuerta);
  
  // Restar ventanas
  const superficieVentanas = input.numVentanas * 
    (input.anchoVentana * input.altoVentana);
  
  // Superficie neta a pintar
  const superficieNeta = superficieBruta - 
    superficiePuertas - superficieVentanas;
  
  return Math.max(superficieNeta, input.metrosHabitacion * 2.5); // Mínimo razonable
}

function calcularPintura(input: CalculoPintura): Desglose {
  const superficie = calcularSuperficiePintura(input);
  const precios = PRECIOS_BASE.pintura[input.calidad];
  
  return {
    alisado: input.necesitaAlisado
      ? superficie * precios.alisado
      : 0,
    
    imprimacion: superficie * precios.imprimacion,
    
    pintura: superficie * precios.pintura,  // Incluye 2 manos
    
    manoObra: superficie * precios.manoObra,
    
    materiales: precios.materialesBase + 
      (superficie > 50 ? precios.materialesExtra : 0),
    
    subtotal: calcularSubtotal(...),
    total: calcularTotal(...)
  };
}
```

#### **Precios Base Pintura:**
```typescript
PRECIOS_BASE.pintura = {
  basica: {
    alisado: 10,           // €/m²
    imprimacion: 3,
    pintura: 6,            // €/m² (2 manos incluidas)
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
};
```

---

### **3. AZULEJOS/PAREDES**

```typescript
interface CalculoAzulejos {
  superficie: number;        // m²
  ubicacion: 'cocina' | 'bano' | 'otro';
  necesitaDesmonte: boolean;
  necesitaPreparacion: boolean;
  calidad: 'basica' | 'estandar' | 'premium';
}

function calcularAzulejos(input: CalculoAzulejos): Desglose {
  const precios = PRECIOS_BASE.azulejos[input.calidad];
  const multiplicadorUbicacion = input.ubicacion === 'bano' ? 1.2 : 1.0; // Baños más complejos
  
  return {
    desmonte: input.necesitaDesmonte
      ? input.superficie * precios.desmonte
      : 0,
    
    preparacion: input.necesitaPreparacion
      ? input.superficie * precios.preparacion
      : 0,
    
    azulejos: input.superficie * precios.azulejos * multiplicadorUbicacion,
    
    instalacion: input.superficie * precios.instalacion,
    
    juntas: input.superficie * precios.juntas,
    
    materiales: precios.materialesBase,
    
    subtotal: calcularSubtotal(...),
    total: calcularTotal(...)
  };
}
```

---

## 🔢 Funciones de Cálculo Auxiliares

### **Cálculo de Perímetro (aproximado)**
```typescript
function calcularPerimetro(metrosCuadrados: number): number {
  // Asumir habitación cuadrada para aproximación
  const lado = Math.sqrt(metrosCuadrados);
  return lado * 4;
}

function calcularPerimetroRectangular(ancho: number, largo: number): number {
  return (ancho + largo) * 2;
}
```

### **Aplicación de Descuentos**
```typescript
function aplicarDescuento(
  subtotal: number, 
  descuentoPorcentaje: number
): number {
  return subtotal * (descuentoPorcentaje / 100);
}
```

### **Cálculo de IVA**
```typescript
const IVA_PORCENTAJE = 21;

function calcularIVA(subtotal: number, descuento: number = 0): number {
  const baseImponible = subtotal - descuento;
  return baseImponible * (IVA_PORCENTAJE / 100);
}

function calcularTotal(
  subtotal: number, 
  descuento: number, 
  iva: number
): number {
  return subtotal - descuento + iva;
}
```

---

## 🎯 Multiplicadores según Condiciones

### **Estado del Inmueble**
```typescript
const MULTIPLICADORES_ESTADO = {
  nuevo: 1.0,              // Sin ajuste
  reciente: 1.1,           // +10% (algunos trabajos extra)
  antiguo: 1.25            // +25% (más preparación necesaria)
};

function aplicarMultiplicadorEstado(
  precio: number, 
  estado: keyof typeof MULTIPLICADORES_ESTADO
): number {
  return precio * MULTIPLICADORES_ESTADO[estado];
}
```

### **Complejidad del Trabajo**
```typescript
const MULTIPLICADORES_COMPLEJIDAD = {
  sencillo: 1.0,
  normal: 1.15,
  complejo: 1.35
};

// Ejemplos:
// - Sencillo: Habitación cuadrada, fácil acceso
// - Normal: Varias habitaciones, altura normal
// - Complejo: Techos altos, espacios irregulares, difícil acceso
```

---

## 📊 Estructura de Desglose Final

```typescript
interface DesgloseTrabajo {
  trabajoId: string;
  tipoTrabajo: TipoTrabajo;
  descripcion: string;
  
  // Desglose detallado
  componentes: {
    nombre: string;
    cantidad: number;
    unidad: string;
    precioUnitario: number;
    precioTotal: number;
  }[];
  
  subtotal: number;
  descuento: number;
  iva: number;
  total: number;
  
  // Explicación generada
  explicacion: string;
}

interface PresupuestoFinal {
  cliente: Cliente;
  proyecto: InfoProyecto;
  trabajos: DesgloseTrabajo[];
  
  resumen: {
    subtotal: number;
    descuento: number;
    baseImponible: number;
    iva: number;
    total: number;
  };
  
  validez: Date;
  fechaCreacion: Date;
}
```

---

## 🔄 Flujo de Cálculo Completo

```typescript
async function calcularPresupuestoCompleto(
  datos: DatosPresupuesto
): Promise<PresupuestoFinal> {
  // 1. Calcular cada trabajo
  const trabajos = await Promise.all(
    datos.trabajos.map(trabajo => calcularTrabajo(trabajo, datos.condiciones))
  );
  
  // 2. Sumar subtotales
  const subtotal = trabajos.reduce((sum, t) => sum + t.subtotal, 0);
  
  // 3. Aplicar descuento del cliente
  const descuento = aplicarDescuento(subtotal, datos.cliente.descuento);
  
  // 4. Calcular IVA
  const baseImponible = subtotal - descuento;
  const iva = calcularIVA(baseImponible);
  
  // 5. Total final
  const total = baseImponible + iva;
  
  // 6. Generar explicaciones (optimizado con IA)
  const trabajosConExplicacion = await Promise.all(
    trabajos.map(async (t) => ({
      ...t,
      explicacion: await generarExplicacionTrabajo(t)
    }))
  );
  
  return {
    cliente: datos.cliente,
    proyecto: datos.proyecto,
    trabajos: trabajosConExplicacion,
    resumen: {
      subtotal,
      descuento,
      baseImponible,
      iva,
      total
    },
    validez: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 días
    fechaCreacion: new Date()
  };
}
```

---

## 🧪 Validaciones y Reglas de Negocio

```typescript
function validarTrabajo(trabajo: Trabajo): ValidationResult {
  const errors: string[] = [];
  
  // Validar cantidad
  if (trabajo.cantidad <= 0) {
    errors.push("La cantidad debe ser mayor que 0");
  }
  
  if (trabajo.cantidad > 10000) {
    errors.push("La cantidad parece excesiva. ¿Estás seguro?");
  }
  
  // Validar que si es pintura con alisado, tenga superficie válida
  if (trabajo.tipo === 'pintura' && trabajo.necesitaAlisado) {
    if (trabajo.superficie < 5) {
      errors.push("Superficie muy pequeña para alisado");
    }
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
}
```

---

## 💡 Ejemplos de Cálculo Completo

### **Ejemplo 1: Cambio de Tarima**
```
Input:
- Metros: 50 m²
- Calidad: Estándar
- Hay solado existente: Sí

Cálculo:
1. Picado: 50 × €8 = €400
2. Retirada: 50 × €3 = €150
3. Autonivelado: 50 × €12 = €600
4. Preparación: 50 × €6 = €300
5. Tarima: 50 × €45 = €2,250
6. Instalación: 50 × €15 = €750
7. Rodapiés: (√50 × 4) ≈ 28m × €25 = €700

Subtotal: €5,150
Descuento (5%): -€257.50
Base: €4,892.50
IVA (21%): €1,027.43
TOTAL: €5,919.93
```

### **Ejemplo 2: Pintura con Alisado**
```
Input:
- Habitación: 35 m²
- Altura techos: 2.70m
- Necesita alisado: Sí
- Calidad: Estándar

Cálculo Superficie:
- Perímetro: √35 × 4 ≈ 23.7m
- Superficie bruta: 23.7 × 2.70 = 64 m²
- Menos puertas/ventanas: -6 m²
- Superficie neta: 58 m²

Desglose:
1. Alisado: 58 × €12 = €696
2. Imprimación: 58 × €4 = €232
3. Pintura: 58 × €8 = €464
4. Mano de obra: 58 × €10 = €580
5. Materiales: €80

Subtotal: €2,052
IVA (21%): €430.92
TOTAL: €2,482.92
```

---

## 🔧 Configuración Flexible de Precios

```typescript
// Los precios deben ser configurables por el administrador
interface ConfiguracionPrecios {
  trabajo: TipoTrabajo;
  calidad: Calidad;
  precioBase: number;
  fechaActualizacion: Date;
  activo: boolean;
}

// Permitir actualizar precios sin cambiar código
async function actualizarPrecios(
  trabajo: TipoTrabajo,
  calidad: Calidad,
  nuevoPrecio: number
) {
  await db.configuracionPrecios.upsert({
    where: {
      trabajo_calidad: {
        trabajo,
        calidad
      }
    },
    update: {
      precioBase: nuevoPrecio,
      fechaActualizacion: new Date()
    },
    create: {
      trabajo,
      calidad,
      precioBase: nuevoPrecio
    }
  });
}
```

