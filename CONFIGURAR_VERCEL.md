# ⚙️ Configurar DATABASE_URL en Vercel

## ✅ Base de Datos Local: Configurada

Tu `.env` local ya está configurado y las tablas están creadas.

## 🔧 Ahora Configura en Vercel (Producción)

### Paso 1: Añadir Variable de Entorno en Vercel

1. Ve a: **https://vercel.com/dashboard**
2. Selecciona tu proyecto **iaenreformas**
3. Ve a **Settings** → **Environment Variables**
4. Haz clic en **"Add New"**
5. Añade:
   - **Name**: `DATABASE_URL`
   - **Value**: `postgresql://neondb_owner:npg_Q6l9mnioUDAI@ep-frosty-king-ablz7xnz-pooler.eu-west-2.aws.neon.tech/neondb?sslmode=require`
   - Marca las tres opciones: **Production**, **Preview**, **Development**
6. Haz clic en **"Save"**

### Paso 2: Redesplegar (Opcional)

Si ya tienes un despliegue activo, Vercel lo actualizará automáticamente con la nueva variable, o puedes:

```bash
vercel --prod
```

---

## ✅ Verificar que Funciona

### Localmente:
```bash
# Ya está funcionando - puedes probar añadir una factura
npm run dev
```

### En Producción:
Una vez configurada la variable en Vercel, tu aplicación en producción también funcionará.

---

## 🎉 ¡Todo Listo!

Tu base de datos está:
- ✅ Configurada localmente
- ✅ Tablas creadas
- ✅ Cliente Prisma generado
- ⏳ Pendiente: Añadir DATABASE_URL en Vercel (para producción)

---

## 📝 Nota de Seguridad

**Nunca subas el archivo `.env` a GitHub** (ya está en `.gitignore`).

Las credenciales que compartiste son sensibles. Si las compartiste públicamente, considera:
1. Regenerar la contraseña en Neon
2. Actualizar la URL en todos los lugares donde la uses


