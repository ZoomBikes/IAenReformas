# 📋 Consultoría: App de Presupuestos para Reformas

## 🎯 Objetivo del Proyecto

Crear una aplicación web premium que genere presupuestos inteligentes y detallados para una empresa de reformas, utilizando IA para optimizar cálculos y generar explicaciones personalizadas.

---

## 🛠️ Stack Tecnológico Recomendado

### **Frontend**
- **Next.js 14** (App Router) - Ya configurado ✅
- **TypeScript** - Type safety y mejor DX
- **Tailwind CSS** - Diseño premium y responsive
- **shadcn/ui** - Componentes UI premium y accesibles
- **Framer Motion** - Animaciones suaves y profesionales
- **React Hook Form** - Formularios optimizados
- **Zod** - Validación de schemas
- **PDF-lib / React-PDF** - Generación de PDFs

### **Backend & Base de Datos**
- **Next.js API Routes** - Endpoints API integrados
- **Prisma ORM** - ORM type-safe para bases de datos
- **PostgreSQL** (Vercel Postgres o Supabase) - Base de datos relacional
- **Redis** (opcional, para caché) - Optimización de consultas

### **IA & Integraciones**
- **OpenAI GPT-4 Turbo** - Generación de texto optimizado
- **LangChain** - Gestión de prompts y chains para ahorrar tokens
- **Function Calling** - Para cálculos estructurados

### **Autenticación & Seguridad**
- **NextAuth.js** - Autenticación segura
- **Vercel KV** (opcional) - Sesiones

### **Almacenamiento**
- **Vercel Blob** - Imágenes de obras/proyectos
- **Cloudinary** (alternativa) - Optimización de imágenes

### **Despliegue**
- **Vercel** - Hosting y CI/CD ✅
- **Vercel Postgres** - Base de datos serverless

---

## 🎨 Diseño Premium: Principios y Sistema de Diseño

### **Paleta de Colores**
```
Primario: 
- #1A1F2E (Azul oscuro elegante)
- #2D3748 (Gris azulado)

Secundario:
- #FF6B35 (Naranja energético - CTAs)
- #4A90E2 (Azul confianza)

Neutros:
- #FFFFFF (Fondo claro)
- #F7FAFC (Fondo secundario)
- #E2E8F0 (Bordes)
- #718096 (Texto secundario)
- #2D3748 (Texto principal)

Acentos:
- #10B981 (Éxito/Verde)
- #EF4444 (Error/Rojo)
- #F59E0B (Advertencia/Amarillo)
```

### **Tipografía**
- **Headings**: Inter / Plus Jakarta Sans (premium, moderno)
- **Body**: Inter (legible, profesional)
- **Código/Números**: JetBrains Mono (para precios y cálculos)

### **Componentes UI Premium**
- Cards con glassmorphism sutil
- Gradientes sutiles en botones primarios
- Micro-interacciones en hover/focus
- Shadows suaves y profundas (layering)
- Iconos: Lucide React (modernos, consistentes)

### **Layout**
- Sidebar fijo para navegación (desktop)
- Mobile-first responsive
- Grid system para organización visual
- Espaciado generoso (no apretado)

---

## 📐 Flujos de Usuario (User Flows)

### **FLUJO 1: Crear Nuevo Presupuesto (Onboarding)**

```
1. Dashboard → Botón "Nuevo Presupuesto"
   ↓
2. Paso 1: Información del Cliente
   - Nombre completo
   - Teléfono / Email
   - Dirección de la obra
   - Tipo de cliente (particular/empresa)
   - Descuento aplicable (%)
   ↓
3. Paso 2: Tipo de Obra
   - Selección: Reforma completa / Cocina / Baño / Suelos / Pintura / etc.
   - Descripción breve de lo que se quiere hacer
   ↓
4. Paso 3: Características del Espacio
   - Metros cuadrados totales
   - Número de habitaciones
   - Número de baños
   - Altura de techos
   - Estado actual (nuevo, reformado, antiguo)
   ↓
5. Paso 4: Trabajos Detallados (Formulario Inteligente)
   - Para cada tipo de trabajo:
     * Trabajo seleccionado (dropdown inteligente)
     * Metros cuadrados/lineales/unidades
     * Calidad/Nivel (básico, estándar, premium)
     * Condiciones especiales (checkbox/es)
   ↓
6. Paso 5: Revisión y Confirmación
   - Resumen visual de todo
   - Cálculos previos
   - Opción de editar cualquier paso
   ↓
7. Paso 6: Generación del Presupuesto
   - Loading con progreso
   - IA genera explicaciones detalladas
   - Cálculo final con desglose
   ↓
8. Vista del Presupuesto Completo
   - PDF descargable
   - Enviar por email
   - Guardar en base de datos
```

### **FLUJO 2: Sistema de Cálculos Inteligentes**

**Ejemplo: Cambio de Tarima**

