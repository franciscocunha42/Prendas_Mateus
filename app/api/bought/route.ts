import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { getSupabase, type PaymentMethod } from "@/lib/supabase";
import { findItem } from "@/lib/items";
import { sendBoughtNotification } from "@/lib/email";

export async function POST(request: Request) {
  let body: {
    itemId?: string;
    name?: string;
    message?: string;
    paymentMethod?: string;
  };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Pedido inválido." }, { status: 400 });
  }

  const itemId = (body.itemId || "").trim();
  const name = (body.name || "").trim();
  const message = (body.message || "").trim();
  const paymentMethod = body.paymentMethod as PaymentMethod | undefined;

  if (!itemId || !name) {
    return NextResponse.json(
      { error: "Falta o item ou o nome." },
      { status: 400 }
    );
  }
  if (paymentMethod !== "store" && paymentMethod !== "transfer") {
    return NextResponse.json(
      { error: "Indica como vais fazer (loja ou transferência)." },
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

  // Upsert: marca como comprado, quer estivesse disponível quer reservado.
  const { error } = await supabase
    .from("reservations")
    .upsert(
      {
        item_id: itemId,
        status: "bought",
        reserver_name: name,
        message: message || null,
        payment_method: paymentMethod,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "item_id" }
    );

  if (error) {
    console.error("Erro ao marcar como comprado:", error);
    return NextResponse.json(
      { error: "Não foi possível registar. Tenta novamente." },
      { status: 500 }
    );
  }

  // Envia o email de notificação. Se falhar, não desfaz o registo — apenas regista.
  try {
    await sendBoughtNotification({
      itemName: item.name,
      buyerName: name,
      message,
      paymentMethod,
    });
  } catch (e) {
    console.error("Erro ao enviar email de notificação:", e);
  }

  revalidatePath("/");
  return NextResponse.json({ ok: true });
}
