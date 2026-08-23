// ── Cliente ARCA vía AfipSDK ─────────────────────────────────────────────
// Mismo patrón ya usado y funcionando en delphsoft/facturafacil-mvp-web para
// WSFE (facturación electrónica): AfipSDK expone dos endpoints genéricos,
// /afip/auth (arma el Ticket de Acceso — reemplaza al WSAA manual) y
// /afip/requests (llama al método SOAP del web service indicado por `wsid`).
//
// ⚠️ ESTADO DE VERIFICACIÓN — leer antes de usar en producción:
// El patrón getTA()/afipRequest() en sí está probado (es el que ya emite
// facturas reales en facturafacil-mvp-web con wsid:'wsfe'). Lo que NO pudimos
// confirmar en este entorno es si AfipSDK soporta wsid:'wsctg' / 'wscpe'
// (Carta de Porte de Granos) — el acceso a docs.afipsdk.com y afipsdk.com
// está bloqueado por el proxy de red de este entorno de desarrollo, así que
// no hay forma de chequear la lista de web services soportados contra su
// documentación real. Antes de emitir un documento real:
//   1. Probar getTA(cuit, 'wscpe', ...) en environment:'dev' (homologación).
//   2. Si devuelve un error tipo "wsid no soportado", habrá que sumar el
//      alta del servicio en AfipSDK (contactar su soporte) o migrar estos
//      dos métodos a un cliente WSAA+SOAP directo contra ARCA.
// No asumas que esto funciona en producción sin haber hecho ese primer
// llamado de prueba.

const AFIPSDK_BASE = 'https://app.afipsdk.com/api/v1'

function env() {
  const e = process.env.AFIPSDK_ENV || 'prod'
  if (e === 'production') return 'prod'
  if (e === 'development' || e === 'homologacion') return 'dev'
  return e
}

// Paso 1: Ticket de Acceso (Token + Sign) para un web service (`wsid`) dado.
async function getTA(cuit, wsid, accessToken) {
  const body = { environment: env(), tax_id: cuit, wsid }
  if (process.env.AFIP_CERT) body.cert = process.env.AFIP_CERT
  if (process.env.AFIP_KEY) body.key = process.env.AFIP_KEY

  const res = await fetch(`${AFIPSDK_BASE}/afip/auth`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${accessToken}` },
    body: JSON.stringify(body),
  })
  const data = await res.json()
  if (!res.ok) {
    throw new Error(data?.message || `Auth ${wsid} error ${res.status}: ${JSON.stringify(data).slice(0, 300)}`)
  }
  return { token: data.token, sign: data.sign }
}

// Paso 2: invocar el método SOAP real (ej. "solicitarCTG") con Token+Sign.
async function afipRequest(wsid, method, params, accessToken) {
  const res = await fetch(`${AFIPSDK_BASE}/afip/requests`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${accessToken}` },
    body: JSON.stringify({ environment: env(), wsid, method, params }),
  })
  const data = await res.json()
  if (!res.ok) {
    const msg = data?.data_errors ? JSON.stringify(data.data_errors) : (data?.message || `HTTP ${res.status}`)
    throw new Error(msg)
  }
  return data
}

// Credenciales del operador. Fase actual: single-tenant vía variables de
// entorno del backend (AFIPSDK_ACCESS_TOKEN + AFIPSDK_CUIT), igual que hace
// hoy facturafacil-mvp-web para la cuenta principal. Si en el futuro esto
// necesita ser multi-operador, hay que sumar una tabla en Supabase (como
// `ff_usuarios` en facturafacil) que guarde el token/CUIT por operador en
// vez de leerlo de env vars globales.
function credencialesOperador() {
  const accessToken = process.env.AFIPSDK_ACCESS_TOKEN
  const cuit = (process.env.AFIPSDK_CUIT || '').replace(/[-\s]/g, '')
  if (!accessToken) throw new Error('Falta configurar AFIPSDK_ACCESS_TOKEN en el backend')
  if (!cuit) throw new Error('Falta configurar AFIPSDK_CUIT en el backend')
  return { accessToken, cuit }
}

module.exports = { getTA, afipRequest, credencialesOperador, AFIPSDK_BASE, env }
