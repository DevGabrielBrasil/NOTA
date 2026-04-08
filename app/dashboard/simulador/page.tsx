"use client";

import { useState, useMemo, useEffect } from "react";
import { useNotas } from "@/hooks/use-notas";
import { CurrencyInput } from "@/components/currency-input";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  Calculator,
  Info,
  CheckCircle2,
  Sparkles,
  ArrowRight,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";

const LIMITE_MEI = 81000;
const LIMITE_MEI_EXCESSO = 97200; // 20% acima do limite
const LIMITE_SIMPLES = 4800000; // Teto do Simples Nacional (ME/EPP)

// Limites de entrada do simulador.
// Máximo = R$ 100 milhões: cobre qualquer caso realista de MEI/ME/EPP
// (teto Simples R$ 4,8M, teto Presumido R$ 78M) sem permitir entradas absurdas.
const MIN_FATURAMENTO = 0;
const MAX_FATURAMENTO = 100_000_000;

// Valores do DAS MEI de 2025 (salário mínimo R$ 1.518)
// INSS = 5% × SM = R$ 75,90 | ICMS = R$ 1,00 | ISS = R$ 5,00
const DAS_MEI: Record<string, number> = {
  comercio: 76.9,
  servico: 80.9,
  industria: 76.9,
  comercio_servico: 81.9,
  servico_regulamentado: 80.9,
};

// Data de referência dos valores tributários
const DATA_REFERENCIA = "janeiro/2025";

const ANEXO_I = [
  { ate: 180000, aliquota: 0.04, deducao: 0 },
  { ate: 360000, aliquota: 0.073, deducao: 5940 },
  { ate: 720000, aliquota: 0.095, deducao: 13860 },
  { ate: 1800000, aliquota: 0.107, deducao: 22500 },
  { ate: 3600000, aliquota: 0.143, deducao: 87300 },
  { ate: 4800000, aliquota: 0.19, deducao: 378000 },
];

const ANEXO_II = [
  { ate: 180000, aliquota: 0.045, deducao: 0 },
  { ate: 360000, aliquota: 0.078, deducao: 5940 },
  { ate: 720000, aliquota: 0.1, deducao: 13860 },
  { ate: 1800000, aliquota: 0.112, deducao: 22500 },
  { ate: 3600000, aliquota: 0.147, deducao: 85500 },
  { ate: 4800000, aliquota: 0.3, deducao: 720000 },
];

const ANEXO_III = [
  { ate: 180000, aliquota: 0.06, deducao: 0 },
  { ate: 360000, aliquota: 0.112, deducao: 9360 },
  { ate: 720000, aliquota: 0.135, deducao: 17640 },
  { ate: 1800000, aliquota: 0.16, deducao: 35640 },
  { ate: 3600000, aliquota: 0.21, deducao: 125640 },
  { ate: 4800000, aliquota: 0.33, deducao: 648000 },
];

// Anexo V — profissões regulamentadas (advocacia, engenharia, arquitetura,
// medicina, odontologia, contabilidade etc.) sem atender ao Fator R.
const ANEXO_V = [
  { ate: 180000, aliquota: 0.155, deducao: 0 },
  { ate: 360000, aliquota: 0.18, deducao: 4500 },
  { ate: 720000, aliquota: 0.195, deducao: 9900 },
  { ate: 1800000, aliquota: 0.205, deducao: 17100 },
  { ate: 3600000, aliquota: 0.23, deducao: 62100 },
  { ate: 4800000, aliquota: 0.305, deducao: 540000 },
];

type Atividade =
  | "comercio"
  | "servico"
  | "industria"
  | "comercio_servico"
  | "servico_regulamentado";

const ATIVIDADE_LABELS: Record<Atividade, string> = {
  servico: "Prestação de Serviços (Anexo III)",
  comercio: "Comércio (Anexo I)",
  industria: "Indústria (Anexo II)",
  comercio_servico: "Comércio e Serviços (Anexo I)",
  servico_regulamentado: "Serviços Regulamentados (Anexo V)",
};

