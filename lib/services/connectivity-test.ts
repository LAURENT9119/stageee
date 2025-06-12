
import { createClient } from '@/lib/supabase/client'

export class ConnectivityTest {
  private supabase = createClient()

  async testDatabaseConnection() {
    try {
      console.log('🔍 Testing database connection...')
      
      const { data, error } = await this.supabase
        .from('users')
        .select('count')
        .limit(1)

      if (error) {
        console.error('❌ Database connection failed:', error.message)
        return { success: false, error: error.message }
      }

      console.log('✅ Database connection successful')
      return { success: true, data }
    } catch (error: any) {
      console.error('❌ Database connection error:', error.message)
      return { success: false, error: error.message }
    }
  }

  async testAuthentication() {
    try {
      console.log('🔍 Testing authentication...')
      
      const { data: { user }, error } = await this.supabase.auth.getUser()

      if (error && error.message !== 'Auth session missing!') {
        console.error('❌ Auth test failed:', error.message)
        return { success: false, error: error.message }
      }

      console.log('✅ Authentication system working')
      return { success: true, user }
    } catch (error: any) {
      console.error('❌ Auth test error:', error.message)
      return { success: false, error: error.message }
    }
  }

  async testAPIEndpoints() {
    const endpoints = [
      '/api/users',
      '/api/demandes',
      '/api/dashboard'
    ]

    const results = []

    for (const endpoint of endpoints) {
      try {
        console.log(`🔍 Testing API endpoint: ${endpoint}`)
        
        const response = await fetch(endpoint, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json'
          }
        })

        const success = response.status < 500
        results.push({
          endpoint,
          status: response.status,
          success,
          message: success ? 'OK' : `Error ${response.status}`
        })

        console.log(`${success ? '✅' : '❌'} ${endpoint}: ${response.status}`)
      } catch (error: any) {
        results.push({
          endpoint,
          status: 0,
          success: false,
          message: error.message
        })
        console.error(`❌ ${endpoint}: ${error.message}`)
      }
    }

    return results
  }

  async runFullTest() {
    console.log('🚀 Starting full connectivity test...')
    
    const dbTest = await this.testDatabaseConnection()
    const authTest = await this.testAuthentication()
    const apiTests = await this.testAPIEndpoints()

    const results = {
      database: dbTest,
      authentication: authTest,
      apis: apiTests,
      timestamp: new Date().toISOString()
    }

    console.log('📊 Test Results:', results)
    return results
  }
}
