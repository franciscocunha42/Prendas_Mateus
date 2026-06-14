import { createClient, type SupabaseClient } from "@supabase/supabase-js";

// Cliente Supabase usado apenas no servidor (Route Handlers / Server Components).
// Usa a service role key, por isso NUNCA deve ser importado em componentes "use client".

export type ReservationStatus = "reserved" | "bought";
export type PaymentMethod = "store" | "transfer";

export type Reservation = {
  id: number;
  item_id: string;
  quantity: number;
  status: ReservationStatus;
  reserver_name: string;
  message: string | null;
  payment_method: PaymentMethod | null;
  created_at: string;
  updated_at: string;
};

type ReservationInsert = {
  item_id: string;
  quantity?: number;
  status: ReservationStatus;
  reserver_name: string;
  message?: string | null;
  payment_method?: PaymentMethod | null;
  created_at?: string;
  updated_at?: string;
};

// Tipos mínimos da base de dados para o cliente Supabase ter type-safety.
type Database = {
  public: {
    Tables: {
      reservations: {
        Row: Reservation;
        Insert: ReservationInsert;
        Update: Partial<ReservationInsert>;
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};

let cached: SupabaseClient<Database> | null = null;

export function getSupabase(): SupabaseClient<Database> {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    throw new Error(
      "Faltam as variáveis de ambiente SUPABASE_URL e/ou SUPABASE_SERVICE_ROLE_KEY."
    );
  }
  if (!cached) {
    cached = createClient<Database>(url, key, {
      auth: { persistSession: false },
    });
  }
  return cached;
}

// Lê todas as reservas e agrupa-as por item: item_id -> lista de contribuições.
// Cada item pode ter várias linhas (ex.: roupa, em que diferentes pessoas
// reservam/compram algumas unidades cada).
export async function getReservationsByItem(): Promise<
  Record<string, Reservation[]>
> {
  const supabase = getSupabase();
  const { data, error } = await supabase.from("reservations").select("*");
  if (error) throw error;
  const map: Record<string, Reservation[]> = {};
  for (const row of (data ?? []) as Reservation[]) {
    (map[row.item_id] ??= []).push(row);
  }
  return map;
}

// Soma as quantidades já reservadas/compradas para um item.
export function summarize(rows: Reservation[] = []) {
  let reservedQty = 0;
  let boughtQty = 0;
  for (const r of rows) {
    if (r.status === "bought") boughtQty += r.quantity;
    else reservedQty += r.quantity;
  }
  return { reservedQty, boughtQty, takenQty: reservedQty + boughtQty };
}
