"use client"

import { useState, useEffect, type FormEvent } from "react"
import { useAuth } from "@/contexts/auth-context"
import { authClient } from "@/lib/auth-client"
import { toast } from "sonner"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Loader2, User, Mail, Building2, Hash, Search, MapPin, Briefcase, CheckCircle2 } from "lucide-react"

interface DadosCNPJ {
  razao_social: string
  nome_fantasia: string
  cnpj: string
  situacao_cadastral: string
  atividade_principal: string
  logradouro: string
  numero: string
  bairro: string
  municipio: string
  uf: string
  cep: string
  porte: string
  natureza_juridica: string
  data_inicio_atividade: string
}

export default function PerfilPage() {
  const { session } = useAuth()
  const [nome, setNome] = useState("")
  const [cnpj, setCnpj] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [buscandoCnpj, setBuscandoCnpj] = useState(false)
  const [dadosCnpj, setDadosCnpj] = useState<DadosCNPJ | null>(null)

  useEffect(() => {
    if (session.user) {
      setNome(session.user.name || "")
      setCnpj(session.user.cnpj || "")
    }
  }, [session.user])

  const buscarCnpj = async () => {
    const cnpjLimpo = cnpj.replace(/\D/g, "")
    if (cnpjLimpo.length < 14) {
      toast.warning(`CNPJ incompleto (${cnpjLimpo.length}/14 dígitos).`)
      return
    }

    setBuscandoCnpj(true)
    setDadosCnpj(null)

    try {
      const res = await fetch(`/api/cnpj?cnpj=${cnpjLimpo}`)

      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        toast.error("CNPJ não encontrado", {
          description: err.error || "Verifique se o CNPJ está correto."
        })
        return
      }

      const result = await res.json()
      setDadosCnpj(result.data)

      const nomeEmpresa = result.data.nome_fantasia || result.data.razao_social
      if (nomeEmpresa) {
        setNome(nomeEmpresa)
        toast.success("Dados do CNPJ carregados!", { description: nomeEmpresa })
      }
    } catch (err) {
      console.error("Erro buscarCnpj:", err)
      toast.error("Erro ao consultar CNPJ.")
    } finally {
      setBuscandoCnpj(false)
    }
  }

  const handleCnpjChange = (value: string) => {
    // Máscara automática: 00.000.000/0000-00
    const digits = value.replace(/\D/g, "").slice(0, 14)
    let masked = digits
    if (digits.length > 12) masked = `${digits.slice(0,2)}.${digits.slice(2,5)}.${digits.slice(5,8)}/${digits.slice(8,12)}-${digits.slice(12)}`
    else if (digits.length > 8) masked = `${digits.slice(0,2)}.${digits.slice(2,5)}.${digits.slice(5,8)}/${digits.slice(8)}`
    else if (digits.length > 5) masked = `${digits.slice(0,2)}.${digits.slice(2,5)}.${digits.slice(5)}`
    else if (digits.length > 2) masked = `${digits.slice(0,2)}.${digits.slice(2)}`
    setCnpj(masked)
    setDadosCnpj(null)
  }

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
        cnpj: cnpj.replace(/\D/g, ""),
      } as any)

      if (error) {
        toast.error("Erro ao atualizar perfil", { description: error.message })
      } else {
        toast.success("Perfil atualizado com sucesso!")
      }
    } catch {
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
            Informe seu CNPJ para buscar os dados automaticamente da Receita Federal.
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
              <Label htmlFor="cnpj" className="flex items-center gap-2">
                <Hash className="h-4 w-4 text-muted-foreground" />
                CNPJ
              </Label>
              <div className="flex gap-2">
                <Input
                  id="cnpj"
                  value={cnpj}
                  onChange={(e) => handleCnpjChange(e.target.value)}
                  placeholder="00.000.000/0000-00"
                  required
                />
                <Button
                  type="button"
                  variant="secondary"
                  onClick={buscarCnpj}
                  disabled={buscandoCnpj}
                >
                  {buscandoCnpj ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Search className="h-4 w-4" />
                  )}
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                Digite o CNPJ e clique na lupa para buscar os dados automaticamente.
              </p>
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
                placeholder="Preenchido automaticamente ao buscar o CNPJ"
                required
              />
            </div>

            {/* Dados do CNPJ consultado */}
            {dadosCnpj && (
              <Card className="border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-950/20">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400" />
                    Dados da Receita Federal
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <p className="text-xs text-muted-foreground">Razão Social</p>
                      <p className="font-medium">{dadosCnpj.razao_social}</p>
                    </div>
                    {dadosCnpj.nome_fantasia && (
                      <div>
                        <p className="text-xs text-muted-foreground">Nome Fantasia</p>
                        <p className="font-medium">{dadosCnpj.nome_fantasia}</p>
                      </div>
                    )}
                    <div>
                      <p className="text-xs text-muted-foreground">Situação Cadastral</p>
                      <p className="font-medium">{dadosCnpj.situacao_cadastral}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Porte</p>
                      <p className="font-medium">{dadosCnpj.porte || "—"}</p>
                    </div>
                    {dadosCnpj.atividade_principal && (
                      <div className="sm:col-span-2">
                        <p className="text-xs text-muted-foreground flex items-center gap-1">
                          <Briefcase className="h-3 w-3" />
                          Atividade Principal
                        </p>
                        <p className="font-medium">{dadosCnpj.atividade_principal}</p>
                      </div>
                    )}
                    {dadosCnpj.municipio && (
                      <div className="sm:col-span-2">
                        <p className="text-xs text-muted-foreground flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          Endereço
                        </p>
                        <p className="font-medium">
                          {[dadosCnpj.logradouro, dadosCnpj.numero, dadosCnpj.bairro].filter(Boolean).join(", ")}
                          {" — "}
                          {dadosCnpj.municipio}/{dadosCnpj.uf}
                          {dadosCnpj.cep ? ` (CEP ${dadosCnpj.cep})` : ""}
                        </p>
                      </div>
                    )}
                    {dadosCnpj.data_inicio_atividade && (
                      <div>
                        <p className="text-xs text-muted-foreground">Início da Atividade</p>
                        <p className="font-medium">{dadosCnpj.data_inicio_atividade}</p>
                      </div>
                    )}
                    {dadosCnpj.natureza_juridica && (
                      <div>
                        <p className="text-xs text-muted-foreground">Natureza Jurídica</p>
                        <p className="font-medium">{dadosCnpj.natureza_juridica}</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

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
