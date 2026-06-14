# Lista de prendas para o nosso bebé 🍼

Site público (em português de Portugal) onde amigos e família veem a lista de
coisas de que vamos precisar para o bebé e podem **reservar** um presente ou
dizer-nos que já o **compraram**.

- **Reservar** um presente torna-o indisponível para os outros. Quem reservou só
  é visível para a Lúcia e o Francisco, na página `/admin`.
- **Já comprei** permite escrever uma mensagem e escolher entre comprar na loja
  ou transferir o valor (Revolut / transferência bancária). Envia um email para
  `luciaefrancisco2025@gmail.com`.

Construído com **Next.js**, **Supabase** (base de dados) e **Resend** (email),
para alojar na **Vercel**.

---

## 1. Editar a lista, preços e links

Tudo o que é texto e conteúdo está em ficheiros fáceis de mudar:

- **`lib/items.ts`** — os presentes, organizados por categoria. Em cada item
  podes preencher o `price` (ex.: `"39,99 €"`) e o `buyLink` (link da loja).
  Deixa `""` enquanto não souberes. **Não mudes os `id`** depois do site estar
  online (são o que liga cada item às reservas guardadas).
- **`lib/site-config.ts`** — data prevista, dados de pagamento (Revolut/IBAN) e,
  quando quiserem, o **nome do bebé** (`babyName`).

---

## 2. Configurar a base de dados (Supabase)

1. Cria conta em <https://supabase.com> e cria um projeto novo (plano gratuito).
2. No projeto, abre **SQL Editor** e corre este SQL:

   ```sql
   -- Se já tinhas criado uma versão antiga da tabela, apaga-a primeiro:
   -- drop table if exists reservations;

   create table if not exists reservations (
     id             bigint generated always as identity primary key,
     item_id        text not null,
     quantity       integer not null default 1,
     status         text not null check (status in ('reserved','bought')),
     reserver_name  text not null,
     message        text,
     payment_method text check (payment_method in ('store','transfer')),
     created_at     timestamptz not null default now(),
     updated_at     timestamptz not null default now()
   );
   create index if not exists reservations_item_id_idx on reservations (item_id);
   ```

   > Cada presente pode ter várias linhas: nos itens de roupa (ex.: bodies),
   > diferentes pessoas podem reservar/comprar algumas unidades cada, e a coluna
   > `quantity` guarda quantas. **Se já tinhas criado a tabela antiga** (com
   > `item_id` como chave primária), corre primeiro a linha `drop table` em
   > comentário acima.

3. Vai a **Project Settings → API** e copia:
   - **Project URL** → `SUPABASE_URL`
   - **service_role** secret key → `SUPABASE_SERVICE_ROLE_KEY`
     (usada só no servidor; mantém secreta).

---

## 3. Configurar o email (Resend)

1. Cria conta em <https://resend.com> usando **luciaefrancisco2025@gmail.com**
   (assim o Resend deixa enviar para esse email sem precisares de domínio).
2. Em **API Keys**, cria uma chave → `RESEND_API_KEY`.
3. O remetente usado é `onboarding@resend.dev` (já configurado no código). Se um
   dia quiserem um remetente próprio, verifiquem um domínio no Resend.

---

## 4. Variáveis de ambiente

Copia `.env.example` para `.env.local` (desenvolvimento) e preenche:

```
SUPABASE_URL=...
SUPABASE_SERVICE_ROLE_KEY=...
RESEND_API_KEY=...
NOTIFICATION_EMAIL=luciaefrancisco2025@gmail.com
ADMIN_PASSWORD=escolhe-uma-password-forte
```

`ADMIN_PASSWORD` é a password da página `/admin` (só os pais a conhecem).

---

## 5. Correr localmente

```bash
npm install
npm run dev
```

Abre <http://localhost:3000>. A página de administração está em
<http://localhost:3000/admin>.

---

## 6. Publicar na Vercel

1. Faz push do repositório para o GitHub.
2. Em <https://vercel.com>, **Add New → Project** e importa este repositório.
3. Em **Environment Variables**, adiciona as mesmas 5 variáveis do passo 4.
4. **Deploy**. A Vercel dá um endereço público (ex.: `…vercel.app`) para
   partilhar com a família.

> Sempre que mudares `lib/items.ts` (preços/links) ou `lib/site-config.ts`,
> faz commit + push e a Vercel volta a publicar automaticamente.

---

## Estrutura

```
app/
  page.tsx              Página pública (lista por categorias)
  admin/page.tsx        Página dos pais (quem reservou) — protegida por password
  api/reserve/route.ts  Reservar um presente
  api/bought/route.ts   Marcar como comprado + enviar email
components/             Cartões e modais (Reservar / Já comprei)
lib/
  items.ts              A lista de presentes (editar aqui)
  site-config.ts        Data, pagamentos, nome do bebé (editar aqui)
  supabase.ts           Ligação à base de dados
  email.ts              Envio do email via Resend
```
