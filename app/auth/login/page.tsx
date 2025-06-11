"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import Link from "next/link"
import { authService } from "@/lib/services/auth-service"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    try {
      const result = await authService.signIn(email, password)

      if (result.error) {
        setError(result.error.message)
        return
      }

      if (result.user) {
        // Attendre un peu pour que la session soit établie
        await new Promise((resolve) => setTimeout(resolve, 1000))

        // Récupérer le profil utilisateur
        const profileResult = await authService.getUserProfile(result.user.id)

        if (profileResult.profile) {
          // Redirection selon le rôle
          switch (profileResult.profile.role) {
            case "admin":
              router.push("/admin")
              break
            case "rh":
              router.push("/rh")
              break
            case "tuteur":
              router.push("/tuteur")
              break
            case "stagiaire":
              router.push("/stagiaire")
              break
            case "finance":
              router.push("/finance")
              break
            default:
              router.push("/")
          }
        } else {
          // Si pas de profil trouvé, rediriger vers la page d'accueil
          router.push("/")
        }
      }
    } catch (err) {
      console.error("Erreur de connexion:", err)
      setError("Une erreur est survenue lors de la connexion")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header showAuth />

      <main className="flex-1 flex">
        <div className="w-1/2 bg-cover bg-center relative" style={{ backgroundImage: "url('/images/connexion.png')" }}>
          <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center">
            <div className="text-white text-center">
              <h1 className="text-4xl font-bold mb-4">Bienvenue sur Bridge</h1>
              <p className="text-xl">Votre plateforme de gestion des stagiaires</p>
            </div>
          </div>
        </div>

        <div className="w-1/2 bg-gray-100 flex items-center justify-center p-8">
          <div className="w-full max-w-md space-y-8">
            <div className="text-center">
              <h2 className="text-3xl font-bold text-gray-900">Connexion à votre compte Bridge</h2>
            </div>

            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="mt-1"
                  required
                  disabled={loading}
                />
              </div>

              <div>
                <Label htmlFor="password">Mot de passe</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="mt-1"
                  required
                  disabled={loading}
                />
              </div>

              <Button type="submit" className="w-full bg-black text-white hover:bg-gray-800" disabled={loading}>
                {loading ? "Connexion..." : "Se connecter"}
              </Button>

              <div className="text-center">
                <span className="text-gray-500">ou</span>
              </div>

              <div className="text-center">
                <span className="text-sm text-gray-600">Vous n'avez pas de compte? </span>
                <Link href="/auth/register" className="text-blue-600 hover:underline">
                  S'inscrire
                </Link>
              </div>

              <div className="text-xs text-center text-gray-500">
                En vous connectant vous acceptez nos{" "}
                <a href="#" className="underline">
                  politiques de confidentialité
                </a>{" "}
                et nos{" "}
                <a href="#" className="underline">
                  conditions d'utilisation
                </a>
              </div>
            </form>

            {/* Comptes de test pour le développement */}
            <div className="mt-8 p-4 bg-blue-50 rounded-lg">
              <h3 className="font-semibold text-sm mb-2">Comptes de test :</h3>
              <div className="text-xs space-y-1">
                <div>
                  <strong>Admin:</strong> admin@bridge-tech.com / admin123
                </div>
                <div>
                  <strong>RH:</strong> rh@bridge-tech.com / rh123
                </div>
                <div>
                  <strong>Tuteur:</strong> tuteur@bridge-tech.com / tuteur123
                </div>
                <div>
                  <strong>Stagiaire:</strong> stagiaire@bridge-tech.com / stagiaire123
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
