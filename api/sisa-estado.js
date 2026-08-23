// ── POST /api/sisa-estado ────────────────────────────────────────────────
// Consulta de estado de inscripción SISA + planta activa para un CUIT.
//
// ⚠️ NO IMPLEMENTADO CONTRA UN SERVICIO REAL — a propósito.
// No encontramos (ni pudimos verificar: sin acceso a internet hacia
// afip.gob.ar/arca.gob.ar/afipsdk.com en este entorno) un web service público
// y documentado que exponga "¿esta planta está activa en SISA?" para un CUIT
// de un tercero. El padrón general de ARCA (ws_sr_padron_a13, que sí es un
// servicio real y estable) devuelve datos impositivos generales del
// contribuyente — no el detalle de plantas SISA, que es un registro nuevo y
// específico creado por la RG Conjunta 5821/2026.
//
// Devolver acá una respuesta simulada tipo {activo: true} sería exactamente
// el error que estamos evitando en toda esta integración: una pantalla que
// dice "verificado ✓" sin que nadie lo haya verificado contra ARCA de verdad.
//
// Mientras no se confirme un canal real (soporte de AfipSDK, o un scraping
// autenticado del portal SISA con clave fiscal — como ya hace facturafacil-
// mvp-web para CCMA vía automations), el frontend sigue usando la
// autodeclaración manual en Configuración (estado SISA + planta activa
// tildados a mano), que es lo que ya está commiteado y funcionando.
module.exports = async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })
  return res.status(501).json({
    error: 'SISA_LOOKUP_NO_DISPONIBLE',
    message: 'No hay un canal automatizado confirmado para consultar "planta activa" en SISA por CUIT. Verificalo manualmente en el portal SISA de ARCA y cargá el resultado en Configuración — es lo que usa hoy el sistema para bloquear/permitir la emisión.',
  })
}
