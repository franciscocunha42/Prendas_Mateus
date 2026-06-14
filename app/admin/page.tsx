import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { allItems } from "@/lib/items";
import { getReservationsMap, type Reservation } from "@/lib/supabase";

export const dynamic = "force-dynamic";

const COOKIE_NAME = "admin_auth";

async function login(formData: FormData) {
  "use server";
  const password = String(formData.get("password") || "");
  const expected = process.env.ADMIN_PASSWORD;
  if (expected && password === expected) {
    cookies().set(COOKIE_NAME, password, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 24 * 30,
    });
    redirect("/admin");
  }
  redirect("/admin?erro=1");
}

async function logout() {
  "use server";
  cookies().delete(COOKIE_NAME);
  redirect("/admin");
}

function isAuthed(): boolean {
  const expected = process.env.ADMIN_PASSWORD;
  if (!expected) return false;
  return cookies().get(COOKIE_NAME)?.value === expected;
}

export default async function AdminPage({
  searchParams,
}: {
  searchParams: { erro?: string };
}) {
  if (!isAuthed()) {
    return <LoginForm error={searchParams.erro === "1"} />;
  }

  let reservations: Record<string, Reservation> = {};
  let dbError = false;
  try {
    reservations = await getReservationsMap();
  } catch (e) {
    console.error(e);
    dbError = true;
  }

  const reserved = allItems
    .map((item) => ({ item, r: reservations[item.id] }))
    .filter((x) => x.r);
  const available = allItems.filter((item) => !reservations[item.id]);

  return (
    <main className="mx-auto max-w-4xl px-6 py-12">
      <div className="mb-8 flex items-center justify-between">
        <h1 className="font-display text-3xl font-700 text-ink">
          Administração — quem reservou
        </h1>
        <form action={logout}>
          <button className="rounded-full bg-white/70 px-4 py-2 text-sm text-ink shadow-soft hover:brightness-105">
            Sair
          </button>
        </form>
      </div>

      <p className="mb-6 text-sm text-inksoft">
        Esta página é só para a Lúcia e o Francisco. Aqui veem quem reservou ou
        comprou cada presente. Os visitantes nunca veem estes nomes.
      </p>

      {dbError && (
        <div className="mb-6 rounded-xl2 border border-peachdark/50 bg-peach/50 p-4 text-sm text-ink">
          Não foi possível ler as reservas da base de dados.
        </div>
      )}

      <h2 className="mb-3 font-display text-xl font-700 text-ink">
        Presentes com atividade ({reserved.length})
      </h2>
      <div className="mb-10 overflow-hidden rounded-xl2 border border-white/60 bg-white/70 shadow-soft">
        <table className="w-full text-left text-sm">
          <thead className="bg-sky/50 text-ink">
            <tr>
              <th className="px-4 py-3">Presente</th>
              <th className="px-4 py-3">Estado</th>
              <th className="px-4 py-3">Nome</th>
              <th className="px-4 py-3">Como</th>
              <th className="px-4 py-3">Mensagem</th>
            </tr>
          </thead>
          <tbody>
            {reserved.length === 0 && (
              <tr>
                <td className="px-4 py-4 text-inksoft" colSpan={5}>
                  Ainda não há reservas.
                </td>
              </tr>
            )}
            {reserved.map(({ item, r }) => (
              <tr key={item.id} className="border-t border-black/5 align-top">
                <td className="px-4 py-3 text-ink">{item.name}</td>
                <td className="px-4 py-3">
                  {r!.status === "bought" ? "Comprado ✓" : "Reservado"}
                </td>
                <td className="px-4 py-3 text-ink">{r!.reserver_name}</td>
                <td className="px-4 py-3 text-inksoft">
                  {r!.payment_method === "store"
                    ? "Loja"
                    : r!.payment_method === "transfer"
                    ? "Transferência"
                    : "—"}
                </td>
                <td className="px-4 py-3 text-inksoft">
                  {r!.message || "—"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <h2 className="mb-3 font-display text-xl font-700 text-ink">
        Ainda disponíveis ({available.length})
      </h2>
      <ul className="list-inside list-disc text-inksoft">
        {available.map((item) => (
          <li key={item.id}>{item.name}</li>
        ))}
      </ul>
    </main>
  );
}

function LoginForm({ error }: { error: boolean }) {
  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-6">
      <div className="rounded-xl2 border border-white/60 bg-white/70 p-8 shadow-soft">
        <h1 className="mb-2 font-display text-2xl font-700 text-ink">
          Área dos pais
        </h1>
        <p className="mb-6 text-sm text-inksoft">
          Introduz a password para ver quem reservou cada presente.
        </p>
        <form action={login} className="space-y-4">
          <input
            type="password"
            name="password"
            placeholder="Password"
            autoFocus
            className="w-full rounded-xl border border-sky bg-white/80 px-4 py-2.5 text-ink outline-none focus:border-skydark"
          />
          {error && (
            <p className="text-sm text-rose-600">Password incorreta.</p>
          )}
          <button
            type="submit"
            className="w-full rounded-full bg-skydark px-6 py-2.5 font-600 text-white shadow-soft hover:brightness-105"
          >
            Entrar
          </button>
        </form>
      </div>
    </main>
  );
}
