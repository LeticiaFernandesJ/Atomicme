import type { Metadata, Viewport } from "next";
import "./globals.css";
import { Providers } from "@/components/Providers";

export const viewport: Viewport = {
  themeColor: "#111E36",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export const metadata: Metadata = {
  title: "AtomicMe — Hábitos que formam identidade",
  description: "Construa quem você quer ser com pequenos hábitos diários, baseado em Hábitos Atômicos de James Clear.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "AtomicMe",
    startupImage: "/icons/apple-touch-icon.png",
  },
  icons: {
    icon: [
      { url: "/icons/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/icons/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/icons/icon-192x192.png",  sizes: "192x192", type: "image/png" },
      { url: "/icons/icon-512x512.png",  sizes: "512x512", type: "image/png" },
    ],
    apple: [
      { url: "/icons/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
  },
  other: {
    "mobile-web-app-capable": "yes",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <head>
        {/* PWA meta tags extras para iOS */}
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="AtomicMe" />
        <link rel="apple-touch-icon" href="/icons/apple-touch-icon.png" />
        <link rel="manifest" href="/manifest.json" />
        {/* Splash screen color on Android */}
        <meta name="theme-color" content="#111E36" />
        {/* Prevent zoom on inputs iOS */}
        <meta name="format-detection" content="telephone=no" />
      </head>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
