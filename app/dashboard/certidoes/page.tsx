"use client";

import Link from "next/link";
import { ArrowLeft, Search, Upload, Download, Trash2, FileText } from "lucide-react";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
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

export default function CertidoesPage() {
  const { session } = useAuth();
  const [cidade, setCidade] = useState("");
  const [certidoes, setCertidoes] = useState<CertidaoLocal[]>([]);
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [certidaoSelecionada, setCertidaoSelecionada] = useState("");
  const [dataValidade, setDataValidade] = useState("");
  const [arquivo, setArquivo] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);

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
    toast.info(`Abrindo ${tipoCertidao}...`);
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

  const handleExcluir = (id: string) => {
    const certidoesAtualizadas = certidoes.filter(c => c.id !== id);
    salvarCertidoes(certidoesAtualizadas);
    toast.success("Certidão excluída com sucesso!");
  };

  return (
    <div className="space-y-8">
      <Link href="/dashboard">
        <Button variant="outline">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Voltar para o Dashboard
        </Button>
      </Link>

      <Card>
        <CardHeader>
          <CardTitle>Emitir Certidões Oficiais</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Button 
              variant="outline" 
              onClick={() => handleEmitirClick("Certidão Federal", "https://solucoes.receita.fazenda.gov.br/servicos/certidaointernet/pj/emitir")}
            >
              Emitir Certidão Federal
            </Button>
            <Button 
              variant="outline" 
              onClick={() => handleEmitirClick("Certidão Estadual (RS)", "https://www.sefaz.rs.gov.br/sat/CertidaoSitFiscalSolic.aspx")}
            >
              Emitir Certidão Estadual (RS)
            </Button>
            <Button 
              variant="outline" 
              onClick={() => handleEmitirClick("Certidão Trabalhista (TST)", "https://cndt-certidao.tst.jus.br/inicio.faces")}
            >
              Emitir Certidão Trabalhista (TST)
            </Button>
            <Button 
              variant="outline" 
              onClick={() => handleEmitirClick("Certificado FGTS", "https://consulta-crf.caixa.gov.br/consultacrf/pages/consultaEmpregador.jsf")}
            >
              Emitir Certificado FGTS (CRF)
            </Button>
            <Button 
              variant="outline" 
              onClick={() => handleEmitirClick("Certidão Simples Nacional", "https://www8.receita.fazenda.gov.br/SimplesNacional/aplicacoes.aspx?id=21")}
            >
              Emitir Certidão Simples Nacional
            </Button>
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
                Procurar e Emitir
              </Button>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Digite sua cidade e clique em procurar para encontrar o link de emissão correto.
            </p>
          </div>
        </CardContent>
      </Card>

      {mostrarFormulario && (
        <Card>
          <CardHeader>
            <CardTitle>Anexar Certidão: {certidaoSelecionada}</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleUpload} className="space-y-4">
              <div>
                <Label htmlFor="dataValidade">Data de Validade</Label>
                <Input
                  id="dataValidade"
                  type="date"
                  value={dataValidade}
                  onChange={(e) => setDataValidade(e.target.value)}
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="arquivo">Arquivo da Certidão (PDF, JPG, PNG)</Label>
                <Input
                  id="arquivo"
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png"
                  onChange={(e) => setArquivo(e.target.files?.[0] || null)}
                  required
                />
              </div>
              
              <div className="flex gap-2">
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? "Anexando..." : "Anexar Certidão"}
                  <Upload className="ml-2 h-4 w-4" />
                </Button>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setMostrarFormulario(false)}
                >
                  Cancelar
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Certidões Anexadas ({certidoes.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {certidoes.length === 0 ? (
            <p className="text-muted-foreground text-center py-4">
              Nenhuma certidão anexada.
            </p>
          ) : (
            <div className="space-y-3">
              {certidoes.map((certidao) => (
                <div key={certidao.id} className="flex items-center justify-between p-3 bg-secondary rounded-md">
                  <div className="flex items-center gap-3">
                    <FileText className="h-5 w-5 text-blue-600" />
                    <div>
                      <p className="font-semibold">{certidao.nome}</p>
                      <p className="text-sm text-muted-foreground">
                        Válida até: {new Date(certidao.dataValidade).toLocaleDateString('pt-BR')}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Arquivo: {certidao.nomeArquivo}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
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
                      onClick={() => handleExcluir(certidao.id)}
                      className="text-destructive hover:text-destructive"
                      title="Excluir certidão"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {!mostrarFormulario && (
        <Card>
          <CardHeader>
            <CardTitle>Anexar Certidão Manualmente</CardTitle>
          </CardHeader>
          <CardContent>
            <Button 
              onClick={() => {
                setCertidaoSelecionada("Certidão Manual");
                setMostrarFormulario(true);
              }}
              variant="outline"
              className="w-full"
            >
              <Upload className="mr-2 h-4 w-4" />
              Anexar Certidão Existente
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}