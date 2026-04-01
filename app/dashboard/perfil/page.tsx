"use client"

import { useState, useEffect, type FormEvent } from "react"
import { useAuth } from "@/contexts/auth-context"
import { authClient } from "@/lib/auth-client"
import { toast } from "sonner"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Loader2, User, Mail, Building2, Hash } from "lucide-react"

export default function PerfilPage() {
  const { session } = useAuth()
  const [nome, setNome] = useState("")
  const [cnpj, setCnpj] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (session.user) {
      setNome(session.user.name || "")
      setCnpj(session.user.cnpj || "")
    }
  }, [session.user])

  const handleUpdateProfile = async (e: FormEvent) => {
    e.preventDefault()
    if (!nome || !cnpj) {
      toast.warning("Todos os campos são obrigatórios.")
      return
    }
    setIsLoading(true)

    try {
      const { error } = await authClient.updateUser({
        name: nome,
        cnpj,
      } as any)

      if (error) {
        toast.error("Erro ao atualizar perfil", { description: error.message })
      } else {
        toast.success("Perfil atualizado com sucesso!")
      }
    } catch (error) {
      toast.error("Erro ao atualizar perfil.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Meu Perfil
          </CardTitle>
          <CardDescription>
            Atualize os seus dados cadastrais. Estas informações serão usadas nas notas fiscais e relatórios.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleUpdateProfile} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="email" className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-muted-foreground" />
                Email
              </Label>
              <Input
                id="email"
                type="email"
                value={session.user?.email || ""}
                disabled
                className="bg-muted"
              />
              <p className="text-xs text-muted-foreground">O email não pode ser alterado.</p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="nome" className="flex items-center gap-2">
                <Building2 className="h-4 w-4 text-muted-foreground" />
                Nome da Empresa
              </Label>
              <Input
                id="nome"
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                placeholder="Digite o nome da sua empresa"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="cnpj" className="flex items-center gap-2">
                <Hash className="h-4 w-4 text-muted-foreground" />
                CNPJ
              </Label>
              <Input
                id="cnpj"
                value={cnpj}
                onChange={(e) => setCnpj(e.target.value)}
                placeholder="00.000.000/0000-00"
                required
              />
            </div>
            <Button type="submit" disabled={isLoading} className="w-full">
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Salvando...
                </>
              ) : (
                "Salvar Alterações"
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
