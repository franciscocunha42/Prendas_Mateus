"use client";

import { useEffect, useState } from "react";
import { siteConfig, pageTitle } from "@/lib/site-config";

function daysUntil(iso: string): number | null {
  const target = new Date(iso + "T00:00:00");
  if (Number.isNaN(target.getTime())) return null;
  const now = new Date();
  const diff = target.getTime() - now.getTime();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

export default function Hero() {
  const [days, setDays] = useState<number | null>(null);

  useEffect(() => {
    setDays(daysUntil(siteConfig.dueDateISO));
  }, []);

  return (
    <header className="relative overflow-hidden">
      <div
        className="h-64 w-full bg-cover bg-center sm:h-80"
        style={{ backgroundImage: "url('/hero.jpg')" }}
      />
      {/* Sobreposição para suavizar a foto com a paleta pastel */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-blush/10 via-cream/40 to-cream" />

      <div className="relative mx-auto max-w-3xl px-6 pb-10 pt-8 text-center">
        <p className="mb-4 text-3xl">🍼💛</p>
        <h1 className="font-display text-4xl font-700 leading-tight text-ink sm:text-5xl">
          {pageTitle()}
        </h1>
        <p className="mt-4 text-lg text-inksoft">
          Estamos a contar os dias para conhecer o nosso menino, com chegada
          prevista para <strong className="text-ink">{siteConfig.dueDateText}</strong>.
        </p>

        {days !== null && days > 0 && (
          <div className="mt-6 inline-flex items-center gap-2 rounded-full bg-white/70 px-5 py-2 text-ink shadow-soft">
            <span className="text-2xl font-700">{days}</span>
            <span className="text-sm text-inksoft">
              {days === 1 ? "dia para a chegada" : "dias para a chegada"}
            </span>
          </div>
        )}

        <p className="mx-auto mt-8 max-w-xl text-base text-inksoft">
          Esta é a nossa lista de coisas que vamos precisar. Se quiseres ajudar,
          podes <strong className="text-ink">reservar</strong> um presente (fica
          indisponível para os outros) ou dizer-nos que já o{" "}
          <strong className="text-ink">compraste</strong>. Obrigado do fundo do
          coração! 💕
        </p>
      </div>
    </header>
  );
}
