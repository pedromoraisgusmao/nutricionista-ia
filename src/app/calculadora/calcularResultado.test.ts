import { describe, expect, it } from "vitest";
import type { DadosUsuario } from "@/types";
import { calcularResultado } from "./calcularResultado";

// Mesmo exemplo de referência de src/lib/integracao.test.ts: homem, 25 anos,
// 80kg, 178cm, moderadamente ativo, perder gordura, ritmo moderado.
const dadosUsuario: DadosUsuario = {
  sexo: "masculino",
  idadeAnos: 25,
  pesoKg: 80,
  alturaCm: 178,
  gestanteOuAmamentando: false,
  condicaoSaudeRelevante: false,
  nivelAtividade: "moderadamente_ativo",
  objetivo: "perder_gordura",
  ritmo: "moderado",
};

describe("calcularResultado", () => {
  it("reproduz a cadeia completa do exemplo de referência", () => {
    const resultado = calcularResultado(dadosUsuario, 1);

    expect(resultado.tmb.valorKcal).toBeCloseTo(1792.5, 2);
    expect(resultado.get.valorKcal).toBeCloseTo(2778.375, 2);
    expect(resultado.metaBruta.valorKcal).toBeCloseTo(2222.7, 2);
    expect(resultado.ajustePiso).toBeNull();
    expect(resultado.ajusteRitmo).toBeNull();
    expect(resultado.metaFinalKcal).toBeCloseTo(2222.7, 2);
    expect(resultado.macros.proteinaG).toBeCloseTo(160, 2);
    expect(resultado.macros.gorduraG).toBeCloseTo(64, 2);
    expect(resultado.macros.carboidratoG).toBeCloseTo(251.675, 2);
    expect(resultado.hidratacaoDiaDeTreino.mlPorDia).toBeCloseTo(3300, 2);
    expect(resultado.hidratacaoDiaDeDescanso.mlPorDia).toBeCloseTo(2800, 2);
    expect(resultado.imc.valor).toBeCloseTo(25.2493, 2);
    expect(resultado.imc.classificacao).toBe("sobrepeso");
  });

  it("usa o maior valor entre meta bruta e os alvos de SEG-04/SEG-05 quando algum dispara", () => {
    // Peso baixo + ritmo agressivo empurra a meta bruta abaixo do piso
    // masculino (1500 kcal) e também aciona o limite de ritmo (SEG-05).
    const dadosComAjustes: DadosUsuario = {
      ...dadosUsuario,
      pesoKg: 55,
      nivelAtividade: "sedentario",
      ritmo: "agressivo",
    };

    const resultado = calcularResultado(dadosComAjustes, 0);

    expect(resultado.ajustePiso).not.toBeNull();
    expect(resultado.metaFinalKcal).toBeGreaterThanOrEqual(
      resultado.metaBruta.valorKcal,
    );
    expect(resultado.metaFinalKcal).toBeGreaterThanOrEqual(
      resultado.ajustePiso?.valorAjustadoKcal ?? 0,
    );
  });
});
