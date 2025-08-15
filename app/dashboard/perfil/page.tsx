"use client"

import { useState, useEffect, type FormEvent } from "react"
import { useAuth } from "@/contexts/auth-context"
import { supabaseClient } from "@/lib/supabase-client"
import { toast } from "sonner"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"

export default function PerfilPage() {
  const { session } = useAuth()
  const [nome, setNome] = useState("")
  const [cnpj, setCnpj] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  // Preenche o formulário com os dados do usuário quando a sessão é carregada
  useEffect(() => {
    if (session.user) {
      setNome(session.user.user_metadata?.nome || "")
      setCnpj(session.user.user_metadata?.cnpj || "")
    }
  }, [session.user])

  // Função para atualizar os dados do perfil
  const handleUpdateProfile = async (e: FormEvent) => {
    e.preventDefault()
    if (!nome || !cnpj) {
        toast.warning("Todos os campos são obrigatórios.")
        return
    }
    setIsLoading(true)

    // Usa o método updateUser para salvar os novos dados nos metadados
    const { data, error } = await supabaseClient.auth.updateUser({
      data: { nome, cnpj }
    })

    if (error) {
      toast.error("Erro ao atualizar o perfil", { description: error.message })
    } else {
      toast.success("Perfil atualizado! A página será recarregada.")
      
      // NOVO: Força um recarregamento completo da página após 1.5 segundos
      // para garantir que os novos dados do usuário sejam carregados.
      setTimeout(() => {
        window.location.reload();
      }, 1500);
    }
    // O setIsLoading(false) não é mais necessário aqui, pois a página irá recarregar.
  }

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Meu Perfil</CardTitle>
        <CardDescription>
          Atualize os seus dados cadastrais. Estas informações serão usadas em todo o sistema.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleUpdateProfile} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={session.user?.email || ""}
              disabled
              className="bg-muted"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="nome">Nome da Empresa</Label>
            <Input
              id="nome"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              placeholder="Digite o nome da sua empresa"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="cnpj">CNPJ</Label>
            <Input
              id="cnpj"
              value={cnpj}
              onChange={(e) => setCnpj(e.target.value)}
              placeholder="Digite o CNPJ da sua empresa"
              required
            />
          </div>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? "Salvando..." : "Salvar Alterações"}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
