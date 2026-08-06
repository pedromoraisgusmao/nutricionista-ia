import { describe, expect, it } from "vitest";
import { calcularGET, calcularMetaCalorica } from "./calculos/gastoEnergetico";
import { calcularHidratacao, calcularIMC, calcularMacros } from "./calculos/macros";
import { calcularTMB } from "./calculos/tmb";
import {
  aplicarPisoCalorico,
  limitarRitmoPerda,
} from "./validacoes/seguranca";
import type { DadosUsuario } from "@/types";

// Homem, 25 anos, 80kg, 178cm, moderadamente ativo, perder gordura, ritmo
// moderado, sem % de gordura nem circunferências informados, não gestante,
// sem condição de saúde. Valores de referência derivados à mão antes de
// rodar a cadeia real (ver relatório da conversa), não a partir do código.
const dados: DadosUsuario = {
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

describe("cadeia completa: TMB -> GET -> meta -> ajustes -> macros -> hidratação -> IMC", () => {
  it("reproduz o exemplo calculado à mão em cada etapa", () => {
    const tmb = calcularTMB(dados);
    expect(tmb.formulaUsada).toBe("mifflin-st-jeor");
    expect(tmb.valorKcal).toBeCloseTo(1792.5, 2);

    const get = calcularGET(tmb.valorKcal, dados.nivelAtividade);
    expect(get.fatorAtividade).toBe(1.55);
    expect(get.valorKcal).toBeCloseTo(2778.375, 2);

    const metaBruta = calcularMetaCalorica(
      get.valorKcal,
      dados.objetivo,
      dados.ritmo,
    );
    expect(metaBruta.percentualAjuste).toBe(-20);
    expect(metaBruta.valorKcal).toBeCloseTo(2222.7, 2);

    const ajustePiso = aplicarPisoCalorico(metaBruta.valorKcal, dados.sexo);
    expect(ajustePiso).toBeNull();

    const ajusteRitmo = limitarRitmoPerda(
      metaBruta.valorKcal,
      get.valorKcal,
      dados.pesoKg,
    );
    expect(ajusteRitmo).toBeNull();

    const metaFinal = metaBruta.valorKcal;
    expect(metaFinal).toBeCloseTo(2222.7, 2);

    const macros = calcularMacros(metaFinal, dados.pesoKg, dados.objetivo);
    expect(macros.proteinaG).toBeCloseTo(160, 2);
    expect(macros.gorduraG).toBeCloseTo(64, 2); // piso (64g) vence o percentual (61,74g)
    expect(macros.carboidratoG).toBeCloseTo(251.675, 2);
    expect(
      macros.proteinaG * 4 + macros.gorduraG * 9 + macros.carboidratoG * 4,
    ).toBeCloseTo(metaFinal, 1);

    const hidratacaoDiaDeTreino = calcularHidratacao(dados.pesoKg, 1);
    expect(hidratacaoDiaDeTreino.mlPorDia).toBeCloseTo(3300, 2);

    const hidratacaoDiaSemTreino = calcularHidratacao(dados.pesoKg, 0);
    expect(hidratacaoDiaSemTreino.mlPorDia).toBeCloseTo(2800, 2);

    const imc = calcularIMC(dados.pesoKg, dados.alturaCm);
    expect(imc.valor).toBeCloseTo(25.2493, 2);
    expect(imc.classificacao).toBe("sobrepeso");
  });
});
