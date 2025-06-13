
import { createClient } from '@/lib/supabase/client'
import type { SupabaseClient } from '@supabase/supabase-js'
import type { Database } from '../supabase/database.types'

export abstract class BaseService {
  protected supabase: SupabaseClient<Database>

  constructor() {
    this.supabase = createClient()
  }

  protected async getAll<T>(
    table: string,
    select: string = '*',
    orderBy: { column: string; ascending: boolean } = { column: 'created_at', ascending: false }
  ): Promise<T[]> {
    const { data, error } = await this.supabase
      .from(table)
      .select(select)
      .order(orderBy.column, { ascending: orderBy.ascending })

    if (error) throw error
    return data || []
  }

  protected async getById<T>(table: string, id: string, select: string = '*'): Promise<T | null> {
    const { data, error } = await this.supabase
      .from(table)
      .select(select)
      .eq('id', id)
      .single()

    if (error) {
      if (error.code === 'PGRST116') return null
      throw error
    }
    return data
  }

  protected async create<T>(table: string, data: any): Promise<T> {
    const { data: result, error } = await this.supabase
      .from(table)
      .insert(data)
      .select()
      .single()

    if (error) throw error
    return result
  }

  protected async update<T>(table: string, id: string, updates: any): Promise<T> {
    const { data, error } = await this.supabase
      .from(table)
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return data
  }

  protected async delete(table: string, id: string): Promise<void> {
    const { error } = await this.supabase
      .from(table)
      .delete()
      .eq('id', id)

    if (error) throw error
  }

  protected async getCount(table: string, filters?: Record<string, any>): Promise<number> {
    let query = this.supabase
      .from(table)
      .select('id', { count: 'exact' })

    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          query = query.eq(key, value)
        }
      })
    }

    const { count, error } = await query

    if (error) throw error
    return count || 0
  }

  protected async search<T>(
    table: string,
    searchFields: string[],
    searchTerm: string,
    select: string = '*',
    filters?: Record<string, any>
  ): Promise<T[]> {
    let query = this.supabase.from(table).select(select)

    // Appliquer les filtres de recherche
    if (searchTerm && searchFields.length > 0) {
      const searchConditions = searchFields
        .map(field => `${field}.ilike.%${searchTerm}%`)
        .join(',')
      query = query.or(searchConditions)
    }

    // Appliquer les filtres additionnels
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          query = query.eq(key, value)
        }
      })
    }

    const { data, error } = await query.order('created_at', { ascending: false })

    if (error) throw error
    return data || []
  }
}
