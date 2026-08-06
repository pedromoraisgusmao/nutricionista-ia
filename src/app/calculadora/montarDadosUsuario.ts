import { derivarNivelAtividade } from "@/lib/calculos/nivelAtividade";
import type { DadosFormulario, DadosUsuario, Ritmo } from "@/types";

/**
 * Fronteira entre o estado do formulário (campos opcionais, preenchimento
 * progressivo) e o motor de cálculo (tipo estrito). Duas coerções vivem
 * só aqui: gestação/amamentação vira `false` explícito para quem não foi
 * perguntado (sexo masculino), e ritmo recebe um valor de preenchimento
 * quando o objetivo é "manter" — calcularMetaCalorica ignora ritmo nesse
 * caso, mas o tipo DadosUsuario exige um valor.
 */
export function montarDadosUsuario(dados: DadosFormulario): DadosUsuario {
  if (
    dados.sexo === undefined ||
    dados.idadeAnos === undefined ||
    dados.pesoKg === undefined ||
    dados.alturaCm === undefined ||
    dados.diasTreinoSemana === undefined ||
    dados.duracaoSessaoMinutos === undefined ||
    dados.objetivo === undefined ||
    dados.condicaoSaudeRelevante === undefined
  ) {
    throw new Error(
      "Dados obrigatórios do formulário ausentes ao montar DadosUsuario.",
    );
  }

  const circunferencias =
    dados.cinturaCm !== undefined && dados.pescocoCm !== undefined
      ? {
          cinturaCm: dados.cinturaCm,
          pescocoCm: dados.pescocoCm,
          quadrilCm: dados.quadrilCm,
        }
      : undefined;

  const ritmoIrrelevantePorManter: Ritmo = "moderado";

  return {
    sexo: dados.sexo,
    idadeAnos: dados.idadeAnos,
    pesoKg: dados.pesoKg,
    alturaCm: dados.alturaCm,
    percentualGordura: dados.percentualGordura,
    circunferencias,
    gestanteOuAmamentando:
      dados.sexo === "feminino" ? Boolean(dados.gestanteOuAmamentando) : false,
    condicaoSaudeRelevante: dados.condicaoSaudeRelevante,
    nivelAtividade: derivarNivelAtividade(
      dados.diasTreinoSemana,
      dados.duracaoSessaoMinutos,
    ),
    objetivo: dados.objetivo,
    ritmo: dados.objetivo === "manter" ? ritmoIrrelevantePorManter : (dados.ritmo as Ritmo),
  };
}
