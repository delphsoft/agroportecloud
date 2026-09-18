"use client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { useCpe } from "@/lib/store";
import type { Role } from "@/lib/demo";
import { statusLabel } from "@/components/app/views";
import { useState } from "react";

export function RoleInbox({ role }: { role: Role }) {
  const viajes = useCpe((s) => s.viajes);
  const confirmArribo = useCpe((s) => s.confirmArribo);
  const [peso, setPeso] = useState<Record<string, string>>({});
  const rows = viajes.filter((v) => {
    if (role === "destinatario") return v.status === "en_viaje" || v.status === "confirmada";
    if (role === "transportista") return v.status === "en_viaje" || v.status === "activa";
    return true;
  });
  const title =
    role === "destinatario"
      ? "Planta destino — confirmar arribo"
      : role === "transportista"
        ? "Viajes del chofer"
        : "Operaciones del corredor";

  return (
    <div className="space-y-3">
      <p className="text-sm text-muted-fg">{title}. Misma base que el productor; cada rol ve lo suyo.</p>
      {rows.map((v) => (
        <div key={v.id} className="rounded-xl border border-border bg-surface p-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="font-semibold">
                {v.especie} · {v.pesoNeto.toLocaleString("es-AR")} kg
              </p>
              <p className="text-xs text-muted-fg">
                CTG {v.nroCtg}
                {v.nroCpe ? ` · CPE ${v.nroCpe}` : ""} · {v.patente}
              </p>
              <p className="text-xs text-muted-fg">
                {v.origen} → {v.destino}
              </p>
            </div>
            <Badge tone={v.status === "confirmada" ? "ok" : "brand"}>{statusLabel(v.status)}</Badge>
          </div>
          {role === "destinatario" && v.status === "en_viaje" ? (
            <div className="mt-3 flex flex-wrap gap-2">
              <Input
                className="max-w-[160px]"
                inputMode="numeric"
                placeholder="Kg báscula"
                value={peso[v.id] ?? String(v.pesoNeto)}
                onChange={(e) => setPeso({ ...peso, [v.id]: e.target.value })}
              />
              <Button onClick={() => confirmArribo(v.id, Number(peso[v.id] || v.pesoNeto), "Confirmado en planta")}>
                Confirmar arribo
              </Button>
            </div>
          ) : null}
          {role === "transportista" ? (
            <a
              className="mt-3 inline-block text-xs font-semibold text-primary underline"
              href={`https://wa.me/?text=${encodeURIComponent(`CTG ${v.nroCtg} destino ${v.destino} patente ${v.patente}`)}`}
              target="_blank"
              rel="noreferrer"
            >
              Compartir por WhatsApp
            </a>
          ) : null}
        </div>
      ))}
      {!rows.length ? <p className="text-sm text-muted-fg">Nada pendiente para este rol.</p> : null}
    </div>
  );
}
