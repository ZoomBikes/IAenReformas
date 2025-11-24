# 🗄️ Crear Tablas en Producción

## ⚠️ Problema

Las tablas de la base de datos no están creadas en producción, por eso:
- Los agentes no aparecen (todo en 0)
- El import de CSV da 455 errores
- La API devuelve errores 500

## ✅ Solución

### Opción 1: Desde Vercel (Recomendado)

1. Ve a **Vercel Dashboard** → Tu proyecto → **Settings** → **Environment Variables**
2. Verifica que `DATABASE_URL` esté configurada con la conexión de Neon (EDU2)
3. Ve a **Deployments** → Click en el último deployment → **View Function Logs**
4. Ejecuta este comando en la terminal local:

```bash
# Conectar a la base de datos de producción y crear tablas
npx prisma db push --skip-generate
```

O mejor aún, añade un script de post-build en Vercel.

### Opción 2: Script de Migración

Ejecuta este comando localmente (asegúrate de tener DATABASE_URL de producción):

```bash
# 1. Asegúrate de tener la DATABASE_URL de producción en .env
# 2. Genera el cliente Prisma
npm run db:generate

# 3. Crea las tablas en producción
npx prisma db push
```

### Opción 3: Desde Neon Dashboard

1. Ve a **Neon Dashboard** → Proyecto EDU2
2. Ve a **SQL Editor**
3. Ejecuta:

```sql
-- Verificar si las tablas existen
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name = 'llamadas_frio';
```

Si no existe, las tablas se crearán automáticamente en el próximo deploy si Prisma está configurado correctamente.

---

## 🔍 Verificar

Después de crear las tablas, verifica:

1. Ve a la aplicación en producción
2. Intenta importar el CSV de nuevo
3. Deberías ver los 455 contactos importados

---

## 📝 Nota

Si las tablas ya existen pero están vacías, simplemente importa el CSV de nuevo desde la interfaz web.

