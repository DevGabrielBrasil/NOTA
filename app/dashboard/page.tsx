"use client"

import { useState } from "react"
import { AuthGuard } from "@/components/auth-guard"
import { UserNav } from "@/components/user-nav"
import { NotaFiscalFormSimplificado } from "@/components/nota-fiscal-form-simplificado"
import { NotasFiscaisTableSimplificado } from "@/components/notas-fiscais-table-simplificado"
import { ResumoFaturamento } from "@/components/resumo-faturamento"
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui"
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from "@radix-ui/react-tabs"

export default function DashboardPage() {
  const [activeTab, setActiveTab] = useState("nova-nota")

  return (
    <AuthGuard>
      <div className="flex min-h-screen flex-col">
        {/* Header */}
        <header className="sticky top-0 z-10 border-b bg-background">
          <div className="container flex h-16 items-center justify-between py-4">
            <h1 className="text-xl font-bold">
              Sistema de Gestão de Notas Fiscais - MEI
            </h1>
            <UserNav />
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 container py-6">
          {/* Resumo Faturamento */}
          <div className="mb-6">
            <ResumoFaturamento />
          </div>

          {/* Tabs de Navegação */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-3 mb-4">
              <TabsTrigger value="nova-nota">Nova Nota Fiscal</TabsTrigger>
              <TabsTrigger value="historico">Histórico de Notas</TabsTrigger>
            </TabsList>

            {/* Aba Nova Nota */}
            <TabsContent value="nova-nota">
              <Card>
                <CardHeader>
                  <CardTitle>Criar Nova Nota Fiscal</CardTitle>
                  <CardDescription>
                    Preencha os dados para gerar uma nova nota fiscal
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <NotaFiscalFormSimplificado />
                </CardContent>
              </Card>
            </TabsContent>

            {/* Aba Histórico */}
            <TabsContent value="historico">
              <Card>
                <CardHeader>
                  <CardTitle>Histórico de Notas Fiscais</CardTitle>
                  <CardDescription>
                    Visualize todas as notas fiscais emitidas
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <NotasFiscaisTableSimplificado />
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </main>
      </div>
    </AuthGuard>
  )
}
