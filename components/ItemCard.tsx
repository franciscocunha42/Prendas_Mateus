"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import ReserveModal from "./ReserveModal";
import BoughtModal from "./BoughtModal";

export type ItemStatus = "available" | "reserved" | "bought";

type Props = {
  id: string;
  name: string;
  price: string;
  buyLink: string;
  note?: string;
  status: ItemStatus;
};

export default function ItemCard({ id, name, price, buyLink, note, status }: Props) {
  const router = useRouter();
  const [modal, setModal] = useState<null | "reserve" | "bought">(null);

  const taken = status !== "available";

  function handleDone() {
    setModal(null);
    router.refresh();
  }

  return (
    <div
      className={`flex flex-col rounded-xl2 border border-white/60 bg-white/70 p-5 shadow-soft transition ${
        taken ? "opacity-80" : "hover:-translate-y-0.5"
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <h3 className="font-600 text-ink">{name}</h3>
        <StatusBadge status={status} />
      </div>

      {note && <p className="mt-1 text-sm text-inksoft">{note}</p>}

      <div className="mt-2 text-sm">
        {price ? (
          <span className="font-600 text-ink">{price}</span>
        ) : (
          <span className="text-inksoft">Preço a indicar</span>
        )}
      </div>

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

        {status === "available" && (
          <div className="mt-4 flex flex-wrap gap-2">
            <button
              onClick={() => setModal("reserve")}
              className="rounded-full bg-skydark px-4 py-2 text-sm font-600 text-white shadow-soft transition hover:brightness-105"
            >
              Reservar
            </button>
            <button
              onClick={() => setModal("bought")}
              className="rounded-full bg-peachdark px-4 py-2 text-sm font-600 text-white shadow-soft transition hover:brightness-105"
            >
              Já comprei
            </button>
          </div>
        )}

        {status === "reserved" && (
          <div className="mt-4">
            <button
              onClick={() => setModal("bought")}
              className="rounded-full border border-peachdark/60 bg-white/70 px-4 py-2 text-sm font-600 text-peachdark transition hover:bg-peach/40"
            >
              Fui eu que reservei — já comprei
            </button>
          </div>
        )}
      </div>

      {modal === "reserve" && (
        <ReserveModal
          itemId={id}
          itemName={name}
          onClose={() => setModal(null)}
          onDone={handleDone}
        />
      )}
      {modal === "bought" && (
        <BoughtModal
          itemId={id}
          itemName={name}
          onClose={() => setModal(null)}
          onDone={handleDone}
        />
      )}
    </div>
  );
}

function StatusBadge({ status }: { status: ItemStatus }) {
  if (status === "reserved") {
    return (
      <span className="shrink-0 rounded-full bg-sky px-3 py-1 text-xs font-600 text-ink">
        Reservado
      </span>
    );
  }
  if (status === "bought") {
    return (
      <span className="shrink-0 rounded-full bg-mintdark px-3 py-1 text-xs font-600 text-ink">
        Já comprado ✓
      </span>
    );
  }
  return (
    <span className="shrink-0 rounded-full bg-mint px-3 py-1 text-xs font-600 text-ink">
      Disponível
    </span>
  );
}
