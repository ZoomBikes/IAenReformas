# 🆕 Crear Nueva Base de Datos Neon (Limpia)

## 🎯 Objetivo

Crear una base de datos Neon completamente nueva y limpia, sin variables duplicadas.

---

## Paso 1: Crear Nueva Base de Datos Neon

### Opción A: Desde Vercel (Más Fácil)

1. Ve a: **https://vercel.com/dashboard**
2. Selecciona tu proyecto: **i-aen-reformas**
3. Ve a la pestaña **"Storage"**
4. Haz clic en **"Create New"**
5. Selecciona **"Neon"** → **"Serverless Postgres"**
6. Si ya tienes Neon conectado:
   - Puedes crear un nuevo proyecto dentro de Neon
   - O crear una nueva base de datos
7. Elige la región
8. Haz clic en **"Create"**

### Opción B: Desde Neon Directamente (Más Control)

1. Ve a: **https://console.neon.tech**
2. Inicia sesión
3. Haz clic en **"Create Project"**
4. Completa:
   - **Name**: `iaenreformas-nuevo` (o el nombre que prefieras)
   - **Region**: Elige la más cercana
   - **PostgreSQL version**: 15 o 16 (cualquiera funciona)
5. Haz clic en **"Create Project"**
6. Espera 1-2 minutos

---

## Paso 2: Obtener la Nueva Connection String

### Si creaste desde Vercel:
- Vercel automáticamente crea las variables
- Ve a **Settings** → **Environment Variables**
- Busca `DATABASE_URL` o `POSTGRES_URL`
- Copia el valor

### Si creaste desde Neon:
1. En Neon Dashboard → Tu proyecto
2. Ve a **"Connection Details"** o **"Connection String"**
3. Copia la **Connection String** (URI)
4. Debería verse así:
   ```
   postgresql://usuario:password@host.neon.tech/database?sslmode=require
   ```

---

## Paso 3: Limpiar Variables Antiguas en Vercel

1. Ve a: **Vercel Dashboard** → Tu proyecto → **Settings** → **Environment Variables**
2. **ELIMINA TODAS** las variables relacionadas con la base de datos antigua:
   - `POSTGRES_PASSWORD`
   - `POSTGRES_DATABASE`
   - `PGPASSWORD`
   - `PGDATABASE`
   - `PGHOST_UNPOOLED`
   - `PGUSER`
   - `POSTGRES_URL_NO_SSL`
   - `POSTGRES_HOST`
   - `POSTGRES_URL` (la antigua)
   - `DATABASE_URL` (si es la antigua)
   - Cualquier otra `POSTGRES_*` o `PG*`

3. **Elimina también** la base de datos antigua si quieres (opcional):
   - Ve a **Storage** en Vercel
   - Elimina la base de datos Neon antigua

---

## Paso 4: Configurar la Nueva Base de Datos

### En Vercel:

1. Si Vercel la creó automáticamente:
   - Verifica que existe `DATABASE_URL` con el nuevo valor
   - Si no, créala manualmente

2. Si la creaste en Neon:
   - Ve a **Settings** → **Environment Variables**
   - Click **"Add New"**
   - **Name**: `DATABASE_URL`
   - **Value**: La nueva Connection String de Neon
   - Marca: ✅ Production, ✅ Preview, ✅ Development
   - Click **"Save"**

### Localmente:

Actualiza tu `.env` local:

```bash
DATABASE_URL="postgresql://nuevo-usuario:nuevo-password@nuevo-host.neon.tech/nuevo-database?sslmode=require"
```

---

## Paso 5: Crear las Tablas

Una vez configurada la nueva base de datos:

```bash
# Generar cliente Prisma
npm run db:generate

# Crear todas las tablas
npm run db:push
```

O si prefieres migraciones:

```bash
npm run db:generate
npm run db:migrate
```

---

## Paso 6: Verificar

```bash
# Abrir Prisma Studio
npm run db:studio
```

Deberías ver todas las tablas creadas en la nueva base de datos.

---

## ✅ Ventajas de Nueva Base de Datos

- ✅ Sin variables duplicadas
- ✅ Configuración limpia desde cero
- ✅ Solo `DATABASE_URL` necesaria
- ✅ Sin conflictos
- ✅ Más fácil de gestionar

---

## 🎯 Resumen

1. Crear nueva BD Neon (desde Vercel o Neon)
2. Obtener nueva Connection String
3. Eliminar todas las variables antiguas en Vercel
4. Añadir solo `DATABASE_URL` con el nuevo valor
5. Ejecutar `npm run db:push` para crear tablas
6. ¡Listo!

