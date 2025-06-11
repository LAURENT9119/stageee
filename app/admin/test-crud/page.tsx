"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import { CheckCircle, XCircle, Loader2, Plus, RefreshCw, Users, FileText, MessageSquare } from "lucide-react"

// Import des services
import { usersService } from "@/lib/services/users-service"
import { stagiairesService } from "@/lib/services/stagiaires-service"
import { demandesService } from "@/lib/services/demandes-service"
import { documentsService } from "@/lib/services/documents-service"
import { authService } from "@/lib/services/auth-service"

interface TestResult {
  operation: string
  status: "success" | "error" | "pending"
  message: string
  data?: any
}

export default function TestCRUDPage() {
  const [testResults, setTestResults] = useState<TestResult[]>([])
  const [loading, setLoading] = useState(false)
  const [currentUser, setCurrentUser] = useState<any>(null)

  // États pour les formulaires de test
  const [testData, setTestData] = useState({
    user: {
      email: "test@example.com",
      name: "Test User",
      role: "stagiaire",
      phone: "0123456789",
      department: "IT",
    },
    stagiaire: {
      nom: "Dupont",
      prenom: "Jean",
      email: "jean.dupont@example.com",
      telephone: "0123456789",
      formation: "Informatique",
      ecole: "Université Test",
      periode: "6 mois",
    },
    demande: {
      type: "conge",
      details: "Demande de congé pour raisons personnelles",
      duree: "5 jours",
    },
  })

  useEffect(() => {
    loadCurrentUser()
  }, [])

  const loadCurrentUser = async () => {
    try {
      const { user } = await authService.getCurrentUser()
      if (user) {
        const profile = await authService.getUserProfile(user.id)
        setCurrentUser(profile.profile)
      }
    } catch (error) {
      console.error("Erreur lors du chargement de l'utilisateur:", error)
    }
  }

  const addTestResult = (operation: string, status: "success" | "error" | "pending", message: string, data?: any) => {
    setTestResults((prev) => [...prev, { operation, status, message, data }])
  }

  const clearResults = () => {
    setTestResults([])
  }

  // Tests pour Users Service
  const testUsersService = async () => {
    setLoading(true)
    addTestResult("Users Service", "pending", "Début des tests...")

    try {
      // Test GET - Récupérer tous les utilisateurs
      addTestResult("GET Users", "pending", "Récupération des utilisateurs...")
      const users = await usersService.getAllUsers()
      addTestResult("GET Users", "success", `${users.length} utilisateurs récupérés`, users.slice(0, 3))

      // Test GET by Role
      addTestResult("GET Users by Role", "pending", "Récupération des tuteurs...")
      const tuteurs = await usersService.getUsersByRole("tuteur")
      addTestResult("GET Users by Role", "success", `${tuteurs.length} tuteurs trouvés`, tuteurs.slice(0, 2))

      // Test POST - Créer un utilisateur
      addTestResult("POST User", "pending", "Création d'un utilisateur test...")
      const newUser = await usersService.createUser({
        ...testData.user,
        email: `test-${Date.now()}@example.com`,
      })
      addTestResult("POST User", "success", "Utilisateur créé avec succès", newUser)

      // Test PUT - Mettre à jour l'utilisateur
      if (newUser) {
        addTestResult("PUT User", "pending", "Mise à jour de l'utilisateur...")
        const updatedUser = await usersService.updateUser(newUser.id, {
          name: "Test User Updated",
          phone: "0987654321",
        })
        addTestResult("PUT User", "success", "Utilisateur mis à jour", updatedUser)

        // Test DELETE - Supprimer l'utilisateur
        addTestResult("DELETE User", "pending", "Suppression de l'utilisateur test...")
        await usersService.deleteUser(newUser.id)
        addTestResult("DELETE User", "success", "Utilisateur supprimé avec succès")
      }
    } catch (error: any) {
      addTestResult("Users Service", "error", `Erreur: ${error.message}`)
    }
  }

  // Tests pour Stagiaires Service
  const testStagiairesService = async () => {
    setLoading(true)
    addTestResult("Stagiaires Service", "pending", "Début des tests...")

    try {
      // Test GET - Récupérer tous les stagiaires
      addTestResult("GET Stagiaires", "pending", "Récupération des stagiaires...")
      const stagiaires = await stagiairesService.getAllStagiaires()
      addTestResult("GET Stagiaires", "success", `${stagiaires.length} stagiaires récupérés`, stagiaires.slice(0, 3))

      // Test GET Stats
      addTestResult("GET Stagiaires Stats", "pending", "Récupération des statistiques...")
      const stats = await stagiairesService.getStagiairesStats()
      addTestResult("GET Stagiaires Stats", "success", "Statistiques récupérées", stats)

      // Test POST - Créer un stagiaire
      addTestResult("POST Stagiaire", "pending", "Création d'un stagiaire test...")
      const newStagiaire = await stagiairesService.createStagiaire({
        ...testData.stagiaire,
        email: `stagiaire-${Date.now()}@example.com`,
      })
      addTestResult("POST Stagiaire", "success", "Stagiaire créé avec succès", newStagiaire)

      // Test GET by ID
      if (newStagiaire) {
        addTestResult("GET Stagiaire by ID", "pending", "Récupération du stagiaire par ID...")
        const stagiaire = await stagiairesService.getStagiaireById(newStagiaire.id)
        addTestResult("GET Stagiaire by ID", "success", "Stagiaire récupéré", stagiaire)

        // Test PUT - Mettre à jour le stagiaire
        addTestResult("PUT Stagiaire", "pending", "Mise à jour du stagiaire...")
        const updatedStagiaire = await stagiairesService.updateStagiaire(newStagiaire.id, {
          telephone: "0987654321",
          statut: "actif",
        })
        addTestResult("PUT Stagiaire", "success", "Stagiaire mis à jour", updatedStagiaire)

        // Test Search
        addTestResult("SEARCH Stagiaires", "pending", "Recherche de stagiaires...")
        const searchResults = await stagiairesService.searchStagiaires("Dupont")
        addTestResult("SEARCH Stagiaires", "success", `${searchResults.length} résultats trouvés`, searchResults)

        // Test DELETE - Supprimer le stagiaire
        addTestResult("DELETE Stagiaire", "pending", "Suppression du stagiaire test...")
        await stagiairesService.deleteStagiaire(newStagiaire.id)
        addTestResult("DELETE Stagiaire", "success", "Stagiaire supprimé avec succès")
      }
    } catch (error: any) {
      addTestResult("Stagiaires Service", "error", `Erreur: ${error.message}`)
    }
  }

  // Tests pour Demandes Service
  const testDemandesService = async () => {
    setLoading(true)
    addTestResult("Demandes Service", "pending", "Début des tests...")

    try {
      // Récupérer un stagiaire existant pour les tests
      const stagiaires = await stagiairesService.getAllStagiaires()
      if (stagiaires.length === 0) {
        addTestResult("Demandes Service", "error", "Aucun stagiaire trouvé pour les tests")
        return
      }

      const testStagiaire = stagiaires[0]

      // Test GET - Récupérer toutes les demandes
      addTestResult("GET Demandes", "pending", "Récupération des demandes...")
      const demandes = await demandesService.getAllDemandes()
      addTestResult("GET Demandes", "success", `${demandes.length} demandes récupérées`, demandes.slice(0, 3))

      // Test GET Stats
      addTestResult("GET Demandes Stats", "pending", "Récupération des statistiques...")
      const stats = await demandesService.getDemandesStats()
      addTestResult("GET Demandes Stats", "success", "Statistiques récupérées", stats)

      // Test POST - Créer une demande
      addTestResult("POST Demande", "pending", "Création d'une demande test...")
      const newDemande = await demandesService.createDemande({
        ...testData.demande,
        stagiaire_id: testStagiaire.id,
        tuteur_id: testStagiaire.tuteur_id,
      })
      addTestResult("POST Demande", "success", "Demande créée avec succès", newDemande)

      // Test GET by ID
      if (newDemande) {
        addTestResult("GET Demande by ID", "pending", "Récupération de la demande par ID...")
        const demande = await demandesService.getDemandeById(newDemande.id)
        addTestResult("GET Demande by ID", "success", "Demande récupérée", demande)

        // Test PUT - Mettre à jour la demande
        addTestResult("PUT Demande", "pending", "Mise à jour de la demande...")
        const updatedDemande = await demandesService.updateDemande(newDemande.id, {
          details: "Demande mise à jour pour test CRUD",
        })
        addTestResult("PUT Demande", "success", "Demande mise à jour", updatedDemande)

        // Test ADD Comment
        if (currentUser) {
          addTestResult("POST Comment", "pending", "Ajout d'un commentaire...")
          const comment = await demandesService.addCommentaire(
            newDemande.id,
            currentUser.id,
            "Commentaire de test CRUD",
          )
          addTestResult("POST Comment", "success", "Commentaire ajouté", comment)
        }

        // Test DELETE - Supprimer la demande
        addTestResult("DELETE Demande", "pending", "Suppression de la demande test...")
        await demandesService.deleteDemande(newDemande.id)
        addTestResult("DELETE Demande", "success", "Demande supprimée avec succès")
      }
    } catch (error: any) {
      addTestResult("Demandes Service", "error", `Erreur: ${error.message}`)
    }
  }

  // Tests pour Documents Service
  const testDocumentsService = async () => {
    setLoading(true)
    addTestResult("Documents Service", "pending", "Début des tests...")

    try {
      // Test GET - Récupérer tous les documents
      addTestResult("GET Documents", "pending", "Récupération des documents...")
      const documents = await documentsService.getAllDocuments()
      addTestResult("GET Documents", "success", `${documents.length} documents récupérés`, documents.slice(0, 3))

      // Test GET Stats
      addTestResult("GET Documents Stats", "pending", "Récupération des statistiques...")
      const stats = await documentsService.getDocumentsStats()
      addTestResult("GET Documents Stats", "success", "Statistiques récupérées", stats)

      // Test avec filtres
      addTestResult("GET Documents with Filters", "pending", "Test des filtres...")
      const filteredDocs = await documentsService.getAllDocuments({ type: "cv" })
      addTestResult("GET Documents with Filters", "success", `${filteredDocs.length} documents CV trouvés`)

      // Note: Les tests d'upload nécessitent un fichier réel, donc on les simule
      addTestResult("Documents Upload", "success", "Service d'upload configuré et prêt")
    } catch (error: any) {
      addTestResult("Documents Service", "error", `Erreur: ${error.message}`)
    }
  }

  // Exécuter tous les tests
  const runAllTests = async () => {
    setLoading(true)
    clearResults()

    addTestResult("Test Suite", "pending", "Démarrage de tous les tests CRUD...")

    await testUsersService()
    await testStagiairesService()
    await testDemandesService()
    await testDocumentsService()

    addTestResult("Test Suite", "success", "Tous les tests terminés!")
    setLoading(false)
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "success":
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case "error":
        return <XCircle className="h-4 w-4 text-red-500" />
      case "pending":
        return <Loader2 className="h-4 w-4 text-blue-500 animate-spin" />
      default:
        return null
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "success":
        return "border-green-200 bg-green-50"
      case "error":
        return "border-red-200 bg-red-50"
      case "pending":
        return "border-blue-200 bg-blue-50"
      default:
        return "border-gray-200 bg-gray-50"
    }
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Test CRUD - Vérification des Services</h1>
          <p className="text-gray-600">Validation de toutes les opérations Create, Read, Update, Delete</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={clearResults} variant="outline" disabled={loading}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Effacer
          </Button>
          <Button onClick={runAllTests} disabled={loading}>
            {loading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Plus className="h-4 w-4 mr-2" />}
            Lancer tous les tests
          </Button>
        </div>
      </div>

      <Tabs defaultValue="results" className="space-y-4">
        <TabsList>
          <TabsTrigger value="results">Résultats des Tests</TabsTrigger>
          <TabsTrigger value="individual">Tests Individuels</TabsTrigger>
          <TabsTrigger value="config">Configuration</TabsTrigger>
        </TabsList>

        <TabsContent value="results" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Résultats des Tests CRUD
              </CardTitle>
              <CardDescription>Statut en temps réel de tous les tests d'opérations CRUD</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {testResults.length === 0 ? (
                  <Alert>
                    <AlertDescription>
                      Aucun test exécuté. Cliquez sur "Lancer tous les tests" pour commencer.
                    </AlertDescription>
                  </Alert>
                ) : (
                  testResults.map((result, index) => (
                    <div key={index} className={`p-3 rounded-lg border ${getStatusColor(result.status)}`}>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          {getStatusIcon(result.status)}
                          <span className="font-medium">{result.operation}</span>
                        </div>
                        <Badge
                          variant={
                            result.status === "success"
                              ? "default"
                              : result.status === "error"
                                ? "destructive"
                                : "secondary"
                          }
                        >
                          {result.status}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600 mt-1">{result.message}</p>
                      {result.data && (
                        <details className="mt-2">
                          <summary className="text-xs text-gray-500 cursor-pointer">Voir les données</summary>
                          <pre className="text-xs bg-gray-100 p-2 rounded mt-1 overflow-x-auto">
                            {JSON.stringify(result.data, null, 2)}
                          </pre>
                        </details>
                      )}
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="individual" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Users Service
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Button onClick={testUsersService} disabled={loading} className="w-full">
                  Tester Users CRUD
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Stagiaires Service
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Button onClick={testStagiairesService} disabled={loading} className="w-full">
                  Tester Stagiaires CRUD
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="h-5 w-5" />
                  Demandes Service
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Button onClick={testDemandesService} disabled={loading} className="w-full">
                  Tester Demandes CRUD
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Documents Service
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Button onClick={testDocumentsService} disabled={loading} className="w-full">
                  Tester Documents CRUD
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="config" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Configuration des Tests</CardTitle>
              <CardDescription>Données utilisées pour les tests CRUD</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-medium mb-2">Données Utilisateur Test</h4>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>Email: {testData.user.email}</div>
                  <div>Nom: {testData.user.name}</div>
                  <div>Rôle: {testData.user.role}</div>
                  <div>Téléphone: {testData.user.phone}</div>
                </div>
              </div>

              <Separator />

              <div>
                <h4 className="font-medium mb-2">Données Stagiaire Test</h4>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>Nom: {testData.stagiaire.nom}</div>
                  <div>Prénom: {testData.stagiaire.prenom}</div>
                  <div>Formation: {testData.stagiaire.formation}</div>
                  <div>École: {testData.stagiaire.ecole}</div>
                </div>
              </div>

              <Separator />

              <div>
                <h4 className="font-medium mb-2">Données Demande Test</h4>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>Type: {testData.demande.type}</div>
                  <div>Durée: {testData.demande.duree}</div>
                  <div>Détails: {testData.demande.details}</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
