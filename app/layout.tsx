import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Liptis Nutrition NeoPed™ LBW Clinical Suite",
  description:
    "Clinical decision support system for preterm & Low Birth Weight infants. Deterministic ESPGHAN 2022 calculation matrix and Fenton/WHO sex-specific growth charts.",
  applicationName: "NeoPed™ LBW Suite",
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
    icon: "/logos/liptis-nutrition.png",
    apple: "/logos/liptis-nutrition.png",
  },
};

export const viewport: Viewport = {
  themeColor: "#0a192f",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/logos/liptis-nutrition.png" />
      </head>
      <body className="min-h-screen flex flex-col font-sans selection:bg-blue-100 selection:text-blue-900">
        {children}
      </body>
    </html>
  );
}
