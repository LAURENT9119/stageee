
import { createBrowserClient } from '@supabase/ssr'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://blmyaizvefkfmwgggid.supabase.co'
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('⚠️ Supabase environment variables are missing')
}

export const supabase = createBrowserClient(supabaseUrl, supabaseAnonKey)

export function createClient() {
  return createBrowserClient(supabaseUrl, supabaseAnonKey)
}

export default supabase
