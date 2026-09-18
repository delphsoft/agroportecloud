"use client";
import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { DESTINOS } from "@/lib/demo";
import { useCpe } from "@/lib/store";
import type { DocStatus, Viaje } from "@/lib/demo";

const TONE: Record<DocStatus, "ok" | "warn" | "brand" | "neutral"> = {
  pendiente: "warn",
  activa: "brand",
  en_viaje: "brand",
  confirmada: "ok",
  desviada: "warn",
  anulada: "neutral",
  vencida: "warn",
};

export function statusLabel(s: DocStatus) {
  return (
    {
      pendiente: "Pendiente",
      activa: "Activa",
      en_viaje: "En viaje",
      confirmada: "Confirmada",
      desviada: "Desviada",
      anulada: "Anulada",
      vencida: "Vencida",
    } as const
  )[s];
}

export function DashboardView() {
  const viajes = useCpe((s) => s.viajes);
  const setView = useCpe((s) => s.setView);
  const activos = viajes.filter((v) => v.status === "en_viaje" || v.status === "activa");
  const tn = viajes.reduce((s, v) => s + v.pesoNeto, 0) / 1000;
  const conf = viajes.filter((v) => v.status === "confirmada").length;
  const pct = viajes.length ? Math.round((conf / viajes.length) * 100) : 0;
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <Kpi label="En curso" value={String(activos.length)} sub="CTG + CPE activas" />
        <Kpi label="CPE emitidas" value={String(viajes.filter((v) => v.kind === "CPE").length)} sub="total" />
        <Kpi label="Toneladas" value={tn.toFixed(1)} sub="peso neto acum." />
        <Kpi label="Confirmadas" value={`${pct}%`} sub={`${conf} con arribo`} />
      </div>
      <div className="flex gap-2">
        <Button onClick={() => setView("cpe")}>Nueva CPE</Button>
        <Button variant="outline" onClick={() => setView("ctg")}>
          Nueva CTG
        </Button>
      </div>
      <Card title="Últimos viajes">
        <Tabla viajes={viajes.slice(0, 8)} compact />
      </Card>
    </div>
  );
}

export function HistorialView() {
  const viajes = useCpe((s) => s.viajes);
  const confirmArribo = useCpe((s) => s.confirmArribo);
  const desviar = useCpe((s) => s.desviar);
  const anular = useCpe((s) => s.anular);
  const [q, setQ] = useState("");
  const [kind, setKind] = useState("all");
  const [open, setOpen] = useState<Viaje | null>(null);
  const [peso, setPeso] = useState("");
  const [obs, setObs] = useState("");
  const rows = viajes.filter((v) => {
    if (kind !== "all" && v.kind !== kind) return false;
    const hay = `${v.nroCtg} ${v.nroCpe} ${v.especie} ${v.remitente.razon} ${v.patente}`.toLowerCase();
    return hay.includes(q.toLowerCase());
  });
  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2">
        <Input placeholder="Buscar CTG, CPE, patente…" value={q} onChange={(e) => setQ(e.target.value)} className="max-w-xs" />
        <Select value={kind} onChange={(e) => setKind(e.target.value)}>
          <option value="all">Todos</option>
          <option value="CTG">CTG</option>
          <option value="CPE">CPE</option>
        </Select>
      </div>
      <Card>
        <Tabla
          viajes={rows}
          onOpen={(v) => {
            setOpen(v);
            setPeso(String(v.pesoNeto));
            setObs(v.obs);
          }}
        />
      </Card>
      <Dialog open={!!open} onOpenChange={() => setOpen(null)}>
        <DialogContent title={open ? `${open.kind} ${open.nroCpe || open.nroCtg}` : ""}>
          {open ? (
            <div className="space-y-3 text-sm">
              <p>
                {open.especie} {open.cosecha} · {open.pesoNeto.toLocaleString("es-AR")} kg
              </p>
              <p className="text-muted-fg">
                {open.origen} → {open.destino}
              </p>
              <p className="text-muted-fg">
                {open.patente} · {open.chofer} · CTG {open.nroCtg}
              </p>
              <div className="flex flex-wrap gap-2">
                <a
                  className="text-xs font-semibold text-primary underline"
                  href={`https://wa.me/?text=${encodeURIComponent(`CTG ${open.nroCtg} · ${open.especie} · ${open.patente} · destino ${open.destino}`)}`}
                  target="_blank"
                  rel="noreferrer"
                >
                  WhatsApp al chofer
                </a>
                <button
                  type="button"
                  className="text-xs font-semibold text-primary underline"
                  onClick={() => window.print()}
                >
                  Imprimir
                </button>
              </div>
              {open.status === "en_viaje" || open.status === "activa" ? (
                <>
                  <Input inputMode="numeric" value={peso} onChange={(e) => setPeso(e.target.value)} placeholder="Peso neto en destino" />
                  <Input value={obs} onChange={(e) => setObs(e.target.value)} placeholder="Observaciones" />
                  <Button
                    onClick={() => {
                      confirmArribo(open.id, Number(peso) || open.pesoNeto, obs);
                      setOpen(null);
                    }}
                  >
                    Confirmar arribo
                  </Button>
                  <Select
                    onChange={(e) => {
                      const d = DESTINOS.find((x) => x.id === e.target.value);
                      if (d) {
                        desviar(open.id, d);
                        setOpen(null);
                      }
                    }}
                    defaultValue=""
                  >
                    <option value="" disabled>
                      Desviar destino…
                    </option>
                    {DESTINOS.map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.razon}
                      </option>
                    ))}
                  </Select>
                  <Button
                    variant="outline"
                    onClick={() => {
                      anular(open.id, obs || "Anulada en demo");
                      setOpen(null);
                    }}
                  >
                    Anular
                  </Button>
                </>
              ) : (
                <Badge tone={TONE[open.status]}>{statusLabel(open.status)}</Badge>
              )}
            </div>
          ) : null}
        </DialogContent>
      </Dialog>
    </div>
  );
}

