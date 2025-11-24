# 🎯 Configurar Base de Datos EDU2

## ✅ Estado Actual

- ✅ Base de datos **EDU2** creada en Neon
- ✅ Conectada en Vercel
- ⏳ Pendiente: Configurar localmente y crear tablas

---

## 📋 Pasos para Completar

### Paso 1: Obtener Connection String

**Desde Neon:**
1. Ve a: https://console.neon.tech
2. Selecciona proyecto: **EDU2**
3. Ve a **"Connection Details"** o **"Connection String"**
4. Copia la Connection String completa
   - Debería verse así: `postgresql://usuario:password@host.neon.tech/database?sslmode=require`

**Desde Vercel:**
1. Ve a: https://vercel.com/dashboard
2. Proyecto: **i-aen-reformas**
3. **Settings** → **Environment Variables**
4. Busca `DATABASE_URL`
5. Copia el valor

---

### Paso 2: Actualizar .env Local

Abre el archivo `.env` y actualiza o añade:

```bash
DATABASE_URL="postgresql://usuario:password@host.neon.tech/database?sslmode=require"
```

**Reemplaza** con la Connection String de EDU2.

---

### Paso 3: Crear Tablas en EDU2

Una vez actualizado el `.env`, ejecuta:

```bash
# Generar cliente Prisma
npm run db:generate

# Crear todas las tablas en EDU2
npm run db:push
```

Esto creará todas las tablas necesarias en tu nueva base de datos EDU2.

---

### Paso 4: Verificar

```bash
# Abrir Prisma Studio para ver las tablas
npm run db:studio
```

Deberías ver todas las tablas creadas en EDU2.

---

### Paso 5: Limpiar Variables Antiguas en Vercel

1. Ve a: **Vercel Dashboard** → **Settings** → **Environment Variables**
2. **Elimina** todas las variables antiguas:
   - `POSTGRES_PASSWORD`
   - `POSTGRES_DATABASE`
   - `PGPASSWORD`
   - `PGDATABASE`
   - `PGHOST_UNPOOLED`
   - `PGUSER`
   - `POSTGRES_URL_NO_SSL`
   - `POSTGRES_HOST`
   - Cualquier otra `POSTGRES_*` o `PG*` (excepto `DATABASE_URL`)

3. **Mantén solo:**
   - ✅ `DATABASE_URL` (con el valor de EDU2)

---

### Paso 6: Redesplegar

Vercel debería redesplegar automáticamente, o ejecuta:

```bash
vercel --prod
```

---

## ✅ Resultado Final

- ✅ Base de datos EDU2 configurada
- ✅ Tablas creadas
- ✅ Variables limpiadas en Vercel
- ✅ Solo `DATABASE_URL` necesaria
- ✅ Aplicación funcionando

---

## 🔍 Verificar en Producción

1. Ve a: https://i-aen-reformas.vercel.app
2. Intenta crear una factura de trabajador
3. Debería funcionar correctamente

