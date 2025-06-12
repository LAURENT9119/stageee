import { supabase } from '@/lib/supabase/client'
import type { Database } from "../supabase/database.types"

const supabase = createClient()

export type User = Database["public"]["Tables"]["users"]["Row"]
export type UserInsert = Database["public"]["Tables"]["users"]["Insert"]
export type UserUpdate = Database["public"]["Tables"]["users"]["Update"]

export class UsersService {
  private supabase = supabase

  async getAll() {
    const { data, error } = await this.supabase
      .from('users')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) throw error
    return data
  }

  async getById(id: string) {
    const { data, error } = await this.supabase
      .from('users')
      .select('*')
      .eq('id', id)
      .single()

    if (error) throw error
    return data
  }

  async create(user: UserInsert) {
    const { data, error } = await this.supabase
      .from('users')
      .insert(user)
      .select()
      .single()

    if (error) throw error
    return data
  }

  async update(id: string, updates: UserUpdate) {
    const { data, error } = await this.supabase
      .from('users')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return data
  }

  async delete(id: string) {
    const { error } = await this.supabase
      .from('users')
      .delete()
      .eq('id', id)

    if (error) throw error
  }

  async getByRole(role: string) {
    const { data, error } = await this.supabase
      .from('users')
      .select('*')
      .eq('role', role)
      .order('created_at', { ascending: false })

    if (error) throw error
    return data
  }

  async search(searchTerm: string) {
    const { data, error } = await this.supabase
      .from('users')
      .select('*')
      .or(`name.ilike.%${searchTerm}%,email.ilike.%${searchTerm}%`)
      .order('created_at', { ascending: false })

    if (error) throw error
    return data
  }
}

export const usersService = new UsersService()