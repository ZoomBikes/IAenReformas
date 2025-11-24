// Mapeo completo de códigos postales de Madrid a zonas/barrios
export const codigosPostalesMadrid: Record<string, string> = {
  '28001': 'Centro (Sol, Gran Vía)',
  '28002': 'Salamanca',
  '28003': 'Chamberí',
  '28004': 'Argüelles, Moncloa',
  '28005': 'La Latina, Embajadores',
  '28006': 'Chamberí Norte',
  '28007': 'Retiro',
  '28008': 'Moncloa-Aravaca',
  '28009': 'Retiro Este',
  '28010': 'Chamberí',
  '28011': 'Carabanchel',
  '28012': 'Centro Sur',
  '28013': 'Centro',
  '28014': 'Retiro',
  '28015': 'Carabanchel',
  '28016': 'Moncloa-Aravaca',
  '28019': 'Carabanchel',
  '28020': 'Tetuán',
  '28021': 'Villaverde',
  '28022': 'Pozuelo de Alarcón',
  '28023': 'Pozuelo de Alarcón',
  '28024': 'Carabanchel',
  '28025': 'Carabanchel',
  '28026': 'Usera',
  '28027': 'Villaverde',
  '28028': 'Chamartín',
  '28030': 'Moratalaz',
  '28031': 'Vallecas',
  '28032': 'Vallecas',
  '28033': 'Hortaleza',
  '28034': 'Fuencarral-El Pardo',
  '28035': 'Latina',
  '28036': 'Chamartín',
  '28037': 'San Blas-Canillejas',
  '28038': 'Villaverde',
  '28039': 'Fuencarral-El Pardo',
  '28040': 'Moncloa-Aravaca',
  '28041': 'Usera',
  '28042': 'Barajas',
  '28043': 'Hortaleza',
  '28044': 'Villa de Vallecas',
  '28045': 'Arganzuela',
  '28046': 'Chamartín',
  '28047': 'Villaverde',
  '28048': 'Fuencarral-El Pardo',
  '28049': 'Moncloa-Aravaca',
  '28050': 'Fuencarral-El Pardo',
  '28051': 'Villaverde',
  '28052': 'Villaverde',
  '28053': 'Villaverde',
  '28054': 'Carabanchel',
  '28055': 'Villaverde',
  '28080': 'Madrid (General)',
}

// Función para obtener zona desde código postal
export function getZonaFromCodigoPostal(cp: string | null | undefined): string {
  if (!cp) return ''
  return codigosPostalesMadrid[cp] || `CP ${cp}`
}

// Función para obtener código postal con zona formateado
export function getCodigoPostalConZona(cp: string | null | undefined): string {
  if (!cp) return ''
  const zona = codigosPostalesMadrid[cp]
  return zona ? `${cp} - ${zona}` : cp
}

// Función para obtener solo la zona (sin código postal)
export function getSoloZona(cp: string | null | undefined): string {
  if (!cp) return ''
  return codigosPostalesMadrid[cp] || ''
}
