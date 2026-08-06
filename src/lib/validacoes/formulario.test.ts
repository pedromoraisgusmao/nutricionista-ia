import { describe, expect, it } from "vitest";
import {
  validarAltura,
  validarCircunferenciaCintura,
  validarCircunferenciaPescoco,
  validarCircunferenciaQuadril,
  validarDiasTreinoSemana,
  validarDuracaoSessaoMinutos,
  validarIdade,
  validarPercentualGordura,
  validarPeso,
} from "./formulario";

describe("validarIdade", () => {
  it("aceita o limite inferior (10) para permitir que a SEG-01 bloqueie menores de 18", () => {
    expect(validarIdade(10)).toBeUndefined();
    expect(validarIdade(17)).toBeUndefined();
  });

  it("aceita o limite superior", () => {
    expect(validarIdade(120)).toBeUndefined();
  });

  it("rejeita abaixo de 10 e acima de 120", () => {
    expect(validarIdade(9)).toMatch(/entre 10 e 120/);
    expect(validarIdade(121)).toMatch(/entre 10 e 120/);
  });

  it("rejeita valor vazio (NaN)", () => {
    expect(validarIdade(NaN)).toBe("Informe a idade.");
  });
});

describe("validarPeso", () => {
  it("aceita a faixa 30-300", () => {
    expect(validarPeso(30)).toBeUndefined();
    expect(validarPeso(300)).toBeUndefined();
  });

  it("rejeita fora da faixa", () => {
    expect(validarPeso(29)).toMatch(/entre 30 e 300/);
    expect(validarPeso(301)).toMatch(/entre 30 e 300/);
  });

  it("rejeita valor vazio (NaN)", () => {
    expect(validarPeso(NaN)).toBe("Informe o peso.");
  });
});

describe("validarAltura", () => {
  it("aceita a faixa 100-250", () => {
    expect(validarAltura(100)).toBeUndefined();
    expect(validarAltura(250)).toBeUndefined();
  });

  it("rejeita fora da faixa", () => {
    expect(validarAltura(99)).toMatch(/entre 100 e 250/);
    expect(validarAltura(251)).toMatch(/entre 100 e 250/);
  });
});

describe("validarPercentualGordura", () => {
  it("aceita a faixa 3-60", () => {
    expect(validarPercentualGordura(3)).toBeUndefined();
    expect(validarPercentualGordura(60)).toBeUndefined();
  });

  it("rejeita fora da faixa", () => {
    expect(validarPercentualGordura(2)).toMatch(/entre 3 e 60/);
    expect(validarPercentualGordura(61)).toMatch(/entre 3 e 60/);
  });
});

describe("validarCircunferenciaCintura", () => {
  it("aceita a faixa 40-200", () => {
    expect(validarCircunferenciaCintura(40)).toBeUndefined();
    expect(validarCircunferenciaCintura(200)).toBeUndefined();
  });

  it("rejeita fora da faixa", () => {
    expect(validarCircunferenciaCintura(39)).toMatch(/entre 40 e 200/);
    expect(validarCircunferenciaCintura(201)).toMatch(/entre 40 e 200/);
  });
});

describe("validarCircunferenciaPescoco", () => {
  it("aceita a faixa 20-60", () => {
    expect(validarCircunferenciaPescoco(20)).toBeUndefined();
    expect(validarCircunferenciaPescoco(60)).toBeUndefined();
  });

  it("rejeita fora da faixa", () => {
    expect(validarCircunferenciaPescoco(19)).toMatch(/entre 20 e 60/);
    expect(validarCircunferenciaPescoco(61)).toMatch(/entre 20 e 60/);
  });
});

describe("validarCircunferenciaQuadril", () => {
  it("aceita a faixa 40-200", () => {
    expect(validarCircunferenciaQuadril(40)).toBeUndefined();
    expect(validarCircunferenciaQuadril(200)).toBeUndefined();
  });

  it("rejeita fora da faixa", () => {
    expect(validarCircunferenciaQuadril(39)).toMatch(/entre 40 e 200/);
    expect(validarCircunferenciaQuadril(201)).toMatch(/entre 40 e 200/);
  });
});

describe("validarDiasTreinoSemana", () => {
  it("aceita a faixa 0-7", () => {
    expect(validarDiasTreinoSemana(0)).toBeUndefined();
    expect(validarDiasTreinoSemana(7)).toBeUndefined();
  });

  it("rejeita fora da faixa", () => {
    expect(validarDiasTreinoSemana(-1)).toMatch(/entre 0 e 7/);
    expect(validarDiasTreinoSemana(8)).toMatch(/entre 0 e 7/);
  });

  it("rejeita valores não inteiros", () => {
    expect(validarDiasTreinoSemana(3.5)).toMatch(/entre 0 e 7/);
  });

  it("rejeita valor vazio (NaN)", () => {
    expect(validarDiasTreinoSemana(NaN)).toBe(
      "Informe os dias de treino por semana.",
    );
  });
});

describe("validarDuracaoSessaoMinutos", () => {
  it("aceita a faixa 0-300", () => {
    expect(validarDuracaoSessaoMinutos(0)).toBeUndefined();
    expect(validarDuracaoSessaoMinutos(300)).toBeUndefined();
  });

  it("rejeita fora da faixa", () => {
    expect(validarDuracaoSessaoMinutos(-1)).toMatch(/entre 0 e 300/);
    expect(validarDuracaoSessaoMinutos(301)).toMatch(/entre 0 e 300/);
  });

  it("rejeita valor vazio (NaN)", () => {
    expect(validarDuracaoSessaoMinutos(NaN)).toBe(
      "Informe a duração média da sessão.",
    );
  });
});
