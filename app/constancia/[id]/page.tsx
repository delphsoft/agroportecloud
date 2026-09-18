"use client";
import { useParams } from "next/navigation";
import { granoLabel, locLabel, provLabel } from "@/lib/catalog";
import { actorByCuit, pesoNeto, useCpe } from "@/lib/store";
import { fmtCuit, STATUS_LABEL } from "@/lib/types";

export default function ConstanciaPage() {
  const { id } = useParams<{ id: string }>();
  const docs = useCpe((s) => s.docs);
  const actores = useCpe((s) => s.actores);
  const d = docs.find((x) => x.id === id);
  if (!d) return <p className="p-8 text-sm">No se encontró la CPE en este navegador.</p>;
  const neto = pesoNeto(d.pesoBruto, d.pesoTara);
  const remitente = actorByCuit(actores, d.cuitSolicitante);
  const dest = actorByCuit(actores, d.cuitDestino);
  const qr = `https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(`CTG:${d.nroCtg}|CPE:${d.nroCpe}|${d.dominio}`)}`;
  return (
    <main className="mx-auto max-w-2xl bg-white p-8 text-black print:max-w-none">
      <div className="flex items-start justify-between gap-4 border-b border-black pb-4">
        <div>
          <p className="text-xs uppercase tracking-wide">ARCA · RG 5017/2021 · documento de trabajo</p>
          <h1 className="text-2xl font-bold">Carta de Porte Electrónica</h1>
          <p className="font-mono text-sm">Tipo 74 automotor · Sucursal {d.sucursal} · Orden {d.nroOrden}</p>
        </div>
        <img src={qr} alt="QR CTG" width={120} height={120} />
      </div>
      <dl className="mt-4 grid grid-cols-2 gap-3 text-sm">
        <Item k="CTG" v={d.nroCtg} />
        <Item k="N° CPE" v={d.nroCpe} />
        <Item k="Estado" v={STATUS_LABEL[d.status]} />
        <Item k="Vence" v={d.vence} />
        <Item k="Grano" v={`${d.codGrano} ${granoLabel(d.codGrano)}`} />
        <Item k="Cosecha" v={String(d.cosecha)} />
        <Item k="Bruto / tara / neto" v={`${d.pesoBruto} / ${d.pesoTara} / ${neto} kg`} />
        <Item k="Partida" v={d.fechaHoraPartida.replace("T", " ")} />
        <Item k="Solicitante" v={`${remitente?.razon || ""} ${fmtCuit(d.cuitSolicitante)}`} />
        <Item k="Origen" v={`${provLabel(d.origenProv)} · ${locLabel(d.origenLoc)}`} />
        <Item k="Destino" v={`${dest?.razon || ""} planta ${d.destinoPlanta || "campo"}`} />
        <Item k="Localidad destino" v={locLabel(d.destinoLoc)} />
        <Item k="Transportista" v={fmtCuit(d.cuitTransportista)} />
        <Item k="Dominios" v={`${d.dominio} ${d.acoplado}`} />
        <Item k="Chofer" v={`${d.choferNombre} ${fmtCuit(d.cuitChofer)}`} />
        <Item k="Km / tarifa" v={`${d.km} km · $ ${d.tarifa.toLocaleString("es-AR")}`} />
        <Item k="Fumigada" v={d.fumigada ? "Sí" : "No"} />
        <Item k="Turno / cupo" v={d.codigoTurno || "—"} />
      </dl>
      <p className="mt-6 text-xs text-neutral-600">
        Constancia de trabajo PymeStudio. El PDF oficial lo emite ARCA al autorizar. Este documento viaja con el chofer
        en demo / pre-cliente.
      </p>
      <button type="button" className="mt-4 rounded border px-3 py-1 text-sm print:hidden" onClick={() => window.print()}>
        Imprimir
      </button>
    </main>
  );
}

function Item({ k, v }: { k: string; v: string }) {
  return (
    <div>
      <dt className="text-[10px] uppercase tracking-wide text-neutral-500">{k}</dt>
      <dd className="font-medium">{v}</dd>
    </div>
  );
}
