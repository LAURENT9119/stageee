"use client"

import { useEffect, useState } from "react"
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { Sidebar } from "@/components/layout/sidebar"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Users, FileText } from "lucide-react"
import { dashboardService } from "@/lib/services/dashboard-service"
import { authService } from "@/lib/services/auth-service"
import { useRouter } from "next/navigation"

interface TuteurStats {
  stagiaireCount: number
  demandeCount: number
  recentDemandes: any[]
}

export default function TuteurDashboard() {
  const [user, setUser] = useState<any>(null)
  const [stats, setStats] = useState<TuteurStats | null>(null)
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
        if (!profileResult.profile || profileResult.profile.role !== "tuteur") {
          router.push("/auth/login")
          return
        }

        setUser(profileResult.profile)

        const dashboardStats = await dashboardService.getTuteurStats(userResult.user.id)
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
        return <Badge className="bg-green-100 text-green-800">Approuvée</Badge>
      case "rejetee":
        return <Badge className="bg-red-100 text-red-800">Rejetée</Badge>
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
        <Sidebar role="tuteur" />

        <main className="flex-1 p-6 bg-white">
          <div className="mb-6">
            <div className="flex items-center space-x-4 mb-4">
              <Avatar className="w-16 h-16">
                <AvatarFallback className="bg-gray-300 text-2xl">
                  {user.first_name?.[0]?.toUpperCase() || "T"}
                </AvatarFallback>
              </Avatar>
              <div>
                <h1 className="text-2xl font-bold">
                  Bonjour, {user.first_name} {user.last_name}
                </h1>
                <p className="text-gray-600">Ceci est votre tableau de bord qui recense l'ensemble de vos activités</p>
              </div>
            </div>
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
                <h3 className="font-semibold mb-1">Stagiaires sous votre tutelle</h3>
                <p className="text-sm text-gray-600">Stagiaires actuellement actifs</p>
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
                <h3 className="font-semibold mb-1">Demandes en attente</h3>
                <p className="text-sm text-gray-600">Demandes nécessitant votre validation</p>
              </CardContent>
            </Card>
          </div>

          <div className="bg-white border border-gray-200 rounded-lg">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold">Suivi des demandes</h2>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">Date</th>
                    <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">Stagiaire</th>
                    <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">Type</th>
                    <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">Statut</th>
                    <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">Détails</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {stats.recentDemandes.map((demande) => (
                    <tr key={demande.id}>
                      <td className="px-6 py-4 text-sm">{formatDate(demande.created_at)}</td>
                      <td className="px-6 py-4 text-sm">
                        {demande.stagiaires?.profiles?.first_name} {demande.stagiaires?.profiles?.last_name}
                      </td>
                      <td className="px-6 py-4 text-sm">{demande.type}</td>
                      <td className="px-6 py-4">{getStatusBadge(demande.statut)}</td>
                      <td className="px-6 py-4 text-sm">{demande.titre || demande.description}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {stats.demandeCount > 0 && (
            <div className="mt-6 bg-yellow-100 border border-yellow-300 rounded-lg p-4">
              <p className="text-yellow-800 font-medium">Notification</p>
              <p className="text-yellow-700">{stats.demandeCount} demande(s) nécessitent votre validation</p>
            </div>
          )}
        </main>
      </div>

      <Footer />
    </div>
  )
}
