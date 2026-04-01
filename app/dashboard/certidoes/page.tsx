"use client";

import { Search, Upload, Download, Trash2, FileText, ExternalLink, AlertTriangle, CheckCircle2, Clock } from "lucide-react";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useAuth } from "@/contexts/auth-context";

interface CertidaoLocal {
  id: string;
  nome: string;
  dataValidade: string;
  arquivo: string;
  nomeArquivo: string;
  tipoArquivo: string;
  dataUpload: string;
}

const CERTIDOES_OFICIAIS = [
  { nome: "Certidão Federal", url: "https://solucoes.receita.fazenda.gov.br/servicos/certidaointernet/pj/emitir", descricao: "Certidão de Débitos Relativos a Créditos Tributários Federais" },
  { nome: "Certidão Estadual (RS)", url: "https://www.sefaz.rs.gov.br/sat/CertidaoSitFiscalSolic.aspx", descricao: "Certidão de Situação Fiscal junto à SEFAZ/RS" },
  { nome: "Certidão Trabalhista (TST)", url: "https://cndt-certidao.tst.jus.br/inicio.faces", descricao: "Certidão Negativa de Débitos Trabalhistas" },
  { nome: "Certificado FGTS (CRF)", url: "https://consulta-crf.caixa.gov.br/consultacrf/pages/consultaEmpregador.jsf", descricao: "Certificado de Regularidade do FGTS" },
  { nome: "Certidão Simples Nacional", url: "https://www8.receita.fazenda.gov.br/SimplesNacional/aplicacoes.aspx?id=21", descricao: "Certidão de Regularidade do Simples Nacional" },
];

function getStatusCertidao(dataValidade: string): { label: string; variant: "default" | "destructive" | "secondary" | "outline"; icon: typeof CheckCircle2 } {
  const hoje = new Date();
  const validade = new Date(dataValidade + "T12:00:00");
  const diffDias = Math.ceil((validade.getTime() - hoje.getTime()) / (1000 * 60 * 60 * 24));

  if (diffDias < 0) return { label: "Vencida", variant: "destructive", icon: AlertTriangle };
  if (diffDias <= 30) return { label: `Vence em ${diffDias} dias`, variant: "secondary", icon: Clock };
  return { label: "Válida", variant: "default", icon: CheckCircle2 };
}

