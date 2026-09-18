import { create } from "zustand";
import { SEED_ACTORES, SEED_CAMIONES, seedCpes } from "@/lib/seed";
import type { Actor, Camion, CpeDoc, CpeStatus } from "@/lib/types";
import { cleanCuit, pesoNeto } from "@/lib/types";

export type View =
  | "dashboard"
  | "cpe"
  | "viajes"
  | "destinatario"
  | "transportista"
  | "corredor"
  | "inbox"
  | "padrones"
  | "config";

type State = {
  demo: boolean;
  view: View;
  inboxCuit: string;
  clientCuit: string;
  clientRazon: string;
  sucursal: number;
  ultimoOrden: number;
  actores: Actor[];
  camiones: Camion[];
  docs: CpeDoc[];
  lastError: string;
  viajeStatus: string;
  setView: (v: View) => void;
  setViajeStatus: (s: string) => void;
  setDemo: (on: boolean) => void;
  setInboxCuit: (c: string) => void;
  setClient: (cuit: string, razon: string, sucursal: number) => void;
  upsertActor: (a: Actor) => void;
  removeActor: (id: string) => void;
  upsertCamion: (c: Camion) => void;
  emitir: (partial: Omit<CpeDoc, "id" | "nroCtg" | "nroCpe" | "nroOrden" | "status" | "createdAt" | "vence" | "pesoBrutoDestino" | "pesoTaraDestino" | "sucursal" | "tipoCpe">) => CpeDoc;
  arribo: (id: string, bruto: number, tara: number, obs?: string) => void;
  confirmar: (id: string) => void;
  desviar: (id: string, dest: Pick<CpeDoc, "cuitDestino" | "cuitDestinatario" | "destinoProv" | "destinoLoc" | "destinoPlanta" | "destinoCampo">) => void;
  anular: (id: string, motivo: string) => void;
  rechazar: (id: string, motivo: string) => void;
  regresoOrigen: (id: string) => void;
};

const KEY = "ag_cpe_v5";

function load(): Partial<State> {
  if (typeof window === "undefined") return {};
  try {
    return JSON.parse(localStorage.getItem(KEY) || "{}");
  } catch {
    return {};
  }
}

function snap(s: State) {
  const { demo, inboxCuit, clientCuit, clientRazon, sucursal, ultimoOrden, actores, camiones, docs } = s;
  if (typeof window !== "undefined") {
    localStorage.setItem(KEY, JSON.stringify({ demo, inboxCuit, clientCuit, clientRazon, sucursal, ultimoOrden, actores, camiones, docs }));
  }
}

function ctg() {
  return "94" + String(1228000000 + (Date.now() % 900000)).slice(-10);
}

const saved = typeof window !== "undefined" ? load() : {};
const seedDocs = seedCpes();

export const useCpe = create<State>((set, get) => ({
  demo: saved.demo ?? true,
  view: "dashboard",
  inboxCuit: saved.inboxCuit ?? "",
  clientCuit: saved.clientCuit ?? "",
  clientRazon: saved.clientRazon ?? "",
  sucursal: saved.sucursal ?? 1,
  ultimoOrden: saved.ultimoOrden ?? Math.max(...seedDocs.map((d) => d.nroOrden), 821),
  actores: saved.actores?.length ? saved.actores : SEED_ACTORES,
  camiones: saved.camiones?.length ? saved.camiones : SEED_CAMIONES,
  docs: saved.docs?.length ? saved.docs : seedDocs,
  lastError: "",
  viajeStatus: "all",
  setView: (view) => set({ view }),
  setViajeStatus: (viajeStatus) => set({ viajeStatus }),
  setInboxCuit: (inboxCuit) => {
    set({ inboxCuit: cleanCuit(inboxCuit) });
    snap(get());
  },
  setDemo: (demo) => {
    if (demo) {
      set({ demo, docs: seedCpes(), actores: SEED_ACTORES, camiones: SEED_CAMIONES });
    } else {
      set({ demo, docs: get().docs.filter((d) => !d.id.startsWith("cpe-")) });
    }
    snap(get());
  },
  setClient: (clientCuit, clientRazon, sucursal) => {
    set({ clientCuit: cleanCuit(clientCuit), clientRazon, sucursal: sucursal || 1 });
    snap(get());
  },
  upsertActor: (a) => {
    const actores = get().actores.some((x) => x.id === a.id)
      ? get().actores.map((x) => (x.id === a.id ? a : x))
      : [a, ...get().actores];
    set({ actores });
    snap(get());
  },
  removeActor: (id) => {
    set({ actores: get().actores.filter((a) => a.id !== id) });
    snap(get());
  },
  upsertCamion: (c) => {
    const camiones = get().camiones.some((x) => x.id === c.id)
      ? get().camiones.map((x) => (x.id === c.id ? c : x))
      : [c, ...get().camiones];
    set({ camiones });
    snap(get());
  },
  emitir: (partial) => {
    const orden = get().ultimoOrden + 1;
    const suc = get().sucursal;
    const solicitante = cleanCuit(get().clientCuit) || partial.cuitSolicitante;
    const doc: CpeDoc = {
      ...partial,
      id: `cpe-${Date.now()}`,
      tipoCpe: 74,
      sucursal: suc,
      nroOrden: orden,
      nroCtg: ctg(),
      nroCpe: `${String(suc).padStart(5, "0")}-${String(orden).padStart(8, "0")}`,
      status: "en_viaje",
      cuitSolicitante: solicitante,
      createdAt: new Date().toISOString().slice(0, 10),
      vence: new Date(Date.now() + 3 * 864e5).toISOString().slice(0, 10),
      pesoBrutoDestino: null,
      pesoTaraDestino: null,
    };
    set({ docs: [doc, ...get().docs], ultimoOrden: orden });
    snap(get());
    return doc;
  },
  arribo: (id, bruto, tara, obs) => {
    set({
      docs: get().docs.map((d) =>
        d.id === id
          ? { ...d, status: "arribada" as CpeStatus, pesoBrutoDestino: bruto, pesoTaraDestino: tara, observaciones: obs || d.observaciones }
          : d,
      ),
    });
    snap(get());
  },
  confirmar: (id) => {
    set({ docs: get().docs.map((d) => (d.id === id ? { ...d, status: "confirmada" as CpeStatus } : d)) });
    snap(get());
  },
  desviar: (id, dest) => {
    set({
      docs: get().docs.map((d) => (d.id === id ? { ...d, status: "desviada" as CpeStatus, ...dest } : d)),
    });
    snap(get());
  },
  anular: (id, motivo) => {
    set({ docs: get().docs.map((d) => (d.id === id ? { ...d, status: "anulada" as CpeStatus, observaciones: motivo } : d)) });
    snap(get());
  },
  rechazar: (id, motivo) => {
    set({ docs: get().docs.map((d) => (d.id === id ? { ...d, status: "rechazada" as CpeStatus, observaciones: motivo } : d)) });
    snap(get());
  },
  regresoOrigen: (id) => {
    set({ docs: get().docs.map((d) => (d.id === id ? { ...d, status: "regreso_origen" as CpeStatus } : d)) });
    snap(get());
  },
}));

export function actorByCuit(actores: Actor[], cuit: string) {
  const c = cleanCuit(cuit);
  return actores.find((a) => cleanCuit(a.cuit) === c);
}

export { pesoNeto };
