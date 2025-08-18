"use client";

import Link from "next/link";
import { ArrowLeft, CalendarIcon, DownloadIcon, Search } from "lucide-react"; // 1. Ícone de busca importado
import { useState, useEffect, type FormEvent, useRef } from "react";
import { supabaseClient } from "@/lib/supabase-client";
import { useAuth } from "@/contexts/auth-context";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";

interface Certidao {
  id: number;
  nome: string;
  data_validade: string;
  file_path: string;
}

export default function CertidoesPage() {
  const { session } = useAuth();
  const [certidoes, setCertidoes] = useState<Certidao[]>([]);
  const [nome, setNome] = useState("");
  const [dataValidade, setDataValidade] = useState<Date | undefined>();
  const [file, setFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isFormVisible, setIsFormVisible] = useState(false);
  const [cidade, setCidade] = useState(""); // 2. Estado para guardar o nome da cidade
  const formRef = useRef<HTMLDivElement>(null);

  const fetchCertidoes = async () => {
    if (!session.user) return;
    const { data, error } = await supabaseClient.from("certidoes").select("*").eq("user_id", session.user.id);
    if (error) toast.error("Erro ao buscar certidões", { description: error.message });
    else setCertidoes(data || []);
  };

  useEffect(() => { fetchCertidoes() }, [session.user]);
  
  const handleEmitirClick = (nomeCertidao: string, url: string) => {
    window.open(url, '_blank');
    setNome(nomeCertidao);
    setIsFormVisible(true);
    setTimeout(() => formRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
  };

  // 3. Função para procurar o link da certidão municipal
  const handleBuscaMunicipal = () => {
    if (!cidade.trim()) {
      toast.warning("Por favor, digite o nome da sua cidade.");
      return;
    }
    const query = `emitir certidão negativa de débitos municipais ${cidade}`;
    const url = `https://www.google.com/search?q=${encodeURIComponent(query)}`;
    window.open(url, '_blank');
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!file || !dataValidade || !session.user) {
      toast.warning("Preencha todos os campos", { description: "Data de validade e arquivo são obrigatórios." });
      return;
    }
    setIsLoading(true);
    const filePath = `${session.user.id}/${Date.now()}-${file.name}`;
    const { error: uploadError } = await supabaseClient.storage.from("certidoes").upload(filePath, file);
    if (uploadError) {
      toast.error("Erro no upload", { description: uploadError.message });
      setIsLoading(false);
      return;
    }
    const { error: insertError } = await supabaseClient.from("certidoes").insert({ nome, data_validade: dataValidade.toISOString().split('T')[0], file_path: filePath, user_id: session.user.id });
    if (insertError) {
      toast.error("Erro ao salvar certidão", { description: insertError.message });
    } else {
      toast.success("Certidão salva com sucesso!");
      setNome(""); setDataValidade(undefined); setFile(null); setIsFormVisible(false); fetchCertidoes();
    }
    setIsLoading(false);
  };
  
  const handleDownload = async (filePath: string) => {
    const { data, error } = await supabaseClient.storage.from("certidoes").download(filePath);
    if (error) {
      toast.error("Erro ao baixar o arquivo", { description: error.message });
      return;
    }
    const url = URL.createObjectURL(data);
    const a = document.createElement('a'); a.href = url; a.download = filePath.split('/').pop() || 'arquivo';
    document.body.appendChild(a); a.click(); document.body.removeChild(a); URL.revokeObjectURL(url);
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
          <CardTitle>1. Emitir Certidões Oficiais</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Button variant="outline" onClick={() => handleEmitirClick("Certidão Federal", "https://solucoes.receita.fazenda.gov.br/servicos/certidaointernet/pj/emitir")}>Emitir Certidão Federal</Button>
            <Button variant="outline" onClick={() => handleEmitirClick("Certidão Estadual (RS)", "https://www.sefaz.rs.gov.br/sat/CertidaoSitFiscalSolic.aspx")}>Emitir Certidão Estadual (RS)</Button>
            <Button variant="outline" onClick={() => handleEmitirClick("Certidão Trabalhista (TST)", "https://cndt-certidao.tst.jus.br/inicio.faces")}>Emitir Certidão Trabalhista (TST)</Button>
            <Button variant="outline" onClick={() => handleEmitirClick("Certificado FGTS", "https://consulta-crf.caixa.gov.br/consultacrf/pages/consultaEmpregador.jsf")}>Emitir Certificado FGTS (CRF)</Button>
            <Button variant="outline" onClick={() => handleEmitirClick("Certidão Simples Nacional", "https://www8.receita.fazenda.gov.br/SimplesNacional/aplicacoes.aspx?id=21")}>Emitir Certidão Simples Nacional</Button>
          </div>
          {/* 4. Novo componente para a busca da certidão municipal */}
          <div className="pt-4 border-t">
             <Label htmlFor="cidade" className="text-sm font-medium">Certidão Municipal</Label>
             <div className="flex flex-col sm:flex-row items-center gap-2 mt-2">
                <Input 
                    id="cidade" 
                    placeholder="Digite o nome da sua cidade" 
                    value={cidade}
                    onChange={(e) => setCidade(e.target.value)}
                />
                <Button variant="secondary" onClick={handleBuscaMunicipal} className="w-full sm:w-auto">
                    <Search className="mr-2 h-4 w-4" />
                    Procurar e Emitir
                </Button>
             </div>
             <p className="text-xs text-muted-foreground mt-2">Digite sua cidade e clique em procurar para encontrar o link de emissão correto.</p>
          </div>
        </CardContent>
      </Card>

      {isFormVisible && (
        <div ref={formRef}>
          <Card>
            <CardHeader><CardTitle>2. Anexar e Salvar a Certidão</CardTitle></CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2"><Label htmlFor="nome">Nome da Certidão</Label><Input id="nome" value={nome} onChange={(e) => setNome(e.target.value)} required readOnly className="bg-muted"/></div>
                <div className="space-y-2"><Label>Data de Validade</Label><Popover><PopoverTrigger asChild><Button variant={"outline"} className="w-full justify-start text-left font-normal"><CalendarIcon className="mr-2 h-4 w-4" />{dataValidade ? format(dataValidade, "PPP") : <span>Escolha uma data</span>}</Button></PopoverTrigger><PopoverContent className="w-auto p-0"><Calendar mode="single" selected={dataValidade} onSelect={setDataValidade} initialFocus /></PopoverContent></Popover></div>
                <div className="space-y-2"><Label htmlFor="arquivo">Arquivo (PDF, JPG, etc.)</Label><Input id="arquivo" type="file" onChange={(e) => setFile(e.target.files ? e.target.files[0] : null)} required /></div>
                <div className="flex gap-2"><Button type="submit" disabled={isLoading}>{isLoading ? "Salvando..." : "Salvar Certidão"}</Button><Button variant="ghost" onClick={() => setIsFormVisible(false)}>Cancelar</Button></div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}

      <Card>
        <CardHeader><CardTitle>Certidões Arquivadas</CardTitle></CardHeader>
        <CardContent>
          <ul className="space-y-3">
            {certidoes.length > 0 ? certidoes.map(cert => (
              <li key={cert.id} className="flex items-center justify-between p-3 bg-secondary rounded-md">
                <div><p className="font-semibold">{cert.nome}</p><p className="text-sm text-muted-foreground">Vence em: {format(new Date(cert.data_validade), "dd/MM/yyyy")}</p></div>
                <Button variant="ghost" size="icon" onClick={() => handleDownload(cert.file_path)}><DownloadIcon className="h-5 w-5" /></Button>
              </li>
            )) : <p>Nenhuma certidão arquivada.</p>}
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
