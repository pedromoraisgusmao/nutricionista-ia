import type {
  AjusteSeguranca,
  BloqueioSeguranca,
  DadosUsuario,
  ResultadoIMC,
  Sexo,
  VerificacaoBloqueios,
} from "@/types";

const IDADE_MINIMA_ANOS = 18;
const IMC_ABAIXO_DO_PESO = 18.5;

export function verificarBloqueios(
  dados: DadosUsuario,
  imc: ResultadoIMC,
): VerificacaoBloqueios {
  const bloqueios: BloqueioSeguranca[] = [];

  if (dados.idadeAnos < IDADE_MINIMA_ANOS) {
    bloqueios.push({
      regra: "SEG-01",
      motivo: `Idade informada (${dados.idadeAnos} anos) é menor que ${IDADE_MINIMA_ANOS} anos. Este aplicativo não gera planos para menores de idade — recomendamos buscar acompanhamento de um nutricionista ou pediatra.`,
    });
  }

  if (dados.gestanteOuAmamentando) {
    bloqueios.push({
      regra: "SEG-02",
      motivo:
        "Gestação ou amamentação informada. Recomendamos acompanhamento nutricional especializado nesta fase, com um nutricionista.",
    });
  }

  if (imc.valor < IMC_ABAIXO_DO_PESO && dados.objetivo === "perder_gordura") {
    bloqueios.push({
      regra: "SEG-03",
      motivo: `IMC calculado (${imc.valor.toFixed(1)}) está abaixo de ${IMC_ABAIXO_DO_PESO} e o objetivo é perder gordura. Recomendamos buscar acompanhamento de um nutricionista antes de iniciar qualquer plano de restrição calórica.`,
    });
  }

  if (dados.condicaoSaudeRelevante) {
    bloqueios.push({
      regra: "SEG-06",
      motivo:
        "Condição de saúde relevante informada (diabetes, doença renal, doença cardíaca ou transtorno alimentar). Recomendamos acompanhamento de um nutricionista para um plano alimentar seguro.",
    });
  }

  return { bloqueado: bloqueios.length > 0, bloqueios };
}

const PISO_KCAL_FEMININO = 1200;
const PISO_KCAL_MASCULINO = 1500;

export function aplicarPisoCalorico(
  metaKcal: number,
  sexo: Sexo,
): AjusteSeguranca | null {
  const piso = sexo === "feminino" ? PISO_KCAL_FEMININO : PISO_KCAL_MASCULINO;

  if (metaKcal >= piso) {
    return null;
  }

  return {
    regra: "SEG-04",
    motivo: `Meta calórica calculada (${metaKcal.toFixed(0)} kcal) está abaixo do piso mínimo seguro de ${piso} kcal. A meta foi elevada para ${piso} kcal.`,
    valorOriginalKcal: metaKcal,
    valorAjustadoKcal: piso,
  };
}

/**
 * Aproximação de Wishnofsky: 1 kg de gordura corporal ≈ 7.700 kcal.
 * Usada apenas como teto de segurança para limitar o ritmo de perda a no
 * máximo 1% do peso corporal por semana (SEG-05) — não é uma previsão
 * exata de quanto peso a pessoa vai perder.
 */
const KCAL_POR_KG_GORDURA = 7700;
const LIMITE_PERDA_SEMANAL_PERCENTUAL = 0.01;
const DIAS_POR_SEMANA = 7;

export function limitarRitmoPerda(
  metaKcal: number,
  getKcal: number,
  pesoKg: number,
): AjusteSeguranca | null {
  const deficitDiarioKcal = getKcal - metaKcal;

  if (deficitDiarioKcal <= 0) {
    return null;
  }

  const perdaSemanalProjetadaKg =
    (deficitDiarioKcal * DIAS_POR_SEMANA) / KCAL_POR_KG_GORDURA;
  const limiteSemanalKg = pesoKg * LIMITE_PERDA_SEMANAL_PERCENTUAL;

  if (perdaSemanalProjetadaKg <= limiteSemanalKg) {
    return null;
  }

  const deficitDiarioMaximoKcal =
    (limiteSemanalKg * KCAL_POR_KG_GORDURA) / DIAS_POR_SEMANA;
  const valorAjustadoKcal = getKcal - deficitDiarioMaximoKcal;

  return {
    regra: "SEG-05",
    motivo: `O ritmo escolhido projetava perda de ${perdaSemanalProjetadaKg.toFixed(2)} kg/semana, acima do limite de segurança de 1% do peso corporal (${limiteSemanalKg.toFixed(2)} kg/semana). Meta ajustada de ${metaKcal.toFixed(0)} kcal para ${valorAjustadoKcal.toFixed(0)} kcal.`,
    valorOriginalKcal: metaKcal,
    valorAjustadoKcal,
  };
}
