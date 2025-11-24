# 📥 Importar CSV de Agentes

## Opción 1: Desde la Interfaz Web (Recomendado)

1. Ve a **Llamadas en Frío** en el menú lateral
2. Click en **"Importar CSV"**
3. Selecciona el archivo: `agentes_madrid copia.csv`
4. El sistema importará automáticamente todos los contactos

## Opción 2: Script Node.js

Si prefieres importar desde la terminal:

```bash
# Asegúrate de tener el archivo en la ruta correcta
# El script buscará en: ~/Desktop/reformas/AGENTES EN MADRID/agentes_madrid copia.csv

# Ejecutar el script
npx ts-node scripts/importar-csv-agentes.ts
```

## Formato CSV Esperado

El CSV debe tener estas columnas:
- `name` - Nombre del agente
- `agency` - Nombre de la agencia
- `address` - Dirección completa
- `profile_url` - URL del perfil (opcional)
- `phone` - Teléfono de contacto

## Funcionalidades Automáticas

✅ **Extracción de código postal** - Se extrae automáticamente de la dirección
✅ **Limpieza de teléfonos** - Se eliminan espacios y caracteres especiales
✅ **Detección de duplicados** - No se importan contactos con el mismo teléfono
✅ **Mapeo inteligente** - Reconoce diferentes formatos de columnas

## Después de Importar

Una vez importado, podrás:
- Filtrar por código postal
- Filtrar por agencia
- Registrar llamadas con timestamp oculto
- Ver métricas avanzadas en el dashboard
- Analizar mejores horas para llamar (datos ocultos)

