// ── POST /api/cpe-anular ──────────────────────────────────────────────────
// Anula una CPE ya emitida. Mismo patrón/salvedades que cpe-solicitar.js —
// verificar `method` y `params` contra el manual WSCPE antes de producción.
const { getTA, afipRequest, credencialesOperador } = require('./_lib/arca')

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })
  const { numero_cpe, motivo } = req.body || {}
  if (!numero_cpe || !motivo) return res.status(400).json({ error: 'Faltan numero_cpe y motivo' })

  try {
    const { accessToken, cuit } = credencialesOperador()
    const { token, sign } = await getTA(cuit, 'wscpe', accessToken)
    const resultado = await afipRequest('wscpe', 'anularCPE', {
      auth: { token, sign, cuit },
      numeroComprobante: numero_cpe,
      motivo,
    }, accessToken)
    return res.status(200).json({ ok: true, raw: resultado })
  } catch (error) {
    console.error('[CPE-ANULAR ERROR]', error?.message)
    return res.status(502).json({ error: error?.message || 'Error al anular la CPE contra ARCA' })
  }
}
