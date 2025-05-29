"use client";

import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

export default function CertidoesCard() {
  const [openModal, setOpenModal] = useState(false);
  const [currentCertidao, setCurrentCertidao] = useState({
    nome: '',
    url: ''
  });

  const handleEmitirCertidao = (nome: string, url: string) => {
    // Abre nova aba para emissão do certificado
    window.open(url, '_blank');
    
    // Prepara o modal para upload
    setCurrentCertidao({ nome, url });
    setOpenModal(true);
  };

  const handleUpload = (file: File) => {
    // Aqui você implementa a lógica para enviar o arquivo para o servidor
    console.log('Arquivo para upload:', file, 'para certidão:', currentCertidao.nome);
    
    // Exemplo de chamada API:
    // await api.uploadCertidao(file, currentCertidao.nome);
    
    // Fecha o modal após upload
    setOpenModal(false);
  };

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Emitir Certidões Oficiais</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground text-sm">
            Clique no botão desejado para emitir a certidão. Depois envie o PDF abaixo.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Button
              variant="outline"
              onClick={() =>
                handleEmitirCertidao(
                  "Certidão Federal (RFB)",
                  "https://servicos.receita.fazenda.gov.br/Servicos/certidao/CNDConjuntaInter/Emitir"
                )
              }
            >
              Emitir Certidão Federal (RFB)
            </Button>

            <Button
              variant="outline"
              onClick={() =>
                handleEmitirCertidao(
                  "Certidão Simples Nacional",
                  "https://www8.receita.fazenda.gov.br/SimplesNacional/aplicacoes.aspx?id=21"
                )
              }
            >
              Emitir Certidão Simples Nacional
            </Button>

            <Button
              variant="outline"
              onClick={() =>
                handleEmitirCertidao(
                  "Certidão Estadual (RS)",
                  "https://www.sefaz.rs.gov.br/SAT/CertidaoSitFiscalConsulta.aspx"
                )
              }
            >
              Emitir Certidão Estadual (RS)
            </Button>

            <Button
              variant="outline"
              onClick={() =>
                handleEmitirCertidao(
                  "Certidão Trabalhista (TST)",
                  "https://www.tst.jus.br/certidao1"
                )
              }
            >
              Emitir Certidão Trabalhista (TST)
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Modal para upload do certificado */}
      <Dialog open={openModal} onOpenChange={setOpenModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Anexar {currentCertidao.nome}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Por favor, anexe o certificado emitido em formato PDF.
            </p>
            {/*
              <FileUploader 
              accept=".pdf"
              maxSize={5 * 1024 * 1024} // 5MB
              onFileUpload={handleUpload}
              label="Arraste ou clique para selecionar o arquivo"
            />
            */}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}