import { createClient, type SupabaseClient } from "@supabase/supabase-js";

// Cliente Supabase usado apenas no servidor (Route Handlers / Server Components).
// Usa a service role key, por isso NUNCA deve ser importado em componentes "use client".

export type ReservationStatus = "reserved" | "bought";
export type PaymentMethod = "store" | "transfer";

export type Reservation = {
  item_id: string;
  status: ReservationStatus;
  reserver_name: string;
  message: string | null;
  payment_method: PaymentMethod | null;
  created_at: string;
  updated_at: string;
};

type ReservationInsert = {
  item_id: string;
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

// Lê todas as reservas e devolve um mapa item_id -> reserva.
export async function getReservationsMap(): Promise<Record<string, Reservation>> {
  const supabase = getSupabase();
  const { data, error } = await supabase.from("reservations").select("*");
  if (error) throw error;
  const map: Record<string, Reservation> = {};
  for (const row of (data ?? []) as Reservation[]) {
    map[row.item_id] = row;
  }
  return map;
}
