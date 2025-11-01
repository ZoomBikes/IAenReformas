# 🤖 Arquitectura de IA: Optimización de Tokens

## 📊 Estrategia de Minimización de Tokens

### **Problema Actual**
Sin optimización: Cada presupuesto podría consumir ~2000-5000 tokens
Con optimización: Reducir a ~500-1000 tokens por presupuesto

### **Ahorro Objetivo: 70-80%**

---

## 🎯 Sistema de Prompts Modulares

### **Nivel 1: Plantillas Pre-definidas (0 tokens)**

```typescript
const PLANTILLAS = {
  tarima: {
    basica: "Instalación de tarima flotante básica en {metros} m². Incluye preparación del suelo, autonivelado y rodapiés.",
    estandar: "Instalación de tarima flotante de calidad estándar en {metros} m². Preparación completa del suelo, autonivelado profesional y rodapiés de madera.",
    premium: "Instalación de tarima de alta calidad en {metros} m². Preparación exhaustiva del suelo, autonivelado de precisión y rodapiés premium."
  },
  pintura: {
    conAlisado: "Pintura de paredes en {metros} m². Incluye alisado previo, imprimación y aplicación de pintura plástica en {manos} manos.",
    sinAlisado: "Pintura directa sobre {metros} m². Imprimación y aplicación de pintura plástica en {manos} manos."
  }
}

// Uso: 0 tokens de OpenAI
function generarExplicacion(trabajo: Trabajo) {
  const template = PLANTILLAS[trabajo.tipo]?.[trabajo.calidad];
  if (template) {
    return template
      .replace('{metros}', trabajo.cantidad)
      .replace('{manos}', trabajo.numManos || 2);
  }
  return null; // Si no hay template, usar IA
}
```

### **Nivel 2: Function Calling (Tokens mínimos)**

Para trabajos complejos, usar function calling:

```typescript
const funcionesIA = [
  {
    name: "generar_explicacion_breve",
    description: "Genera una explicación de 2-3 frases para un trabajo de reforma",
    parameters: {
      type: "object",
      properties: {
        trabajo: {
          type: "string",
          enum: ["tarima", "pintura", "azulejos", "fontaneria", ...]
        },
        metros: { type: "number" },
        calidad: {
          type: "string",
          enum: ["basica", "estandar", "premium"]
        },
        explicacion: {
          type: "string",
          description: "Máximo 150 palabras"
        }
      },
      required: ["trabajo", "metros", "calidad", "explicacion"]
    }
  }
]

// Prompt ultra-condensado
const prompt = `Genera explicación breve para: ${tipoTrabajo}, ${metros}m², calidad ${calidad}`;
// ≈ 20 tokens input
// ≈ 50 tokens output
// Total: ~70 tokens por trabajo
```

### **Nivel 3: Batch Processing**

Agrupar múltiples trabajos en una sola llamada:

```typescript
// ❌ MAL: 5 llamadas separadas
for (const trabajo of trabajos) {
  await openai.chat.completions.create({
    messages: [{ role: "user", content: `Explica: ${trabajo}` }]
  });
}
// Total: ~350 tokens

// ✅ BIEN: 1 llamada con array
const trabajosData = trabajos.map(t => ({
  tipo: t.tipo,
  metros: t.cantidad,
  calidad: t.calidad
}));

await openai.chat.completions.create({
  messages: [{
    role: "user",
    content: `Genera explicaciones breves para estos trabajos: ${JSON.stringify(trabajosData)}`
  }],
  functions: funcionesIA,
  max_tokens: 300 // Limitar respuesta
});
// Total: ~150 tokens (ahorro de 57%)
```

---

## 💾 Sistema de Caché Inteligente

### **Estructura de Caché**

```typescript
interface CacheExplicacion {
  hash: string; // Hash de: tipo+metros+calidad+condiciones
  texto: string;
  fechaCreacion: Date;
  usos: number;
}

// Generar hash único
function generarHash(trabajo: Trabajo): string {
  const key = `${trabajo.tipo}-${trabajo.cantidad}-${trabajo.calidad}-${trabajo.condiciones.join(',')}`;
  return crypto.createHash('sha256').update(key).digest('hex').substring(0, 16);
}

// Verificar caché antes de llamar a IA
async function obtenerExplicacion(trabajo: Trabajo): Promise<string> {
  const hash = generarHash(trabajo);
  
  // 1. Buscar en caché local (Redis/DB)
  const cached = await db.cacheExplicacion.findFirst({
    where: { hash }
  });
  
  if (cached) {
    // Actualizar contador
    await db.cacheExplicacion.update({
      where: { id: cached.id },
      data: { usos: cached.usos + 1 }
    });
    return cached.texto; // 0 tokens
  }
  
  // 2. Si no está en caché, usar plantilla
  const plantilla = PLANTILLAS[trabajo.tipo]?.[trabajo.calidad];
  if (plantilla) {
    const texto = aplicarTemplate(plantilla, trabajo);
    // Guardar en caché para futuros usos similares
    await db.cacheExplicacion.create({
      data: { hash, texto, usos: 1 }
    });
    return texto; // 0 tokens
  }
  
  // 3. Último recurso: llamar a IA
  const texto = await generarConIA(trabajo);
  
  // Guardar en caché
  await db.cacheExplicacion.create({
    data: { hash, texto, usos: 1 }
  });
  
  return texto; // ≈70 tokens
}
```

### **Estrategia de Invalidez de Caché**

