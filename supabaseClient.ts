// supabaseClient.ts
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

// Cliente principal - con auth (para reservas, login, etc.)
export const supabase: SupabaseClient = createClient(supabaseUrl, supabaseAnonKey);

// Cliente público - sin auth (para queries públicas que no necesitan sesión)
export const supabasePublic: SupabaseClient = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
    detectSessionInUrl: false,
  }
});