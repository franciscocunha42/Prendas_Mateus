"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

type Props = {
  itemId: string;
  itemName: string;
  maxQuantity?: number;
  onClose: () => void;
  onDone: () => void;
};

export default function ReserveModal({
  itemId,
  itemName,
  maxQuantity = 1,
  onClose,
  onDone,
}: Props) {
  const isMulti = maxQuantity > 1;
  const [name, setName] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) {
      setError("Por favor indica o teu nome.");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/reserve", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ itemId, name: name.trim(), quantity }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Não foi possível reservar. Tenta novamente.");
        return;
      }
      onDone();
    } catch {
      setError("Erro de ligação. Verifica a internet e tenta novamente.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <ModalShell title="Reservar presente" onClose={onClose}>
      <p className="text-sm text-inksoft">
        Vais reservar <strong className="text-ink">{itemName}</strong>.{" "}
        {isMulti
          ? `Podes reservar quantas unidades quiseres (faltam ${maxQuantity}). As que reservares ficam indisponíveis para os outros.`
          : "Fica indisponível para as outras pessoas."}{" "}
        Só a Lúcia e o Francisco veem quem reservou.
      </p>
      <form onSubmit={submit} className="mt-5 space-y-4">
        {isMulti && (
          <QuantityField
            value={quantity}
            max={maxQuantity}
            onChange={setQuantity}
            accent="sky"
          />
        )}
        <label className="block">
          <span className="text-sm font-600 text-ink">O teu nome</span>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Ex.: Avó Maria"
            autoFocus
            className="mt-1 w-full rounded-xl border border-sky bg-white/80 px-4 py-2.5 text-ink outline-none focus:border-skydark"
          />
        </label>
        {error && <p className="text-sm text-rose-600">{error}</p>}
        <div className="flex justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="rounded-full px-5 py-2.5 text-ink hover:bg-black/5"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={loading}
            className="rounded-full bg-skydark px-6 py-2.5 font-600 text-white shadow-soft transition hover:brightness-105 disabled:opacity-60"
          >
            {loading ? "A reservar…" : "Confirmar reserva"}
          </button>
        </div>
      </form>
    </ModalShell>
  );
}

export function ModalShell({
  title,
  onClose,
  children,
}: {
  title: string;
  onClose: () => void;
  children: React.ReactNode;
}) {
  // Só renderiza no cliente (o portal precisa de document) e bloqueia o scroll
  // do fundo enquanto o modal está aberto.
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, []);

  if (!mounted) return null;

  // Renderizado num portal para document.body — assim o overlay cobre sempre a
  // janela toda e nunca fica "preso" por um transform de um cartão ascendente.
  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-ink/30 p-0 backdrop-blur-sm sm:items-center sm:p-4"
      onClick={onClose}
    >
      <div
        className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-t-xl2 bg-cream p-6 shadow-soft sm:rounded-xl2"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        <div className="mb-4 flex items-center justify-between">
          <h3 className="font-display text-xl font-700 text-ink">{title}</h3>
          <button
            onClick={onClose}
            aria-label="Fechar"
            className="rounded-full px-2 text-2xl leading-none text-inksoft hover:text-ink"
          >
            ×
          </button>
        </div>
        {children}
      </div>
    </div>,
    document.body
  );
}

// Seletor de quantidade (− valor +), partilhado pelos dois modais.
export function QuantityField({
  value,
  max,
  onChange,
  accent,
}: {
  value: number;
  max: number;
  onChange: (n: number) => void;
  accent: "sky" | "peach";
}) {
  const border = accent === "sky" ? "border-sky" : "border-peachdark/60";
  const clamp = (n: number) => Math.max(1, Math.min(max, n));
  return (
    <div>
      <span className="text-sm font-600 text-ink">Quantas unidades?</span>
      <div className="mt-1 flex items-center gap-3">
        <button
          type="button"
          aria-label="Menos"
          onClick={() => onChange(clamp(value - 1))}
          className={`h-10 w-10 rounded-full border ${border} bg-white/80 text-xl font-700 text-ink disabled:opacity-40`}
          disabled={value <= 1}
        >
          −
        </button>
        <input
          type="number"
          min={1}
          max={max}
          value={value}
          onChange={(e) => onChange(clamp(parseInt(e.target.value, 10) || 1))}
          className={`w-20 rounded-xl border ${border} bg-white/80 px-3 py-2 text-center text-ink outline-none`}
        />
        <button
          type="button"
          aria-label="Mais"
          onClick={() => onChange(clamp(value + 1))}
          className={`h-10 w-10 rounded-full border ${border} bg-white/80 text-xl font-700 text-ink disabled:opacity-40`}
          disabled={value >= max}
        >
          +
        </button>
        <span className="text-sm text-inksoft">de {max} disponíveis</span>
      </div>
    </div>
  );
}
