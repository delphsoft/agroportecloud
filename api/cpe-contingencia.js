// ── POST /api/cpe-contingencia ──────────────────────────────────────────
// Declara Contingencia sobre una CPE (extiende su vigencia). Mismo patrón y
// mismas salvedades que cpe-solicitar.js.
const { getTA, afipRequest, credencialesOperador } = require('./_lib/arca')

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })
  const { numero_cpe, motivo } = req.body || {}
  if (!numero_cpe || !motivo) return res.status(400).json({ error: 'Faltan numero_cpe y motivo' })

  try {
    const { accessToken, cuit } = credencialesOperador()
    const { token, sign } = await getTA(cuit, 'wscpe', accessToken)
    const resultado = await afipRequest('wscpe', 'informarContingencia', {
      auth: { token, sign, cuit },
      numeroComprobante: numero_cpe,
      motivo,
    }, accessToken)
    return res.status(200).json({
      ok: true,
      vigenciaHasta: resultado?.fechaVigencia ?? resultado?.vigenciaHasta ?? null,
      raw: resultado,
    })
  } catch (error) {
    console.error('[CPE-CONTINGENCIA ERROR]', error?.message)
    return res.status(502).json({ error: error?.message || 'Error al declarar contingencia contra ARCA' })
  }
}
