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
    <header className="px-6 pt-10 pb-6">
      {/* Foto completa da barriga, nítida e centrada */}
      <img
        src="/hero.jpg"
        alt="À espera do nosso bebé"
        className="mx-auto max-h-[85vh] w-auto rounded-xl2 object-contain shadow-soft"
      />

      <div className="mx-auto mt-10 max-w-3xl text-center">
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
