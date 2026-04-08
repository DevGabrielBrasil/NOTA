"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import { Loader2 } from "lucide-react";
import { useAuth } from "@/contexts/auth-context";
import { useNotas } from "@/hooks/use-notas";
import { NotaFiscalFormSimplificado } from "@/components/nota-fiscal-form-simplificado";
import { NotasFiscaisTableSimplificado } from "@/components/notas-fiscais-table-simplificado";
import { ResumoFaturamento } from "@/components/resumo-faturamento";
import { GraficoFaturamento } from "@/components/grafico-faturamento";
import { RelatorioAnualPdf } from "@/components/relatorio-anual-pdf";
import { ImportarNotaXml } from "@/components/importar-nota-xml";
import { toast } from "sonner";
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

function getSaudacao(): string {
  const hora = new Date().getHours();
  if (hora < 12) return "Bom dia";
  if (hora < 18) return "Boa tarde";
  return "Boa noite";
}

export default function DashboardPage() {
  const { session } = useAuth();
  const { notas, loading: notasLoading } = useNotas();
  const [activeTab, setActiveTab] = useState("nova-nota");
  const saudacaoExibida = useRef(false);

  // Toast de boas-vindas com resumo
  useEffect(() => {
    if (saudacaoExibida.current || session.isLoading || notasLoading || !session.user) return;
    saudacaoExibida.current = true;

    const nome = session.user.name?.split(" ")[0] || "usuário";
    const mesAtual = new Date().getMonth() + 1;
    const anoAtual = new Date().getFullYear();
    const notasDoMes = notas.filter((n) => {
      const match = String(n.data_fim).match(/(\d{4})-(\d{2})/);
      return match && parseInt(match[1]) === anoAtual && parseInt(match[2]) === mesAtual;
    });

    const totalMes = notasDoMes.reduce((acc, n) => acc + (Number(n.valor_total) || 0), 0);
    const formatBRL = (v: number) =>
      new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(v);

    toast(`${getSaudacao()}, ${nome}!`, {
      description: notasDoMes.length > 0
        ? `Você tem ${notasDoMes.length} nota${notasDoMes.length > 1 ? "s" : ""} este mês, totalizando ${formatBRL(totalMes)}.`
        : "Você ainda não tem notas este mês.",
      duration: 5000,
    });
  }, [session.isLoading, session.user, notasLoading, notas]);

  const primeiroNome = useMemo(
    () => session.user?.name?.split(" ")[0] || "por aí",
    [session.user]
  );

  if (session.isLoading) {
    return (
      <div className="flex min-h-[50vh] flex-col items-center justify-center gap-3 text-muted-foreground">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
        <p className="text-sm">Carregando seu painel…</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8">
      {/* Cabeçalho persistente */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-medium text-primary">
            {getSaudacao()}, {primeiroNome} 👋
          </p>
          <h1 className="mt-1 font-display text-3xl font-extrabold tracking-tight sm:text-4xl">
            Seu painel MEI+
          </h1>
          <p className="mt-1.5 text-sm text-muted-foreground">
            Acompanhe faturamento, emita notas e mantenha tudo em dia.
          </p>
        </div>
        <RelatorioAnualPdf />
      </div>

      <ResumoFaturamento />
      <GraficoFaturamento />

      {/* Sistema de Abas */}
      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="w-full"
      >
        <TabsList className="grid w-full grid-cols-3 mb-4">
          <TabsTrigger value="nova-nota">Nova Nota</TabsTrigger>
          <TabsTrigger value="importar">Importar XML</TabsTrigger>
          <TabsTrigger value="historico">Histórico</TabsTrigger>
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

        {/* Aba Importar XML */}
        <TabsContent value="importar">
          <Card>
            <CardHeader>
              <CardTitle>Importar Nota Fiscal (XML)</CardTitle>
              <CardDescription>
                Importe o XML da nota emitida pelo Emissor Nacional para calcular o faturamento automaticamente
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ImportarNotaXml />
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
