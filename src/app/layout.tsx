import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "@/components/Providers";

export const metadata: Metadata = {
  title: "AtomicMe — Hábitos que formam identidade",
  description:
    "Construa quem você quer ser com pequenos hábitos diários, baseado em Hábitos Atômicos de James Clear.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
