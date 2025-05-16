import { eachDayOfInterval, parseISO } from "date-fns";

interface Feriado {
  date: string;
  name: string;
  type: string;
}

export async function getFeriados(ano: number): Promise<Feriado[]> {
  try {
    const response = await fetch(`https://brasilapi.com.br/api/feriados/v1/${ano}`);

    if (!response.ok) {
      throw new Error(`Erro ao buscar feriados: ${response.statusText}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Erro ao buscar feriados:", error);
    throw error
  }
}

export async function calcularDiasUteis(dataInicio: Date, dataFim: Date): Promise<number> {
  try {
    // Garantir que as datas estejam no formato correto
    const inicio = new Date(dataInicio);
    const fim = new Date(dataFim);

    // Obter todos os dias no intervalo
    const diasNoIntervalo = eachDayOfInterval({ start: inicio, end: fim });

    // Buscar feriados para o ano atual e próximo (caso o período cruze o ano)
    const anoInicio = inicio.getFullYear();
    const anoFim = fim.getFullYear();

    const feriadosAnoInicio = await getFeriados(anoInicio);
    let feriadosAnoFim: Feriado[] = [];

    if (anoInicio !== anoFim) {
      feriadosAnoFim = await getFeriados(anoFim);
    }

    // Combinar feriados
    const todosFeriados = [...feriadosAnoInicio, ...feriadosAnoFim];
    const datasFeriados = todosFeriados.map((f) => parseISO(f.date));

    // Filtrar dias úteis (apenas segunda a sexta, excluindo feriados)
    const diasUteis = diasNoIntervalo.filter((dia) => {
      // Verificar se é dia útil (segunda a sexta)
      const diaDaSemana = dia.getDay();
      const ehDiaUtil = diaDaSemana >= 1 && diaDaSemana <= 5; // 1 = segunda, 5 = sexta

      // Verificar se não é feriado
      const naoEhFeriado = !datasFeriados.some(
        (feriado) =>
          feriado.getDate() === dia.getDate() &&
          feriado.getMonth() === dia.getMonth() &&
          feriado.getFullYear() === dia.getFullYear()
      );

      return ehDiaUtil && naoEhFeriado;
    });

    return diasUteis.length;
  } catch (error) {
    console.error("Erro ao calcular dias úteis:", error);
    throw new Error("Não foi possível calcular os dias úteis");
  }
}
