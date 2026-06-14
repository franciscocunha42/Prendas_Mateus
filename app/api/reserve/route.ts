import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { getSupabase, summarize, type Reservation } from "@/lib/supabase";
import { findItem } from "@/lib/items";

export async function POST(request: Request) {
  let body: { itemId?: string; name?: string; quantity?: number };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Pedido inválido." }, { status: 400 });
  }

  const itemId = (body.itemId || "").trim();
  const name = (body.name || "").trim();
  const quantity = Math.max(1, Math.floor(Number(body.quantity) || 1));

  if (!itemId || !name) {
    return NextResponse.json(
      { error: "Falta o item ou o nome." },
      { status: 400 }
    );
  }
  const item = findItem(itemId);
  if (!item) {
    return NextResponse.json({ error: "Item desconhecido." }, { status: 404 });
  }

  let supabase;
  try {
    supabase = getSupabase();
  } catch {
    return NextResponse.json(
      { error: "Serviço indisponível de momento. Tenta mais tarde." },
      { status: 503 }
    );
  }

  const target = item.quantity ?? 1;

  // Verifica quanto já está reservado/comprado antes de aceitar a reserva.
  const { data: rows, error: readError } = await supabase
    .from("reservations")
    .select("*")
    .eq("item_id", itemId);

  if (readError) {
    console.error("Erro ao ler reservas:", readError);
    const detail = (readError as { message?: string }).message;
    return NextResponse.json(
      {
        error: detail
          ? `Não foi possível reservar. (detalhe: ${detail})`
          : "Não foi possível reservar. Tenta novamente.",
      },
      { status: 500 }
    );
  }

  const { takenQty } = summarize((rows ?? []) as Reservation[]);
  const remaining = target - takenQty;

  if (remaining <= 0) {
    return NextResponse.json(
      {
        error:
          target > 1
            ? "Já não faltam unidades deste presente."
            : "Este presente já foi reservado por outra pessoa.",
      },
      { status: 409 }
    );
  }
  if (quantity > remaining) {
    return NextResponse.json(
      { error: `Só faltam ${remaining} unidade(s) deste presente.` },
      { status: 409 }
    );
  }

  const { error } = await supabase.from("reservations").insert({
    item_id: itemId,
    quantity,
    status: "reserved",
    reserver_name: name,
  });

  if (error) {
    console.error("Erro ao reservar:", error);
    const detail = (error as { message?: string }).message;
    return NextResponse.json(
      {
        error: detail
          ? `Não foi possível reservar. (detalhe: ${detail})`
          : "Não foi possível reservar. Tenta novamente.",
      },
      { status: 500 }
    );
  }

  revalidatePath("/");
  return NextResponse.json({ ok: true });
}
