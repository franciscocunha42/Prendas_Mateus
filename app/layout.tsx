import type { Metadata } from "next";
import "./globals.css";
import { pageTitle } from "@/lib/site-config";

export const metadata: Metadata = {
  title: `${pageTitle()} · Lista de prendas`,
  description:
    "Lista de prendas para o nosso bebé. Reserva um presente ou ajuda-nos a comprá-lo.",
  robots: { index: false, follow: false },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-PT">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          href="https://fonts.googleapis.com/css2?family=Quicksand:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="font-sans antialiased">{children}</body>
    </html>
  );
}
