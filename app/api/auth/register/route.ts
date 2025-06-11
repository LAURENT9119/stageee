import { createClient } from "@supabase/supabase-js"
import { NextResponse } from "next/server"

// Client Supabase avec clé de service pour bypasser RLS
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
})

export async function POST(request: Request) {
  try {
    const { email, password, nom, prenom, telephone, role } = await request.json()

    console.log("Données reçues:", { email, nom, prenom, role })

    // Validation
    if (!email || !password || !nom || !prenom || !role) {
      return NextResponse.json({ error: "Tous les champs obligatoires doivent être remplis" }, { status: 400 })
    }

    // Créer l'utilisateur avec confirmation automatique
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true, // Confirmer automatiquement l'email
      user_metadata: {
        nom,
        prenom,
        role,
      },
    })

    if (authError) {
      console.error("Erreur auth:", authError)
      return NextResponse.json({ error: authError.message }, { status: 400 })
    }

    if (!authData.user) {
      return NextResponse.json({ error: "Erreur lors de la création de l'utilisateur" }, { status: 400 })
    }

    console.log("Utilisateur créé:", authData.user.id)

    // Créer l'entrée dans la table users
    const { error: userError } = await supabase.from("users").insert({
      id: authData.user.id,
      email: email,
      name: `${prenom} ${nom}`,
      role: role,
      phone: telephone || null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })

    if (userError) {
      console.error("Erreur user:", userError)
      // Supprimer l'utilisateur Auth en cas d'erreur
      await supabase.auth.admin.deleteUser(authData.user.id)
      return NextResponse.json({ error: `Erreur lors de la création du profil: ${userError.message}` }, { status: 500 })
    }

    console.log("Profil utilisateur créé")

    // Si c'est un stagiaire, créer l'entrée dans la table stagiaires
    if (role === "stagiaire") {
      const { error: stagiaireError } = await supabase.from("stagiaires").insert({
        user_id: authData.user.id,
        nom: nom,
        prenom: prenom,
        email: email,
        telephone: telephone || null,
        periode: "Non défini",
        statut: "en_attente",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })

      if (stagiaireError) {
        console.error("Erreur stagiaire:", stagiaireError)
        // Ne pas faire échouer l'inscription pour cette erreur
      } else {
        console.log("Profil stagiaire créé")
      }
    }

    return NextResponse.json({
      user: authData.user,
      message: "Compte créé avec succès",
    })
  } catch (error) {
    console.error("Erreur inscription:", error)
    return NextResponse.json({ error: "Erreur interne du serveur" }, { status: 500 })
  }
}