export default function CertidoesPage() {
  const { session } = useAuth();
  const [cidade, setCidade] = useState("");
  const [certidoes, setCertidoes] = useState<CertidaoLocal[]>([]);
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [certidaoSelecionada, setCertidaoSelecionada] = useState("");
  const [dataValidade, setDataValidade] = useState("");
  const [arquivo, setArquivo] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [certidaoParaExcluir, setCertidaoParaExcluir] = useState<CertidaoLocal | null>(null);

  useEffect(() => {
    if (session?.user?.id) {
      const chave = `certidoes_${session.user.id}`;
      const certidoesSalvas = localStorage.getItem(chave);
      if (certidoesSalvas) {
        setCertidoes(JSON.parse(certidoesSalvas));
      }
    }
  }, [session?.user?.id]);

  const salvarCertidoes = (novasCertidoes: CertidaoLocal[]) => {
    if (session?.user?.id) {
      const chave = `certidoes_${session.user.id}`;
      localStorage.setItem(chave, JSON.stringify(novasCertidoes));
      setCertidoes(novasCertidoes);
    }
  };

  const handleEmitirClick = (tipoCertidao: string, url: string) => {
    window.open(url, "_blank");
    setCertidaoSelecionada(tipoCertidao);
    setMostrarFormulario(true);
  };

  const handleBuscaMunicipal = () => {
    if (!cidade.trim()) {
      toast.warning("Digite o nome da cidade primeiro.");
      return;
    }
    const query = `certidão municipal ${cidade} emitir site oficial`;
    const googleUrl = `https://www.google.com/search?q=${encodeURIComponent(query)}`;
    handleEmitirClick(`Certidão Municipal - ${cidade}`, googleUrl);
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!arquivo || !dataValidade || !certidaoSelecionada) {
      toast.warning("Preencha todos os campos.");
      return;
    }

    setIsLoading(true);
    try {
      const reader = new FileReader();
      reader.onload = () => {
        const novaCertidao: CertidaoLocal = {
          id: Date.now().toString(),
          nome: certidaoSelecionada,
          dataValidade,
          arquivo: reader.result as string,
          nomeArquivo: arquivo.name,
          tipoArquivo: arquivo.type,
          dataUpload: new Date().toISOString()
        };

        const certidoesAtualizadas = [...certidoes, novaCertidao];
        salvarCertidoes(certidoesAtualizadas);

        toast.success("Certidão anexada com sucesso!");
        setMostrarFormulario(false);
        setCertidaoSelecionada("");
        setDataValidade("");
        setArquivo(null);
      };
      reader.readAsDataURL(arquivo);
    } catch (error) {
      toast.error("Erro ao anexar certidão.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownload = (certidao: CertidaoLocal) => {
    const link = document.createElement('a');
    link.href = certidao.arquivo;
    link.download = certidao.nomeArquivo;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const confirmarExclusao = () => {
    if (!certidaoParaExcluir) return;
    const certidoesAtualizadas = certidoes.filter(c => c.id !== certidaoParaExcluir.id);
    salvarCertidoes(certidoesAtualizadas);
    toast.success("Certidão excluída com sucesso!");
    setCertidaoParaExcluir(null);
  };

  const vencidas = certidoes.filter(c => getStatusCertidao(c.dataValidade).label === "Vencida").length;
  const aVencer = certidoes.filter(c => getStatusCertidao(c.dataValidade).label.startsWith("Vence")).length;

  return (
    <div className="space-y-6">
      {/* Resumo */}
      {certidoes.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="rounded-full bg-primary/10 p-2">
                  <FileText className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{certidoes.length}</p>
                  <p className="text-sm text-muted-foreground">Total anexadas</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="rounded-full bg-red-100 dark:bg-red-900/30 p-2">
                  <AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{vencidas}</p>
                  <p className="text-sm text-muted-foreground">Vencidas</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="rounded-full bg-yellow-100 dark:bg-yellow-900/30 p-2">
                  <Clock className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{aVencer}</p>
                  <p className="text-sm text-muted-foreground">A vencer (30 dias)</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Emitir Certidões */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ExternalLink className="h-5 w-5" />
            Emitir Certidões Oficiais
          </CardTitle>
          <CardDescription>
            Clique para acessar o site oficial, emitir a certidão e depois anexá-la aqui.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {CERTIDOES_OFICIAIS.map((cert) => (
              <button
                key={cert.nome}
                onClick={() => handleEmitirClick(cert.nome, cert.url)}
                className="flex flex-col items-start gap-1 rounded-lg border p-4 text-left transition-colors hover:bg-accent"
              >
                <span className="font-medium text-sm">{cert.nome}</span>
                <span className="text-xs text-muted-foreground">{cert.descricao}</span>
              </button>
            ))}
          </div>

          <div className="pt-4 border-t">
            <Label htmlFor="cidade" className="text-sm font-medium">
              Certidão Municipal
            </Label>
            <div className="flex flex-col sm:flex-row items-center gap-2 mt-2">
              <Input
                id="cidade"
                placeholder="Digite o nome da sua cidade"
                value={cidade}
                onChange={(e) => setCidade(e.target.value)}
              />
              <Button
                variant="secondary"
                onClick={handleBuscaMunicipal}
                className="w-full sm:w-auto"
              >
                <Search className="mr-2 h-4 w-4" />
                Procurar
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Formulário de Upload */}
      <Dialog open={mostrarFormulario} onOpenChange={setMostrarFormulario}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Anexar: {certidaoSelecionada}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleUpload} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="dataValidade">Data de Validade</Label>
              <Input
                id="dataValidade"
                type="date"
                value={dataValidade}
                onChange={(e) => setDataValidade(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="arquivo">Arquivo (PDF, JPG, PNG)</Label>
              <Input
                id="arquivo"
                type="file"
                accept=".pdf,.jpg,.jpeg,.png"
                onChange={(e) => setArquivo(e.target.files?.[0] || null)}
                required
              />
            </div>
            <div className="flex gap-2 justify-end">
              <Button type="button" variant="outline" onClick={() => setMostrarFormulario(false)}>
                Cancelar
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? "Anexando..." : "Anexar Certidão"}
                <Upload className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Certidões Anexadas */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Certidões Anexadas</CardTitle>
            <CardDescription>{certidoes.length} certidão(ões) armazenada(s)</CardDescription>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setCertidaoSelecionada("Certidão Manual");
              setMostrarFormulario(true);
            }}
          >
            <Upload className="mr-2 h-4 w-4" />
            Anexar
          </Button>
        </CardHeader>
        <CardContent>
          {certidoes.length === 0 ? (
            <div className="text-center py-8">
              <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
              <p className="text-muted-foreground font-medium">Nenhuma certidão anexada</p>
              <p className="text-sm text-muted-foreground mt-1">
                Emita uma certidão acima e depois anexe o arquivo aqui.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {certidoes.map((certidao) => {
                const status = getStatusCertidao(certidao.dataValidade);
                const StatusIcon = status.icon;
                return (
                  <div key={certidao.id} className="flex items-center justify-between rounded-lg border p-4">
                    <div className="flex items-center gap-4">
                      <div className="rounded-full bg-primary/10 p-2.5">
                        <FileText className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium">{certidao.nome}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <p className="text-sm text-muted-foreground">
                            Válida até: {new Date(certidao.dataValidade + "T12:00:00").toLocaleDateString('pt-BR')}
                          </p>
                          <Badge variant={status.variant} className="text-xs">
                            <StatusIcon className="mr-1 h-3 w-3" />
                            {status.label}
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground mt-0.5">{certidao.nomeArquivo}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDownload(certidao)}
                        title="Baixar certidão"
                      >
                        <Download className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setCertidaoParaExcluir(certidao)}
                        className="text-destructive hover:text-destructive"
                        title="Excluir certidão"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Modal de confirmação de exclusão */}
      <AlertDialog open={!!certidaoParaExcluir} onOpenChange={(open) => !open && setCertidaoParaExcluir(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir certidão?</AlertDialogTitle>
            <AlertDialogDescription asChild>
              <div>
                <p>Esta ação não pode ser desfeita.</p>
                {certidaoParaExcluir && (
                  <div className="rounded-md border p-3 mt-2 space-y-1 text-sm">
                    <p><strong>Certidão:</strong> {certidaoParaExcluir.nome}</p>
                    <p><strong>Arquivo:</strong> {certidaoParaExcluir.nomeArquivo}</p>
                    <p><strong>Validade:</strong> {new Date(certidaoParaExcluir.dataValidade + "T12:00:00").toLocaleDateString('pt-BR')}</p>
                  </div>
                )}
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={confirmarExclusao} className="bg-red-600 hover:bg-red-700">
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
