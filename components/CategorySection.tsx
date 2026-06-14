import type { Category } from "@/lib/items";
import { summarize, type Reservation } from "@/lib/supabase";
import ItemCard from "./ItemCard";

export default function CategorySection({
  category,
  reservations,
}: {
  category: Category;
  reservations: Record<string, Reservation[]>;
}) {
  return (
    <section className="mb-12">
      <h2 className="mb-5 flex items-center gap-2 font-display text-2xl font-700 text-ink">
        <span aria-hidden>{category.emoji}</span>
        {category.title}
      </h2>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {category.items.map((item) => {
          const target = item.quantity ?? 1;
          const { reservedQty, boughtQty, takenQty } = summarize(
            reservations[item.id]
          );
          const remaining = Math.max(0, target - takenQty);
          return (
            <ItemCard
              key={item.id}
              id={item.id}
              name={item.name}
              price={item.price}
              buyLink={item.buyLink}
              note={item.note}
              target={target}
              reservedQty={reservedQty}
              boughtQty={boughtQty}
              remaining={remaining}
            />
          );
        })}
      </div>
    </section>
  );
}
