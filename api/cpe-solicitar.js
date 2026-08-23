// ── POST /api/cpe-solicitar ──────────────────────────────────────────────
// Emisión real de Carta de Porte Electrónica de Granos vía WSCPE (ARCA),
// proxeado a través de AfipSDK con el mismo patrón que ya usa
// facturafacil-mvp-web para WSFE (ver api/_lib/arca.js).
//
// ⚠️ LEER ANTES DE USAR EN HOMOLOGACIÓN/PRODUCCIÓN:
// El servicio vigente desde la RG 5017/2021 es WSCPE, no WSCTG (que es el
// servicio anterior, en desuso desde 2021). WSCPE genera el CTG como parte
// de la misma solicitud — por eso este endpoint devuelve `numeroCTG` junto
// con `numeroCPE`, y por eso NO existe un "cpe-solicitar-ctg-aparte": pedirlo
// como documento independiente sería replicar el modelo pre-2021, que es
// exactamente el gap que señalamos en la auditoría contra la RG 5821/2026.
//
// El nombre del método SOAP (`solicitarCPEAutomotor` / `solicitarCPEFerroviario`)
// y la forma general de los parámetros están reconstruidos de memoria a
// partir del manual público de WSCPE de ARCA — NO se verificaron acá campo
// por campo contra el WSDL vigente (sin acceso a internet en este entorno
// para bajar el manual/WSDL actualizado). Antes de la primera emisión real:
//   1. Descargar el "Manual para el desarrollador — WSCPE" vigente de arca.gob.ar.
//   2. Confirmar nombre exacto del método y de cada campo de `params` abajo.
//   3. Probar primero con environment:'dev' (homologación) — un error de ARCA
//      indica el campo exacto que está mal, así que ajustar desde ahí es rápido.
//   4. Recién después habilitar AFIPSDK_ENV=prod.

const { getTA, afipRequest, credencialesOperador } = require('./_lib/arca')

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  let body
  try { body = req.body && typeof req.body === 'object' ? req.body : JSON.parse(req.body || '{}') }
  catch { return res.status(400).json({ error: 'JSON inválido' }) }

  const {
    modo_transporte,           // 'Automotor' | 'Ferroviario'
    regimen,                   // 'Grano' | 'CPEDG'
    especie, cosecha, tipo_grano,
    cuit_remitente, razon_social_remitente,
    cuit_destinatario, razon_social_destinatario,
    localidad_productor, localidad_destino, establecimiento, planta_destino,
    cuit_transportista, dominio_vehiculo, dominio_acoplado,
    configuracion_vehicular,
    peso_bruto_declarado, peso_tara, peso_neto,
    humedad, porcentaje_zaranda,
    fecha_hora_partida, km_a_recorrer,
  } = body

  if (!cuit_remitente || !cuit_destinatario || !peso_bruto_declarado || !modo_transporte) {
    return res.status(400).json({ error: 'Faltan campos obligatorios (remitente, destinatario, peso bruto, modo de transporte)' })
  }

  try {
    const { accessToken, cuit: cuitOperador } = credencialesOperador()

    // Paso 1: Ticket de Acceso para wscpe.
    const { token, sign } = await getTA(cuitOperador, 'wscpe', accessToken)

    // Paso 2: solicitar la CPE. Método distinto según modo de transporte
    // (así lo separa el manual de WSCPE — los datos de tren/vagón difieren
    // de los de patente/acoplado de automotor).
    const method = modo_transporte === 'Ferroviario' ? 'solicitarCPEFerroviario' : 'solicitarCPEAutomotor'

    // ── Bloque de parámetros — VERIFICAR nombres exactos contra el manual (ver arriba) ──
    const params = {
      auth: { token, sign, cuit: cuitOperador },
      solicitud: {
        // Datos comerciales
        cuitRemitenteComercial: cuit_remitente,
        cuitDestinatario: cuit_destinatario,
        // La CPEDG (derivados granarios) es de uso exclusivo entre operadores
        // inscriptos en SISA — el frontend ya obliga a confirmar esto antes
        // de llegar acá; lo repetimos como dato informativo para el registro.
        regimen: regimen === 'CPEDG' ? 'DERIVADOS_GRANARIOS' : 'GRANOS',
        especie,
        cosechaAno: cosecha,
        tipoGrano: tipo_grano,
        // Origen
        localidadOrigen: localidad_productor,
        establecimiento,
        // Destino
        localidadDestino: localidad_destino,
        codigoPlantaDestino: planta_destino,
        // Transporte
        cuitTransportista: cuit_transportista,
        dominioVehiculo: dominio_vehiculo,
        dominioAcoplado: dominio_acoplado || undefined,
        configuracionVehicular: configuracion_vehicular,
        fechaHoraPartida: fecha_hora_partida,
        kmARecorrer: km_a_recorrer,
        // Pesos y calidad
        pesoBrutoKg: peso_bruto_declarado,
        pesoTaraKg: peso_tara,
        pesoNetoKg: peso_neto,
        porcentajeHumedad: humedad || undefined,
        porcentajeZaranda: porcentaje_zaranda || undefined,
      },
    }

    const resultado = await afipRequest('wscpe', method, params, accessToken)

    // La forma exacta de la respuesta también depende del WSDL real — se
    // intenta leer con nombres razonables, pero convendría loguear
    // `resultado` completo la primera vez que esto corra contra homologación
    // para confirmar el shape real y ajustar este mapeo.
    return res.status(200).json({
      numeroCPE: resultado?.numeroComprobante ?? resultado?.numeroCPE ?? null,
      numeroCTG: resultado?.numeroCTG ?? resultado?.CTG ?? null,
      vigenciaHasta: resultado?.fechaVigencia ?? resultado?.vigenciaHasta ?? null,
      raw: resultado,
    })

  } catch (error) {
    console.error('[CPE-SOLICITAR ERROR]', error?.message)
    return res.status(502).json({
      error: error?.message || 'Error al solicitar la CPE contra ARCA',
    })
  }
}
