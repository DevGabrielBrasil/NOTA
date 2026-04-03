export interface DadosNotaImportada {
  numero: string
  dataEmissao: string // YYYY-MM-DD
  valorTotal: number
  descricao: string
  cnpjPrestador: string
  tipo: 'nfse' | 'nfe'
}

function getTagValue(doc: Document, tagName: string): string | null {
  const elements = doc.getElementsByTagName(tagName)
  if (elements.length === 0) return null
  return elements[0].textContent?.trim() || null
}

function parseDate(raw: string): string {
  // ISO: 2026-03-15T10:00:00
  const isoMatch = raw.match(/(\d{4})-(\d{2})-(\d{2})/)
  if (isoMatch) return `${isoMatch[1]}-${isoMatch[2]}-${isoMatch[3]}`

  // BR: 15/03/2026
  const brMatch = raw.match(/(\d{2})\/(\d{2})\/(\d{4})/)
  if (brMatch) return `${brMatch[3]}-${brMatch[2]}-${brMatch[1]}`

  return ""
}

function tryParseNFSe(doc: Document): DadosNotaImportada | null {
  // NFS-e padrão ABRASF (Emissor Nacional)
  const valorServicos =
    getTagValue(doc, "ValorLiquidoNfse") ||
    getTagValue(doc, "ValorServicos") ||
    getTagValue(doc, "vServico") ||
    getTagValue(doc, "vLiq")

  if (!valorServicos) return null

  const numero =
    getTagValue(doc, "Numero") ||
    getTagValue(doc, "nNFSe") ||
    getTagValue(doc, "NumeroNfse") ||
    ""

  const dataRaw =
    getTagValue(doc, "DataEmissao") ||
    getTagValue(doc, "dhEmi") ||
    getTagValue(doc, "Competencia") ||
    getTagValue(doc, "dtEmi") ||
    ""

  const descricao =
    getTagValue(doc, "Discriminacao") ||
    getTagValue(doc, "xServ") ||
    getTagValue(doc, "Descricao") ||
    "NFS-e importada"

  // Buscar CNPJ do prestador
  let cnpj = ""
  const prestadorCnpj = doc.querySelector("Prestador Cnpj, PrestadorServico Cnpj, Prestador CpfCnpj Cnpj")
  if (prestadorCnpj) {
    cnpj = prestadorCnpj.textContent?.trim() || ""
  }
  if (!cnpj) {
    cnpj = getTagValue(doc, "Cnpj") || getTagValue(doc, "CNPJ") || ""
  }

  return {
    numero,
    dataEmissao: parseDate(dataRaw),
    valorTotal: parseFloat(valorServicos.replace(",", ".")) || 0,
    descricao: descricao.substring(0, 200),
    cnpjPrestador: cnpj.replace(/\D/g, ""),
    tipo: 'nfse',
  }
}

function tryParseNFe(doc: Document): DadosNotaImportada | null {
  // NF-e padrão nacional
  const vNF = getTagValue(doc, "vNF")
  if (!vNF) return null

  const numero = getTagValue(doc, "nNF") || ""
  const dhEmi = getTagValue(doc, "dhEmi") || getTagValue(doc, "dEmi") || ""
  const descricao = getTagValue(doc, "xProd") || "NF-e importada"
  const cnpj = getTagValue(doc, "CNPJ") || ""

  return {
    numero,
    dataEmissao: parseDate(dhEmi),
    valorTotal: parseFloat(vNF.replace(",", ".")) || 0,
    descricao: descricao.substring(0, 200),
    cnpjPrestador: cnpj.replace(/\D/g, ""),
    tipo: 'nfe',
  }
}

export function parseNotaFiscalXml(xmlString: string): DadosNotaImportada | null {
  const parser = new DOMParser()
  const doc = parser.parseFromString(xmlString, "text/xml")

  // Verificar erro de parse
  const parseError = doc.querySelector("parsererror")
  if (parseError) return null

  // Tentar NFS-e primeiro (mais comum para MEI)
  const nfse = tryParseNFSe(doc)
  if (nfse && nfse.valorTotal > 0) return nfse

  // Tentar NF-e
  const nfe = tryParseNFe(doc)
  if (nfe && nfe.valorTotal > 0) return nfe

  return null
}
