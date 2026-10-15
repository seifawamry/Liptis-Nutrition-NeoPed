import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Liptis Nutrition NeoPed™ LBW Clinical Suite",
  description:
    "Clinical decision support system for preterm & Low Birth Weight infants. Deterministic ESPGHAN 2022 calculation matrix and Fenton/WHO sex-specific growth charts.",
  applicationName: "Liptis Nutrition NeoPed™ LBW Suite",
  authors: [{ name: "Liptis Nutrition" }],
  keywords: [
    "Liptis Nutrition",
    "Pediamil LBW",
    "ESPGHAN 2022",
    "Fenton 2013",
    "Preterm Nutrition",
    "VLBW",
    "ELBW",
    "Neonatology",
  ],
  manifest: "/manifest.json",
  icons: {
    icon: [
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [
      { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
    shortcut: "/favicon.ico",
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Liptis Nutrition NeoPed™ LBW",
  },
  formatDetection: {
    telephone: false,
  },
};

export const viewport: Viewport = {
  themeColor: "#0a192f",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="min-h-screen flex flex-col font-sans selection:bg-blue-100 selection:text-blue-900">
        {children}
      </body>
    </html>
  );
}
