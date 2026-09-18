export const ESPECIES = [
  { id: "soja", label: "Soja" },
  { id: "maiz", label: "Maíz" },
  { id: "trigo", label: "Trigo" },
  { id: "girasol", label: "Girasol" },
  { id: "cebada", label: "Cebada cervecera" },
  { id: "sorgo", label: "Sorgo granífero" },
  { id: "mani", label: "Maní" },
] as const;

export const COSECHAS = ["2025/2026", "2024/2025", "2023/2024"];

export type Role = "productor" | "destinatario" | "transportista" | "corredor";
export type DocKind = "CTG" | "CPE";
export type DocStatus = "pendiente" | "activa" | "en_viaje" | "confirmada" | "desviada" | "anulada" | "vencida";

export type Actor = {
  id: string;
  rol: Role;
  razon: string;
  cuit: string;
  localidad: string;
  planta?: string;
};

export type Viaje = {
  id: string;
  kind: DocKind;
  nroCtg: string;
  nroCpe: string | null;
  especie: string;
  cosecha: string;
  grado: string;
  pesoBruto: number;
  tara: number;
  pesoNeto: number;
  humedad: number;
  km: number;
  remitente: Actor;
  destinatario: Actor;
  transportista: Actor;
  corredor: Actor | null;
  patente: string;
  acoplado: string;
  chofer: string;
  origen: string;
  destino: string;
  plantaDestino: string;
  partida: string;
  vence: string;
  status: DocStatus;
  pesoConfirmado: number | null;
  obs: string;
  cadena: string;
  createdAt: string;
};

export const PRODUCTORES: Actor[] = [
  { id: "durazno", rol: "productor", razon: "Estancia El Durazno", cuit: "20-27384910-3", localidad: "Río Cuarto, Córdoba" },
  { id: "punilla", rol: "productor", razon: "Campos Punilla SA", cuit: "30-71239876-4", localidad: "Villa María, Córdoba" },
];

export const DESTINOS: Actor[] = [
  { id: "acopio", rol: "destinatario", razon: "Acopio Sur SRL", cuit: "30-70881223-9", localidad: "Tancacha, Córdoba", planta: "Planta 2 — Tancacha" },
  { id: "aceitera", rol: "destinatario", razon: "Aceitera General Deheza", cuit: "30-50143132-2", localidad: "General Deheza, Córdoba", planta: "Planta AGD 1" },
];

export const TRANSPORTES: Actor[] = [
  { id: "valle", rol: "transportista", razon: "Transportes del Valle", cuit: "20-18445566-1", localidad: "Río Cuarto, Córdoba" },
  { id: "pampa", rol: "transportista", razon: "Pampa Logística SA", cuit: "30-71550011-8", localidad: "Marcos Juárez, Córdoba" },
];

export const CORREDORES: Actor[] = [
  { id: "broker", rol: "corredor", razon: "Corredor Punilla", cuit: "20-30112233-5", localidad: "Córdoba capital" },
];

function iso(d: Date) {
  return d.toISOString().slice(0, 10);
}

export function seedViajes(): Viaje[] {
  const hoy = new Date();
  const d = (n: number) => {
    const x = new Date(hoy);
    x.setDate(x.getDate() + n);
    return iso(x);
  };
  const p = PRODUCTORES[0];
  const dest = DESTINOS[0];
  const t = TRANSPORTES[0];
  const c = CORREDORES[0];
  return [
    {
      id: "v-1",
      kind: "CPE",
      nroCtg: "941228110034",
      nroCpe: "00001-00000821",
      especie: "Soja",
      cosecha: "2025/2026",
      grado: "Grado 2",
      pesoBruto: 32500,
      tara: 2100,
      pesoNeto: 30400,
      humedad: 13.2,
      km: 86,
      remitente: p,
      destinatario: dest,
      transportista: t,
      corredor: c,
      patente: "AD 384 ZZ",
      acoplado: "AC 991 KK",
      chofer: "Héctor Ríos",
      origen: "Establecimiento El Durazno — Río Cuarto",
      destino: dest.planta || dest.localidad,
      plantaDestino: dest.planta || "",
      partida: d(-1),
      vence: d(2),
      status: "en_viaje",
      pesoConfirmado: null,
      obs: "",
      cadena: "Venta primaria · corredor Punilla",
      createdAt: d(-1),
    },
    {
      id: "v-2",
      kind: "CPE",
      nroCtg: "941228109877",
      nroCpe: "00001-00000818",
      especie: "Maíz",
      cosecha: "2025/2026",
      grado: "Grado 1",
      pesoBruto: 33800,
      tara: 2050,
      pesoNeto: 31750,
      humedad: 14.1,
      km: 112,
      remitente: p,
      destinatario: DESTINOS[1],
      transportista: TRANSPORTES[1],
      corredor: null,
      patente: "AE 102 TT",
      acoplado: "AB 440 HH",
      chofer: "Luis Pereyra",
      origen: "Lote 12 — El Durazno",
      destino: DESTINOS[1].planta || "",
      plantaDestino: DESTINOS[1].planta || "",
      partida: d(-4),
      vence: d(-1),
      status: "confirmada",
      pesoConfirmado: 31680,
      obs: "Merma 70 kg por humedad",
      cadena: "",
      createdAt: d(-4),
    },
    {
      id: "v-3",
      kind: "CTG",
      nroCtg: "941228111002",
      nroCpe: null,
      especie: "Trigo",
      cosecha: "2025/2026",
      grado: "Grado 2",
      pesoBruto: 0,
      tara: 0,
      pesoNeto: 28000,
      humedad: 0,
      km: 64,
      remitente: PRODUCTORES[1],
      destinatario: dest,
      transportista: t,
      corredor: c,
      patente: "AD 384 ZZ",
      acoplado: "",
      chofer: "Héctor Ríos",
      origen: "Campos Punilla — Villa María",
      destino: dest.planta || "",
      plantaDestino: dest.planta || "",
      partida: d(0),
      vence: d(3),
      status: "activa",
      pesoConfirmado: null,
      obs: "Pendiente de emitir CPE",
      cadena: "",
      createdAt: d(0),
    },
  ];
}
