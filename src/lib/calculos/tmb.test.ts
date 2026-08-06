import { describe, expect, it } from "vitest";
import {
  calcularTMB,
  calcularTMBKatchMcArdle,
  calcularTMBMifflinStJeor,
  estimarPercentualGorduraMarinha,
} from "./tmb";

describe("calcularTMBMifflinStJeor", () => {
  it("calcula a TMB de um homem", () => {
    const tmb = calcularTMBMifflinStJeor({
      sexo: "masculino",
      idadeAnos: 25,
      pesoKg: 80,
      alturaCm: 178,
    });
    expect(tmb).toBeCloseTo(1792.5, 2);
  });

  it("calcula a TMB de uma mulher", () => {
    const tmb = calcularTMBMifflinStJeor({
      sexo: "feminino",
      idadeAnos: 30,
      pesoKg: 65,
      alturaCm: 165,
    });
    expect(tmb).toBeCloseTo(1370.25, 2);
  });
});

describe("calcularTMBKatchMcArdle", () => {
  it("calcula a TMB a partir do percentual de gordura", () => {
    const tmb = calcularTMBKatchMcArdle(80, 15);
    expect(tmb).toBeCloseTo(1838.8, 1);
  });
});

describe("estimarPercentualGorduraMarinha", () => {
  it("estima o percentual de gordura de um homem", () => {
    const percentual = estimarPercentualGorduraMarinha("masculino", 178, {
      cinturaCm: 85,
      pescocoCm: 38,
    });
    expect(percentual).toBeCloseTo(16.44, 1);
  });

  it("estima o percentual de gordura de uma mulher", () => {
    const percentual = estimarPercentualGorduraMarinha("feminino", 165, {
      cinturaCm: 70,
      pescocoCm: 32,
      quadrilCm: 95,
    });
    expect(percentual).toBeCloseTo(24.86, 1);
  });

  it("lança erro se faltar o quadril para estimar em uma mulher", () => {
    expect(() =>
      estimarPercentualGorduraMarinha("feminino", 165, {
        cinturaCm: 70,
        pescocoCm: 32,
      }),
    ).toThrow();
  });
});

// Valores de referência calculados por fora (à mão / calculadora), não a
// partir da mesma leitura da fórmula usada para escrever os testes acima —
// servem para checar a implementação contra uma fonte independente.
describe("valores de referência verificados externamente", () => {
  it("Mifflin-St Jeor, homem, 25 anos, 80kg, 178cm → 1792,5 kcal", () => {
    const tmb = calcularTMBMifflinStJeor({
      sexo: "masculino",
      idadeAnos: 25,
      pesoKg: 80,
      alturaCm: 178,
    });
    expect(tmb).toBeCloseTo(1792.5, 2);
  });

  it("Mifflin-St Jeor, mulher, 30 anos, 65kg, 165cm → 1370,25 kcal", () => {
    const tmb = calcularTMBMifflinStJeor({
      sexo: "feminino",
      idadeAnos: 30,
      pesoKg: 65,
      alturaCm: 165,
    });
    expect(tmb).toBeCloseTo(1370.25, 2);
  });

  it("Katch-McArdle, 80kg com 20% de gordura → 1752,4 kcal", () => {
    const tmb = calcularTMBKatchMcArdle(80, 20);
    expect(tmb).toBeCloseTo(1752.4, 2);
  });

  it("Marinha, homem, cintura 90cm, pescoço 38cm, altura 178cm → ~20,1%", () => {
    const percentual = estimarPercentualGorduraMarinha("masculino", 178, {
      cinturaCm: 90,
      pescocoCm: 38,
    });
    expect(percentual).toBeCloseTo(20.1, 1);
  });
});

describe("calcularTMB", () => {
  it("usa Mifflin-St Jeor quando não há percentual de gordura nem circunferências", () => {
    const resultado = calcularTMB({
      sexo: "masculino",
      idadeAnos: 25,
      pesoKg: 80,
      alturaCm: 178,
    });
    expect(resultado.formulaUsada).toBe("mifflin-st-jeor");
    expect(resultado.valorKcal).toBeCloseTo(1792.5, 2);
  });

  it("usa Katch-McArdle quando o percentual de gordura é informado diretamente", () => {
    const resultado = calcularTMB({
      sexo: "masculino",
      idadeAnos: 25,
      pesoKg: 80,
      alturaCm: 178,
      percentualGordura: 15,
    });
    expect(resultado.formulaUsada).toBe("katch-mcardle");
    expect(resultado.valorKcal).toBeCloseTo(1838.8, 1);
  });

  it("usa Katch-McArdle com percentual estimado quando há circunferências mas não % de gordura informado", () => {
    const resultado = calcularTMB({
      sexo: "masculino",
      idadeAnos: 25,
      pesoKg: 80,
      alturaCm: 178,
      circunferencias: { cinturaCm: 85, pescocoCm: 38 },
    });
    expect(resultado.formulaUsada).toBe("katch-mcardle");
  });
});
