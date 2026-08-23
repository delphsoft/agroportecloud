# Backend ARCA (WSCPE) — `api/`

Funciones serverless de Vercel (Node, zero-config — no requieren Next.js ni
un `vercel.json` propio; Vercel las detecta solas por vivir en `/api`).

## Qué hace cada endpoint

| Endpoint | Qué hace | Estado |
|---|---|---|
| `POST /api/cpe-solicitar` | Emite una CPE real contra ARCA (WSCPE), vía AfipSDK | Patrón probado, **parámetros sin verificar contra el WSDL** |
| `POST /api/cpe-anular` | Anula una CPE | Idem |
| `POST /api/cpe-contingencia` | Declara Contingencia sobre una CPE | Idem |
| `POST /api/ctg-solicitar` | — | Devuelve 409 a propósito: el CTG ya no se pide por separado desde RG 5017/2021, es parte de la respuesta de `cpe-solicitar` |
| `POST /api/sisa-estado` | — | Devuelve 501 a propósito: no hay canal automatizado confirmado para consultar "planta activa" SISA por CUIT |

## Antes de usar esto en homologación o producción

1. **Conseguí un certificado digital de ARCA** para el servicio WSCPE de la
   CUIT que va a emitir (Administrador de Relaciones de Clave Fiscal en
   afip.gob.ar/arca.gob.ar). Sin esto no hay integración real posible.
2. **Cargá las variables de entorno** en Vercel (Project Settings →
   Environment Variables), mismos nombres que ya usa
   `delphsoft/facturafacil-mvp-web` para no inventar una convención nueva:
   - `AFIPSDK_ACCESS_TOKEN` — tu token de cuenta de [AfipSDK](https://afipsdk.com).
   - `AFIPSDK_CUIT` — CUIT del operador que emite.
   - `AFIP_CERT` / `AFIP_KEY` — certificado y clave privada (PEM), si tu
     cuenta de AfipSDK los requiere en cada request en vez de tenerlos
     precargados del lado de ellos.
   - `AFIPSDK_ENV` — `dev` (homologación) mientras probás, `prod` recién
     cuando confirmes que todo funciona.
3. **Confirmá que AfipSDK soporta `wsid:'wscpe'`.** No pudimos verificar esto
   contra su documentación (sin acceso a internet en el entorno donde se
   escribió este código). Hacé una prueba manual primero:
   ```bash
   curl -X POST https://app.afipsdk.com/api/v1/afip/auth \
     -H "Authorization: Bearer $AFIPSDK_ACCESS_TOKEN" \
     -H "Content-Type: application/json" \
     -d '{"environment":"dev","tax_id":"'"$AFIPSDK_CUIT"'","wsid":"wscpe"}'
   ```
   Si devuelve `token`/`sign`, el wsid existe y podés seguir. Si devuelve un
   error de "wsid no soportado" o similar, contactá soporte de AfipSDK para
   que lo habiliten, o hay que migrar `api/_lib/arca.js` a un cliente
   WSAA+SOAP directo contra ARCA (más trabajo, pero no depende de que un
   tercero lo soporte).
4. **Verificá el nombre exacto de los campos** de `params` en
   `cpe-solicitar.js` contra el "Manual para el desarrollador — WSCPE"
   vigente de arca.gob.ar. Los nombres actuales son una reconstrucción de
   memoria, marcada en el propio archivo. El primer error que devuelva ARCA
   en homologación normalmente nombra el campo exacto que está mal — es más
   rápido ajustar desde ahí que adivinar de antemano.
5. Recién ahí, en el frontend (`agro_carta_porte_v3.html` → Configuración),
   cargá la URL del deploy de Vercel en "URL backend ARCA" para salir del
   modo offline/demo.

## Por qué no hay integración real de SISA

No existe (o no pudimos confirmar que exista) un web service público y
documentado para consultar "¿esta planta está activa en SISA?" por CUIT de
un tercero — es un registro nuevo de la RG Conjunta 5821/2026, no forma
parte del padrón general de ARCA. Mientras eso no se confirme (soporte de
AfipSDK, o automatizar el portal SISA con clave fiscal como ya hace
`facturafacil-mvp-web` para CCMA), el sistema sigue usando la
autodeclaración manual en Configuración — que es real en el sentido de que
efectivamente bloquea la emisión si no está marcada, aunque no consulte a
ARCA en vivo.
