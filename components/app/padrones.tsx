"use client";
import { useState, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { LOCALIDADES, PROVINCIAS, locLabel } from "@/lib/catalog";
import { useCpe } from "@/lib/store";
import { cleanCuit, fmtCuit, type Actor, type ActorKind } from "@/lib/types";

const KINDS: ActorKind[] = ["productor", "acopio", "transportista", "corredor", "chofer"];

export function PadronesView() {
  const actores = useCpe((s) => s.actores);
  const camiones = useCpe((s) => s.camiones);
  const upsertActor = useCpe((s) => s.upsertActor);
  const upsertCamion = useCpe((s) => s.upsertCamion);
  const removeActor = useCpe((s) => s.removeActor);
  const [kind, setKind] = useState<ActorKind>("productor");

  function addActor(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const a: Actor = {
      id: `a-${Date.now()}`,
      kind,
      razon: String(fd.get("razon")),
      cuit: cleanCuit(String(fd.get("cuit"))),
      provincia: Number(fd.get("provincia")),
      localidad: Number(fd.get("localidad")),
      planta: fd.get("planta") ? Number(fd.get("planta")) : undefined,
      plantaNombre: String(fd.get("plantaNombre") || ""),
      licencia: String(fd.get("licencia") || ""),
    };
    upsertActor(a);
    e.currentTarget.reset();
  }

  function addCamion(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    upsertCamion({
      id: `k-${Date.now()}`,
      dominio: String(fd.get("dominio")).replace(/\s/g, "").toUpperCase(),
      acoplado: String(fd.get("acoplado") || "").replace(/\s/g, "").toUpperCase(),
      cuitTransportista: cleanCuit(String(fd.get("cuitTransportista"))),
    });
    e.currentTarget.reset();
  }

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <div className="rounded-xl border border-border bg-surface p-5">
        <h2 className="mb-3 text-sm font-semibold">Actores (CUIT)</h2>
        <form onSubmit={addActor} className="mb-4 grid gap-2 sm:grid-cols-2">
          <Select value={kind} onChange={(e) => setKind(e.target.value as ActorKind)}>
            {KINDS.map((k) => (
              <option key={k}>{k}</option>
            ))}
          </Select>
          <Input name="razon" placeholder="Razón / nombre" required />
          <Input name="cuit" placeholder="CUIT" required />
          <Select name="provincia" defaultValue="3">
            {PROVINCIAS.map((p) => (
              <option key={p.cod} value={p.cod}>
                {p.label}
              </option>
            ))}
          </Select>
          <Select name="localidad" defaultValue="140588">
            {LOCALIDADES.map((l) => (
              <option key={l.cod} value={l.cod}>
                {l.label}
              </option>
            ))}
          </Select>
          {kind === "acopio" ? <Input name="planta" placeholder="N° planta SISA" /> : null}
          {kind === "chofer" ? <Input name="licencia" placeholder="Licencia" /> : null}
          <Button type="submit" className="sm:col-span-2">
            Agregar
          </Button>
        </form>
        <ul className="space-y-2 text-sm">
          {actores.map((a) => (
            <li key={a.id} className="flex items-center justify-between gap-2 border-b border-border py-1">
              <span>
                <span className="text-[10px] uppercase text-muted-fg">{a.kind}</span>
                <br />
                {a.razon} · {fmtCuit(a.cuit)} · {locLabel(a.localidad)}
                {a.planta ? ` · planta ${a.planta}` : ""}
              </span>
              <button type="button" className="text-xs text-warn" onClick={() => removeActor(a.id)}>
                Quitar
              </button>
            </li>
          ))}
        </ul>
      </div>
      <div className="rounded-xl border border-border bg-surface p-5">
        <h2 className="mb-3 text-sm font-semibold">Camiones / acoplados</h2>
        <form onSubmit={addCamion} className="mb-4 grid gap-2">
          <Input name="dominio" placeholder="Dominio tractor" required />
          <Input name="acoplado" placeholder="Dominio acoplado" />
          <Input name="cuitTransportista" placeholder="CUIT transportista" required />
          <Button type="submit">Agregar</Button>
        </form>
        <ul className="space-y-2 text-sm">
          {camiones.map((c) => (
            <li key={c.id} className="font-mono text-xs">
              {c.dominio} {c.acoplado && `+ ${c.acoplado}`} · {fmtCuit(c.cuitTransportista)}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
