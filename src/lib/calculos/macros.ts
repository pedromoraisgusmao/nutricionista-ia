import type { Hidratacao, Macros, Objetivo, ResultadoIMC } from "@/types";

const G_PROTEINA_POR_KG: Record<Objetivo, number> = {
  manter: 1.6,
  perder_gordura: 2.0,
  ganhar_massa: 1.8,
};

const KCAL_POR_G_PROTEINA = 4;
const KCAL_POR_G_GORDURA = 9;
const KCAL_POR_G_CARBOIDRATO = 4;
const PERCENTUAL_GORDURA_DA_META = 0.25;
const PISO_GORDURA_G_POR_KG = 0.8;

export function calcularProteinaG(pesoKg: number, objetivo: Objetivo): number {
  return pesoKg * G_PROTEINA_POR_KG[objetivo];
}

export function calcularMacros(
  metaKcal: number,
  pesoKg: number,
  objetivo: Objetivo,
): Macros {
  const proteinaG = calcularProteinaG(pesoKg, objetivo);

  const gorduraPorPercentualG =
    (metaKcal * PERCENTUAL_GORDURA_DA_META) / KCAL_POR_G_GORDURA;
  const gorduraPisoG = pesoKg * PISO_GORDURA_G_POR_KG;
  const gorduraG = Math.max(gorduraPorPercentualG, gorduraPisoG);

  const kcalRestantes =
    metaKcal - proteinaG * KCAL_POR_G_PROTEINA - gorduraG * KCAL_POR_G_GORDURA;
  const carboidratoG = kcalRestantes / KCAL_POR_G_CARBOIDRATO;

  return { proteinaG, gorduraG, carboidratoG };
}

const ML_POR_KG_PESO = 35;
const ML_POR_HORA_TREINO = 500;

export function calcularHidratacao(
  pesoKg: number,
  horasTreinoDia: number,
): Hidratacao {
  return {
    mlPorDia: pesoKg * ML_POR_KG_PESO + horasTreinoDia * ML_POR_HORA_TREINO,
  };
}

export function calcularIMC(pesoKg: number, alturaCm: number): ResultadoIMC {
  const alturaM = alturaCm / 100;
  const valor = pesoKg / (alturaM * alturaM);

  const classificacao =
    valor < 18.5
      ? "abaixo_do_peso"
      : valor < 25
        ? "peso_normal"
        : valor < 30
          ? "sobrepeso"
          : "obesidade";

  return { valor, classificacao };
}
