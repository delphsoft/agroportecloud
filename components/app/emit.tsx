"use client";
import { useState, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { COSECHAS, CORREDORES, DESTINOS, ESPECIES, PRODUCTORES, TRANSPORTES } from "@/lib/demo";
import { useCpe } from "@/lib/store";

export function EmitCtg() {
  const addCtg = useCpe((s) => s.addCtg);
  const setView = useCpe((s) => s.setView);
  const cosechaDef = useCpe((s) => s.cosecha);
  const clientCuit = useCpe((s) => s.clientCuit);
  const [done, setDone] = useState("");

  function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const remitente = PRODUCTORES.find((p) => p.id === fd.get("remitente")) || PRODUCTORES[0];
    const destinatario = DESTINOS.find((p) => p.id === fd.get("destinatario")) || DESTINOS[0];
    const transportista = TRANSPORTES.find((p) => p.id === fd.get("transportista")) || TRANSPORTES[0];
    const v = addCtg({
      especie: String(fd.get("especie")),
      cosecha: String(fd.get("cosecha")),
      grado: String(fd.get("grado")),
      pesoBruto: 0,
      tara: 0,
      pesoNeto: Number(fd.get("peso") || 0),
      humedad: 0,
      km: Number(fd.get("km") || 0),
      remitente: clientCuit ? { ...remitente, cuit: clientCuit } : remitente,
      destinatario,
      transportista,
      corredor: null,
      patente: String(fd.get("patente")),
      acoplado: "",
      chofer: String(fd.get("chofer") || "A designar"),
      origen: remitente.localidad,
      destino: destinatario.planta || destinatario.localidad,
      plantaDestino: destinatario.planta || "",
      partida: new Date().toISOString().slice(0, 10),
      vence: new Date(Date.now() + 3 * 864e5).toISOString().slice(0, 10),
      obs: "",
      cadena: "",
    });
    setDone(v.nroCtg);
    e.currentTarget.reset();
  }

  return (
    <form onSubmit={submit} className="mx-auto max-w-2xl space-y-4 rounded-xl border border-border bg-surface p-5">
      <h2 className="text-base font-semibold">Solicitar CTG</h2>
      <p className="text-xs text-muted-fg">Código de trazabilidad simulado. Cuando el cliente tenga ARCA, sale el número real con el mismo formulario.</p>
      <div className="grid gap-3 sm:grid-cols-2">
        <Field label="Especie">
          <Select name="especie" required>
            {ESPECIES.map((x) => (
              <option key={x.id}>{x.label}</option>
            ))}
          </Select>
        </Field>
        <Field label="Cosecha">
          <Select name="cosecha" defaultValue={cosechaDef}>
            {COSECHAS.map((c) => (
              <option key={c}>{c}</option>
            ))}
          </Select>
        </Field>
        <Field label="Grado">
          <Select name="grado">
            <option>Grado 1</option>
            <option>Grado 2</option>
            <option>Grado 3</option>
          </Select>
        </Field>
        <Field label="Peso neto kg">
          <Input name="peso" inputMode="numeric" required placeholder="30000" />
        </Field>
        <Field label="Remitente">
          <Select name="remitente">
            {PRODUCTORES.map((p) => (
              <option key={p.id} value={p.id}>
                {p.razon}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="Destinatario">
          <Select name="destinatario">
            {DESTINOS.map((p) => (
              <option key={p.id} value={p.id}>
                {p.razon}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="Transportista">
          <Select name="transportista">
            {TRANSPORTES.map((p) => (
              <option key={p.id} value={p.id}>
                {p.razon}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="Patente">
          <Input name="patente" required placeholder="AD 384 ZZ" />
        </Field>
        <Field label="Chofer">
          <Input name="chofer" placeholder="Nombre" />
        </Field>
        <Field label="Km">
          <Input name="km" inputMode="numeric" placeholder="90" />
        </Field>
      </div>
      {done ? <p className="text-sm font-semibold text-ok">CTG {done} generado (demo).</p> : null}
      <div className="flex gap-2">
        <Button type="submit">Registrar CTG</Button>
        <Button type="button" variant="outline" onClick={() => setView("cpe")}>
          Seguir a CPE
        </Button>
      </div>
    </form>
  );
}

export function EmitCpe() {
  const addCpe = useCpe((s) => s.addCpe);
  const viajes = useCpe((s) => s.viajes);
  const clientCuit = useCpe((s) => s.clientCuit);
  const cosechaDef = useCpe((s) => s.cosecha);
  const [done, setDone] = useState("");
  const ctgs = viajes.filter((v) => v.kind === "CTG" && v.status === "activa");

  function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const remitente = PRODUCTORES.find((p) => p.id === fd.get("remitente")) || PRODUCTORES[0];
    const destinatario = DESTINOS.find((p) => p.id === fd.get("destinatario")) || DESTINOS[0];
    const transportista = TRANSPORTES.find((p) => p.id === fd.get("transportista")) || TRANSPORTES[0];
    const corredor = CORREDORES.find((p) => p.id === fd.get("corredor")) || null;
    const bruto = Number(fd.get("bruto") || 0);
    const tara = Number(fd.get("tara") || 0);
    const v = addCpe({
      especie: String(fd.get("especie")),
      cosecha: String(fd.get("cosecha")),
      grado: String(fd.get("grado")),
      pesoBruto: bruto,
      tara,
      pesoNeto: bruto && tara ? bruto - tara : Number(fd.get("neto") || 0),
      humedad: Number(fd.get("humedad") || 0),
      km: Number(fd.get("km") || 0),
      remitente: clientCuit ? { ...remitente, cuit: clientCuit } : remitente,
      destinatario,
      transportista,
      corredor,
      patente: String(fd.get("patente")),
      acoplado: String(fd.get("acoplado") || ""),
      chofer: String(fd.get("chofer") || "A designar"),
      origen: String(fd.get("origen") || remitente.localidad),
      destino: destinatario.planta || destinatario.localidad,
      plantaDestino: destinatario.planta || "",
      partida: String(fd.get("partida") || new Date().toISOString().slice(0, 10)),
      vence: new Date(Date.now() + 3 * 864e5).toISOString().slice(0, 10),
      obs: String(fd.get("obs") || ""),
      cadena: corredor ? `Venta primaria · ${corredor.razon}` : "",
      nroCtg: String(fd.get("ctg") || "") || undefined,
    });
    setDone(`${v.nroCpe} / CTG ${v.nroCtg}`);
    e.currentTarget.reset();
  }

  return (
    <form onSubmit={submit} className="mx-auto max-w-3xl space-y-4 rounded-xl border border-border bg-surface p-5">
      <h2 className="text-base font-semibold">Emitir Carta de Porte Electrónica</h2>
      <p className="text-xs text-muted-fg">RG 5017/2021. Hoy genera número de trabajo. Con el CUIT del cliente + ARCA, el mismo alta pide el CTG oficial.</p>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <Field label="CTG asociado">
          <Select name="ctg">
            <option value="">Generar CTG nuevo</option>
            {ctgs.map((c) => (
              <option key={c.id} value={c.nroCtg}>
                {c.nroCtg} · {c.especie}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="Especie">
          <Select name="especie">
            {ESPECIES.map((x) => (
              <option key={x.id}>{x.label}</option>
            ))}
          </Select>
        </Field>
        <Field label="Cosecha">
          <Select name="cosecha" defaultValue={cosechaDef}>
            {COSECHAS.map((c) => (
              <option key={c}>{c}</option>
            ))}
          </Select>
        </Field>
        <Field label="Grado">
          <Select name="grado">
            <option>Grado 1</option>
            <option>Grado 2</option>
            <option>Grado 3</option>
          </Select>
        </Field>
        <Field label="Remitente">
          <Select name="remitente">
            {PRODUCTORES.map((p) => (
              <option key={p.id} value={p.id}>
                {p.razon}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="Destinatario / planta">
          <Select name="destinatario">
            {DESTINOS.map((p) => (
              <option key={p.id} value={p.id}>
                {p.razon}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="Transportista">
          <Select name="transportista">
            {TRANSPORTES.map((p) => (
              <option key={p.id} value={p.id}>
                {p.razon}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="Corredor">
          <Select name="corredor">
            <option value="">Sin corredor</option>
            {CORREDORES.map((p) => (
              <option key={p.id} value={p.id}>
                {p.razon}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="Patente">
          <Input name="patente" required />
        </Field>
        <Field label="Acoplado">
          <Input name="acoplado" />
        </Field>
        <Field label="Chofer">
          <Input name="chofer" />
        </Field>
        <Field label="Origen">
          <Input name="origen" placeholder="Establecimiento / lote" />
        </Field>
        <Field label="Bruto kg">
          <Input name="bruto" inputMode="numeric" />
        </Field>
        <Field label="Tara kg">
          <Input name="tara" inputMode="numeric" />
        </Field>
        <Field label="Neto kg">
          <Input name="neto" inputMode="numeric" required />
        </Field>
        <Field label="Humedad %">
          <Input name="humedad" inputMode="decimal" />
        </Field>
        <Field label="Km">
          <Input name="km" inputMode="numeric" />
        </Field>
        <Field label="Partida">
          <Input name="partida" type="date" defaultValue={new Date().toISOString().slice(0, 10)} />
        </Field>
      </div>
      <Field label="Observaciones">
        <Input name="obs" />
      </Field>
      {done ? <p className="text-sm font-semibold text-ok">Emitida {done} (demo).</p> : null}
      <Button type="submit">Emitir CPE</Button>
    </form>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <Label>{label}</Label>
      {children}
    </div>
  );
}
