import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "AgroGestión — Carta de Porte",
  description: "CTG y CPE para granos. Listo para el primer cliente: solo falta el CUIT.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          href="https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,400;0,9..40,600;0,9..40,700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="bg-bg text-fg">{children}</body>
    </html>
  );
}
