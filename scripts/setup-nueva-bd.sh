#!/bin/bash

# Script para configurar nueva base de datos Neon

echo "🆕 Configuración de Nueva Base de Datos Neon"
echo "=============================================="
echo ""

# Verificar que existe .env
if [ ! -f .env ]; then
    echo "📝 Creando archivo .env..."
    touch .env
fi

# Solicitar nueva DATABASE_URL
echo "📋 Por favor, pega la nueva Connection String de Neon:"
echo "   (Formato: postgresql://usuario:password@host.neon.tech/database?sslmode=require)"
echo ""
read -p "DATABASE_URL: " NEW_DATABASE_URL

if [ -z "$NEW_DATABASE_URL" ]; then
    echo "❌ Error: DATABASE_URL no puede estar vacía"
    exit 1
fi

# Actualizar .env
echo ""
echo "🔄 Actualizando .env..."

# Si ya existe DATABASE_URL, reemplazarla
if grep -q "^DATABASE_URL=" .env; then
    # Reemplazar línea existente
    if [[ "$OSTYPE" == "darwin"* ]]; then
        # macOS
        sed -i '' "s|^DATABASE_URL=.*|DATABASE_URL=\"$NEW_DATABASE_URL\"|" .env
    else
        # Linux
        sed -i "s|^DATABASE_URL=.*|DATABASE_URL=\"$NEW_DATABASE_URL\"|" .env
    fi
    echo "✅ DATABASE_URL actualizada en .env"
else
    # Añadir nueva línea
    echo "DATABASE_URL=\"$NEW_DATABASE_URL\"" >> .env
    echo "✅ DATABASE_URL añadida a .env"
fi

# Generar cliente Prisma
echo ""
echo "🔧 Generando cliente Prisma..."
npm run db:generate

if [ $? -ne 0 ]; then
    echo "❌ Error al generar cliente Prisma"
    exit 1
fi

# Crear tablas
echo ""
echo "📊 Creando tablas en la base de datos..."
npm run db:push

if [ $? -ne 0 ]; then
    echo "❌ Error al crear tablas"
    exit 1
fi

echo ""
echo "✅ ¡Base de datos configurada correctamente!"
echo ""
echo "📋 Próximos pasos:"
echo "   1. Ve a Vercel Dashboard → Settings → Environment Variables"
echo "   2. Elimina TODAS las variables antiguas (POSTGRES_*, PG*)"
echo "   3. Añade DATABASE_URL con el mismo valor que en .env"
echo "   4. Redespliega la aplicación"
echo ""
echo "🔍 Para verificar, ejecuta: npm run db:studio"

