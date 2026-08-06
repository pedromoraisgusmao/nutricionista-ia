import { describe, expect, it } from "vitest";
import { calcularGET, calcularMetaCalorica } from "./gastoEnergetico";

describe("calcularGET", () => {
  it.each([
    ["sedentario", 1.2],
    ["levemente_ativo", 1.375],
    ["moderadamente_ativo", 1.55],
    ["muito_ativo", 1.725],
    ["extremamente_ativo", 1.9],
  ] as const)("aplica o fator de %s (%d) sobre a TMB", (nivel, fator) => {
    const resultado = calcularGET(1792.5, nivel);
    expect(resultado.fatorAtividade).toBe(fator);
    expect(resultado.valorKcal).toBeCloseTo(1792.5 * fator, 2);
  });
});

describe("calcularMetaCalorica", () => {
  it("mantém a meta igual ao GET quando o objetivo é manter, independente do ritmo", () => {
    const resultado = calcularMetaCalorica(2778.375, "manter", "agressivo");
    expect(resultado.valorKcal).toBeCloseTo(2778.375, 2);
    expect(resultado.percentualAjuste).toBe(0);
  });

  it.each([
    ["leve", -10],
    ["moderado", -20],
    ["agressivo", -25],
  ] as const)("aplica ritmo %s (%d%%) para perder gordura", (ritmo, percentual) => {
    const resultado = calcularMetaCalorica(2778.375, "perder_gordura", ritmo);
    expect(resultado.percentualAjuste).toBe(percentual);
    expect(resultado.valorKcal).toBeCloseTo(
      2778.375 * (1 + percentual / 100),
      2,
    );
  });

  it.each([
    ["leve", 5],
    ["moderado", 10],
    ["agressivo", 15],
  ] as const)("aplica ritmo %s (+%d%%) para ganhar massa", (ritmo, percentual) => {
    const resultado = calcularMetaCalorica(2778.375, "ganhar_massa", ritmo);
    expect(resultado.percentualAjuste).toBe(percentual);
    expect(resultado.valorKcal).toBeCloseTo(
      2778.375 * (1 + percentual / 100),
      2,
    );
  });
});