```
INPUT del usuario:
- Metros cuadrados: 50 m²
- Trabajo: Cambio de tarima
- Calidad: Estándar

SISTEMA calcula automáticamente:
1. Picado de solado existente: 50 m² × €8/m² = €400
2. Retirada de escombros: 50 m² × €3/m² = €150
3. Autonivelado: 50 m² × €12/m² = €600
4. Cemento/Preparación: 50 m² × €6/m² = €300
5. Tarima (calidad estándar): 50 m² × €45/m² = €2,250
6. Mano de obra instalación: 50 m² × €15/m² = €750
7. Rodapiés (aprox. 40m lineales): 40m × €25/m = €1,000

TOTAL BRUTO: €5,450
+ IVA (21%): €1,144.50
TOTAL NETO: €6,594.50

Con descuento del 5%: €6,264.78
```

**Ejemplo: Pintura**

```
INPUT del usuario:
- Habitación: Salón
- Metros cuadrados: 35 m²
- Altura techos: 2.70m
- Estado: Necesita alisado

SISTEMA calcula:
1. Superficie a pintar (paredes):
   - Perímetro: (5m + 4m) × 2 = 18m
   - Superficie: 18m × 2.70m = 48.6 m²
   - Menos puertas/ventanas: -6 m²
   - TOTAL: 42.6 m²

2. Trabajos necesarios:
   - Alisado de paredes: 42.6 m² × €12/m² = €511.20
   - Imprimación: 42.6 m² × €4/m² = €170.40
   - Pintura plástica (2 manos): 42.6 m² × €8/m² = €340.80
   - Mano de obra: 42.6 m² × €10/m² = €426
   - Materiales (rodillos, etc.): €80

TOTAL: €1,528.40
+ IVA: €320.96
TOTAL NETO: €1,849.36
```

---

## 🗄️ Arquitectura de Base de Datos

### **Modelos Principales**

```prisma
model Cliente {
  id            String    @id @default(cuid())
  nombre        String
  telefono      String?
  email         String?
  direccion     String?
  tipo          ClienteTipo @default(PARTICULAR)
  descuento     Float     @default(0) // %
  notas         String?
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
  presupuestos  Presupuesto[]
}

model Presupuesto {
  id              String    @id @default(cuid())
  clienteId       String
  cliente         Cliente   @relation(fields: [clienteId], references: [id])
  
  // Información del proyecto
  direccionObra   String
  tipoObra        TipoObra
  metrosTotales   Float?
  numHabitaciones Int?
  numBanos        Int?
  alturaTechos    Float?
  estado          EstadoInmueble
  
  // Cálculos
  subtotal        Float
  descuento       Float
  iva             Float
  total           Float
  
  // Detalles generados por IA
  explicacionIA   String? // JSON con explicaciones detalladas
  
  // Metadata
  estado          EstadoPresupuesto @default(BORRADOR)
  fechaCreacion   DateTime  @default(now())
  fechaValidez    DateTime?
  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt
  
  trabajos        TrabajoPresupuesto[]
}

model TrabajoPresupuesto {
  id              String    @id @default(cuid())
  presupuestoId   String
  presupuesto     Presupuesto @relation(fields: [presupuestoId], references: [id])
  
  tipoTrabajo     TipoTrabajo
  descripcion     String
  cantidad        Float     // m², unidades, etc.
  unidad          UnidadMedida
  precioUnitario  Float
  precioTotal     Float
  
  // Configuraciones
  calidad         Calidad   @default(ESTANDAR)
  necesitaAlisado Boolean   @default(false)
  necesitaPicado  Boolean   @default(false)
  // ... más flags según tipo de trabajo
  
  // Explicación generada por IA
  explicacionIA   String?
  
  createdAt       DateTime  @default(now())
}

model PlantillaTrabajo {
  id                String    @id @default(cuid())
  tipo              TipoTrabajo
  nombre            String
  
  // Trabajos relacionados necesarios
  trabajosNecesarios Json // Array de trabajos que se activan automáticamente
  
  // Precios base por calidad
  preciosBase       Json // { basico: X, estandar: Y, premium: Z }
  
  // Reglas de cálculo
  multiplicadores   Json? // Para ajustes según condiciones
  
  activo            Boolean   @default(true)
}
```

---

## 🤖 Integración ChatGPT: Optimización de Tokens

### **Estrategia de Ahorro de Tokens**

#### **1. Function Calling para Cálculos**
En lugar de que GPT calcule, usamos function calling para que devuelva estructuras de datos:

```typescript
const functions = [
  {
    name: "calcular_trabajo",
    description: "Calcula el precio de un trabajo específico",
    parameters: {
      type: "object",
      properties: {
        trabajo: { type: "string" },
        cantidad: { type: "number" },
        precioUnitario: { type: "number" },
        total: { type: "number" }
      }
    }
  }
]
```

#### **2. Prompts Modulares y Reutilizables**
Dividir en prompts pequeños y específicos:

```typescript
// ❌ MAL (consume muchos tokens)
const promptGrande = `
Analiza toda esta información del presupuesto y genera...
[1000+ palabras de contexto]
`

// ✅ BIEN (prompts modulares)
const promptExplicacionTrabajo = `
Genera una explicación breve (2-3 frases) para este trabajo:
Trabajo: ${tipoTrabajo}
Cantidad: ${cantidad}
Precio: ${precio}
Formato: JSON con { titulo: string, explicacion: string }
`
```

#### **3. Cache de Explicaciones**
Guardar explicaciones comunes en base de datos:

```typescript
// Si el trabajo es común, usar explicación cached
const explicacionCache = await db.explicacionCache.findFirst({
  where: {
    tipoTrabajo: "pintura",
    calidad: "estandar",
    tieneAlisado: true
  }
})

if (explicacionCache) {
  return explicacionCache.texto // Sin llamar a GPT
}
```

#### **4. Sistema de Templates con Variables**
Templates predefinidos con placeholders:

```typescript
const templates = {
  pintura: {
    conAlisado: "Se realizará alisado de paredes en {metros} m², seguido de imprimación y aplicación de pintura plástica en {numManos} manos.",
    sinAlisado: "Aplicación directa de pintura plástica en {numManos} manos sobre {metros} m²."
  }
}

// Solo usar GPT para casos especiales
```

#### **5. Batch Processing**
Agrupar trabajos similares en una sola llamada:

```typescript
// En lugar de 10 llamadas individuales
// 1 llamada con array de trabajos
const trabajosBatch = presupuesto.trabajos.map(t => ({
  tipo: t.tipoTrabajo,
  cantidad: t.cantidad
}))

const response = await openai.chat.completions.create({
  messages: [{
    role: "user",
    content: `Genera explicaciones breves para estos trabajos: ${JSON.stringify(trabajosBatch)}`
  }],
  model: "gpt-4-turbo-preview", // Más eficiente que gpt-4
  max_tokens: 500 // Limitar respuesta
})
```

#### **6. Generación de PDF sin IA**
Para el PDF, usar templates HTML/CSS. Solo usar IA para la explicación narrativa:

```typescript
// PDF se genera con React-PDF usando datos calculados
// IA solo genera el texto de "Resumen del Proyecto"
```

---

## 📱 Estructura de Componentes Frontend

```
app/
├── (auth)/
│   ├── login/
│   └── register/
├── (dashboard)/
│   ├── layout.tsx          # Sidebar + Header
│   ├── page.tsx            # Dashboard principal
│   ├── presupuestos/
│   │   ├── new/            # Wizard de creación
│   │   │   ├── cliente/
│   │   │   ├── obra/
│   │   │   ├── espacio/
│   │   │   ├── trabajos/
│   │   │   └── revision/
│   │   ├── [id]/           # Vista detallada
│   │   └── page.tsx        # Lista de presupuestos
│   ├── clientes/
│   └── plantillas/
├── api/
│   ├── presupuestos/
│   │   ├── calcular/
│   │   ├── generar-pdf/
│   │   └── [id]/
│   └── ia/
│       └── explicacion/    # Endpoint optimizado
└── components/
    ├── ui/                 # shadcn components
    ├── forms/
    │   ├── ClienteForm.tsx
    │   ├── TrabajoForm.tsx
    │   └── CalculadoraInteligente.tsx
    ├── presupuesto/
    │   ├── PresupuestoCard.tsx
    │   ├── DesgloseTrabajo.tsx
    │   ├── PDFViewer.tsx
    │   └── ResumenFinanciero.tsx
    └── wizard/
        └── WizardSteps.tsx
```

---

## 🚀 Roadmap de Implementación

### **Fase 1: MVP (2-3 semanas)**
- [ ] Setup completo: DB, Auth, UI básico
- [ ] Flujo de creación de presupuesto (formulario simple)
- [ ] Sistema de cálculos básico (hardcoded primero)
- [ ] Generación PDF básica
- [ ] Dashboard con lista de presupuestos

### **Fase 2: Inteligencia (2 semanas)**
- [ ] Sistema de plantillas de trabajos
- [ ] Cálculos inteligentes con reglas
- [ ] Integración ChatGPT optimizada
- [ ] Cache de explicaciones

### **Fase 3: UX Premium (1-2 semanas)**
- [ ] Animaciones y micro-interacciones
- [ ] Wizard multi-step mejorado
- [ ] Preview en tiempo real
- [ ] Optimización mobile

### **Fase 4: Features Avanzados (2-3 semanas)**
- [ ] Plantillas de presupuestos
- [ ] Historial de cambios
- [ ] Comparativa de presupuestos
- [ ] Export a Excel
- [ ] Integración email

---

## 💡 Recomendaciones Finales

1. **Empezar Simple**: Primero haz cálculos hardcoded, luego añade IA
2. **Validación Fuerte**: Usa Zod para validar todos los inputs
3. **Performance**: Lazy loading, code splitting, optimización de imágenes
4. **Testing**: Prueba especialmente los cálculos de precios
5. **Backup**: Guarda todos los presupuestos generados
6. **Analytics**: Trackea qué trabajos son más comunes para optimizar

---

¿Quieres que empecemos a implementar alguna parte específica?

