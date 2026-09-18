"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { granoLabel, locLabel } from "@/lib/catalog";
import { actorByCuit, pesoNeto, useCpe } from "@/lib/store";
import { STATUS_LABEL, type CpeDoc, type CpeStatus } from "@/lib/types";

const TONE: Record<CpeStatus, "ok" | "warn" | "brand" | "neutral"> = {
  borrador: "neutral",
  autorizada: "brand",
  en_viaje: "brand",
  arribada: "warn",
  confirmada: "ok",
  desviada: "warn",
  regreso_origen: "warn",
  anulada: "neutral",
  rechazada: "neutral",
};

export function DashboardView() {
  const docs = useCpe((s) => s.docs);
  const setView = useCpe((s) => s.setView);
  const sucursal = useCpe((s) => s.sucursal);
  const ultimoOrden = useCpe((s) => s.ultimoOrden);
  const curso = docs.filter((d) => ["autorizada", "en_viaje", "arribada", "desviada"].includes(d.status));
  const tn = docs.reduce((s, d) => s + pesoNeto(d.pesoBruto, d.pesoTara), 0) / 1000;
  const conf = docs.filter((d) => d.status === "confirmada").length;
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <Kpi label="En circuito" value={String(curso.length)} sub="viaje / arribo / desvío" />
        <Kpi label="CPE" value={String(docs.length)} sub={`sucursal ${sucursal} · orden ${ultimoOrden}`} />
        <Kpi label="Toneladas" value={tn.toFixed(1)} sub="neto origen" />
        <Kpi label="Confirmadas" value={String(conf)} sub="cierre definitivo" />
      </div>
      <Button onClick={() => setView("cpe")}>Nueva CPE automotor</Button>
      <Card title="Últimas cartas de porte">
        <Tabla docs={docs.slice(0, 8)} />
      </Card>
    </div>
  );
}

export function HistorialView() {
  const docs = useCpe((s) => s.docs);
  const [q, setQ] = useState("");
  const [st, setSt] = useState("all");
  const [open, setOpen] = useState<CpeDoc | null>(null);
  const rows = docs.filter((d) => {
    if (st !== "all" && d.status !== st) return false;
    const hay = `${d.nroCtg} ${d.nroCpe} ${d.dominio} ${d.cuitSolicitante} ${granoLabel(d.codGrano)}`.toLowerCase();
    return hay.includes(q.toLowerCase());
  });
  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2">
        <Input className="max-w-xs" placeholder="CTG, CPE, dominio, CUIT…" value={q} onChange={(e) => setQ(e.target.value)} />
        <Select value={st} onChange={(e) => setSt(e.target.value)}>
          <option value="all">Todos los estados</option>
          {Object.entries(STATUS_LABEL).map(([k, v]) => (
            <option key={k} value={k}>
              {v}
            </option>
          ))}
        </Select>
      </div>
      <Card>
        <Tabla docs={rows} onOpen={setOpen} />
      </Card>
      <ViajeDialog doc={open} onClose={() => setOpen(null)} />
    </div>
  );
}

