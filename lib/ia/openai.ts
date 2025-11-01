// Integración con OpenAI - Modelo más barato (gpt-3.5-turbo)
// Solo para generar explicaciones, NO para cálculos

import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Usar el modelo más barato disponible
const MODEL = 'gpt-3.5-turbo'; // Más barato que gpt-4

/**
 * Genera una explicación breve para un trabajo específico
 * Usa plantillas cuando sea posible para ahorrar tokens
 */
export async function generarExplicacionTrabajo(
  tipoTrabajo: string,
  cantidad: number,
  calidad: string,
  detalles?: Record<string, any>
): Promise<string> {
  // Intentar usar plantilla primero (0 tokens)
  const plantilla = obtenerPlantilla(tipoTrabajo, calidad, detalles);
  if (plantilla) {
    return plantilla;
  }

  // Si no hay plantilla, usar IA con prompt mínimo
  try {
    const response = await openai.chat.completions.create({
      model: MODEL,
      messages: [
        {
          role: 'user',
          content: `Explica brevemente (máx 100 palabras) este trabajo de reforma: ${tipoTrabajo}, ${cantidad}m², calidad ${calidad}.`
        }
      ],
      max_tokens: 150, // Limitar respuesta
      temperature: 0.7,
    });

    return response.choices[0]?.message?.content || '';
  } catch (error) {
    console.error('Error generando explicación con IA:', error);
    return `Trabajo de ${tipoTrabajo} en ${cantidad}m², calidad ${calidad}.`;
  }
}

/**
 * Genera resumen del proyecto completo
 */
export async function generarResumenProyecto(
  tipoObra: string,
  metrosTotales: number,
  trabajos: Array<{ tipo: string; cantidad: number }>
): Promise<string> {
  try {
    const trabajosTexto = trabajos.map(t => `${t.tipo} (${t.cantidad}m²)`).join(', ');
    
    const response = await openai.chat.completions.create({
      model: MODEL,
      messages: [
        {
          role: 'user',
          content: `Resumen profesional (3 párrafos) de reforma: ${tipoObra}, ${metrosTotales}m². Trabajos: ${trabajosTexto}.`
        }
      ],
      max_tokens: 250,
      temperature: 0.7,
    });

    return response.choices[0]?.message?.content || '';
  } catch (error) {
    console.error('Error generando resumen:', error);
    return `Reforma de ${tipoObra} en ${metrosTotales}m².`;
  }
}

/**
 * Plantillas predefinidas (0 tokens)
 */
function obtenerPlantilla(
  tipoTrabajo: string,
  calidad: string,
  detalles?: Record<string, any>
): string | null {
  const plantillas: Record<string, Record<string, string>> = {
    cambio_tarima: {
      basica: `Instalación de tarima flotante básica en ${detalles?.metros || ''} m². Incluye preparación del suelo, autonivelado y rodapiés.`,
      estandar: `Instalación de tarima flotante de calidad estándar en ${detalles?.metros || ''} m². Preparación completa del suelo, autonivelado profesional y rodapiés de madera.`,
      premium: `Instalación de tarima de alta calidad en ${detalles?.metros || ''} m². Preparación exhaustiva del suelo, autonivelado de precisión y rodapiés premium.`
    },
    pintura_paredes: {
      basica: detalles?.necesitaAlisado 
        ? `Pintura de paredes en ${detalles?.metros || ''} m². Incluye alisado previo, imprimación y aplicación de pintura plástica en ${detalles?.numManos || 2} manos.`
        : `Pintura directa sobre ${detalles?.metros || ''} m². Imprimación y aplicación de pintura plástica en ${detalles?.numManos || 2} manos.`,
      estandar: detalles?.necesitaAlisado
        ? `Pintura de paredes estándar en ${detalles?.metros || ''} m². Alisado profesional, imprimación de calidad y pintura plástica en ${detalles?.numManos || 2} manos.`
        : `Pintura estándar sobre ${detalles?.metros || ''} m². Imprimación profesional y pintura de calidad en ${detalles?.numManos || 2} manos.`,
      premium: detalles?.necesitaAlisado
        ? `Pintura premium en ${detalles?.metros || ''} m². Alisado exhaustivo, imprimación de alta calidad y pintura premium en ${detalles?.numManos || 2} manos.`
        : `Pintura premium sobre ${detalles?.metros || ''} m². Imprimación profesional y pintura de alta gama en ${detalles?.numManos || 2} manos.`
    }
  };

  const key = tipoTrabajo.toLowerCase().replace(/\s+/g, '_');
  return plantillas[key]?.[calidad.toLowerCase()] || null;
}

