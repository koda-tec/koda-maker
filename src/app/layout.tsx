import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google"
import "./globals.css";
import { Toaster } from "sonner";

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Koda Maker — Gestión Pro",
  description: "Sistema de gestión para fabricantes e impresores 3D.",
  manifest: "/manifest.webmanifest",
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon.ico",
    apple: "/icon-192x192.png", 
  },
 verification: {
    google: "SmArSga7j_IxiUZCkI3oZKbMT6I8ELAVc4-EKpSW53s",
  },
};

export const viewport: Viewport = {
  themeColor: "#000000",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body className={`${inter.className} antialiased`} suppressHydrationWarning>
        {children}
        <Toaster position="top-center" richColors />
      </body>
    </html>
  );
}