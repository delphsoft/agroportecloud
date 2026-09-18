"use client";
import { useState, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useCpe } from "@/lib/store";

export function ConfigView() {
  const clientCuit = useCpe((s) => s.clientCuit);
  const clientRazon = useCpe((s) => s.clientRazon);
  const sucursal = useCpe((s) => s.sucursal);
  const ultimoOrden = useCpe((s) => s.ultimoOrden);
  const setClient = useCpe((s) => s.setClient);
  const [cuit, setCuit] = useState(clientCuit);
  const [razon, setRazon] = useState(clientRazon);
  const [suc, setSuc] = useState(String(sucursal));
  const [ok, setOk] = useState(false);

  function save(e: FormEvent) {
    e.preventDefault();
    setClient(cuit, razon, Number(suc) || 1);
    setOk(true);
  }

  return (
    <form onSubmit={save} className="mx-auto max-w-lg space-y-4 rounded-xl border border-border bg-surface p-5">
      <h2 className="text-base font-semibold">Cliente — lo único que falta para el primero</h2>
      <p className="text-sm text-muted-fg">
        El flujo ya usa sucursal + nroOrden + códigos WSCPE. Cuando entre el productor, cargás CUIT y sucursal. El
        certificado ARCA se pega después: no cambia el formulario.
      </p>
      <div>
        <Label>Razón social</Label>
        <Input value={razon} onChange={(e) => setRazon(e.target.value)} placeholder="Estancia…" />
      </div>
      <div>
        <Label>CUIT titular / solicitante</Label>
        <Input value={cuit} onChange={(e) => setCuit(e.target.value)} placeholder="20-27384910-3" />
      </div>
      <div>
        <Label>Sucursal CPE (WSCPE)</Label>
        <Input value={suc} onChange={(e) => setSuc(e.target.value)} inputMode="numeric" />
        <p className="mt-1 text-xs text-muted-fg">Último nroOrden local: {ultimoOrden}. ARCA exigirá correlatividad.</p>
      </div>
      <div className="rounded-lg border border-border bg-bg p-3 text-xs text-muted-fg">
        Pendiente de cliente real: certificado WSAA + ambiente homo/prod. Métodos listos: AutorizarCPEAutomotor,
        ConfirmarArribo (bruto/tara), Desvio, Anular, Rechazo, RegresoOrigen, ConsultarUltNroOrden.
      </div>
      {ok ? <p className="text-sm font-semibold text-ok">Guardado. Las próximas CPE salen con este CUIT y sucursal.</p> : null}
      <Button type="submit">Guardar</Button>
    </form>
  );
}