function getAnexo(atividade: Atividade) {
  if (atividade === "comercio" || atividade === "comercio_servico") return ANEXO_I;
  if (atividade === "industria") return ANEXO_II;
  if (atividade === "servico_regulamentado") return ANEXO_V;
  return ANEXO_III;
}

function getAnexoNome(atividade: Atividade): string {
  if (atividade === "comercio" || atividade === "comercio_servico") return "I";
  if (atividade === "industria") return "II";
  if (atividade === "servico_regulamentado") return "V";
  return "III";
}

function calcularSimplesNacional(
  faturamento: number,
  atividade: Atividade
): number {
  if (faturamento <= 0) return 0;
  const anexo = getAnexo(atividade);

  for (const faixa of anexo) {
    if (faturamento <= faixa.ate) {
      const aliquotaEfetiva =
        (faturamento * faixa.aliquota - faixa.deducao) / faturamento;
      return faturamento * Math.max(aliquotaEfetiva, 0);
    }
  }

  const ultima = anexo[anexo.length - 1];
  const aliquotaEfetiva =
    (faturamento * ultima.aliquota - ultima.deducao) / faturamento;
  return faturamento * Math.max(aliquotaEfetiva, 0);
}

function calcularDASAnual(atividade: Atividade): number {
  return DAS_MEI[atividade] * 12;
}

function getAliquotaEfetiva(
  faturamento: number,
  atividade: Atividade
): number {
  if (faturamento <= 0) return 0;
  const anexo = getAnexo(atividade);

  for (const faixa of anexo) {
    if (faturamento <= faixa.ate) {
      return Math.max(
        ((faturamento * faixa.aliquota - faixa.deducao) / faturamento) * 100,
        0
      );
    }
  }
  return 0;
}

const formatBRL = (v: number) =>
  new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(v);

type Cenario =
  | "dentro"
  | "excesso-baixo"
  | "excesso-alto"
  | "acima-simples";

