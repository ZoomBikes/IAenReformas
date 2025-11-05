#!/bin/bash

echo "🗄️  Configuración de Base de Datos para IA en Reformas"
echo "=================================================="
echo ""

# Verificar si DATABASE_URL existe
if [ -f .env ] && grep -q "DATABASE_URL" .env; then
    echo "✅ DATABASE_URL encontrada en .env"
    echo ""
    
    # Generar cliente de Prisma
    echo "📦 Generando cliente de Prisma..."
    npx prisma generate
    
    echo ""
    echo "🔄 ¿Qué quieres hacer ahora?"
    echo "1) Crear migraciones y aplicar (migrate dev)"
    echo "2) Sincronizar schema sin migraciones (db push)"
    echo "3) Solo generar cliente"
    echo ""
    read -p "Elige una opción (1-3): " option
    
    case $option in
        1)
            echo "🔄 Creando y aplicando migraciones..."
            npx prisma migrate dev --name init
            echo "✅ Migraciones aplicadas"
            ;;
        2)
            echo "🔄 Sincronizando schema..."
            npx prisma db push
            echo "✅ Schema sincronizado"
            ;;
        3)
            echo "✅ Cliente generado"
            ;;
        *)
            echo "❌ Opción inválida"
            exit 1
            ;;
    esac
    
    echo ""
    echo "🎉 Base de datos configurada correctamente!"
    echo ""
    echo "Para abrir Prisma Studio (interfaz visual):"
    echo "  npm run db:studio"
    echo ""
else
    echo "❌ No se encontró DATABASE_URL en .env"
    echo ""
    echo "📖 Por favor sigue estos pasos:"
    echo ""
    echo "1. Crea una base de datos PostgreSQL:"
    echo "   - Vercel Postgres: https://vercel.com/dashboard → Storage → Create Database"
    echo "   - Supabase: https://supabase.com → New Project (gratis)"
    echo "   - Neon: https://neon.tech → New Project (gratis)"
    echo ""
    echo "2. Obtén la URL de conexión (Connection String)"
    echo ""
    echo "3. Crea un archivo .env con:"
    echo "   DATABASE_URL=\"postgresql://usuario:password@host:5432/database\""
    echo ""
    echo "4. Ejecuta este script de nuevo:"
    echo "   bash scripts/setup-db.sh"
    echo ""
    echo "📚 Más información en: SETUP_DATABASE.md"
fi

