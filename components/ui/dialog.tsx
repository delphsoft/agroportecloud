import type { ReactNode } from "react";

export function Dialog({
  open,
  onOpenChange,
  children,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  children: ReactNode;
}) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <button type="button" className="absolute inset-0 bg-black/40" aria-label="Cerrar" onClick={() => onOpenChange(false)} />
      {children}
    </div>
  );
}

export function DialogContent({ title, children }: { title?: string; children: ReactNode }) {
  return (
    <div className="relative z-10 w-full max-w-md rounded-xl border border-border bg-surface p-5 shadow-lg">
      {title ? <h2 className="mb-3 text-base font-semibold">{title}</h2> : null}
      {children}
    </div>
  );
}