```typescript
// Invalidar caché después de X días o si hay actualización de precios
const CACHE_TTL = 30 * 24 * 60 * 60 * 1000; // 30 días

// Limpiar caché antiguo periódicamente
async function limpiarCacheAntiguo() {
  await db.cacheExplicacion.deleteMany({
    where: {
      fechaCreacion: {
        lt: new Date(Date.now() - CACHE_TTL)
      },
      usos: { lt: 5 } // Solo eliminar si se usó menos de 5 veces
    }
  });
}
```

---

## 📝 Prompt Engineering Optimizado

### **Prompts Ultra-Condensados**

```typescript
// ❌ MAL (verboso, muchos tokens)
const promptMal = `
Por favor, genera una explicación detallada y profesional para el cliente sobre el siguiente trabajo de reforma:

Tipo de trabajo: Cambio de tarima
Metros cuadrados: 50
Calidad: Estándar
Ubicación: Salón principal

La explicación debe ser clara, profesional y detallar todos los pasos del proceso...
`;
// ~150 tokens

// ✅ BIEN (condensado, específico)
const promptBien = `Expl: tarima 50m² estándar. Max 100 palabras.`;
// ~15 tokens

// Con function calling es aún mejor:
const promptOptimizado = {
  role: "user",
  content: "tarima 50m² estándar",
  functions: [funcionGenerarExplicacion]
};
// ~10 tokens
```

### **Template de Resumen del Proyecto**

```typescript
// Resumen general del presupuesto (una sola llamada)
async function generarResumenProyecto(presupuesto: Presupuesto): Promise<string> {
  // Extraer solo información esencial
  const datos = {
    tipo: presupuesto.tipoObra,
    metros: presupuesto.metrosTotales,
    trabajos: presupuesto.trabajos.map(t => t.tipoTrabajo),
    total: presupuesto.total
  };
  
  const prompt = `Resumen proyecto: ${JSON.stringify(datos)}. 3 párrafos máximo.`;
  
  const response = await openai.chat.completions.create({
    model: "gpt-4-turbo-preview", // Más eficiente
    messages: [{ role: "user", content: prompt }],
    max_tokens: 200, // Limitar estrictamente
    temperature: 0.7 // Consistente pero no demasiado creativo
  });
  
  return response.choices[0].message.content;
}
```

---

## 🔄 Flujo Completo Optimizado

```typescript
async function generarPresupuestoConIA(presupuesto: Presupuesto) {
  const explicaciones: string[] = [];
  let tokensUsados = 0;
  
  // 1. Generar explicaciones de trabajos (batch)
  const trabajosParaIA = [];
  for (const trabajo of presupuesto.trabajos) {
    // Intentar caché/plantilla primero
    let explicacion = await obtenerExplicacion(trabajo);
    
    if (!explicacion) {
      // Agregar a batch para procesar juntos
      trabajosParaIA.push(trabajo);
    } else {
      explicaciones.push(explicacion);
    }
  }
  
  // 2. Si hay trabajos sin explicación, procesar en batch
  if (trabajosParaIA.length > 0) {
    const batchResult = await generarExplicacionesBatch(trabajosParaIA);
    explicaciones.push(...batchResult.explicaciones);
    tokensUsados += batchResult.tokens;
  }
  
  // 3. Generar resumen del proyecto (solo una llamada)
  const resumen = await generarResumenProyecto(presupuesto);
  tokensUsados += 150; // Estimado
  
  // 4. Total estimado por presupuesto
  // - 5 trabajos × 70 tokens = 350 (si ninguno en caché)
  // - Resumen = 150 tokens
  // Total: ~500 tokens (vs ~2500 sin optimización)
  
  return {
    explicaciones,
    resumen,
    tokensUsados,
    ahorro: calcularAhorro(presupuesto.trabajos.length)
  };
}
```

---

## 📊 Métricas y Monitoreo

```typescript
interface MetricasIA {
  presupuestoId: string;
  tokensUsados: number;
  tokensAhorrados: number; // Por caché/plantillas
  trabajosEnCache: number;
  trabajosConIA: number;
  tiempoGeneracion: number; // ms
  costoEstimado: number; // USD
}

// Tracking para optimizar
async function trackearUsoIA(metricas: MetricasIA) {
  await db.metricasIA.create({ data: metricas });
  
  // Alertar si consumo es alto
  if (metricas.tokensUsados > 1000) {
    console.warn(`Alto consumo de tokens en presupuesto ${metricas.presupuestoId}`);
  }
}
```

---

## 💰 Cálculo de Costos

```
Precios OpenAI (GPT-4 Turbo):
- Input: $0.01 / 1K tokens
- Output: $0.03 / 1K tokens

Presupuesto promedio optimizado:
- Input: ~200 tokens = $0.002
- Output: ~300 tokens = $0.009
- Total: ~$0.011 por presupuesto

Sin optimización:
- Input: ~800 tokens = $0.008
- Output: ~1200 tokens = $0.036
- Total: ~$0.044 por presupuesto

Ahorro: 75% de costos
```

---

## ✅ Checklist de Optimización

- [x] Plantillas pre-definidas para trabajos comunes
- [x] Sistema de caché con hash único
- [x] Batch processing para múltiples trabajos
- [x] Function calling para respuestas estructuradas
- [x] Prompts ultra-condensados
- [x] Límites estrictos de max_tokens
- [x] Modelo eficiente (gpt-4-turbo-preview)
- [x] Monitoreo de uso de tokens
- [ ] A/B testing de prompts
- [ ] Machine learning para mejorar plantillas

