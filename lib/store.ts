import { create } from "zustand";
import {
  CORREDORES,
  DESTINOS,
  PRODUCTORES,
  TRANSPORTES,
  seedViajes,
  type Actor,
  type DocStatus,
  type Role,
  type Viaje,
} from "@/lib/demo";

export type View =
  | "dashboard"
  | "ctg"
  | "cpe"
  | "historial"
  | "destinatario"
  | "transportista"
  | "corredor"
  | "config";

type State = {
  demo: boolean;
  view: View;
  role: Role;
  clientCuit: string;
  clientRazon: string;
  cosecha: string;
  viajes: Viaje[];
  lastError: string;
  setView: (v: View) => void;
  setRole: (r: Role) => void;
  setDemo: (on: boolean) => void;
  setClient: (cuit: string, razon: string) => void;
  setCosecha: (c: string) => void;
  addCtg: (v: Omit<Viaje, "id" | "kind" | "nroCtg" | "nroCpe" | "status" | "createdAt" | "pesoConfirmado">) => Viaje;
  addCpe: (v: Omit<Viaje, "id" | "kind" | "nroCtg" | "nroCpe" | "status" | "createdAt" | "pesoConfirmado"> & { nroCtg?: string }) => Viaje;
  confirmArribo: (id: string, peso: number, obs: string) => void;
  desviar: (id: string, destino: Actor) => void;
  anular: (id: string, motivo: string) => void;
};

const KEY = "ag_cpe_v4";

function load(): Partial<State> {
  if (typeof window === "undefined") return {};
  try {
    return JSON.parse(localStorage.getItem(KEY) || "{}");
  } catch {
    return {};
  }
}

function persist(s: Pick<State, "demo" | "clientCuit" | "clientRazon" | "cosecha" | "viajes" | "role">) {
  if (typeof window === "undefined") return;
  localStorage.setItem(KEY, JSON.stringify(s));
}

function nro(prefix: number, len: number) {
  const n = String(prefix + Math.floor(Math.random() * 8000) + Date.now() % 1000);
  return n.slice(-len).padStart(len, "0");
}

const saved = typeof window !== "undefined" ? load() : {};

export const useCpe = create<State>((set, get) => ({
  demo: saved.demo ?? true,
  view: "dashboard",
  role: saved.role ?? "productor",
  clientCuit: saved.clientCuit ?? "",
  clientRazon: saved.clientRazon ?? "",
  cosecha: saved.cosecha ?? "2025/2026",
  viajes: saved.viajes?.length ? saved.viajes : seedViajes(),
  lastError: "",
  setView: (view) => set({ view }),
  setRole: (role) => {
    set({ role });
    persist(get());
  },
  setDemo: (demo) => {
    set({ demo, viajes: demo ? seedViajes() : get().viajes.filter((v) => !v.id.startsWith("v-")) });
    persist(get());
  },
  setClient: (clientCuit, clientRazon) => {
    set({ clientCuit, clientRazon });
    persist(get());
  },
  setCosecha: (cosecha) => {
    set({ cosecha });
    persist(get());
  },
  addCtg: (input) => {
    const v: Viaje = {
      ...input,
      id: `ctg-${Date.now()}`,
      kind: "CTG",
      nroCtg: "94" + nro(1228000000, 10),
      nroCpe: null,
      status: "activa",
      createdAt: new Date().toISOString().slice(0, 10),
      pesoConfirmado: null,
    };
    set({ viajes: [v, ...get().viajes] });
    persist(get());
    return v;
  },
  addCpe: (input) => {
    const ctg = input.nroCtg || "94" + nro(1228000000, 10);
    const v: Viaje = {
      ...input,
      id: `cpe-${Date.now()}`,
      kind: "CPE",
      nroCtg: ctg,
      nroCpe: "00001-" + nro(800, 8),
      status: "en_viaje",
      createdAt: new Date().toISOString().slice(0, 10),
      pesoConfirmado: null,
    };
    set({ viajes: [v, ...get().viajes] });
    persist(get());
    return v;
  },
  confirmArribo: (id, peso, obs) => {
    set({
      viajes: get().viajes.map((v) =>
        v.id === id ? { ...v, status: "confirmada" as DocStatus, pesoConfirmado: peso, obs } : v,
      ),
    });
    persist(get());
  },
  desviar: (id, destino) => {
    set({
      viajes: get().viajes.map((v) =>
        v.id === id
          ? {
              ...v,
              status: "desviada" as DocStatus,
              destinatario: destino,
              destino: destino.planta || destino.localidad,
              plantaDestino: destino.planta || "",
            }
          : v,
      ),
    });
    persist(get());
  },
  anular: (id, motivo) => {
    set({
      viajes: get().viajes.map((v) => (v.id === id ? { ...v, status: "anulada" as DocStatus, obs: motivo } : v)),
    });
    persist(get());
  },
}));

export const CATALOG = { PRODUCTORES, DESTINOS, TRANSPORTES, CORREDORES };
