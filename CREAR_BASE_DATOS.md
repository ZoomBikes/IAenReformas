# 🚀 Crear Base de Datos - Guía Rápida

## ⚡ Opción Más Rápida: Vercel Postgres (2 minutos)

Ya que tu proyecto está en Vercel, esta es la opción más fácil:

### 1. Crear Base de Datos en Vercel

1. Ve a: **https://vercel.com/dashboard**
2. Selecciona tu proyecto **iaenreformas**
3. Ve a la pestaña **"Storage"** (o **"Data"**)
4. Haz clic en **"Create Database"**
5. Selecciona **"Postgres"**
6. Elige el plan **"Hobby"** (gratis)
7. Selecciona la región (ej: `iad1` - Estados Unidos)
8. Haz clic en **"Create"**

### 2. Configurar Automáticamente

Vercel automáticamente:
- ✅ Crea la variable `POSTGRES_URL` o `DATABASE_URL`
- ✅ La añade a tus Environment Variables
- ✅ Está lista para usar

### 3. Ejecutar Migraciones

```bash
# Opción 1: Sincronizar schema (más rápido, sin historial)
npx prisma db push

# Opción 2: Crear migraciones (recomendado para producción)
npx prisma migrate dev --name init
```

### 4. Verificar

```bash
# Abrir interfaz visual de la base de datos
npm run db:studio
```

---

## 🆓 Alternativa: Supabase (Gratis, 3 minutos)

### 1. Crear Proyecto

1. Ve a: **https://supabase.com**
2. Crea cuenta (gratis)
3. Click en **"New Project"**
4. Completa:
   - **Name**: `iaenreformas`
   - **Password**: (guárdala bien, la necesitarás)
   - **Region**: Elige la más cercana
5. Click **"Create new project"**
6. Espera 2-3 minutos

### 2. Obtener URL de Conexión

1. En tu proyecto → **Settings** → **Database**
2. Busca **"Connection string"** → **URI**
3. Copia la URL (parece: `postgresql://postgres:[YOUR-PASSWORD]@...`)
4. Reemplaza `[YOUR-PASSWORD]` con tu contraseña

### 3. Configurar en Vercel

1. Vercel Dashboard → Tu proyecto → **Settings** → **Environment Variables**
2. Añade:
   - **Name**: `DATABASE_URL`
   - **Value**: La URL que copiaste
   - Marca: Production, Preview, Development
3. Click **"Save"**

### 4. Configurar Localmente

Crea archivo `.env.local`:

```bash
DATABASE_URL="postgresql://postgres:TU_PASSWORD@db.xxx.supabase.co:5432/postgres"
```

### 5. Ejecutar Migraciones

```bash
npx prisma generate
npx prisma db push
```

---

## ✅ Verificar que Funciona

Después de configurar, ejecuta:

```bash
npm run db:studio
```

Esto abrirá una interfaz web donde puedes ver tus tablas.

---

## 🎯 Una vez configurada la base de datos

Tu aplicación podrá:
- ✅ Crear y gestionar facturas de trabajadores
- ✅ Gestionar clientes, leads y campañas
- ✅ Crear obras y tareas
- ✅ Gestionar compras y proveedores
- ✅ Controlar costes y pagos
- ✅ Y todo lo demás

---

## 📞 ¿Necesitas Ayuda?

Si tienes problemas:
1. Verifica que la URL de conexión sea correcta
2. Asegúrate de que la base de datos esté creada y activa
3. Revisa los logs en Vercel para ver errores específicos

