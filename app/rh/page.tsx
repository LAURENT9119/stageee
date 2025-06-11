"use client"

import { useEffect, useState } from "react"
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { Sidebar } from "@/components/layout/sidebar"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Users, FileText } from "lucide-react"
import { dashboardService } from "@/lib/services/dashboard-service"
import { authService } from "@/lib/services/auth-service"
import { useRouter } from "next/navigation"

interface RHStats {
  stagiaireCount: number
  demandeCount: number
  demandesRH: any[]
  stagiaireActifs: any[]
}

export default function RHDashboard() {
  const [user, setUser] = useState<any>(null)
  const [stats, setStats] = useState<RHStats | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    async function loadData() {
      try {
        const userResult = await authService.getCurrentUser()
        if (!userResult.user) {
          router.push("/auth/login")
          return
        }

        const profileResult = await authService.getUserProfile(userResult.user.id)
        if (!profileResult.profile || profileResult.profile.role !== "rh") {
          router.push("/auth/login")
          return
        }

        setUser(profileResult.profile)

        const dashboardStats = await dashboardService.getRHStats()
        setStats(dashboardStats)
      } catch (error) {
        console.error("Erreur lors du chargement:", error)
        router.push("/auth/login")
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [router])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
          <p className="mt-4">Chargement...</p>
        </div>
      </div>
    )
  }

  if (!user || !stats) {
    return null
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("fr-FR")
  }

  const getStatusBadge = (statut: string) => {
    switch (statut) {
      case "en_attente":
        return <Badge className="bg-orange-100 text-orange-800">En attente</Badge>
      case "approuvee":
        return <Badge className="bg-green-100 text-green-800">Validé</Badge>
      case "rejetee":
        return <Badge className="bg-red-100 text-red-800">Refusé</Badge>
      case "en_cours_traitement":
        return <Badge className="bg-blue-100 text-blue-800">En cours</Badge>
      default:
        return <Badge className="bg-gray-100 text-gray-800">{statut}</Badge>
    }
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header user={user} />

      <div className="flex flex-1">
        <Sidebar role="rh" />

        <main className="flex-1 p-6 bg-white">
          <div className="mb-6">
            <h1 className="text-2xl font-bold mb-2">Bonjour {user.first_name}, bienvenue sur votre tableau de bord</h1>
            <p className="text-gray-600">Ceci est votre tableau de bord qui recense l'ensemble de vos activités</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <Card className="border border-gray-200 rounded-lg">
              <CardContent className="p-6 text-center">
                <div className="flex items-center justify-center mb-2">
                  <span className="text-3xl font-bold">{stats.stagiaireCount}</span>
                  <div className="ml-2 w-6 h-6 bg-gray-800 rounded flex items-center justify-center">
                    <Users className="w-4 h-4 text-white" />
                  </div>
                </div>
                <h3 className="font-semibold mb-1">Stagiaires actifs</h3>
                <p className="text-sm text-gray-600">Stagiaires actuellement en entreprise</p>
              </CardContent>
            </Card>

            <Card className="border border-gray-200 rounded-lg">
              <CardContent className="p-6 text-center">
                <div className="flex items-center justify-center mb-2">
                  <span className="text-3xl font-bold">{stats.demandeCount}</span>
                  <div className="ml-2 w-6 h-6 bg-gray-800 rounded flex items-center justify-center">
                    <FileText className="w-4 h-4 text-white" />
                  </div>
                </div>
                <h3 className="font-semibold mb-1">Demandes en cours</h3>
                <p className="text-sm text-gray-600">Demandes en attente de validation</p>
              </CardContent>
            </Card>
          </div>

          <div className="bg-white border border-gray-200 rounded-lg mb-6">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold">Demandes nécessitant votre validation</h2>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">Date</th>
                    <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">Stagiaire</th>
                    <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">Type</th>
                    <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">Statut</th>
                    <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {stats.demandesRH.map((demande) => (
                    <tr key={demande.id}>
                      <td className="px-6 py-4 text-sm">{formatDate(demande.created_at)}</td>
                      <td className="px-6 py-4 text-sm">
                        {demande.stagiaires?.profiles?.first_name} {demande.stagiaires?.profiles?.last_name}
                      </td>
                      <td className="px-6 py-4 text-sm">{demande.type}</td>
                      <td className="px-6 py-4">{getStatusBadge(demande.statut)}</td>
                      <td className="px-6 py-4">
                        <Button variant="outline" size="sm">
                          Examiner
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="bg-white border border-gray-200 rounded-lg">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold">Stagiaires actifs</h2>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">Nom</th>
                    <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">Email</th>
                    <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">Période de stage</th>
                    <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">Statut</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {stats.stagiaireActifs.map((stagiaire, index) => (
                    <tr key={stagiaire.id}>
                      <td className="px-6 py-4 text-sm">
                        {stagiaire.profiles?.first_name} {stagiaire.profiles?.last_name}
                      </td>
                      <td className="px-6 py-4 text-sm">{stagiaire.profiles?.email}</td>
                      <td className="px-6 py-4 text-sm">
                        {formatDate(stagiaire.date_debut)} - {formatDate(stagiaire.date_fin)}
                      </td>
                      <td className="px-6 py-4">
                        <Badge className="bg-green-100 text-green-800">Actif</Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {stats.demandeCount > 0 && (
            <div className="mt-6 bg-green-100 border border-green-300 rounded-lg p-4">
              <p className="text-green-800 font-medium">{stats.demandeCount} demande(s) nécessitent votre attention</p>
            </div>
          )}
        </main>
      </div>

      <Footer />
    </div>
  )
}
