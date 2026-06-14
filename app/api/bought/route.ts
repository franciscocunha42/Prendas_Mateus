import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import {
  getSupabase,
  summarize,
  type PaymentMethod,
  type Reservation,
} from "@/lib/supabase";
import { findItem } from "@/lib/items";
import { sendBoughtNotification } from "@/lib/email";

export async function POST(request: Request) {
  let body: {
    itemId?: string;
    name?: string;
    quantity?: number;
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
  const quantity = Math.max(1, Math.floor(Number(body.quantity) || 1));
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

  const target = item.quantity ?? 1;

  // Confirma que ainda há unidades por garantir.
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
          ? `Não foi possível registar. (detalhe: ${detail})`
          : "Não foi possível registar. Tenta novamente.",
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
            : "Este presente já está marcado como comprado.",
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
    status: "bought",
    reserver_name: name,
    message: message || null,
    payment_method: paymentMethod,
  });

  if (error) {
    console.error("Erro ao marcar como comprado:", error);
    const detail = (error as { message?: string }).message;
    return NextResponse.json(
      {
        error: detail
          ? `Não foi possível registar. (detalhe: ${detail})`
          : "Não foi possível registar. Tenta novamente.",
      },
      { status: 500 }
    );
  }

  // Envia o email de notificação. Se falhar, não desfaz o registo — apenas regista.
  try {
    await sendBoughtNotification({
      itemName: target > 1 ? `${item.name} (${quantity} un.)` : item.name,
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