function Tabla({
  viajes,
  onOpen,
  compact,
}: {
  viajes: Viaje[];
  onOpen?: (v: Viaje) => void;
  compact?: boolean;
}) {
  if (!viajes.length) return <p className="p-6 text-sm text-muted-fg">No hay viajes.</p>;
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="text-left text-xs text-muted-fg">
            <th className="px-3 py-2">Tipo</th>
            <th className="px-3 py-2">Número</th>
            <th className="px-3 py-2">Grano</th>
            {!compact && <th className="px-3 py-2">Patente</th>}
            <th className="px-3 py-2">Kg</th>
            <th className="px-3 py-2">Estado</th>
          </tr>
        </thead>
        <tbody>
          {viajes.map((v) => (
            <tr key={v.id} className="border-t border-border">
              <td className="px-3 py-2">{v.kind}</td>
              <td className="px-3 py-2 font-mono text-xs">
                <button type="button" className="text-primary" onClick={() => onOpen?.(v)}>
                  {v.nroCpe || v.nroCtg}
                </button>
              </td>
              <td className="px-3 py-2">
                {v.especie}
                <div className="text-xs text-muted-fg">{v.remitente.razon}</div>
              </td>
              {!compact && <td className="px-3 py-2">{v.patente}</td>}
              <td className="px-3 py-2 tabular-nums">{v.pesoNeto.toLocaleString("es-AR")}</td>
              <td className="px-3 py-2">
                <Badge tone={TONE[v.status]}>{statusLabel(v.status)}</Badge>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function Card({ title, children }: { title?: string; children: React.ReactNode }) {
  return (
    <div className="overflow-hidden rounded-xl border border-border bg-surface">
      {title ? <div className="border-b border-border px-4 py-3 text-sm font-semibold">{title}</div> : null}
      {children}
    </div>
  );
}

function Kpi({ label, value, sub }: { label: string; value: string; sub: string }) {
  return (
    <div className="rounded-xl border border-border bg-surface p-4">
      <p className="text-xs font-medium uppercase tracking-wide text-muted-fg">{label}</p>
      <p className="mt-1 text-2xl font-semibold tabular-nums">{value}</p>
      <p className="text-xs text-muted-fg">{sub}</p>
    </div>
  );
}
