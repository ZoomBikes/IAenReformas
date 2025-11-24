# 🔧 Arreglar Variables de Entorno - Base de Datos

## ⚠️ Problema Detectado

Tienes **múltiples variables de entorno** relacionadas con la base de datos en Vercel, lo que puede causar conflictos.

## 🎯 Solución: Limpiar y Configurar Correctamente

### Paso 1: Identificar la Variable Correcta

La variable que necesitas es:
```
DATABASE_URL=postgresql://neondb_owner:npg_Q6l9mnioUDAI@ep-frosty-king-ablz7xnz-pooler.eu-west-2.aws.neon.tech/neondb?sslmode=require
```

### Paso 2: Limpiar Variables en Vercel

Ve a: **Vercel Dashboard** → Proyecto **i-aen-reformas** → **Settings** → **Environment Variables**

#### Variables a ELIMINAR (son duplicadas o innecesarias):
- ❌ `POSTGRES_PASSWORD`
- ❌ `POSTGRES_DATABASE`
- ❌ `PGPASSWORD`
- ❌ `PGDATABASE`
- ❌ `PGHOST_UNPOOLED`
- ❌ `PGUSER`
- ❌ `POSTGRES_URL_NO_SSL`
- ❌ `POSTGRES_HOST`
- ❌ `NEXT_PUBLIC_STACK_*` (si no las usas)

#### Variable a MANTENER o CREAR:
- ✅ `DATABASE_URL` con el valor completo de Neon

### Paso 3: Configurar DATABASE_URL Correctamente

1. Si **NO existe** `DATABASE_URL`:
   - Click **"Add New"**
   - **Name**: `DATABASE_URL`
   - **Value**: `postgresql://neondb_owner:npg_Q6l9mnioUDAI@ep-frosty-king-ablz7xnz-pooler.eu-west-2.aws.neon.tech/neondb?sslmode=require`
   - Marca: **Production**, **Preview**, **Development**
   - Click **"Save"**

2. Si **YA existe** `DATABASE_URL`:
   - Verifica que tenga el valor correcto de Neon
   - Si tiene otro valor, edítala y actualízala

### Paso 4: Verificar Variables Restantes

Después de limpiar, deberías tener solo:
- ✅ `DATABASE_URL` (la principal que usa Prisma)
- ✅ `OPENAI_API_KEY` (si la usas, opcional)

### Paso 5: Redesplegar

Después de limpiar las variables:

```bash
vercel --prod
```

O espera a que Vercel redespliegue automáticamente.

---

## 🔍 Cómo Verificar

1. Ve a **Settings** → **Environment Variables**
2. Deberías ver solo `DATABASE_URL` (y `OPENAI_API_KEY` si la usas)
3. Verifica que `DATABASE_URL` tenga el valor correcto de Neon

---

## ⚠️ Importante

- Las variables `POSTGRES_*` y `PG*` son redundantes
- Prisma solo necesita `DATABASE_URL`
- Tener múltiples variables puede causar conflictos

---

## ✅ Después de Limpiar

Tu aplicación debería funcionar correctamente con solo `DATABASE_URL` configurada.

