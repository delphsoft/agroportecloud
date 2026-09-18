"use client";
import { useMemo, useState, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { COSECHAS, GRANOS, PROVINCIAS, locsOf } from "@/lib/catalog";
import { useCpe } from "@/lib/store";
import { cleanCuit, pesoNeto } from "@/lib/types";

export function EmitCpe() {
  const emitir = useCpe((s) => s.emitir);
  const actores = useCpe((s) => s.actores);
  const camiones = useCpe((s) => s.camiones);
  const clientCuit = useCpe((s) => s.clientCuit);
  const sucursal = useCpe((s) => s.sucursal);
  const ultimoOrden = useCpe((s) => s.ultimoOrden);
  const [done, setDone] = useState("");
  const [origProv, setOrigProv] = useState(3);
  const [destProv, setDestProv] = useState(3);
  const [bruto, setBruto] = useState("32500");
  const [tara, setTara] = useState("2100");
  const productores = actores.filter((a) => a.kind === "productor");
  const acopios = actores.filter((a) => a.kind === "acopio");
  const trans = actores.filter((a) => a.kind === "transportista");
  const choferes = actores.filter((a) => a.kind === "chofer");
  const corredores = actores.filter((a) => a.kind === "corredor");
  const neto = pesoNeto(Number(bruto), Number(tara));

  function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const doc = emitir({
      esProductor: fd.get("esProductor") === "si",
      cuitSolicitante: cleanCuit(clientCuit) || String(fd.get("cuitSolicitante")),
      origenProv: Number(fd.get("origenProv")),
      origenLoc: Number(fd.get("origenLoc")),
      origenPlanta: fd.get("origenPlanta") ? Number(fd.get("origenPlanta")) : null,
      cuitDestino: String(fd.get("cuitDestino")),
      cuitDestinatario: String(fd.get("cuitDestinatario") || fd.get("cuitDestino")),
      destinoCampo: fd.get("destinoCampo") === "si",
      destinoProv: Number(fd.get("destinoProv")),
      destinoLoc: Number(fd.get("destinoLoc")),
      destinoPlanta: fd.get("destinoPlanta") ? Number(fd.get("destinoPlanta")) : null,
      codGrano: Number(fd.get("codGrano")),
      cosecha: Number(fd.get("cosecha")),
      pesoBruto: Number(bruto),
      pesoTara: Number(tara),
      cuitTransportista: String(fd.get("cuitTransportista")),
      dominio: String(fd.get("dominio")).replace(/\s/g, "").toUpperCase(),
      acoplado: String(fd.get("acoplado") || "").replace(/\s/g, "").toUpperCase(),
      cuitChofer: String(fd.get("cuitChofer")),
      choferNombre: String(fd.get("choferNombre") || ""),
      fechaHoraPartida: String(fd.get("fechaHoraPartida")),
      km: Number(fd.get("km") || 0),
      fumigada: fd.get("fumigada") === "si",
      tarifa: Number(fd.get("tarifa") || 0),
      cuitPagadorFlete: String(fd.get("cuitPagadorFlete") || fd.get("cuitSolicitante")),
      codigoTurno: String(fd.get("codigoTurno") || ""),
      cuitRemitenteComercial1: String(fd.get("cuitRemitenteComercial1") || ""),
      cuitCorredor1: String(fd.get("cuitCorredor1") || ""),
      cuitRemitenteComercial2: String(fd.get("cuitRemitenteComercial2") || ""),
      cuitCorredor2: String(fd.get("cuitCorredor2") || ""),
      cuitEntregador: String(fd.get("cuitEntregador") || ""),
      cuitRecibidor: String(fd.get("cuitRecibidor") || ""),
      retiroProductor: fd.get("esProductor") === "si",
      certificadoCoe: String(fd.get("certificadoCoe") || ""),
      observaciones: String(fd.get("observaciones") || ""),
    });
    setDone(`CPE ${doc.nroCpe} · CTG ${doc.nroCtg}`);
  }

  const origLocs = useMemo(() => locsOf(origProv), [origProv]);
  const destLocs = useMemo(() => locsOf(destProv), [destProv]);

  return (
    <form onSubmit={submit} className="mx-auto max-w-4xl space-y-5 rounded-xl border border-border bg-surface p-5">
      <div>
        <h2 className="text-base font-semibold">Autorizar CPE automotor (tipo 74)</h2>
        <p className="text-xs text-muted-fg">
          Campos WSCPE. Sucursal {sucursal} · próximo nroOrden {ultimoOrden + 1}. El CTG lo asigna el alta (como ARCA).
        </p>
      </div>

      <Section title="Cabecera">
        <Field label="Solicitante (productor / planta)">
          <Select name="esProductor" defaultValue="si">
            <option value="si">Productor (campo SISA)</option>
            <option value="no">Operador con planta</option>
          </Select>
        </Field>
        <Field label="CUIT solicitante">
          <Select name="cuitSolicitante" defaultValue={clientCuit || productores[0]?.cuit}>
            {productores.concat(acopios).map((a) => (
              <option key={a.id} value={a.cuit}>
                {a.razon} · {a.cuit}
              </option>
            ))}
          </Select>
        </Field>
      </Section>

      <Section title="Origen (cod provincia / localidad SISA)">
        <Field label="Provincia origen">
          <Select name="origenProv" value={String(origProv)} onChange={(e) => setOrigProv(Number(e.target.value))}>
            {PROVINCIAS.map((p) => (
              <option key={p.cod} value={p.cod}>
                {p.cod} · {p.label}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="Localidad origen">
          <Select name="origenLoc">
            {origLocs.map((l) => (
              <option key={l.cod} value={l.cod}>
                {l.cod} · {l.label}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="Planta origen (si operador)">
          <Input name="origenPlanta" placeholder="vacío si es productor" />
        </Field>
      </Section>

      <Section title="Carga — AgregarDatosCarga">
        <Field label="codGrano">
          <Select name="codGrano" defaultValue="23">
            {GRANOS.map((g) => (
              <option key={g.cod} value={g.cod}>
                {g.cod} · {g.label}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="Cosecha (AAAA)">
          <Select name="cosecha" defaultValue="2026">
            {COSECHAS.map((c) => (
              <option key={c.cod} value={c.cod}>
                {c.cod} · {c.label}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="Peso bruto kg">
          <Input name="pesoBruto" value={bruto} onChange={(e) => setBruto(e.target.value)} required />
        </Field>
        <Field label="Peso tara kg">
          <Input name="pesoTara" value={tara} onChange={(e) => setTara(e.target.value)} required />
        </Field>
        <p className="col-span-full text-xs text-muted-fg">Neto calculado (ARCA no lo pide): {neto.toLocaleString("es-AR")} kg</p>
      </Section>

      <Section title="Destino — AgregarDestino">
        <Field label="CUIT destino (planta)">
          <Select name="cuitDestino">
            {acopios.map((a) => (
              <option key={a.id} value={a.cuit}>
                {a.razon} · planta {a.planta}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="CUIT destinatario">
          <Select name="cuitDestinatario">
            {acopios.map((a) => (
              <option key={a.id} value={a.cuit}>
                {a.cuit}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="¿Destino campo?">
          <Select name="destinoCampo" defaultValue="no">
            <option value="no">No — planta</option>
            <option value="si">Sí — campo SISA</option>
          </Select>
        </Field>
        <Field label="Provincia destino">
          <Select name="destinoProv" value={String(destProv)} onChange={(e) => setDestProv(Number(e.target.value))}>
            {PROVINCIAS.map((p) => (
              <option key={p.cod} value={p.cod}>
                {p.cod} · {p.label}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="Localidad destino">
          <Select name="destinoLoc">
            {destLocs.map((l) => (
              <option key={l.cod} value={l.cod}>
                {l.cod} · {l.label}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="N° planta SISA">
          <Input name="destinoPlanta" defaultValue="2" />
        </Field>
        <Field label="Cupo / código turno">
          <Input name="codigoTurno" placeholder="CUP-441" />
        </Field>
      </Section>

      <Section title="Transporte — AgregarTransporte">
        <Field label="CUIT transportista">
          <Select name="cuitTransportista">
            {trans.map((a) => (
              <option key={a.id} value={a.cuit}>
                {a.razon}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="Dominio">
          <Select name="dominio">
            {camiones.map((c) => (
              <option key={c.id} value={c.dominio}>
                {c.dominio} {c.acoplado ? `+ ${c.acoplado}` : ""}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="Acoplado (2º dominio)">
          <Input name="acoplado" defaultValue={camiones[0]?.acoplado || ""} />
        </Field>
        <Field label="CUIT chofer">
          <Select name="cuitChofer">
            {choferes.map((a) => (
              <option key={a.id} value={a.cuit}>
                {a.razon} · {a.cuit}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="Nombre chofer">
          <Input name="choferNombre" defaultValue={choferes[0]?.razon} />
        </Field>
        <Field label="Fecha y hora partida">
          <Input name="fechaHoraPartida" type="datetime-local" defaultValue={new Date().toISOString().slice(0, 16)} required />
        </Field>
        <Field label="Km a recorrer">
          <Input name="km" inputMode="numeric" defaultValue="86" />
        </Field>
        <Field label="Fumigada">
          <Select name="fumigada" defaultValue="no">
            <option value="no">No</option>
            <option value="si">Sí</option>
          </Select>
        </Field>
        <Field label="Tarifa flete $">
          <Input name="tarifa" inputMode="numeric" defaultValue="185000" />
        </Field>
        <Field label="CUIT pagador flete">
          <Input name="cuitPagadorFlete" defaultValue={clientCuit || productores[0]?.cuit} />
        </Field>
      </Section>

      <Section title="Cadena comercial (opcional — RG 5017)">
        <Field label="Remitente comercial venta primaria">
          <Input name="cuitRemitenteComercial1" />
        </Field>
        <Field label="Corredor venta primaria">
          <Select name="cuitCorredor1">
            <option value="">—</option>
            {corredores.map((a) => (
              <option key={a.id} value={a.cuit}>
                {a.razon}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="Remitente comercial secundaria">
          <Input name="cuitRemitenteComercial2" />
        </Field>
        <Field label="Corredor secundaria">
          <Input name="cuitCorredor2" />
        </Field>
        <Field label="Representante entregador">
          <Input name="cuitEntregador" />
        </Field>
        <Field label="Representante recibidor">
          <Input name="cuitRecibidor" />
        </Field>
        <Field label="Certificado COE (retiro productor)">
          <Input name="certificadoCoe" />
        </Field>
      </Section>

      <Field label="Observaciones">
        <Input name="observaciones" />
      </Field>
      {done ? <p className="text-sm font-semibold text-ok">{done} — número de trabajo. Con certificado ARCA, el mismo POST pide autorización.</p> : null}
      <Button type="submit">Autorizar CPE (simulado)</Button>
    </form>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-primary">{title}</p>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{children}</div>
    </div>
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
