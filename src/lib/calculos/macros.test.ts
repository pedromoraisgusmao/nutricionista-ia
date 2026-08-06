import { describe, expect, it } from "vitest";
import {
  calcularHidratacao,
  calcularIMC,
  calcularMacros,
  calcularProteinaG,
} from "./macros";

describe("calcularProteinaG", () => {
  it.each([
    ["manter", 1.6],
    ["perder_gordura", 2.0],
    ["ganhar_massa", 1.8],
  ] as const)("usa %s g/kg para objetivo %s", (objetivo, gPorKg) => {
    expect(calcularProteinaG(80, objetivo)).toBeCloseTo(80 * gPorKg, 2);
  });
});

describe("calcularMacros", () => {
  // Valores derivados à mão (RF-02), não a partir da implementação:
  // 100kg, meta 1800kcal, manter -> proteína 160g/640kcal; gordura por
  // percentual daria 50g, mas o piso de 0,8g/kg exige 80g -> piso vence
  // (720kcal); sobram 440kcal de carboidrato -> 110g. Soma = 1800kcal.
  it("aplica o piso de gordura quando o percentual de 25% fica abaixo de 0,8 g/kg", () => {
    const macros = calcularMacros(1800, 100, "manter");
    expect(macros.gorduraG).toBeCloseTo(80, 2);
    expect(macros.proteinaG).toBeCloseTo(160, 2);
    expect(macros.carboidratoG).toBeCloseTo(110, 2);
  });

  it("recalcula o carboidrato com as calorias que sobraram depois do piso de gordura", () => {
    const macros = calcularMacros(1800, 100, "manter");
    const totalKcal =
      macros.proteinaG * 4 + macros.gorduraG * 9 + macros.carboidratoG * 4;
    expect(totalKcal).toBeCloseTo(1800, 1);
  });

  // 70kg, meta 2500kcal, manter -> proteína 112g/448kcal; gordura por
  // percentual = 69,444g (625kcal), piso seria só 56g -> percentual vence;
  // sobram 1427kcal de carboidrato -> 356,75g. Soma = 2500kcal.
  it("usa o percentual de 25% quando ele já está acima do piso de 0,8 g/kg", () => {
    const macros = calcularMacros(2500, 70, "manter");
    expect(macros.gorduraG).toBeCloseTo(69.444, 2);
    expect(macros.proteinaG).toBeCloseTo(112, 2);
    expect(macros.carboidratoG).toBeCloseTo(356.75, 2);

    const totalKcal =
      macros.proteinaG * 4 + macros.gorduraG * 9 + macros.carboidratoG * 4;
    expect(totalKcal).toBeCloseTo(2500, 1);
  });
});

describe("calcularHidratacao", () => {
  it("calcula 35ml/kg sem treino", () => {
    expect(calcularHidratacao(80, 0).mlPorDia).toBeCloseTo(2800, 2);
  });

  it("soma 500ml por hora de treino", () => {
    expect(calcularHidratacao(80, 1).mlPorDia).toBeCloseTo(3300, 2);
  });
});

describe("calcularIMC", () => {
  it("classifica abaixo do peso (IMC < 18,5)", () => {
    const resultado = calcularIMC(50, 170);
    expect(resultado.valor).toBeCloseTo(17.301, 2);
    expect(resultado.classificacao).toBe("abaixo_do_peso");
  });

  it("classifica peso normal (18,5 <= IMC < 25)", () => {
    const resultado = calcularIMC(65, 170);
    expect(resultado.valor).toBeCloseTo(22.4913, 2);
    expect(resultado.classificacao).toBe("peso_normal");
  });

  it("classifica sobrepeso (25 <= IMC < 30)", () => {
    const resultado = calcularIMC(80, 178);
    expect(resultado.valor).toBeCloseTo(25.2492, 2);
    expect(resultado.classificacao).toBe("sobrepeso");
  });

  it("classifica obesidade (IMC >= 30)", () => {
    const resultado = calcularIMC(100, 170);
    expect(resultado.valor).toBeCloseTo(34.6021, 2);
    expect(resultado.classificacao).toBe("obesidade");
  });
});
