# 🗄️ Guía para Configurar la Base de Datos

## Opción 1: Vercel Postgres (Recomendado - Integrado con Vercel)

### Paso 1: Crear Base de Datos en Vercel

1. Ve a tu proyecto en Vercel: https://vercel.com/dashboard
2. Selecciona tu proyecto `iaenreformas`
3. Ve a la pestaña **"Storage"** o **"Data"**
4. Haz clic en **"Create Database"**
5. Selecciona **"Postgres"**
6. Elige el plan (el gratuito es suficiente para empezar)
7. Selecciona la región más cercana
8. Haz clic en **"Create"**

### Paso 2: Obtener la URL de Conexión

1. Una vez creada, ve a la pestaña **"Settings"** de tu proyecto
2. Busca **"Environment Variables"**
3. Verás que Vercel automáticamente creó `POSTGRES_URL` o `DATABASE_URL`
4. Copia esa URL

### Paso 3: Configurar en Vercel

La variable `DATABASE_URL` debería estar automáticamente configurada.
Si no, añádela manualmente en **Environment Variables**.

### Paso 4: Ejecutar Migraciones

```bash
# En producción, Vercel ejecutará las migraciones automáticamente
# O puedes ejecutarlas manualmente:
npx prisma migrate deploy
```

---

## Opción 2: Supabase (Gratis y Fácil)

### Paso 1: Crear Cuenta y Proyecto

1. Ve a: https://supabase.com
2. Crea una cuenta gratuita
3. Haz clic en **"New Project"**
4. Completa:
   - **Name**: `iaenreformas`
   - **Database Password**: (guárdala bien)
   - **Region**: Elige la más cercana
5. Haz clic en **"Create new project"**
6. Espera 2-3 minutos a que se cree

### Paso 2: Obtener la URL de Conexión

1. En tu proyecto de Supabase, ve a **Settings** → **Database**
2. Busca la sección **"Connection string"**
3. Copia la URI que empieza con `postgresql://`
4. Reemplaza `[YOUR-PASSWORD]` con tu contraseña de la base de datos

### Paso 3: Configurar en Vercel

1. Ve a tu proyecto en Vercel
2. Settings → Environment Variables
3. Añade:
   - **Name**: `DATABASE_URL`
   - **Value**: La URL que copiaste de Supabase
4. Marca **"Production"**, **"Preview"** y **"Development"**
5. Haz clic en **"Save"**

### Paso 4: Configurar Localmente

Crea un archivo `.env.local` en la raíz del proyecto:

```bash
DATABASE_URL="postgresql://postgres:[TU-PASSWORD]@db.[TU-PROJECT].supabase.co:5432/postgres"
```

---

## Opción 3: Neon (Gratis - PostgreSQL Serverless)

### Paso 1: Crear Proyecto

1. Ve a: https://neon.tech
2. Crea una cuenta
3. Crea un nuevo proyecto
4. Copia la **Connection String**

### Paso 2: Configurar

Igual que Supabase, añade `DATABASE_URL` en Vercel y en `.env.local`

---

## ⚡ Ejecutar Migraciones

Una vez configurada la base de datos:

### Desarrollo Local:
```bash
# Generar cliente de Prisma
npx prisma generate

# Crear y aplicar migraciones
npx prisma migrate dev --name init

# O si prefieres sincronizar sin migraciones:
npx prisma db push
```

### Producción (Vercel):
```bash
# Las migraciones se ejecutan automáticamente en el build
# O ejecuta manualmente:
npx prisma migrate deploy
```

---

## 🔍 Verificar que Funciona

```bash
# Abrir Prisma Studio (interfaz visual)
npx prisma studio
```

Esto abrirá una interfaz web donde puedes ver y editar tus datos.

---

## 📝 Nota Importante

- **Nunca subas el archivo `.env` a GitHub** (ya está en `.gitignore`)
- **La URL de la base de datos contiene credenciales sensibles**
- **Usa variables de entorno en Vercel** para producción

---

## 🆘 Solución de Problemas

### Error: "Database not found"
- Verifica que la URL de conexión sea correcta
- Asegúrate de que la base de datos esté creada

### Error: "Connection timeout"
- Verifica que la IP de tu servidor esté permitida (en Supabase/Neon)
- Algunos servicios requieren whitelist de IPs

### Error: "Migration failed"
- Ejecuta `npx prisma migrate reset` para empezar de cero (⚠️ borra datos)
- O `npx prisma db push` para sincronizar el schema sin migraciones

