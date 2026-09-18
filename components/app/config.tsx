"use client";
import { useState, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { COSECHAS } from "@/lib/demo";
import { useCpe } from "@/lib/store";

export function ConfigView() {
  const clientCuit = useCpe((s) => s.clientCuit);
  const clientRazon = useCpe((s) => s.clientRazon);
  const cosecha = useCpe((s) => s.cosecha);
  const setClient = useCpe((s) => s.setClient);
  const setCosecha = useCpe((s) => s.setCosecha);
  const [cuit, setCuit] = useState(clientCuit);
  const [razon, setRazon] = useState(clientRazon);
  const [ok, setOk] = useState(false);

  function save(e: FormEvent) {
    e.preventDefault();
    setClient(cuit.trim(), razon.trim());
    setOk(true);
  }

  return (
    <form onSubmit={save} className="mx-auto max-w-lg space-y-4 rounded-xl border border-border bg-surface p-5">
      <h2 className="text-base font-semibold">Cliente real</h2>
      <p className="text-sm text-muted-fg">
        El producto ya funciona entero en demo. Cuando tengas el primer productor, acá entra el CUIT. ARCA (certificado
        y punto de planta) se pega después: no bloquea vender ni mostrar el flujo.
      </p>
      <div>
        <Label htmlFor="razon">Razón social</Label>
        <Input id="razon" value={razon} onChange={(e) => setRazon(e.target.value)} placeholder="Estancia…" />
      </div>
      <div>
        <Label htmlFor="cuit">CUIT del titular</Label>
        <Input id="cuit" value={cuit} onChange={(e) => setCuit(e.target.value)} placeholder="20-27384910-3" />
      </div>
      <div>
        <Label>Cosecha por defecto</Label>
        <Select value={cosecha} onChange={(e) => setCosecha(e.target.value)}>
          {COSECHAS.map((c) => (
            <option key={c}>{c}</option>
          ))}
        </Select>
      </div>
      <div className="rounded-lg border border-border bg-bg p-3 text-xs text-muted-fg">
        ARCA / WSCPE: pendiente. Campos listos: CUIT, sucursal, certificado. Hasta entonces cada alta genera CTG/CPE de
        trabajo y el destinatario confirma igual.
      </div>
      {ok ? <p className="text-sm font-semibold text-ok">Guardado. Las próximas CPE usan este CUIT como remitente.</p> : null}
      <Button type="submit">Guardar cliente</Button>
    </form>
  );
}
