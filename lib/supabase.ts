import { createClient } from "@supabase/supabase-js";
import type { User } from "@/types/api";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabasePublishableKey =
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY!;

export const supabase = createClient(supabaseUrl, supabasePublishableKey);

// Re-export types for convenience
export type { User };
