import type React from "react"
import type { Metadata } from "next"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { NotificationCenter } from "@/components/ui/notifications"

// Removed Google Fonts import due to network issues in build
// Using system fonts instead

export const metadata: Metadata = {
  title: "Bridge Technologies Solutions - Gestion des Stagiaires",
  description: "Plateforme de gestion des stagiaires avec demandes en ligne",
  generator: "v0.dev",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <body className="">
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem disableTransitionOnChange>
          {children}
          <NotificationCenter />
        </ThemeProvider>
      </body>
    </html>
  )
}