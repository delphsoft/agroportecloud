"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { granoLabel, locLabel } from "@/lib/catalog";
import { pesoNeto, useCpe } from "@/lib/store";
import { STATUS_LABEL, cleanCuit } from "@/lib/types";

export function InboxView({ role }: { role?: "destinatario" | "transportista" | "corredor" }) {
  const docs = useCpe((s) => s.docs);
  const inboxCuit = useCpe((s) => s.inboxCuit);
  const setInboxCuit = useCpe((s) => s.setInboxCuit);
  const actores = useCpe((s) => s.actores);
  const arribo = useCpe((s) => s.arribo);
  const confirmar = useCpe((s) => s.confirmar);
  const [bruto, setBruto] = useState("");
  const [tara, setTara] = useState("");
  const kind =
    role === "destinatario" ? "acopio" : role === "transportista" ? "transportista" : role === "corredor" ? "corredor" : null;
  const preset = kind ? actores.find((a) => a.kind === kind) || actores.find((a) => role === "transportista" && a.kind === "chofer") : null;
  const cuit = cleanCuit(inboxCuit) || (preset ? cleanCuit(preset.cuit) : "");
  const actor = actores.find((a) => cleanCuit(a.cuit) === cuit) || preset;
  const rows = !cuit
    ? docs
    : docs.filter((d) => {
        if (role === "destinatario") return cleanCuit(d.cuitDestino) === cuit || cleanCuit(d.cuitDestinatario) === cuit;
        if (role === "transportista") return cleanCuit(d.cuitTransportista) === cuit || cleanCuit(d.cuitChofer) === cuit;
        if (role === "corredor") return cleanCuit(d.cuitCorredor1) === cuit || cleanCuit(d.cuitCorredor2) === cuit;
        return (
          cleanCuit(d.cuitDestino) === cuit ||
          cleanCuit(d.cuitDestinatario) === cuit ||
          cleanCuit(d.cuitTransportista) === cuit ||
          cleanCuit(d.cuitChofer) === cuit ||
          cleanCuit(d.cuitCorredor1) === cuit ||
          cleanCuit(d.cuitSolicitante) === cuit
        );
      });
  const rol =
    actor?.kind === "acopio"
      ? "planta destino"
      : actor?.kind === "transportista" || actor?.kind === "chofer"
        ? "transporte"
        : actor?.kind === "corredor"
          ? "corredor"
          : actor?.kind || "CUIT";

  return (
    <div className="space-y-4">
      <div>
        <p className="text-sm font-semibold">Bandeja por CUIT</p>
        <p className="text-xs text-muted-fg">El mismo viaje lo ve productor, planta, chofer o corredor según intervenga.</p>
      </div>
      <div className="flex flex-wrap gap-2">
        <Input className="max-w-xs" placeholder="CUIT para entrar al inbox" value={inboxCuit} onChange={(e) => setInboxCuit(e.target.value)} />
        {actores.slice(0, 8).map((a) => (
          <button
            key={a.id}
            type="button"
            className="rounded-md border border-border px-2 py-1 text-xs"
            onClick={() => setInboxCuit(a.cuit)}
          >
            {a.kind}: {a.razon.split(" ")[0]}
          </button>
        ))}
      </div>
      {cuit ? (
        <p className="text-sm">
          Viendo como <span className="font-semibold">{actor?.razon || cuit}</span> ({rol}) · {rows.length} CPE
        </p>
      ) : (
        <p className="text-sm text-muted-fg">Ingresá un CUIT del padrón para ver su bandeja.</p>
      )}
      {rows.map((d) => (
        <div key={d.id} className="rounded-xl border border-border bg-surface p-4">
          <div className="flex justify-between gap-3">
            <div>
              <p className="font-semibold">
                {granoLabel(d.codGrano)} · {pesoNeto(d.pesoBruto, d.pesoTara).toLocaleString("es-AR")} kg
              </p>
              <p className="font-mono text-xs text-muted-fg">
                {d.nroCpe} · CTG {d.nroCtg}
              </p>
              <p className="text-xs text-muted-fg">
                {locLabel(d.origenLoc)} → {locLabel(d.destinoLoc)} · {d.dominio}
              </p>
            </div>
            <Badge tone={d.status === "confirmada" ? "ok" : "brand"}>{STATUS_LABEL[d.status]}</Badge>
          </div>
          {actor?.kind === "acopio" && d.status === "en_viaje" ? (
            <div className="mt-3 flex flex-wrap gap-2">
              <Input className="w-28" placeholder="Bruto" value={bruto} onChange={(e) => setBruto(e.target.value)} />
              <Input className="w-28" placeholder="Tara" value={tara} onChange={(e) => setTara(e.target.value)} />
              <Button onClick={() => arribo(d.id, Number(bruto) || d.pesoBruto, Number(tara) || d.pesoTara)}>
                Arribo
              </Button>
            </div>
          ) : null}
          {actor?.kind === "acopio" && d.status === "arribada" ? (
            <Button className="mt-3" onClick={() => confirmar(d.id)}>
              Confirmación definitiva
            </Button>
          ) : null}
          {(actor?.kind === "chofer" || actor?.kind === "transportista") && (
            <a
              className="mt-3 inline-block text-xs font-semibold text-primary underline"
              href={`/constancia/${d.id}`}
              target="_blank"
            >
              Constancia para la ruta
            </a>
          )}
        </div>
      ))}
    </div>
  );
}
