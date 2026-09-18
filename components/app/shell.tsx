"use client";
import { useMemo } from "react";
import { BookUser, FileSpreadsheet, Inbox, LayoutDashboard, List, Settings } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { useCpe, type View } from "@/lib/store";
import { DashboardView, HistorialView } from "@/components/app/views";
import { EmitCpe } from "@/components/app/emit";
import { InboxView } from "@/components/app/roles";
import { ConfigView } from "@/components/app/config";
import { PadronesView } from "@/components/app/padrones";
import { cn } from "@/lib/utils";
import { fmtCuit } from "@/lib/types";

const NAV: { id: View; label: string; icon: typeof LayoutDashboard }[] = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "cpe", label: "Nueva CPE", icon: FileSpreadsheet },
  { id: "viajes", label: "Viajes", icon: List },
  { id: "inbox", label: "Bandeja CUIT", icon: Inbox },
  { id: "padrones", label: "Padrones", icon: BookUser },
  { id: "config", label: "Cliente / CUIT", icon: Settings },
];

export function AppShell() {
  const view = useCpe((s) => s.view);
  const setView = useCpe((s) => s.setView);
  const demo = useCpe((s) => s.demo);
  const setDemo = useCpe((s) => s.setDemo);
  const clientCuit = useCpe((s) => s.clientCuit);
  const clientRazon = useCpe((s) => s.clientRazon);
  const docs = useCpe((s) => s.docs);
  const pendientes = useMemo(
    () => docs.filter((d) => ["en_viaje", "arribada", "desviada"].includes(d.status)).length,
    [docs],
  );

  return (
    <div className="flex h-dvh bg-bg text-fg">
      <aside className="hidden w-[230px] shrink-0 flex-col border-r border-border bg-surface md:flex">
        <div className="border-b border-border px-4 py-4">
          <p className="text-sm font-bold">AgroGestión</p>
          <p className="text-xs text-muted-fg">CPE automotor · WSCPE</p>
        </div>
        <nav className="flex-1 space-y-1 overflow-y-auto p-3">
          {NAV.map((n) => {
            const Icon = n.icon;
            const on = view === n.id;
            return (
              <button
                key={n.id}
                type="button"
                onClick={() => setView(n.id)}
                className={cn(
                  "flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm font-medium",
                  on ? "bg-primary text-white" : "text-muted-fg hover:bg-muted hover:text-fg",
                )}
              >
                <Icon className="size-4" />
                {n.label}
                {n.id === "viajes" && pendientes > 0 && !on ? (
                  <span className="ml-auto rounded bg-warn-soft px-1.5 text-[10px] font-bold text-warn">{pendientes}</span>
                ) : null}
              </button>
            );
          })}
        </nav>
        <div className="border-t border-border p-4 text-xs text-muted-fg">
          {clientCuit ? (
            <p>
              Cliente<br />
              <span className="font-semibold text-fg">{clientRazon || fmtCuit(clientCuit)}</span>
            </p>
          ) : (
            <p>Sin CUIT. Demo hasta el primer cliente.</p>
          )}
        </div>
      </aside>
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex items-center justify-between border-b border-border bg-surface px-4 py-3">
          <div>
            <p className="text-sm font-semibold">{NAV.find((n) => n.id === view)?.label}</p>
            <p className="text-xs text-muted-fg">Campos WSCPE · CTG al autorizar CPE</p>
          </div>
          <label className="flex items-center gap-2 text-xs font-semibold">
            Datos demo
            <Switch checked={demo} onCheckedChange={setDemo} />
          </label>
        </header>
        <main className="min-h-0 flex-1 overflow-y-auto p-4 md:p-6">
          {view === "dashboard" && <DashboardView />}
          {view === "cpe" && <EmitCpe />}
          {view === "viajes" && <HistorialView />}
          {view === "inbox" && <InboxView />}
          {view === "padrones" && <PadronesView />}
          {view === "config" && <ConfigView />}
        </main>
        <nav className="grid grid-cols-4 border-t border-border bg-surface p-2 md:hidden">
          {NAV.filter((n) => ["dashboard", "cpe", "viajes", "inbox"].includes(n.id)).map((n) => (
            <button key={n.id} type="button" onClick={() => setView(n.id)} className="py-2 text-[11px] font-semibold">
              {n.label}
            </button>
          ))}
        </nav>
      </div>
    </div>
  );
}
