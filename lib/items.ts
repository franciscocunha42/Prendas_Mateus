// Lista de itens da lista de prendas.
//
// COMO EDITAR (Lúcia e Francisco):
//  - "name": nome do item mostrado no site.
//  - "price": preço a mostrar. Deixar "" enquanto não souberem; é só preencher
//    depois (ex.: "39,99 €").
//  - "buyLink": link da loja onde se pode comprar. Deixar "" se ainda não houver.
//  - "note": observação opcional (ex.: cor, tamanho, modelo preferido).
//  - NÃO mudem o "id" depois do site estar online — é o que liga cada item às
//    reservas guardadas na base de dados.

export type CategoryId = "A" | "B" | "C" | "D" | "E";

export type Item = {
  id: string;
  name: string;
  price: string;
  buyLink: string;
  note?: string;
};

export type Category = {
  id: CategoryId;
  title: string;
  emoji: string;
  items: Item[];
};

export const categories: Category[] = [
  {
    id: "A",
    title: "Dormir & quarto",
    emoji: "🌙",
    items: [
      { id: "a1", name: "Berço de colo / next-to-me", price: "", buyLink: "" },
      { id: "a2", name: "Set de 2 lençóis ajustáveis", price: "", buyLink: "https://www.babylux.nl/set-van-2-hoeslakens-voor-next-2-me-dream-chicco-panda.html" },
      { id: "a3", name: "2 sacos de dormir para bebé", price: "", buyLink: "" },
      { id: "a4", name: "Luz de presença com ruído branco", price: "", buyLink: "" },
    ],
  },
  {
    id: "B",
    title: "Dia a dia em casa",
    emoji: "🧸",
    items: [
      { id: "b1", name: "Tapete de atividades", price: "", buyLink: "" },
    ],
  },
  {
    id: "C",
    title: "Carro & passeios",
    emoji: "🚗",
    items: [
      { id: "c1", name: "Cadeira auto para recém-nascido + base Isofix", price: "", buyLink: "" },
      { id: "c2", name: "Carrinho de passeio com alcofa", price: "", buyLink: "" },
      { id: "c3", name: "Marsúpio / porta-bebés", price: "", buyLink: "" },
    ],
  },
  {
    id: "D",
    title: "Muda da fralda & higiene",
    emoji: "🧴",
    items: [
      { id: "d1", name: "Tapete de muda", price: "", buyLink: "" },
      { id: "d2", name: "Fraldas", price: "", buyLink: "" },
      { id: "d3", name: "Toalhitas ou discos de algodão", price: "", buyLink: "" },
      { id: "d4", name: "Creme muda da fralda", price: "", buyLink: "" },
      { id: "d5", name: "Banheira ou apoio de banho", price: "", buyLink: "" },
      { id: "d6", name: "2 toalhas de bebé", price: "", buyLink: "" },
      { id: "d7", name: "Termómetro", price: "", buyLink: "" },
      { id: "d8", name: "Lima ou tesoura de unhas para bebé", price: "", buyLink: "" },
    ],
  },
  {
    id: "E",
    title: "Roupa & têxteis essenciais",
    emoji: "👶",
    items: [
      { id: "e1", name: "6–8 bodies de manga comprida", price: "", buyLink: "" },
      { id: "e2", name: "6–8 babygrows / pijamas com pés", price: "", buyLink: "" },
      { id: "e3", name: "2–3 casacos ou camadas quentes", price: "", buyLink: "" },
      { id: "e4", name: "4–6 pares de meias", price: "", buyLink: "" },
      { id: "e5", name: "2 gorros de recém-nascido", price: "", buyLink: "" },
      { id: "e6", name: "1 gorro quente de exterior", price: "", buyLink: "" },
      { id: "e7", name: "8–12 fraldas de pano / panos de arroto", price: "", buyLink: "" },
    ],
  },
];

// Todos os itens em lista única (útil para juntar com o estado da base de dados).
export const allItems: Item[] = categories.flatMap((c) => c.items);

export function findItem(id: string): Item | undefined {
  return allItems.find((i) => i.id === id);
}
