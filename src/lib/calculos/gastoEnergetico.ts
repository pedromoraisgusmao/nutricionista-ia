import type { MetaCalorica, NivelAtividade, Objetivo, ResultadoGET, Ritmo } from "@/types";

const FATOR_ATIVIDADE: Record<NivelAtividade, number> = {
  sedentario: 1.2,
  levemente_ativo: 1.375,
  moderadamente_ativo: 1.55,
  muito_ativo: 1.725,
  extremamente_ativo: 1.9,
};

const PERCENTUAL_PERDER_GORDURA: Record<Ritmo, number> = {
  leve: -10,
  moderado: -20,
  agressivo: -25,
};

const PERCENTUAL_GANHAR_MASSA: Record<Ritmo, number> = {
  leve: 5,
  moderado: 10,
  agressivo: 15,
};

export function calcularGET(
  tmbKcal: number,
  nivelAtividade: NivelAtividade,
): ResultadoGET {
  const fatorAtividade = FATOR_ATIVIDADE[nivelAtividade];
  return {
    valorKcal: tmbKcal * fatorAtividade,
    fatorAtividade,
  };
}

export function calcularMetaCalorica(
  getKcal: number,
  objetivo: Objetivo,
  ritmo: Ritmo,
): MetaCalorica {
  if (objetivo === "manter") {
    return { valorKcal: getKcal, percentualAjuste: 0 };
  }

  const percentualAjuste =
    objetivo === "perder_gordura"
      ? PERCENTUAL_PERDER_GORDURA[ritmo]
      : PERCENTUAL_GANHAR_MASSA[ritmo];

  return {
    valorKcal: getKcal * (1 + percentualAjuste / 100),
    percentualAjuste,
  };
}
