
import { createClient } from '@/lib/supabase/client'
import type { Database } from "../supabase/database.types"

const supabase = createClient()

export interface Template {
  id: string
  nom: string
  type: string
  contenu: string
  variables: string[]
  created_at: string
  updated_at: string
}

export interface TemplateInsert {
  nom: string
  type: string
  contenu: string
  variables?: string[]
}

export interface TemplateUpdate {
  nom?: string
  type?: string
  contenu?: string
  variables?: string[]
}

export class TemplatesService {
  private supabase = supabase

  async getAll(): Promise<Template[]> {
    // Simulated data since templates table might not exist yet
    return [
      {
        id: '1',
        nom: 'Attestation de stage',
        type: 'attestation',
        contenu: 'Attestation de stage pour {{nom}} {{prenom}}...',
        variables: ['nom', 'prenom', 'periode', 'entreprise'],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      {
        id: '2',
        nom: 'Lettre de recommandation',
        type: 'recommandation',
        contenu: 'Je recommande {{nom}} {{prenom}} pour...',
        variables: ['nom', 'prenom', 'competences', 'tuteur'],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
    ]
  }

  async getById(id: string): Promise<Template | null> {
    const templates = await this.getAll()
    return templates.find(t => t.id === id) || null
  }

  async create(template: TemplateInsert): Promise<Template> {
    // Simulated creation
    const newTemplate: Template = {
      id: Date.now().toString(),
      ...template,
      variables: template.variables || [],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
    return newTemplate
  }

  async update(id: string, updates: TemplateUpdate): Promise<Template | null> {
    const template = await this.getById(id)
    if (!template) return null
    
    return {
      ...template,
      ...updates,
      updated_at: new Date().toISOString()
    }
  }

  async delete(id: string): Promise<void> {
    // Simulated deletion
    console.log(`Template ${id} deleted`)
  }

  async generateDocument(templateId: string, variables: Record<string, string>): Promise<string> {
    const template = await this.getById(templateId)
    if (!template) throw new Error('Template not found')
    
    let content = template.contenu
    Object.entries(variables).forEach(([key, value]) => {
      content = content.replace(new RegExp(`{{${key}}}`, 'g'), value)
    })
    
    return content
  }

  extractVariables(content: string): string[] {
    const matches = content.match(/{{(\w+)}}/g) || []
    return matches.map(match => match.replace(/[{}]/g, ''))
  }
}

export const templatesService = new TemplatesService()
