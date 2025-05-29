// Função para formatar data
export function formatarData(dataString: string): string {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dataString)) {
    console.error("Formato de data inválido. Esperado: YYYY-MM-DD")
    return dataString
  }

  // Divide a string em partes
  const partes = dataString.split('-')
  
  // Reorganiza as partes para o formato brasileiro
  return `${partes[2]}/${partes[1]}/${partes[0]}`
}

// Função para formatar valor monetário
export function formatarValor(valor: number): string {
  try {
    return valor.toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    })
  } catch (error) {
    console.error("Erro ao formatar valor:", error)
    return `R$ ${valor}`
  }
}
