import { getSupabase } from "@/lib/supabase";

export const dynamic = "force-dynamic";

// Página de diagnóstico — ajuda a perceber porque é que reservar/comprar falha.
// Abre /diagnostico no site e vê o que está a verde (✅) e a vermelho (❌).
// Podes apagar esta página quando tudo estiver a funcionar.

function Row({ ok, label, detail }: { ok: boolean; label: string; detail?: string }) {
  return (
    <li className="flex flex-col gap-0.5 border-b border-black/5 py-3">
      <span className="font-600 text-ink">
        {ok ? "✅" : "❌"} {label}
      </span>
      {detail && (
        <span className="break-all text-sm text-inksoft">{detail}</span>
      )}
    </li>
  );
}

export default async function Diagnostico() {
  const url = process.env.SUPABASE_URL || "";
  const hasKey = !!process.env.SUPABASE_SERVICE_ROLE_KEY;
  const hasResend = !!process.env.RESEND_API_KEY;
  const hasAdmin = !!process.env.ADMIN_PASSWORD;
  const notif = process.env.NOTIFICATION_EMAIL || "";

  // Valida o formato do URL do Supabase (deve ser https://xxxx.supabase.co, sem caminho).
  const urlLooksOk = /^https:\/\/[a-z0-9-]+\.supabase\.co\/?$/i.test(url);

  // Testa a ligação à base de dados e à coluna quantity.
  let dbOk = false;
  let dbDetail = "";
  let quantityOk = false;
  try {
    const supabase = getSupabase();
    const { error } = await supabase
      .from("reservations")
      .select("id, item_id, quantity, status")
      .limit(1);
    if (error) {
      dbDetail = error.message;
      // Se a coluna quantity não existir, a mensagem costuma referir "quantity".
      quantityOk = !/quantity/i.test(error.message);
    } else {
      dbOk = true;
      quantityOk = true;
      dbDetail = "Tabela 'reservations' acessível e com a coluna 'quantity'.";
    }
  } catch (e) {
    dbDetail =
      e instanceof Error ? e.message : "Erro desconhecido ao ligar ao Supabase.";
  }

  return (
    <main className="mx-auto max-w-2xl px-6 py-12">
      <h1 className="mb-2 font-display text-3xl font-700 text-ink">
        Diagnóstico
      </h1>
      <p className="mb-6 text-sm text-inksoft">
        Esta página verifica a configuração. Tira um print e envia para o
        Francisco/assistente se algo estiver a ❌.
      </p>

      <ul className="rounded-xl2 border border-white/60 bg-white/70 px-5 shadow-soft">
        <Row
          ok={!!url}
          label="SUPABASE_URL definida"
          detail={url ? url : "Em falta — define a variável no Vercel."}
        />
        <Row
          ok={urlLooksOk}
          label="SUPABASE_URL tem o formato correto"
          detail={
            urlLooksOk
              ? "OK (https://…​.supabase.co)"
              : "Deve ser exatamente https://<id>.supabase.co, sem /caminho nem barra no fim. Se estiver diferente, é esta a causa do erro."
          }
        />
        <Row
          ok={hasKey}
          label="SUPABASE_SERVICE_ROLE_KEY definida"
          detail={hasKey ? "Presente." : "Em falta — define no Vercel."}
        />
        <Row
          ok={dbOk}
          label="Ligação à base de dados (tabela reservations)"
          detail={dbDetail}
        />
        <Row
          ok={quantityOk}
          label="Coluna 'quantity' existe (feature da roupa)"
          detail={
            quantityOk
              ? "OK."
              : "A tabela parece ser a versão antiga. Corre o SQL novo (drop + create) no Supabase."
          }
        />
        <Row
          ok={hasResend}
          label="RESEND_API_KEY definida (email)"
          detail={hasResend ? "Presente." : "Em falta — os emails não são enviados (mas reservar/comprar funciona na mesma)."}
        />
        <Row
          ok={!!notif}
          label="NOTIFICATION_EMAIL definida"
          detail={notif || "Em falta."}
        />
        <Row
          ok={hasAdmin}
          label="ADMIN_PASSWORD definida (página /admin)"
          detail={hasAdmin ? "Presente." : "Em falta — a página /admin não abre."}
        />
      </ul>

      <p className="mt-6 text-xs text-inksoft">
        Nota: esta página não mostra nenhuma chave secreta — apenas indica se
        está definida. Podes apagá-la mais tarde.
      </p>
    </main>
  );
}
