
'use client'

import { useState } from 'react'
import { ConnectivityTest } from '@/lib/services/connectivity-test'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ProtectedPage } from '@/components/auth/ProtectedPage'

export default function ConnectivityTestPage() {
  const [testResults, setTestResults] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  const runTests = async () => {
    setLoading(true)
    try {
      const tester = new ConnectivityTest()
      const results = await tester.runFullTest()
      setTestResults(results)
    } catch (error) {
      console.error('Test failed:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <ProtectedPage requiredRoles={['admin']}>
      <div className="container mx-auto p-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold">Test de Connectivité</h1>
          <p className="text-gray-600 mt-2">
            Vérifiez la connectivité entre le frontend, les APIs et la base de données
          </p>
        </div>

        <div className="mb-6">
          <Button onClick={runTests} disabled={loading}>
            {loading ? 'Test en cours...' : 'Lancer les tests'}
          </Button>
        </div>

        {testResults && (
          <div className="space-y-6">
            {/* Database Test */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  Base de Données
                  <Badge variant={testResults.database.success ? "default" : "destructive"}>
                    {testResults.database.success ? "✅ OK" : "❌ Erreur"}
                  </Badge>
                </CardTitle>
                <CardDescription>
                  Test de connexion à Supabase
                </CardDescription>
              </CardHeader>
              <CardContent>
                {testResults.database.error && (
                  <p className="text-red-600">{testResults.database.error}</p>
                )}
              </CardContent>
            </Card>

            {/* Authentication Test */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  Authentification
                  <Badge variant={testResults.authentication.success ? "default" : "destructive"}>
                    {testResults.authentication.success ? "✅ OK" : "❌ Erreur"}
                  </Badge>
                </CardTitle>
                <CardDescription>
                  Test du système d'authentification
                </CardDescription>
              </CardHeader>
              <CardContent>
                {testResults.authentication.error && (
                  <p className="text-red-600">{testResults.authentication.error}</p>
                )}
              </CardContent>
            </Card>

            {/* API Tests */}
            <Card>
              <CardHeader>
                <CardTitle>APIs</CardTitle>
                <CardDescription>
                  Test des endpoints API
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {testResults.apis.map((api: any, index: number) => (
                    <div key={index} className="flex items-center justify-between p-2 border rounded">
                      <span className="font-mono text-sm">{api.endpoint}</span>
                      <div className="flex items-center gap-2">
                        <Badge variant={api.success ? "default" : "destructive"}>
                          {api.status}
                        </Badge>
                        <span className="text-sm">{api.message}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Test Info */}
            <Card>
              <CardContent className="pt-6">
                <p className="text-sm text-gray-500">
                  Test effectué le : {new Date(testResults.timestamp).toLocaleString('fr-FR')}
                </p>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </ProtectedPage>
  )
}
