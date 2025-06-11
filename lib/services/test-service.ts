import { createClient } from "@/lib/supabase/client"

export class TestService {
  private supabase = createClient()

  // Test de connectivité à la base de données
  async testConnection() {
    try {
      const { data, error } = await this.supabase.from("users").select("count").limit(1)

      if (error) throw error

      return {
        success: true,
        message: "Connexion à la base de données réussie",
        timestamp: new Date().toISOString(),
      }
    } catch (error: any) {
      return {
        success: false,
        message: `Erreur de connexion: ${error.message}`,
        timestamp: new Date().toISOString(),
      }
    }
  }

  // Test des permissions RLS
  async testRLSPermissions(userId: string) {
    const tests = []

    try {
      // Test lecture users
      const { data: users, error: usersError } = await this.supabase.from("users").select("id").limit(1)

      tests.push({
        table: "users",
        operation: "SELECT",
        success: !usersError,
        error: usersError?.message,
      })

      // Test lecture stagiaires
      const { data: stagiaires, error: stagiairesError } = await this.supabase.from("stagiaires").select("id").limit(1)

      tests.push({
        table: "stagiaires",
        operation: "SELECT",
        success: !stagiairesError,
        error: stagiairesError?.message,
      })

      // Test lecture demandes
      const { data: demandes, error: demandesError } = await this.supabase.from("demandes").select("id").limit(1)

      tests.push({
        table: "demandes",
        operation: "SELECT",
        success: !demandesError,
        error: demandesError?.message,
      })

      return {
        success: tests.every((test) => test.success),
        tests,
        timestamp: new Date().toISOString(),
      }
    } catch (error: any) {
      return {
        success: false,
        message: `Erreur lors du test RLS: ${error.message}`,
        timestamp: new Date().toISOString(),
      }
    }
  }

  // Test des opérations CRUD de base
  async testBasicCRUD() {
    const results = []

    try {
      // Test CREATE - Créer un utilisateur test
      const testUser = {
        email: `test-crud-${Date.now()}@example.com`,
        name: "Test CRUD User",
        role: "stagiaire" as const,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }

      const { data: createdUser, error: createError } = await this.supabase
        .from("users")
        .insert(testUser)
        .select()
        .single()

      results.push({
        operation: "CREATE",
        success: !createError,
        error: createError?.message,
        data: createdUser,
      })

      if (createdUser) {
        // Test READ
        const { data: readUser, error: readError } = await this.supabase
          .from("users")
          .select("*")
          .eq("id", createdUser.id)
          .single()

        results.push({
          operation: "READ",
          success: !readError,
          error: readError?.message,
          data: readUser,
        })

        // Test UPDATE
        const { data: updatedUser, error: updateError } = await this.supabase
          .from("users")
          .update({ name: "Test CRUD User Updated" })
          .eq("id", createdUser.id)
          .select()
          .single()

        results.push({
          operation: "UPDATE",
          success: !updateError,
          error: updateError?.message,
          data: updatedUser,
        })

        // Test DELETE
        const { error: deleteError } = await this.supabase.from("users").delete().eq("id", createdUser.id)

        results.push({
          operation: "DELETE",
          success: !deleteError,
          error: deleteError?.message,
        })
      }

      return {
        success: results.every((result) => result.success),
        results,
        timestamp: new Date().toISOString(),
      }
    } catch (error: any) {
      return {
        success: false,
        message: `Erreur lors du test CRUD: ${error.message}`,
        timestamp: new Date().toISOString(),
      }
    }
  }

  // Test complet de l'application
  async runFullTest() {
    const startTime = Date.now()

    const connectionTest = await this.testConnection()
    const crudTest = await this.testBasicCRUD()

    const endTime = Date.now()
    const duration = endTime - startTime

    return {
      summary: {
        success: connectionTest.success && crudTest.success,
        duration: `${duration}ms`,
        timestamp: new Date().toISOString(),
      },
      tests: {
        connection: connectionTest,
        crud: crudTest,
      },
    }
  }
}

export const testService = new TestService()
