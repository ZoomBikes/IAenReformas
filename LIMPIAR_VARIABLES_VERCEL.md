# 🧹 Limpiar Variables de Entorno en Vercel

## ⚠️ Problema

Tienes **múltiples variables de entorno** relacionadas con PostgreSQL/Neon que pueden causar conflictos.

## ✅ Solución: Dejar Solo DATABASE_URL

### Paso 1: Ir a Variables de Entorno

1. Ve a: **https://vercel.com/dashboard**
2. Selecciona el proyecto: **i-aen-reformas** (el que mencionas)
3. Ve a: **Settings** → **Environment Variables**

### Paso 2: Eliminar Variables Duplicadas

**Elimina estas variables** (son redundantes):
- ❌ `POSTGRES_PASSWORD`
- ❌ `POSTGRES_DATABASE`
- ❌ `PGPASSWORD`
- ❌ `PGDATABASE`
- ❌ `PGHOST_UNPOOLED`
- ❌ `PGUSER`
- ❌ `POSTGRES_URL_NO_SSL`
- ❌ `POSTGRES_HOST`
- ❌ `POSTGRES_URL` (si existe y no es la correcta)
- ❌ Cualquier `NEXT_PUBLIC_STACK_*` (si no las usas)

**Para eliminar cada una:**
- Click en los **3 puntos** (`...`) a la derecha
- Selecciona **"Delete"**
- Confirma

### Paso 3: Crear/Verificar DATABASE_URL

**Si NO existe `DATABASE_URL`:**
1. Click **"Add New"**
2. **Name**: `DATABASE_URL`
3. **Value**: `postgresql://neondb_owner:npg_Q6l9mnioUDAI@ep-frosty-king-ablz7xnz-pooler.eu-west-2.aws.neon.tech/neondb?sslmode=require`
4. Marca: ✅ **Production**, ✅ **Preview**, ✅ **Development**
5. Click **"Save"**

**Si YA existe `DATABASE_URL`:**
1. Verifica que tenga el valor correcto de Neon
2. Si tiene otro valor, edítala (3 puntos → Edit)
3. Actualiza con el valor de Neon
4. Guarda

### Paso 4: Resultado Final

Después de limpiar, deberías tener **SOLO**:
- ✅ `DATABASE_URL` (con el valor de Neon)
- ✅ `OPENAI_API_KEY` (solo si la usas, opcional)

### Paso 5: Redesplegar

```bash
vercel --prod
```

O espera a que Vercel redespliegue automáticamente.

---

## 🎯 ¿Por qué solo DATABASE_URL?

- Prisma **solo necesita** `DATABASE_URL`
- Las otras variables (`POSTGRES_*`, `PG*`) son redundantes
- Tener múltiples variables puede causar conflictos
- `DATABASE_URL` es el estándar que usa Prisma

---

## ✅ Verificación

Después de limpiar:
1. Ve a **Settings** → **Environment Variables**
2. Deberías ver solo `DATABASE_URL` (y `OPENAI_API_KEY` si la usas)
3. Prueba crear una factura en producción
4. Debería funcionar correctamente

---

## 📝 Nota

Si tienes otro proyecto (`iaenreformas` vs `i-aen-reformas`), repite el proceso en el proyecto correcto donde se aplican los cambios.

