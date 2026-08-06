import type { Circunferencias, DadosCorporais, ResultadoTMB, Sexo } from "@/types";

export function calcularTMBMifflinStJeor(
  dados: Pick<DadosCorporais, "sexo" | "idadeAnos" | "pesoKg" | "alturaCm">,
): number {
  const base = 10 * dados.pesoKg + 6.25 * dados.alturaCm - 5 * dados.idadeAnos;
  return dados.sexo === "masculino" ? base + 5 : base - 161;
}

export function calcularTMBKatchMcArdle(
  pesoKg: number,
  percentualGordura: number,
): number {
  const massaMagraKg = pesoKg * (1 - percentualGordura / 100);
  return 370 + 21.6 * massaMagraKg;
}

export function estimarPercentualGorduraMarinha(
  sexo: Sexo,
  alturaCm: number,
  circunferencias: Circunferencias,
): number {
  const { cinturaCm, pescocoCm, quadrilCm } = circunferencias;

  if (sexo === "masculino") {
    const denominador =
      1.0324 -
      0.19077 * Math.log10(cinturaCm - pescocoCm) +
      0.15456 * Math.log10(alturaCm);
    return 495 / denominador - 450;
  }

  if (quadrilCm === undefined) {
    throw new Error(
      "quadrilCm é obrigatório para estimar o percentual de gordura de mulheres pelo método da Marinha dos EUA",
    );
  }

  const denominador =
    1.29579 -
    0.35004 * Math.log10(cinturaCm + quadrilCm - pescocoCm) +
    0.221 * Math.log10(alturaCm);
  return 495 / denominador - 450;
}

export function calcularTMB(dados: DadosCorporais): ResultadoTMB {
  if (dados.percentualGordura !== undefined) {
    return {
      valorKcal: calcularTMBKatchMcArdle(dados.pesoKg, dados.percentualGordura),
      formulaUsada: "katch-mcardle",
    };
  }

  if (dados.circunferencias !== undefined) {
    const percentualEstimado = estimarPercentualGorduraMarinha(
      dados.sexo,
      dados.alturaCm,
      dados.circunferencias,
    );
    return {
      valorKcal: calcularTMBKatchMcArdle(dados.pesoKg, percentualEstimado),
      formulaUsada: "katch-mcardle",
    };
  }

  return {
    valorKcal: calcularTMBMifflinStJeor(dados),
    formulaUsada: "mifflin-st-jeor",
  };
}
