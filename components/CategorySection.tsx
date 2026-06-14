import type { Category } from "@/lib/items";
import type { Reservation } from "@/lib/supabase";
import ItemCard, { ItemStatus } from "./ItemCard";

function statusFor(reservation: Reservation | undefined): ItemStatus {
  if (!reservation) return "available";
  if (reservation.status === "bought") return "bought";
  return "reserved";
}

export default function CategorySection({
  category,
  reservations,
}: {
  category: Category;
  reservations: Record<string, Reservation>;
}) {
  return (
    <section className="mb-12">
      <h2 className="mb-5 flex items-center gap-2 font-display text-2xl font-700 text-ink">
        <span aria-hidden>{category.emoji}</span>
        {category.title}
      </h2>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {category.items.map((item) => (
          <ItemCard
            key={item.id}
            id={item.id}
            name={item.name}
            price={item.price}
            buyLink={item.buyLink}
            note={item.note}
            status={statusFor(reservations[item.id])}
          />
        ))}
      </div>
    </section>
  );
}
