// Função para formatar data no padrão brasileiro (DD/MM/YYYY)
export function formatarData(dataString: string): string {
  if (!dataString) return ""
  // Extrai apenas a parte YYYY-MM-DD de qualquer formato (ISO, com timezone, etc.)
  const match = dataString.match(/(\d{4})-(\d{2})-(\d{2})/)
  if (!match) return dataString
  return `${match[3]}/${match[2]}/${match[1]}`
}

// Função para formatar valor monetário
export function formatarValor(valor: number | string): string {
  const num = Number(valor) || 0
  return num.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  })
}

export function cnpjMask (value: string) {
  if (!value) return "";
  return value
    .replace(/\D/g, "") // Remove tudo o que não é dígito
    .replace(/(\d{2})(\d)/, "$1.$2") // Coloca ponto após o segundo dígito
    .replace(/(\d{3})(\d)/, "$1.$2") // Coloca ponto após o quinto dígito
    .replace(/(\d{3})(\d)/, "$1/$2") // Coloca barra após o oitavo dígito
    .replace(/(\d{4})(\d)/, "$1-$2") // Coloca hífen após o décimo segundo dígito
    .replace(/(-\d{2})\d+?$/, "$1"); // Limita a dois dígitos após o hífen
};