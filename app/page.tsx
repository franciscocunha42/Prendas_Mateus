import Hero from "@/components/Hero";
import Gallery from "@/components/Gallery";
import CategorySection from "@/components/CategorySection";
import { categories } from "@/lib/items";
import { getReservationsByItem, type Reservation } from "@/lib/supabase";

// A página depende do estado das reservas, por isso é sempre renderizada a pedido.
export const dynamic = "force-dynamic";

export default async function Home() {
  let reservations: Record<string, Reservation[]> = {};
  let dbError = false;

  try {
    reservations = await getReservationsByItem();
  } catch (e) {
    console.error("Não foi possível ler as reservas:", e);
    dbError = true;
  }

  return (
    <main className="min-h-screen pb-24">
      <Hero />

      <Gallery />

      <div className="mx-auto max-w-5xl px-6">
        {dbError && (
          <div className="mb-8 rounded-xl2 border border-peachdark/50 bg-peach/50 p-4 text-sm text-ink">
            Estamos com uma dificuldade técnica a carregar as reservas. Os
            presentes aparecem como disponíveis — por favor tenta novamente daqui
            a pouco antes de reservar.
          </div>
        )}

        {categories.map((category) => (
          <CategorySection
            key={category.id}
            category={category}
            reservations={reservations}
          />
        ))}
      </div>

      <footer className="mx-auto max-w-5xl px-6 text-center text-sm text-inksoft">
        Feito com muito amor à espera do nosso bebé 💛
      </footer>
    </main>
  );
}
