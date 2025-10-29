"use client";

import Link from "next/link";
import { ArrowLeft, ExternalLink, Calculator } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function DASPage() {
  const [valorDAS, setValorDAS] = useState("70.60");

  const handleAbrirSistema = (url: string) => {
    window.open(url, "_blank");
  };

  const calcularDASAnual = () => {
    const valorMensal = parseFloat(valorDAS) || 70.60;
    return valorMensal * 12;
  };

  return (
    <div className="space-y-6">
      <Link href="/dashboard">
        <Button variant="outline">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Voltar para o Dashboard
        </Button>
      </Link>

      <div>
        <h1 className="text-2xl font-bold">DAS - MEI</h1>
        <p className="text-muted-foreground">
          Gere e consulte seus pagamentos do DAS
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Gerar DAS</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Acesse o sistema oficial da Receita Federal para gerar seu DAS com PIX ou boleto.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Button
              onClick={() => handleAbrirSistema("https://www8.receita.fazenda.gov.br/SimplesNacional/Aplicacoes/ATSPO/pgmei.app/Identificacao")}
              className="bg-green-600 hover:bg-green-700"
            >
              <ExternalLink className="mr-2 h-4 w-4" />
              Gerar DAS
            </Button>
            
            <Button
              onClick={() => handleAbrirSistema("https://www8.receita.fazenda.gov.br/SimplesNacional/Aplicacoes/ATSPO/pgmei.app/Identificacao")}
              variant="outline"
            >
              Consultar Pagamentos
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calculator className="h-5 w-5" />
            Calculadora DAS
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="valorDAS">Valor mensal (R$)</Label>
              <Input
                id="valorDAS"
                type="number"
                step="0.01"
                value={valorDAS}
                onChange={(e) => setValorDAS(e.target.value)}
                placeholder="70.60"
              />
            </div>
            
            <div className="space-y-2">
              <div className="p-3 bg-muted rounded-lg">
                <p className="text-sm text-muted-foreground">Valor anual</p>
                <p className="text-xl font-bold">
                  R$ {calcularDASAnual().toFixed(2).replace(".", ",")}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Informações</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-medium mb-2">Vencimento</h3>
              <p className="text-sm text-muted-foreground">
                Todo dia 20 de cada mês
              </p>
            </div>
            
            <div>
              <h3 className="font-medium mb-2">Valor 2024</h3>
              <p className="text-sm text-muted-foreground">
                Aproximadamente R$ 70,60
              </p>
            </div>
            
            <div>
              <h3 className="font-medium mb-2">Limite MEI</h3>
              <p className="text-sm text-muted-foreground">
                Faturamento até R$ 81.000/ano
              </p>
            </div>
            
            <div>
              <h3 className="font-medium mb-2">Pagamento</h3>
              <p className="text-sm text-muted-foreground">
                PIX, boleto ou débito automático
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}