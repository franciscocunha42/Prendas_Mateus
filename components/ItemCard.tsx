"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import ReserveModal from "./ReserveModal";
import BoughtModal from "./BoughtModal";

type Props = {
  id: string;
  name: string;
  price: string;
  buyLink: string;
  note?: string;
  target: number;
  reservedQty: number;
  boughtQty: number;
  remaining: number;
};

export default function ItemCard({
  id,
  name,
  price,
  buyLink,
  note,
  target,
  reservedQty,
  boughtQty,
  remaining,
}: Props) {
  const router = useRouter();
  const [modal, setModal] = useState<null | "reserve" | "bought">(null);

  const isMulti = target > 1;
  const fullyTaken = remaining <= 0;

  function handleDone() {
    setModal(null);
    router.refresh();
  }

  return (
    <div
      className={`flex flex-col rounded-xl2 border border-white/60 bg-white/70 p-5 shadow-soft transition ${
        fullyTaken ? "opacity-80" : "hover:-translate-y-0.5"
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <h3 className="font-600 text-ink">{name}</h3>
        <StatusBadge
          isMulti={isMulti}
          fullyTaken={fullyTaken}
          reservedQty={reservedQty}
          boughtQty={boughtQty}
        />
      </div>

      {note && <p className="mt-1 text-sm text-inksoft">{note}</p>}

      <div className="mt-2 text-sm">
        {price ? (
          <span className="font-600 text-ink">{price}</span>
        ) : (
          <span className="text-inksoft">Preço a indicar</span>
        )}
        {isMulti && <span className="text-inksoft"> · cada</span>}
      </div>

      {isMulti && (
        <MultiProgress
          target={target}
          reservedQty={reservedQty}
          boughtQty={boughtQty}
          remaining={remaining}
        />
      )}

      <div className="mt-auto pt-4">
        {buyLink ? (
          <a
            href={buyLink}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-skydark underline underline-offset-2 hover:text-ink"
          >
            Ver produto ↗
          </a>
        ) : (
          <span className="text-sm text-inksoft">Sugestão sem link específico</span>
        )}

        {!fullyTaken && (
          <div className="mt-4 flex flex-wrap gap-2">
            <button
              onClick={() => setModal("reserve")}
              className="rounded-full bg-skydark px-4 py-2 text-sm font-600 text-white shadow-soft transition hover:brightness-105"
            >
              {isMulti ? "Reservar algumas" : "Reservar"}
            </button>
            <button
              onClick={() => setModal("bought")}
              className="rounded-full bg-peachdark px-4 py-2 text-sm font-600 text-white shadow-soft transition hover:brightness-105"
            >
              {isMulti ? "Já comprei algumas" : "Já comprei"}
            </button>
          </div>
        )}
      </div>

      {modal === "reserve" && (
        <ReserveModal
          itemId={id}
          itemName={name}
          maxQuantity={remaining}
          onClose={() => setModal(null)}
          onDone={handleDone}
        />
      )}
      {modal === "bought" && (
        <BoughtModal
          itemId={id}
          itemName={name}
          maxQuantity={remaining}
          onClose={() => setModal(null)}
          onDone={handleDone}
        />
      )}
    </div>
  );
}

function MultiProgress({
  target,
  reservedQty,
  boughtQty,
  remaining,
}: {
  target: number;
  reservedQty: number;
  boughtQty: number;
  remaining: number;
}) {
  const taken = reservedQty + boughtQty;
  const pct = Math.min(100, Math.round((taken / target) * 100));
  return (
    <div className="mt-3">
      <div className="h-2 w-full overflow-hidden rounded-full bg-sand">
        <div
          className="h-full rounded-full bg-mintdark"
          style={{ width: `${pct}%` }}
        />
      </div>
      <p className="mt-1.5 text-xs text-inksoft">
        {taken} de {target} já garantidos
        {remaining > 0 ? (
          <>
            {" "}
            · <strong className="text-ink">faltam {remaining}</strong>
          </>
        ) : (
          " · completo ✓"
        )}
      </p>
    </div>
  );
}

function StatusBadge({
  isMulti,
  fullyTaken,
  reservedQty,
  boughtQty,
}: {
  isMulti: boolean;
  fullyTaken: boolean;
  reservedQty: number;
  boughtQty: number;
}) {
  if (isMulti) {
    if (fullyTaken) {
      return (
        <span className="shrink-0 rounded-full bg-mintdark px-3 py-1 text-xs font-600 text-ink">
          Completo ✓
        </span>
      );
    }
    return (
      <span className="shrink-0 rounded-full bg-mint px-3 py-1 text-xs font-600 text-ink">
        Disponível
      </span>
    );
  }

  // Item de unidade única
  if (boughtQty > 0) {
    return (
      <span className="shrink-0 rounded-full bg-mintdark px-3 py-1 text-xs font-600 text-ink">
        Já comprado ✓
      </span>
    );
  }
  if (reservedQty > 0) {
    return (
      <span className="shrink-0 rounded-full bg-sky px-3 py-1 text-xs font-600 text-ink">
        Reservado
      </span>
    );
  }
  return (
    <span className="shrink-0 rounded-full bg-mint px-3 py-1 text-xs font-600 text-ink">
      Disponível
    </span>
  );
}
