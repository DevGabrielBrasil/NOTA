"use client";

import { useState } from "react";
import { useAuth } from "@/contexts/auth-context";
import { NotaFiscalFormSimplificado } from "@/components/nota-fiscal-form-simplificado";
import { NotasFiscaisTableSimplificado } from "@/components/notas-fiscais-table-simplificado";
import { ResumoFaturamento } from "@/components/resumo-faturamento"; // 1. Importado novamente
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from "@/components/ui/tabs";

export default function DashboardPage() {
  const { session } = useAuth();
  const [activeTab, setActiveTab] = useState("nova-nota");

  // Se a sessão ainda estiver a carregar, podemos mostrar uma mensagem.
  if (session.isLoading) {
    return <div>A carregar...</div>;
  }

  return (
    <div className="flex flex-col gap-6">
      {/* 2. Componente de Faturamento adicionado de volta */}
      <ResumoFaturamento />



      {/* Sistema de Abas */}
      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="w-full"
      >
        <TabsList className="grid w-full grid-cols-2 mb-4">
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
    </div>
  );
}
