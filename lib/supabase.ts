import { createClient } from "@supabase/supabase-js";
import type { User, UserRole } from "@/types/api";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey =
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Re-export types for convenience
export type { User, UserRole };
