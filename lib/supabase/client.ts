
import { createClient as createSupabaseClient } from '@supabase/supabase-js'
import type { Database } from './database.types'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co'
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-key'

// Vérifier si les variables sont correctement configurées
if (supabaseUrl === 'https://placeholder.supabase.co' || supabaseAnonKey === 'placeholder-key') {
  console.warn('⚠️ Supabase environment variables not properly configured. Please check your .env.local file.')
}

// Créer le client Supabase
export function createClient() {
  return createSupabaseClient<Database>(supabaseUrl, supabaseAnonKey)
}

// Export par défaut pour compatibilité
export default createSupabaseClient<Database>(supabaseUrl, supabaseAnonKey)
