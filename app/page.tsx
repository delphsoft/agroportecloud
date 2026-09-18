"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

export default function Home() {
  const router = useRouter();
  useEffect(() => {
    const u = new URL(window.location.href);
    const t = u.searchParams.get("token");
    if (t) {
      localStorage.setItem("ag_token", t);
      router.replace("/dashboard");
    }
  }, [router]);

  return (
    <main className="mx-auto flex min-h-dvh max-w-lg flex-col justify-center gap-6 p-6">
      <div>
        <p className="text-xs font-semibold tracking-wide text-primary uppercase">PymeStudio</p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight">Carta de Porte lista para mostrar</h1>
        <p className="mt-3 text-sm text-muted-fg">
          CPE automotor con campos WSCPE, padrones, bandeja por CUIT y constancia para la ruta. Demo hasta el primer
          cliente: cargás el CUIT y la sucursal. ARCA se enchufa después.
        </p>
      </div>
      <Button onClick={() => router.push("/dashboard")}>Entrar al producto</Button>
    </main>
  );
}
