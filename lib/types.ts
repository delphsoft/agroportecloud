export type CpeStatus =
  | "borrador"
  | "autorizada"
  | "en_viaje"
  | "arribada"
  | "confirmada"
  | "desviada"
  | "regreso_origen"
  | "anulada"
  | "rechazada";

export type ActorKind = "productor" | "acopio" | "transportista" | "corredor" | "chofer";

export type Actor = {
  id: string;
  kind: ActorKind;
  razon: string;
  cuit: string;
  provincia: number;
  localidad: number;
  planta?: number;
  plantaNombre?: string;
  licencia?: string;
};

export type Camion = {
  id: string;
  dominio: string;
  acoplado: string;
  cuitTransportista: string;
};

export type CpeDoc = {
  id: string;
  tipoCpe: 74 | 75 | 274;
  sucursal: number;
  nroOrden: number;
  nroCtg: string;
  nroCpe: string;
  status: CpeStatus;
  /** origen */
  esProductor: boolean;
  cuitSolicitante: string;
  origenProv: number;
  origenLoc: number;
  origenPlanta: number | null;
  /** destino */
  cuitDestino: string;
  cuitDestinatario: string;
  destinoCampo: boolean;
  destinoProv: number;
  destinoLoc: number;
  destinoPlanta: number | null;
  /** carga — WSCPE: codGrano, cosecha, bruto, tara */
  codGrano: number;
  cosecha: number;
  pesoBruto: number;
  pesoTara: number;
  /** transporte */
  cuitTransportista: string;
  dominio: string;
  acoplado: string;
  cuitChofer: string;
  choferNombre: string;
  fechaHoraPartida: string;
  km: number;
  fumigada: boolean;
  tarifa: number;
  cuitPagadorFlete: string;
  codigoTurno: string;
  /** cadena RG 5017 */
  cuitRemitenteComercial1: string;
  cuitCorredor1: string;
  cuitRemitenteComercial2: string;
  cuitCorredor2: string;
  cuitEntregador: string;
  cuitRecibidor: string;
  retiroProductor: boolean;
  certificadoCoe: string;
  observaciones: string;
  /** confirmación destino */
  pesoBrutoDestino: number | null;
  pesoTaraDestino: number | null;
  createdAt: string;
  vence: string;
};

export function pesoNeto(bruto: number, tara: number) {
  return Math.max(0, (bruto || 0) - (tara || 0));
}

export function fmtCuit(c: string) {
  const d = c.replace(/\D/g, "");
  if (d.length !== 11) return c;
  return `${d.slice(0, 2)}-${d.slice(2, 10)}-${d.slice(10)}`;
}

export function cleanCuit(c: string) {
  return c.replace(/\D/g, "");
}

export const STATUS_LABEL: Record<CpeStatus, string> = {
  borrador: "Borrador",
  autorizada: "Autorizada",
  en_viaje: "En viaje",
  arribada: "Arribada",
  confirmada: "Confirmada",
  desviada: "Desviada",
  regreso_origen: "Regreso origen",
  anulada: "Anulada",
  rechazada: "Rechazada",
};
