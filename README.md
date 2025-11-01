# 🏗️ IA en Reformas - Generador de Presupuestos Inteligente

Aplicación web premium para generar presupuestos inteligentes y detallados para empresa de reformas, utilizando IA (ChatGPT) para optimizar cálculos y generar explicaciones personalizadas.

## 📋 Descripción del Proyecto

Sistema completo de gestión de presupuestos que:
- ✅ Conoce y calcula automáticamente trabajos de reforma (tarima, pintura, azulejos, etc.)
- ✅ Genera desgloses detallados con cálculos inteligentes
- ✅ Utiliza IA para crear explicaciones personalizadas (optimizado para ahorrar tokens)
- ✅ Genera PDFs profesionales con todos los detalles
- ✅ Diseño premium y moderno
- ✅ Flujos de usuario optimizados

## 📚 Documentación de Consultoría

**Consulta estos documentos para el diseño completo:**

1. **[CONSULTORIA.md](./CONSULTORIA.md)** - Stack tecnológico, diseño, arquitectura completa
2. **[USER_FLOWS.md](./USER_FLOWS.md)** - Flujos de usuario detallados con wireframes
3. **[ARQUITECTURA_IA.md](./ARQUITECTURA_IA.md)** - Sistema de IA optimizado para ahorrar tokens
4. **[SISTEMA_CALCULOS.md](./SISTEMA_CALCULOS.md)** - Reglas de cálculo inteligentes por tipo de trabajo

---

Proyecto Next.js 14 configurado para desplegar en Vercel.

## 🚀 Inicio Rápido

### Instalación

```bash
npm install
# o
yarn install
# o
pnpm install
```

### Desarrollo

Ejecuta el servidor de desarrollo:

```bash
npm run dev
# o
yarn dev
# o
pnpm dev
```

Abre [http://localhost:3000](http://localhost:3000) en tu navegador para ver el resultado.

## 📦 Despliegue en Vercel

### 🚀 Método Rápido: CLI de Vercel (Obtener link en 2 minutos)

**Paso 1: Instala las dependencias**
```bash
npm install
```

**Paso 2: Instala Vercel CLI globalmente**
```bash
npm i -g vercel
```

**Paso 3: Despliega tu proyecto**
```bash
vercel
```

**¿Qué pasará cuando ejecutes `vercel`?**
1. Te pedirá que inicies sesión (si es la primera vez, se abrirá el navegador)
2. Te preguntará si quieres enlazar a un proyecto existente (di "No" si es tu primera vez)
3. Te preguntará sobre la configuración del proyecto (presiona Enter para aceptar los valores por defecto)
4. **¡Listo!** Te dará una URL como: `https://tu-proyecto.vercel.app`

**Paso 4: Despliegue en producción (opcional)**
```bash
vercel --prod
```
Esto creará una URL de producción permanente.

### 🌐 Método Alternativo: Desde GitHub (Recomendado para proyectos continuos)

**Ventajas:** Despliegue automático cada vez que haces push a GitHub

1. Crea un repositorio en GitHub y sube tu código:
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin TU_REPOSITORIO_DE_GITHUB
   git push -u origin main
   ```

2. Ve a [vercel.com](https://vercel.com) y haz clic en "Add New Project"

3. Conecta tu cuenta de GitHub y selecciona tu repositorio

4. Vercel detectará automáticamente Next.js y configurará todo

5. Haz clic en "Deploy"

6. **¡Listo!** En menos de 2 minutos tendrás tu aplicación en vivo con una URL única

### 📱 Tu link de Vercel

Una vez desplegado, tu aplicación estará disponible en:
- **URL de desarrollo:** `https://tu-proyecto-xxxxx.vercel.app`
- **URL de producción:** `https://tu-proyecto.vercel.app` (si configuras un dominio personalizado)

**Nota:** Cada vez que hagas cambios y los subas a GitHub (o ejecutes `vercel`), se actualizará automáticamente.

## 🛠️ Stack Tecnológico (Planificado)

### Frontend
- **Next.js 14** (App Router) - Framework React
- **TypeScript** - Tipado estático
- **Tailwind CSS** - Diseño premium
- **shadcn/ui** - Componentes UI
- **Framer Motion** - Animaciones

### Backend & Base de Datos
- **Next.js API Routes** - Endpoints integrados
- **Prisma ORM** - ORM type-safe
- **PostgreSQL** (Vercel Postgres) - Base de datos
- **NextAuth.js** - Autenticación

### IA & Integraciones
- **OpenAI GPT-4 Turbo** - Generación de texto optimizada
- **LangChain** - Gestión de prompts
- **React-PDF** - Generación de PDFs

### Despliegue
- **Vercel** - Hosting y CI/CD

## 📁 Estructura del Proyecto (Planificada)

```
├── app/
│   ├── (auth)/         # Rutas de autenticación
│   ├── (dashboard)/    # Dashboard principal
│   │   ├── presupuestos/
│   │   │   ├── new/    # Wizard de creación
│   │   │   └── [id]/   # Vista detallada
│   │   └── clientes/
│   ├── api/            # API Routes
│   │   ├── presupuestos/
│   │   └── ia/
│   └── components/     # Componentes reutilizables
├── prisma/             # Schema y migraciones
├── lib/                # Utilidades y lógica de negocio
│   ├── calculos/       # Sistema de cálculos
│   ├── ia/             # Integración OpenAI
│   └── pdf/            # Generación de PDFs
├── public/             # Archivos estáticos
└── docs/               # Documentación de consultoría
```

**Estado actual:** Proyecto base configurado. Ver documentación para implementación completa.

## 🎨 Personalización

- Edita `app/page.tsx` para modificar la página principal
- Ajusta `app/globals.css` para cambiar los estilos
- Modifica `app/layout.tsx` para actualizar el metadata

## 🎯 Características Principales

### Sistema de Cálculos Inteligentes
- Cálculo automático de trabajos complejos (ej: tarima incluye picado, autonivelado, instalación, rodapiés)
- Multiplicadores según condiciones (estado del inmueble, complejidad)
- Desglose detallado componente por componente

### Optimización de IA
- Sistema de plantillas predefinidas (0 tokens)
- Caché inteligente de explicaciones
- Batch processing para múltiples trabajos
- Function calling para respuestas estructuradas
- **Ahorro estimado: 70-80% en tokens**

### Flujos de Usuario
- Wizard multi-paso intuitivo
- Preview en tiempo real de cálculos
- Validaciones inteligentes
- Edición flexible de presupuestos

### Generación de PDF
- Diseño profesional
- Desglose completo punto por punto
- Explicaciones generadas por IA
- Fácil descarga y envío por email

## 📝 Notas

Este proyecto usa el App Router de Next.js 14. Para más información, visita la [documentación de Next.js](https://nextjs.org/docs).

**Próximos pasos:** Consulta [CONSULTORIA.md](./CONSULTORIA.md) para comenzar la implementación completa.

