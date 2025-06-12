
import { createClient } from '@supabase/supabase-js'
import type { Database } from './database.types'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co'
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-key'

// Vérifier si les variables sont correctement configurées
if (supabaseUrl === 'https://placeholder.supabase.co' || supabaseAnonKey === 'placeholder-key') {
  console.warn('⚠️ Supabase environment variables not properly configured. Please check your .env.local file.')
}

// Créer le client Supabase avec les types
export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey)

// Export de la fonction createClient pour compatibilité
export function createSupabaseClient() {
  return createClient<Database>(supabaseUrl, supabaseAnonKey)
}

// Export default
export default supabase
