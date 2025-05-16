// Função para formatar data
export function formatarData(dataString: string): string {
  try {
    const data = new Date(dataString)
    return data.toLocaleDateString("pt-BR")
  } catch (error) {
    console.error("Erro ao formatar data:", error)
    return dataString
  }
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
