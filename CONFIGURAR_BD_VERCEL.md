# 🚀 Configurar Base de Datos en Vercel (Neon - Recomendado)

## Paso 1: Crear Base de Datos con Neon

1. En Vercel Dashboard → Tu proyecto → **Storage**
2. Haz clic en **"Create New"**
3. Selecciona **"Neon"** → **"Serverless Postgres"**
4. Haz clic en **"Continue"** o **"Create"**
5. Si es la primera vez, te pedirá conectar tu cuenta de Neon (gratis)
6. Elige la región más cercana
7. Haz clic en **"Create"**

## Paso 2: Vercel Configura Automáticamente

Neon/Vercel automáticamente:
- ✅ Crea la base de datos
- ✅ Añade la variable `DATABASE_URL` a tus Environment Variables
- ✅ La conecta a tu proyecto

## Paso 3: Verificar Variables de Entorno

1. Ve a **Settings** → **Environment Variables**
2. Verifica que existe `DATABASE_URL` o `NEON_DATABASE_URL`
3. Debería estar marcada para Production, Preview y Development

## Paso 4: Ejecutar Migraciones

Una vez creada la base de datos, ejecuta:

```bash
# Generar cliente de Prisma
npm run db:generate

# Crear todas las tablas (sincronizar schema)
npm run db:push
```

O si prefieres migraciones formales:

```bash
npm run db:generate
npm run db:migrate
```

## Paso 5: Verificar

```bash
npm run db:studio
```

Esto abrirá Prisma Studio donde puedes ver todas tus tablas.

---

## Alternativa: Prisma Postgres

Si ves la opción **"Prisma Postgres"**, también es excelente:

1. Selecciona **"Prisma Postgres"** → **"Instant Serverless Postgres"**
2. Sigue los mismos pasos
3. Está optimizado específicamente para Prisma

---

## ✅ Una vez configurado

Tu aplicación estará completamente funcional:
- ✅ Facturas de trabajadores
- ✅ CRM completo
- ✅ Planificación
- ✅ Compras
- ✅ Control de costes