export function ViajeDialog({ doc, onClose }: { doc: CpeDoc | null; onClose: () => void }) {
  const arribo = useCpe((s) => s.arribo);
  const confirmar = useCpe((s) => s.confirmar);
  const anular = useCpe((s) => s.anular);
  const rechazar = useCpe((s) => s.rechazar);
  const regresoOrigen = useCpe((s) => s.regresoOrigen);
  const desviar = useCpe((s) => s.desviar);
  const actores = useCpe((s) => s.actores);
  const [bruto, setBruto] = useState("");
  const [tara, setTara] = useState("");
  const [motivo, setMotivo] = useState("");
  const acopios = actores.filter((a) => a.kind === "acopio");
  if (!doc) return null;
  const netoO = pesoNeto(doc.pesoBruto, doc.pesoTara);
  const netoD = doc.pesoBrutoDestino != null ? pesoNeto(doc.pesoBrutoDestino, doc.pesoTaraDestino || 0) : null;
  const merma = netoD != null ? netoO - netoD : null;
  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent title={`CPE ${doc.nroCpe}`}>
        <div className="max-h-[70vh] space-y-3 overflow-y-auto text-sm">
          <p className="font-mono text-xs">CTG {doc.nroCtg} · tipo {doc.tipoCpe} · suc {doc.sucursal} · orden {doc.nroOrden}</p>
          <p>
            {granoLabel(doc.codGrano)} {doc.cosecha} · {netoO.toLocaleString("es-AR")} kg neto
          </p>
          <p className="text-muted-fg">
            {locLabel(doc.origenLoc)} → {locLabel(doc.destinoLoc)} planta {doc.destinoPlanta || "campo"}
          </p>
          <p className="text-muted-fg">
            {doc.dominio} {doc.acoplado && `+ ${doc.acoplado}`} · chofer {doc.cuitChofer}
          </p>
          {merma != null ? (
            <p className={merma > 0 ? "text-warn" : "text-ok"}>
              Destino {netoD?.toLocaleString("es-AR")} kg · merma {merma.toLocaleString("es-AR")} kg
            </p>
          ) : null}
          <div className="flex flex-wrap gap-2">
            <a className="text-xs font-semibold text-primary underline" href={`/constancia/${doc.id}`} target="_blank">
              Constancia / QR
            </a>
            <a
              className="text-xs font-semibold text-primary underline"
              href={`https://wa.me/?text=${encodeURIComponent(`CPE ${doc.nroCpe} CTG ${doc.nroCtg} ${granoLabel(doc.codGrano)} ${doc.dominio} destino planta ${doc.destinoPlanta}`)}`}
              target="_blank"
              rel="noreferrer"
            >
              WhatsApp
            </a>
          </div>
          {["en_viaje", "autorizada", "desviada"].includes(doc.status) ? (
            <>
              <p className="text-xs font-semibold">Confirmar arribo (bruto y tara destino)</p>
              <div className="grid grid-cols-2 gap-2">
                <Input placeholder="Bruto destino" value={bruto} onChange={(e) => setBruto(e.target.value)} />
                <Input placeholder="Tara destino" value={tara} onChange={(e) => setTara(e.target.value)} />
              </div>
              <Button
                onClick={() => {
                  arribo(doc.id, Number(bruto) || doc.pesoBruto, Number(tara) || doc.pesoTara);
                  onClose();
                }}
              >
                Registrar arribo
              </Button>
              <Select
                defaultValue=""
                onChange={(e) => {
                  const a = acopios.find((x) => x.cuit === e.target.value);
                  if (!a) return;
                  desviar(doc.id, {
                    cuitDestino: a.cuit,
                    cuitDestinatario: a.cuit,
                    destinoProv: a.provincia,
                    destinoLoc: a.localidad,
                    destinoPlanta: a.planta ?? null,
                    destinoCampo: false,
                  });
                  onClose();
                }}
              >
                <option value="" disabled>
                  Desviar a otra planta…
                </option>
                {acopios.map((a) => (
                  <option key={a.id} value={a.cuit}>
                    {a.razon} · planta {a.planta}
                  </option>
                ))}
              </Select>
              <Button variant="outline" onClick={() => { regresoOrigen(doc.id); onClose(); }}>
                Regreso a origen
              </Button>
            </>
          ) : null}
          {doc.status === "arribada" ? (
            <Button onClick={() => { confirmar(doc.id); onClose(); }}>Confirmación definitiva</Button>
          ) : null}
          <Input placeholder="Motivo anulación / rechazo" value={motivo} onChange={(e) => setMotivo(e.target.value)} />
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => { anular(doc.id, motivo || "Anulada"); onClose(); }}>
              Anular
            </Button>
            <Button variant="outline" onClick={() => { rechazar(doc.id, motivo || "Rechazo planta"); onClose(); }}>
              Rechazar
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function Tabla({ docs, onOpen }: { docs: CpeDoc[]; onOpen?: (d: CpeDoc) => void }) {
  const actores = useCpe((s) => s.actores);
  if (!docs.length) return <p className="p-6 text-sm text-muted-fg">Sin CPE.</p>;
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="text-left text-xs text-muted-fg">
            <th className="px-3 py-2">CPE / CTG</th>
            <th className="px-3 py-2">Grano</th>
            <th className="px-3 py-2">Kg neto</th>
            <th className="px-3 py-2">Destino</th>
            <th className="px-3 py-2">Estado</th>
          </tr>
        </thead>
        <tbody>
          {docs.map((d) => (
            <tr key={d.id} className="border-t border-border">
              <td className="px-3 py-2 font-mono text-xs">
                <button type="button" className="text-primary" onClick={() => onOpen?.(d)}>
                  {d.nroCpe}
                </button>
                <div className="text-[10px] text-muted-fg">{d.nroCtg}</div>
              </td>
              <td className="px-3 py-2">
                {granoLabel(d.codGrano)}
                <div className="text-xs text-muted-fg">{actorByCuit(actores, d.cuitSolicitante)?.razon}</div>
              </td>
              <td className="px-3 py-2 tabular-nums">{pesoNeto(d.pesoBruto, d.pesoTara).toLocaleString("es-AR")}</td>
              <td className="px-3 py-2 text-xs">{locLabel(d.destinoLoc)}</td>
              <td className="px-3 py-2">
                <Badge tone={TONE[d.status]}>{STATUS_LABEL[d.status]}</Badge>
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
