
'use client'

import { useState } from 'react'
import { ConnectivityTest } from '@/lib/services/connectivity-test'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ProtectedPage } from '@/components/auth/ProtectedPage'
import { authService } from '@/lib/services/auth-service'
import { usersService } from '@/lib/services/users-service'
import { stagiairesService } from '@/lib/services/stagiaires-service'
import { demandesService } from '@/lib/services/demandes-service'
import { documentsService } from '@/lib/services/documents-service'

export default function ConnectivityTestPage() {
  const [testResults, setTestResults] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [apiTests, setApiTests] = useState<any[]>([])

  const testAllServices = async () => {
    setLoading(true)
    const results = []

    try {
      // Test Auth Service
      console.log('🔍 Testing Auth Service...')
      const authUser = await authService.getCurrentUser()
      results.push({
        service: 'Auth Service',
        status: authUser ? 'success' : 'warning',
        message: authUser ? 'Utilisateur connecté' : 'Aucun utilisateur connecté',
        data: authUser
      })

      // Test Users Service
      console.log('🔍 Testing Users Service...')
      try {
        const users = await usersService.getAllUsers()
        results.push({
          service: 'Users Service',
          status: 'success',
          message: `${users.length} utilisateurs récupérés`,
          data: users.slice(0, 3)
        })
      } catch (error: any) {
        results.push({
          service: 'Users Service',
          status: 'error',
          message: error.message
        })
      }

      // Test Stagiaires Service
      console.log('🔍 Testing Stagiaires Service...')
      try {
        const stagiaires = await stagiairesService.getAllStagiaires()
        results.push({
          service: 'Stagiaires Service',
          status: 'success',
          message: `${stagiaires.length} stagiaires récupérés`,
          data: stagiaires.slice(0, 3)
        })
      } catch (error: any) {
        results.push({
          service: 'Stagiaires Service',
          status: 'error',
          message: error.message
        })
      }

      // Test Demandes Service
      console.log('🔍 Testing Demandes Service...')
      try {
        const demandes = await demandesService.getAllDemandes()
        results.push({
          service: 'Demandes Service',
          status: 'success',
          message: `${demandes.length} demandes récupérées`,
          data: demandes.slice(0, 3)
        })
      } catch (error: any) {
        results.push({
          service: 'Demandes Service',
          status: 'error',
          message: error.message
        })
      }

      // Test Documents Service
      console.log('🔍 Testing Documents Service...')
      try {
        const documents = await documentsService.getAllDocuments()
        results.push({
          service: 'Documents Service',
          status: 'success',
          message: `${documents.length} documents récupérés`,
          data: documents.slice(0, 3)
        })
      } catch (error: any) {
        results.push({
          service: 'Documents Service',
          status: 'error',
          message: error.message
        })
      }

      setApiTests(results)

      // Test de connectivité générale
      const tester = new ConnectivityTest()
      const connectivityResults = await tester.runFullTest()
      setTestResults(connectivityResults)

    } catch (error) {
      console.error('Test failed:', error)
    } finally {
      setLoading(false)
    }
  }

  const getBadgeVariant = (status: string) => {
    switch (status) {
      case 'success': return 'default'
      case 'warning': return 'secondary'
      case 'error': return 'destructive'
      default: return 'outline'
    }
  }

  return (
    <ProtectedPage requiredRoles={['admin']}>
      <div className="container mx-auto p-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold">Test de Connectivité Complet</h1>
          <p className="text-gray-600 mt-2">
            Vérifiez la connectivité entre le frontend, les services, les APIs et la base de données
          </p>
        </div>

        <div className="mb-6">
          <Button onClick={testAllServices} disabled={loading}>
            {loading ? 'Tests en cours...' : 'Lancer tous les tests'}
          </Button>
        </div>

        {/* Tests des Services */}
        {apiTests.length > 0 && (
          <div className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">Tests des Services</h2>
            <div className="grid gap-4">
              {apiTests.map((test, index) => (
                <Card key={index}>
                  <CardHeader>
                    <div className="flex justify-between items-center">
                      <CardTitle className="text-lg">{test.service}</CardTitle>
                      <Badge variant={getBadgeVariant(test.status)}>
                        {test.status}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-600 mb-2">{test.message}</p>
                    {test.data && (
                      <pre className="bg-gray-100 p-2 rounded text-xs overflow-auto max-h-40">
                        {JSON.stringify(test.data, null, 2)}
                      </pre>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Tests de connectivité */}
        {testResults && (
          <div className="space-y-6">
            <h2 className="text-2xl font-semibold">Résultats de Connectivité</h2>
            
            {/* Database Test */}
            <Card>
              <CardHeader>
                <CardTitle className="flex justify-between items-center">
                  Base de données
                  <Badge variant={testResults.database.success ? 'default' : 'destructive'}>
                    {testResults.database.success ? 'Connecté' : 'Erreur'}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {testResults.database.error && (
                  <p className="text-red-600 text-sm">{testResults.database.error}</p>
                )}
                {testResults.database.data && (
                  <pre className="bg-gray-100 p-2 rounded text-xs">
                    {JSON.stringify(testResults.database.data, null, 2)}
                  </pre>
                )}
              </CardContent>
            </Card>

            {/* Auth Test */}
            <Card>
              <CardHeader>
                <CardTitle className="flex justify-between items-center">
                  Authentification
                  <Badge variant={testResults.authentication.success ? 'default' : 'destructive'}>
                    {testResults.authentication.success ? 'OK' : 'Erreur'}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {testResults.authentication.user ? (
                  <p className="text-green-600 text-sm">Utilisateur: {testResults.authentication.user.email}</p>
                ) : (
                  <p className="text-orange-600 text-sm">Aucun utilisateur connecté</p>
                )}
              </CardContent>
            </Card>

            {/* API Tests */}
            <Card>
              <CardHeader>
                <CardTitle>APIs</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {testResults.apis.map((api: any, index: number) => (
                    <div key={index} className="flex justify-between items-center">
                      <span className="text-sm">{api.endpoint}</span>
                      <Badge variant={api.success ? 'default' : 'destructive'}>
                        {api.status} - {api.message}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </ProtectedPage>
  )
}
