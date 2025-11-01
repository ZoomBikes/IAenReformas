# IA en Reformas

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

## 🛠️ Tecnologías

- **Next.js 14** - Framework React
- **TypeScript** - Tipado estático
- **React 18** - Biblioteca UI
- **Vercel** - Plataforma de despliegue

## 📁 Estructura del Proyecto

```
├── app/
│   ├── layout.tsx      # Layout principal
│   ├── page.tsx        # Página de inicio
│   └── globals.css     # Estilos globales
├── public/             # Archivos estáticos
├── next.config.js      # Configuración de Next.js
├── tsconfig.json       # Configuración de TypeScript
└── package.json        # Dependencias
```

## 🎨 Personalización

- Edita `app/page.tsx` para modificar la página principal
- Ajusta `app/globals.css` para cambiar los estilos
- Modifica `app/layout.tsx` para actualizar el metadata

## 📝 Notas

Este proyecto usa el App Router de Next.js 14. Para más información, visita la [documentación de Next.js](https://nextjs.org/docs).

