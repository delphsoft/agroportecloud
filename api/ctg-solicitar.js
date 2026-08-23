// ── POST /api/ctg-solicitar ──────────────────────────────────────────────
// Devuelve 409 a propósito, con una explicación — no un mock que simula éxito.
//
// El servicio WSCTG (donde el CTG se pedía como documento independiente) es
// el régimen ANTERIOR a la RG 5017/2021. Desde esa resolución, el CTG se
// genera automáticamente como parte de la solicitud de CPE (ver
// cpe-solicitar.js, que devuelve `numeroCTG` en la respuesta). Pedir un CTG
// "suelto" contra ARCA hoy replicaría exactamente el modelo pre-2021 que
// señalamos como gap en la auditoría (frente 3/4: CTG y CPE modelados como
// documentos independientes en vez de que el CTG sea un subproducto de la CPE).
//
// El panel "Nueva CTG" del frontend sigue existiendo como flujo separado en
// modo offline/demo (localStorage) porque cambiar eso es un rediseño de UI,
// no solo de backend — lo dejamos señalado acá en vez de tocarlo sin que lo
// pidas explícitamente.
module.exports = async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })
  return res.status(409).json({
    error: 'CTG_NO_ES_UN_DOCUMENTO_INDEPENDIENTE',
    message: 'Desde la RG 5017/2021 el CTG se genera junto con la CPE (WSCPE), no se solicita por separado (eso era WSCTG, el servicio anterior). Usá /api/cpe-solicitar — la respuesta incluye numeroCTG.',
  })
}
