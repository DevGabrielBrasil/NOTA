import type React from "react"
import { Inter } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { AppProvider } from "@/contexts/app-context"
import { AuthProvider } from "@/contexts/auth-context"

const inter = Inter({ subsets: ["latin"] })

export const metadata = {
  title: "Sistema de Gestão de Notas Fiscais - MEI",
  description: "Sistema para gerenciamento de notas fiscais para Microempreendedor Individual",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem disableTransitionOnChange>
          <AuthProvider>
            <AppProvider>{children}</AppProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