export default function SimuladorPage() {
  const { notas, loading } = useNotas();
  const [faturamentoProjetado, setFaturamentoProjetado] = useState<
    number | undefined
  >(undefined);
  const [clampedAviso, setClampedAviso] = useState<
    "nenhum" | "maximo" | "negativo"
  >("nenhum");
  const [atividade, setAtividade] = useState<Atividade>("servico");

  /**
   * Limita a entrada ao intervalo realista do mercado brasileiro.
   * - Valores negativos não existem em faturamento → 0
   * - Valores acima de R$ 100M são quase certamente digitação incorreta
   *   (ultrapassam até o teto do Lucro Presumido de R$ 78M)
   */
  const handleFaturamentoChange = (v: number | undefined) => {
    if (v === undefined) {
      setFaturamentoProjetado(undefined);
      setClampedAviso("nenhum");
      return;
    }
    if (v < MIN_FATURAMENTO) {
      setFaturamentoProjetado(MIN_FATURAMENTO);
      setClampedAviso("negativo");
      return;
    }
    if (v > MAX_FATURAMENTO) {
      setFaturamentoProjetado(MAX_FATURAMENTO);
      setClampedAviso("maximo");
      return;
    }
    setFaturamentoProjetado(v);
    setClampedAviso("nenhum");
  };

  const faturamentoAtual = useMemo(() => {
    const anoAtual = new Date().getFullYear();
    return notas.reduce((acc, nota) => {
      const match = String(nota.data_fim).match(/(\d{4})/);
      if (match && parseInt(match[1]) === anoAtual) {
        return acc + (Number(nota.valor_total) || 0);
      }
      return acc;
    }, 0);
  }, [notas]);

  useEffect(() => {
    if (!loading && faturamentoAtual > 0 && faturamentoProjetado === undefined) {
      const mesAtual = new Date().getMonth() + 1;
      const projecao = Math.round((faturamentoAtual / mesAtual) * 12);
      setFaturamentoProjetado(projecao);
    }
  }, [loading, faturamentoAtual, faturamentoProjetado]);

  // Oculta o aviso de clamp após 4 segundos
  useEffect(() => {
    if (clampedAviso === "nenhum") return;
    const t = setTimeout(() => setClampedAviso("nenhum"), 4000);
    return () => clearTimeout(t);
  }, [clampedAviso]);

  const valor = faturamentoProjetado ?? faturamentoAtual;

  const resultado = useMemo(() => {
    const dasAnual = calcularDASAnual(atividade);
    const impostoME = calcularSimplesNacional(valor, atividade);
    const aliquotaEfetivaME = getAliquotaEfetiva(valor, atividade);
    const aliquotaMEI = valor > 0 ? (dasAnual / valor) * 100 : 0;

    const excedeu = valor > LIMITE_MEI;
    const excedeuMuito = valor > LIMITE_MEI_EXCESSO;
    const acimaDoSimples = valor > LIMITE_SIMPLES;

    const cenario: Cenario = acimaDoSimples
      ? "acima-simples"
      : !excedeu
        ? "dentro"
        : excedeuMuito
          ? "excesso-alto"
          : "excesso-baixo";

    let custoTotalMEI = dasAnual;
    if (cenario === "excesso-baixo") {
      const excedente = valor - LIMITE_MEI;
      custoTotalMEI = dasAnual + calcularSimplesNacional(excedente, atividade);
    } else if (cenario === "excesso-alto") {
      custoTotalMEI = impostoME;
    }

    const economia = !excedeu ? impostoME - dasAnual : 0;
    const diferenca = impostoME - custoTotalMEI;

    const percentualLimite = (valor / LIMITE_MEI) * 100;

    return {
      dasAnual,
      impostoME,
      aliquotaEfetivaME,
      aliquotaMEI,
      excedeu,
      excedeuMuito,
      custoTotalMEI,
      economia,
      diferenca,
      cenario,
      percentualLimite,
    };
  }, [valor, atividade]);

  const dadosGrafico = [
    {
      nome: "Continuar MEI",
      valor: resultado.custoTotalMEI,
      cor: resultado.cenario === "dentro" ? "hsl(158 64% 32%)" : "hsl(0 72% 50%)",
    },
    {
      nome: "Migrar para ME",
      valor: resultado.impostoME,
      cor:
        resultado.cenario !== "dentro" && resultado.impostoME < resultado.custoTotalMEI
          ? "hsl(158 64% 32%)"
          : "hsl(158 40% 55%)",
    },
  ];

  return (
    <div className="space-y-8">
      {/* HEADER */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-primary">
            <Calculator className="h-3.5 w-3.5" />
            Simulador fiscal
          </div>
          <h1 className="mt-3 font-display text-3xl font-extrabold tracking-tight sm:text-4xl">
            MEI ou ME? Descubra o que compensa.
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
            Informe seu faturamento anual projetado e veja exatamente quanto
            você pagaria continuando como MEI ou migrando para ME no Simples
            Nacional.
          </p>
        </div>
      </div>

      {/* DISCLAIMER */}
      <div className="flex items-start gap-3 rounded-xl border border-amber-500/30 bg-amber-500/5 p-4">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400">
          <Info className="h-4 w-4" />
        </div>
        <div className="text-xs leading-relaxed text-muted-foreground">
          <p className="font-semibold text-foreground">
            Valores de referência: {DATA_REFERENCIA}
          </p>
          <p className="mt-1">
            DAS MEI calculado sobre salário mínimo de R$ 1.518 · Limite MEI de{" "}
            {formatBRL(LIMITE_MEI)} · Alíquotas do Simples Nacional conforme LC
            123/2006. Esta ferramenta é uma estimativa — para profissões
            regulamentadas, o Fator R (folha ÷ receita ≥ 28%) pode alterar o
            anexo aplicável. <strong>Consulte sempre um contador</strong> antes
            de tomar decisões fiscais.
          </p>
        </div>
      </div>

      {/* CONTROLES */}
      <Card className="overflow-hidden border-2">
        <div className="grid gap-0 md:grid-cols-5">
          {/* Faturamento */}
          <div className="md:col-span-3 border-b p-6 md:border-b-0 md:border-r md:p-8">
            <div className="flex items-baseline justify-between">
              <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Faturamento anual projetado
              </Label>
              <span className="text-[10px] font-medium text-muted-foreground">
                Máx. {formatBRL(MAX_FATURAMENTO)}
              </span>
            </div>
            <div className="mt-3">
              <CurrencyInput
                value={faturamentoProjetado}
                onChange={handleFaturamentoChange}
                className={`h-16 rounded-xl border-2 !text-3xl font-display font-extrabold tracking-tight ${
                  clampedAviso !== "nenhum"
                    ? "border-amber-500 focus-visible:ring-amber-500"
                    : ""
                }`}
              />
            </div>

            {clampedAviso !== "nenhum" && (
              <p className="mt-2 flex items-center gap-1.5 text-xs font-medium text-amber-600 dark:text-amber-500">
                <AlertTriangle className="h-3.5 w-3.5" />
                {clampedAviso === "maximo"
                  ? `Valor ajustado ao máximo permitido (${formatBRL(MAX_FATURAMENTO)}). Acima disso foge do escopo deste simulador.`
                  : "Faturamento não pode ser negativo — ajustado para zero."}
              </p>
            )}

            {/* Progress bar */}
            <div className="mt-5">
              <div className="flex items-center justify-between text-xs">
                <span className="font-medium text-muted-foreground">
                  Limite MEI: {formatBRL(LIMITE_MEI)}
                </span>
                <span
                  className={`font-bold ${
                    resultado.percentualLimite > 120
                      ? "text-destructive"
                      : resultado.percentualLimite > 100
                        ? "text-amber-600 dark:text-amber-500"
                        : "text-primary"
                  }`}
                >
                  {resultado.percentualLimite.toFixed(0)}%
                </span>
              </div>
              <div className="mt-2 h-2.5 w-full overflow-hidden rounded-full bg-muted">
                <div
                  className={`h-full rounded-full transition-all ${
                    resultado.percentualLimite > 120
                      ? "bg-destructive"
                      : resultado.percentualLimite > 100
                        ? "bg-amber-500"
                        : "bg-gradient-to-r from-primary to-primary/70"
                  }`}
                  style={{
                    width: `${Math.min(resultado.percentualLimite, 150)}%`,
                  }}
                />
              </div>
            </div>

            {faturamentoAtual > 0 && (
              <button
                onClick={() => {
                  const mesAtual = new Date().getMonth() + 1;
                  setFaturamentoProjetado(
                    Math.round((faturamentoAtual / mesAtual) * 12)
                  );
                }}
                className="mt-4 inline-flex items-center gap-1.5 text-xs font-medium text-primary hover:underline"
              >
                <Sparkles className="h-3 w-3" />
                Usar projeção do ano atual ({formatBRL(
                  Math.round(
                    (faturamentoAtual / (new Date().getMonth() + 1)) * 12
                  )
                )})
              </button>
            )}
          </div>

          {/* Atividade */}
          <div className="p-6 md:col-span-2 md:p-8">
            <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Tipo de atividade
            </Label>
            <div className="mt-3">
              <Select
                value={atividade}
                onValueChange={(v) => setAtividade(v as Atividade)}
              >
                <SelectTrigger className="h-12 rounded-xl border-2">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {(Object.keys(ATIVIDADE_LABELS) as Atividade[]).map((key) => (
                    <SelectItem key={key} value={key}>
                      {ATIVIDADE_LABELS[key]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="mt-5 space-y-2 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">DAS mensal</span>
                <span className="font-semibold">
                  {formatBRL(DAS_MEI[atividade])}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Anexo Simples</span>
                <span className="font-semibold">
                  {getAnexoNome(atividade)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* STATUS BANNER */}
      {valor > 0 && <StatusBanner cenario={resultado.cenario} valor={valor} />}

      {/* COMPARATIVO PRINCIPAL */}
      {valor > 0 && resultado.cenario !== "acima-simples" && (
        <div className="grid gap-5 md:grid-cols-2">
          <ResultCard
            label="Continuar como MEI"
            sublabel={
              resultado.cenario === "dentro"
                ? `DAS fixo de ${formatBRL(DAS_MEI[atividade])}/mês`
                : resultado.cenario === "excesso-baixo"
                  ? "DAS anual + guia complementar sobre excedente"
                  : "Não é viável — desenquadramento retroativo"
            }
            valor={resultado.custoTotalMEI}
            aliquota={
              resultado.cenario === "dentro"
                ? resultado.aliquotaMEI
                : resultado.aliquotaEfetivaME
            }
            winner={
              resultado.cenario === "dentro" &&
              resultado.custoTotalMEI < resultado.impostoME
            }
            warning={resultado.cenario !== "dentro"}
            unavailable={resultado.cenario === "excesso-alto"}
          />
          <ResultCard
            label="Migrar para ME"
            sublabel={`Simples Nacional — Anexo ${getAnexoNome(atividade)}`}
            valor={resultado.impostoME}
            aliquota={resultado.aliquotaEfetivaME}
            winner={
              resultado.cenario !== "dentro" ||
              resultado.impostoME < resultado.custoTotalMEI
            }
          />
        </div>
      )}

      {/* VEREDICTO */}
      {valor > 0 && <Veredicto resultado={resultado} atividade={atividade} />}

      {/* GRÁFICO */}
      {valor > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="font-display text-lg">
              Comparativo visual
            </CardTitle>
            <CardDescription>
              Imposto anual estimado em cada regime
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={260}>
              <BarChart
                data={dadosGrafico}
                margin={{ top: 20, right: 20, left: 0, bottom: 0 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke="hsl(var(--border))"
                />
                <XAxis
                  dataKey="nome"
                  tick={{ fontSize: 13, fontWeight: 600 }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fontSize: 11 }}
                  tickFormatter={(v) => `R$${(v / 1000).toFixed(0)}k`}
                  width={60}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip
                  formatter={(value: number) => [formatBRL(value), "Imposto"]}
                  contentStyle={{
                    borderRadius: "0.75rem",
                    border: "1px solid hsl(var(--border))",
                    background: "hsl(var(--card))",
                  }}
                />
                <Bar dataKey="valor" radius={[8, 8, 0, 0]}>
                  {dadosGrafico.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.cor} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {/* GUIA EDUCATIVO */}
      <Card className="bg-muted/30">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 font-display text-lg">
            <Info className="h-5 w-5 text-primary" />
            Entenda as regras do desenquadramento
          </CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <GuiaItem
            badge="Zona segura"
            badgeColor="primary"
            titulo={`Até ${formatBRL(LIMITE_MEI)}`}
            texto="Continua como MEI pagando apenas o DAS fixo mensal. Sem burocracia extra."
          />
          <GuiaItem
            badge="Alerta laranja"
            badgeColor="amber"
            titulo={`${formatBRL(LIMITE_MEI)} — ${formatBRL(LIMITE_MEI_EXCESSO)}`}
            texto="Migra para ME em janeiro e paga uma guia complementar sobre o valor excedente."
          />
          <GuiaItem
            badge="Alerta vermelho"
            badgeColor="destructive"
            titulo={`${formatBRL(LIMITE_MEI_EXCESSO)} — ${formatBRL(LIMITE_SIMPLES)}`}
            texto="Desenquadramento retroativo a janeiro. Todo o faturamento do ano é tributado pelo Simples Nacional como ME."
          />
          <GuiaItem
            badge="Fora do Simples"
            badgeColor="destructive"
            titulo={`Acima de ${formatBRL(LIMITE_SIMPLES)}`}
            texto="Excede o teto do Simples Nacional. Precisa migrar para Lucro Presumido ou Lucro Real — procure um contador."
          />
        </CardContent>
        <CardContent className="border-t pt-4 text-xs text-muted-foreground">
          <p>
            <strong>Fator R:</strong> para alguns serviços, é possível tributar
            pelo Anexo III (mais barato) caso a folha de pagamento represente{" "}
            <strong>no mínimo 28% da receita bruta dos últimos 12 meses</strong>.
            Caso contrário, vão para o Anexo V.
          </p>
          <p className="mt-2">
            Valores de referência: {DATA_REFERENCIA}. Consulte sempre um
            contador para orientação personalizada ao seu caso.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

function StatusBanner({
  cenario,
  valor,
}: {
  cenario: Cenario;
  valor: number;
}) {
  if (cenario === "dentro") {
    return (
      <div className="flex items-start gap-4 rounded-2xl border-2 border-primary/30 bg-primary/5 p-5">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground">
          <CheckCircle2 className="h-5 w-5" />
        </div>
        <div>
          <p className="font-display text-lg font-bold text-primary">
            Você está dentro do limite MEI
          </p>
          <p className="mt-0.5 text-sm text-muted-foreground">
            Com {formatBRL(valor)} projetados, você pode continuar como MEI
            tranquilamente. Ainda falta{" "}
            <strong className="text-foreground">
              {formatBRL(LIMITE_MEI - valor)}
            </strong>{" "}
            até o teto anual.
          </p>
        </div>
      </div>
    );
  }

  if (cenario === "excesso-baixo") {
    return (
      <div className="flex items-start gap-4 rounded-2xl border-2 border-amber-500/40 bg-amber-500/10 p-5">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-500 text-white">
          <AlertTriangle className="h-5 w-5" />
        </div>
        <div>
          <p className="font-display text-lg font-bold text-amber-700 dark:text-amber-400">
            Você passou do limite — migração obrigatória em janeiro
          </p>
          <p className="mt-0.5 text-sm text-muted-foreground">
            Com {formatBRL(valor)}, você excedeu o teto em{" "}
            <strong className="text-foreground">
              {formatBRL(valor - LIMITE_MEI)}
            </strong>
            , mas ficou abaixo dos 20% de tolerância. Vai precisar migrar para
            ME em 1º de janeiro e pagar uma guia complementar sobre o
            excedente.
          </p>
        </div>
      </div>
    );
  }

  if (cenario === "excesso-alto") {
    return (
      <div className="flex items-start gap-4 rounded-2xl border-2 border-destructive/40 bg-destructive/10 p-5">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-destructive text-destructive-foreground">
          <AlertTriangle className="h-5 w-5" />
        </div>
        <div>
          <p className="font-display text-lg font-bold text-destructive">
            Desenquadramento retroativo — migre para ME imediatamente
          </p>
          <p className="mt-0.5 text-sm text-muted-foreground">
            Com {formatBRL(valor)}, você excedeu em mais de 20% o limite do
            MEI. O desenquadramento é{" "}
            <strong className="text-foreground">retroativo a janeiro</strong>{" "}
            e todo o faturamento do ano será tributado pelo Simples Nacional
            como ME.
          </p>
        </div>
      </div>
    );
  }

  // acima-simples
  return (
    <div className="flex items-start gap-4 rounded-2xl border-2 border-destructive/60 bg-destructive/10 p-5">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-destructive text-destructive-foreground">
        <AlertTriangle className="h-5 w-5" />
      </div>
      <div>
        <p className="font-display text-lg font-bold text-destructive">
          Acima do teto do Simples Nacional
        </p>
        <p className="mt-0.5 text-sm text-muted-foreground">
          Com {formatBRL(valor)}, você ultrapassou também o limite de{" "}
          <strong className="text-foreground">{formatBRL(LIMITE_SIMPLES)}</strong>{" "}
          do Simples Nacional. Nem MEI nem ME servem — você precisa migrar
          para <strong className="text-foreground">Lucro Presumido</strong> ou{" "}
          <strong className="text-foreground">Lucro Real</strong>. Procure um
          contador urgentemente.
        </p>
      </div>
    </div>
  );
}

function ResultCard({
  label,
  sublabel,
  valor,
  aliquota,
  winner,
  warning,
  unavailable,
}: {
  label: string;
  sublabel: string;
  valor: number;
  aliquota: number;
  winner?: boolean;
  warning?: boolean;
  unavailable?: boolean;
}) {
  return (
    <div
      className={`relative overflow-hidden rounded-2xl border-2 p-6 transition ${
        unavailable
          ? "border-destructive/40 bg-destructive/5 opacity-75"
          : winner
            ? "border-primary bg-primary/5 shadow-lg shadow-primary/10"
            : warning
              ? "border-destructive/30 bg-destructive/5"
              : "border-border bg-card"
      }`}
    >
      {unavailable && (
        <div className="absolute right-4 top-4 inline-flex items-center gap-1 rounded-full bg-destructive px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-destructive-foreground">
          <AlertTriangle className="h-3 w-3" />
          Inviável
        </div>
      )}
      {winner && !unavailable && (
        <div className="absolute right-4 top-4 inline-flex items-center gap-1 rounded-full bg-primary px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-primary-foreground">
          <CheckCircle2 className="h-3 w-3" />
          Recomendado
        </div>
      )}
      <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
        {label}
      </p>
      <p
        className={`mt-3 font-display text-4xl font-extrabold tracking-tight ${
          unavailable ? "line-through decoration-destructive/50" : ""
        }`}
      >
        {formatBRL(valor)}
      </p>
      <p className="mt-1 text-xs text-muted-foreground">por ano</p>
      <div className="mt-5 space-y-1.5 border-t pt-4 text-sm">
        <p className="text-muted-foreground">{sublabel}</p>
        <p className="font-medium">
          Alíquota efetiva:{" "}
          <span className="font-bold text-foreground">
            {aliquota.toFixed(2)}%
          </span>
        </p>
      </div>
    </div>
  );
}

function Veredicto({
  resultado,
  atividade,
}: {
  resultado: {
    cenario: Cenario;
    economia: number;
    diferenca: number;
    impostoME: number;
    custoTotalMEI: number;
  };
  atividade: Atividade;
}) {
  // CENÁRIO 1: dentro do limite → continuar MEI compensa
  if (resultado.cenario === "dentro") {
    if (resultado.economia <= 0) return null;
    return (
      <VeredictoCard
        tone="primary"
        icon={<TrendingDown className="h-6 w-6" />}
        titulo={`Continue como MEI — você economiza ${formatBRL(resultado.economia)} por ano`}
        descricao={`Mantendo este faturamento, MEI é ${((resultado.economia / resultado.impostoME) * 100).toFixed(0)}% mais barato que migrar para ME agora. Nenhuma ação necessária.`}
        acao="Recomendação: manter cadastro MEI"
      />
    );
  }

  // CENÁRIO 2: excesso até 20% → migração obrigatória em janeiro
  if (resultado.cenario === "excesso-baixo") {
    return (
      <VeredictoCard
        tone="amber"
        icon={<ArrowRight className="h-6 w-6" />}
        titulo="Você precisa virar ME em janeiro"
        descricao={`Pagará cerca de ${formatBRL(resultado.custoTotalMEI)} no total (DAS do ano + guia complementar sobre o excedente). Se fosse ME o ano inteiro, pagaria ${formatBRL(resultado.impostoME)} no Anexo ${getAnexoNome(atividade)}.`}
        acao="Ação: agende migração para ME até 31/12 deste ano"
      />
    );
  }

  // CENÁRIO 3: excesso acima de 20% → migração obrigatória JÁ (retroativa)
  if (resultado.cenario === "excesso-alto") {
    return (
      <VeredictoCard
        tone="destructive"
        icon={<AlertTriangle className="h-6 w-6" />}
        titulo="Migre para ME imediatamente"
        descricao={`Você excedeu 20% acima do teto. O desenquadramento é retroativo a janeiro e todo o faturamento do ano será tributado como ME pelo Anexo ${getAnexoNome(atividade)}, totalizando cerca de ${formatBRL(resultado.impostoME)}.`}
        acao="Ação urgente: procure um contador esta semana"
      />
    );
  }

  // CENÁRIO 4: acima do teto do Simples → Lucro Presumido/Real
  return (
    <VeredictoCard
      tone="destructive"
      icon={<AlertTriangle className="h-6 w-6" />}
      titulo="Você passou do teto do Simples Nacional"
      descricao={`Com este faturamento, você ultrapassa ${formatBRL(LIMITE_SIMPLES)} e não pode mais ficar no Simples. O próximo passo é migrar para Lucro Presumido ou Lucro Real, cuja tributação exige análise contábil detalhada.`}
      acao="Ação urgente: consulte um contador para definir o regime (Presumido vs Real)"
    />
  );
}

function VeredictoCard({
  tone,
  icon,
  titulo,
  descricao,
  acao,
}: {
  tone: "primary" | "amber" | "destructive";
  icon: React.ReactNode;
  titulo: string;
  descricao: string;
  acao: string;
}) {
  const styles = {
    primary: {
      bg: "from-primary/10 via-primary/5 to-transparent",
      iconBg: "bg-primary text-primary-foreground",
      border: "border-primary/30",
      acaoColor: "text-primary",
    },
    amber: {
      bg: "from-amber-500/10 via-amber-500/5 to-transparent",
      iconBg: "bg-amber-500 text-white",
      border: "border-amber-500/40",
      acaoColor: "text-amber-700 dark:text-amber-400",
    },
    destructive: {
      bg: "from-destructive/10 via-destructive/5 to-transparent",
      iconBg: "bg-destructive text-destructive-foreground",
      border: "border-destructive/40",
      acaoColor: "text-destructive",
    },
  }[tone];

  return (
    <div
      className={`flex items-start gap-4 rounded-2xl border-2 ${styles.border} bg-gradient-to-br ${styles.bg} p-6`}
    >
      <div
        className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl ${styles.iconBg}`}
      >
        {icon}
      </div>
      <div className="flex-1 space-y-2">
        <p className="font-display text-xl font-extrabold tracking-tight">
          {titulo}
        </p>
        <p className="text-sm leading-relaxed text-muted-foreground">
          {descricao}
        </p>
        <p className={`text-xs font-bold uppercase tracking-wider ${styles.acaoColor}`}>
          → {acao}
        </p>
      </div>
    </div>
  );
}

function GuiaItem({
  badge,
  badgeColor,
  titulo,
  texto,
}: {
  badge: string;
  badgeColor: "primary" | "amber" | "destructive";
  titulo: string;
  texto: string;
}) {
  const colors = {
    primary: "bg-primary/10 text-primary",
    amber: "bg-amber-500/10 text-amber-700 dark:text-amber-400",
    destructive: "bg-destructive/10 text-destructive",
  };

  return (
    <div className="space-y-2">
      <span
        className={`inline-flex rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${colors[badgeColor]}`}
      >
        {badge}
      </span>
      <p className="font-display text-base font-bold">{titulo}</p>
      <p className="text-xs leading-relaxed text-muted-foreground">{texto}</p>
    </div>
  );
}
