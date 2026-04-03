import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const cnpj = request.nextUrl.searchParams.get('cnpj')?.replace(/\D/g, '')

  if (!cnpj || cnpj.length !== 14) {
    return NextResponse.json({ error: 'CNPJ inválido' }, { status: 400 })
  }

  try {
    const url = `https://brasilapi.com.br/api/cnpj/v1/${cnpj}`
    console.log('Consultando CNPJ:', url)

    const response = await fetch(url, { cache: 'no-store' })

    if (!response.ok) {
      console.log('BrasilAPI retornou status:', response.status)
      return NextResponse.json({ error: 'CNPJ não encontrado' }, { status: 404 })
    }

    const data = await response.json()
    console.log('Dados recebidos:', data.razao_social)

    return NextResponse.json({
      success: true,
      data: {
        razao_social: data.razao_social || '',
        nome_fantasia: data.nome_fantasia || '',
        cnpj: data.cnpj || cnpj,
        situacao_cadastral: data.descricao_situacao_cadastral || '',
        atividade_principal: data.cnae_fiscal_descricao || '',
        logradouro: data.logradouro || '',
        numero: data.numero || '',
        bairro: data.bairro || '',
        municipio: data.municipio || '',
        uf: data.uf || '',
        cep: data.cep || '',
        porte: data.porte || '',
        natureza_juridica: data.natureza_juridica || '',
        data_inicio_atividade: data.data_inicio_atividade || '',
      }
    })
  } catch (error) {
    console.error('Erro ao consultar CNPJ:', error)
    return NextResponse.json({ error: 'Erro ao consultar CNPJ' }, { status: 500 })
  }
}
