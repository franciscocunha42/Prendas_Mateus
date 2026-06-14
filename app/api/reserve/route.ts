import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { getSupabase } from "@/lib/supabase";
import { findItem } from "@/lib/items";

export async function POST(request: Request) {
  let body: { itemId?: string; name?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Pedido inválido." }, { status: 400 });
  }

  const itemId = (body.itemId || "").trim();
  const name = (body.name || "").trim();

  if (!itemId || !name) {
    return NextResponse.json(
      { error: "Falta o item ou o nome." },
      { status: 400 }
    );
  }
  if (!findItem(itemId)) {
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

  // Insert atómico: se já existir uma reserva para este item, a constraint de
  // item_id único faz falhar — evita reservas duplicadas em simultâneo.
  const { error } = await supabase.from("reservations").insert({
    item_id: itemId,
    status: "reserved",
    reserver_name: name,
  });

  if (error) {
    // 23505 = unique_violation -> já estava reservado/comprado
    if ((error as { code?: string }).code === "23505") {
      return NextResponse.json(
        { error: "Este presente já foi reservado por outra pessoa." },
        { status: 409 }
      );
    }
    console.error("Erro ao reservar:", error);
    return NextResponse.json(
      { error: "Não foi possível reservar. Tenta novamente." },
      { status: 500 }
    );
  }

  revalidatePath("/");
  return NextResponse.json({ ok: true });
}
