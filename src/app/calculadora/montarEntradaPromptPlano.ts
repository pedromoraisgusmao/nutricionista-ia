import type { EntradaPromptPlano } from "@/lib/ia/prompt";
import type { DadosFormulario } from "@/types";
import type { ResultadoCalculo } from "./calcularResultado";

const NUMERO_REFEICOES_PADRAO = 4;

/**
 * Fronteira entre o estado do formulário e o prompt de geração do plano
 * (RF-04): só repassa números já calculados por `calcularResultado` —
 * não faz nenhum cálculo aqui. Gestação e condição de saúde não
 * aparecem em `DadosFormulario` mapeado para cá de propósito (ver
 * src/lib/ia/prompt.ts).
 */
export function montarEntradaPromptPlano(
  dados: DadosFormulario,
  resultado: ResultadoCalculo,
): EntradaPromptPlano {
  return {
    metaCalorica: resultado.metaFinalKcal,
    macros: resultado.macros,
    numeroRefeicoes: dados.refeicoesPorDia ?? NUMERO_REFEICOES_PADRAO,
    restricoes: dados.restricoesAlimentares,
    alergias: dados.alergias,
    alimentosPreferidos: dados.alimentosPreferidos,
    alimentosRejeitados: dados.alimentosRejeitados,
    orcamento: dados.orcamento,
    disponibilidadeCozinhar: dados.disponibilidadeCozinhar,
  };
}
