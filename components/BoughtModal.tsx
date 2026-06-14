"use client";

import { useState } from "react";
import { ModalShell } from "./ReserveModal";
import { siteConfig } from "@/lib/site-config";

type Props = {
  itemId: string;
  itemName: string;
  onClose: () => void;
  onDone: () => void;
};

type Method = "store" | "transfer";

export default function BoughtModal({ itemId, itemName, onClose, onDone }: Props) {
  const [name, setName] = useState("");
  const [message, setMessage] = useState("");
  const [method, setMethod] = useState<Method | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) {
      setError("Por favor indica o teu nome.");
      return;
    }
    if (!method) {
      setError("Indica se compraste na loja ou se vais transferir o valor.");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/bought", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          itemId,
          name: name.trim(),
          message: message.trim(),
          paymentMethod: method,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Não foi possível registar. Tenta novamente.");
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
    <ModalShell title="Já comprei este presente" onClose={onClose}>
      <p className="text-sm text-inksoft">
        Obrigado por ajudares com{" "}
        <strong className="text-ink">{itemName}</strong>! 💛 Deixa o teu nome e,
        se quiseres, uma mensagem para nós.
      </p>

      <form onSubmit={submit} className="mt-5 space-y-4">
        <label className="block">
          <span className="text-sm font-600 text-ink">O teu nome</span>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Ex.: Tio João e Tia Rita"
            autoFocus
            className="mt-1 w-full rounded-xl border border-peachdark/60 bg-white/80 px-4 py-2.5 text-ink outline-none focus:border-peachdark"
          />
        </label>

        <label className="block">
          <span className="text-sm font-600 text-ink">Mensagem (opcional)</span>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            rows={3}
            placeholder="Uma palavrinha para o bebé e para os pais…"
            className="mt-1 w-full rounded-xl border border-peachdark/60 bg-white/80 px-4 py-2.5 text-ink outline-none focus:border-peachdark"
          />
        </label>

        <fieldset className="space-y-2">
          <legend className="text-sm font-600 text-ink">Como vais fazer?</legend>
          <MethodOption
            checked={method === "store"}
            onClick={() => setMethod("store")}
            title="🛍️ Comprei na loja"
            subtitle="Já comprei e vou entregar o presente."
          />
          <MethodOption
            checked={method === "transfer"}
            onClick={() => setMethod("transfer")}
            title="💳 Vou transferir o valor"
            subtitle="Preferes que sejamos nós a comprar — transferes o valor."
          />
        </fieldset>

        {method === "transfer" && <TransferDetails />}

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
            className="rounded-full bg-peachdark px-6 py-2.5 font-600 text-white shadow-soft transition hover:brightness-105 disabled:opacity-60"
          >
            {loading ? "A enviar…" : "Confirmar"}
          </button>
        </div>
      </form>
    </ModalShell>
  );
}

function MethodOption({
  checked,
  onClick,
  title,
  subtitle,
}: {
  checked: boolean;
  onClick: () => void;
  title: string;
  subtitle: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex w-full flex-col rounded-xl border px-4 py-3 text-left transition ${
        checked
          ? "border-peachdark bg-peach/60"
          : "border-peachdark/40 bg-white/60 hover:bg-white"
      }`}
    >
      <span className="font-600 text-ink">{title}</span>
      <span className="text-sm text-inksoft">{subtitle}</span>
    </button>
  );
}

function TransferDetails() {
  const { payment, transferDescription } = siteConfig;
  return (
    <div className="rounded-xl bg-white/70 p-4 text-sm text-ink">
      <p className="mb-3 text-inksoft">
        Podes transferir por Revolut ou transferência bancária. Usa{" "}
        <strong className="text-ink">«{transferDescription} – o teu nome»</strong>{" "}
        na descrição.
      </p>

      <div className="mb-3">
        <p className="font-600">Revolut ({payment.revolut.name})</p>
        <a
          href={payment.revolut.link}
          target="_blank"
          rel="noopener noreferrer"
          className="text-skydark underline"
        >
          {payment.revolut.linkLabel}
        </a>
      </div>

      {payment.bankAccounts.map((acc) => (
        <div key={acc.iban} className="mb-3 last:mb-0">
          <p className="font-600">{acc.label}</p>
          <p className="text-inksoft">{acc.holder}</p>
          <p className="select-all font-mono text-ink">{acc.iban}</p>
        </div>
      ))}
    </div>
  );
}
