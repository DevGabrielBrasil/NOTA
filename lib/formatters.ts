/**
 * Formata um número para o padrão de moeda brasileiro (BRL).
 * @param value O número a ser formatado.
 * @returns Uma string com o valor formatado, ex: "R$ 1.234,56".
 */
export function formatCurrency(value: number | null | undefined): string {
  // Se o valor não for um número válido, retorna um padrão.
  if (typeof value !== 'number') {
    return "R$ 0,00";
  }

  // Usamos o objeto Intl.NumberFormat, que é a forma nativa e correta
  // do JavaScript para lidar com internacionalização de números.
  const formatter = new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 2, // Garante sempre duas casas decimais
  });

  return formatter.format(value);
}