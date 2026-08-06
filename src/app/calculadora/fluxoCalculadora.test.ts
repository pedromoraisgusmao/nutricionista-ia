import { describe, expect, it } from "vitest";
import { calcularIMC } from "@/lib/calculos/macros";
import { verificarBloqueios } from "@/lib/validacoes/seguranca";
import type { DadosFormulario } from "@/types";
import { calcularResultado } from "./calcularResultado";
import { montarDadosUsuario } from "./montarDadosUsuario";

// Mesmo exemplo de referência usado na Fase 1 (src/lib/integracao.test.ts):
// homem, 25 anos, 80kg, 178cm, 4 treinos de 60min/semana (-> moderadamente
// ativo), perder gordura, ritmo moderado.
const dadosFormularioPreenchido: DadosFormulario = {
  sexo: "masculino",
  idadeAnos: 25,
  pesoKg: 80,
  alturaCm: 178,
  diasTreinoSemana: 4,
  duracaoSessaoMinutos: 60,
  objetivo: "perder_gordura",
  ritmo: "moderado",
  gestanteOuAmamentando: undefined,
  condicaoSaudeRelevante: false,
};

describe("fluxo completo do formulário até os resultados", () => {
  it("do preenchimento aos números finais, passando pela verificação de bloqueios", () => {
    const dadosUsuario = montarDadosUsuario(dadosFormularioPreenchido);
    const imc = calcularIMC(dadosUsuario.pesoKg, dadosUsuario.alturaCm);
    const verificacao = verificarBloqueios(dadosUsuario, imc);

    expect(verificacao.bloqueado).toBe(false);

    const horasTreinoDia = dadosFormularioPreenchido.duracaoSessaoMinutos! / 60;
    const resultado = calcularResultado(dadosUsuario, horasTreinoDia);

    expect(resultado.tmb.valorKcal).toBeCloseTo(1792.5, 2);
    expect(resultado.tmb.formulaUsada).toBe("mifflin-st-jeor");
    expect(resultado.get.valorKcal).toBeCloseTo(2778.375, 2);
    expect(resultado.get.fatorAtividade).toBe(1.55);
    expect(resultado.metaFinalKcal).toBeCloseTo(2222.7, 2);
    expect(resultado.macros.proteinaG).toBeCloseTo(160, 2);
    expect(resultado.macros.gorduraG).toBeCloseTo(64, 2);
    expect(resultado.macros.carboidratoG).toBeCloseTo(251.675, 2);
    expect(resultado.hidratacaoDiaDeTreino.mlPorDia).toBeCloseTo(3300, 2);
    expect(resultado.hidratacaoDiaDeDescanso.mlPorDia).toBeCloseTo(2800, 2);
    expect(resultado.imc.valor).toBeCloseTo(25.2493, 2);
    expect(resultado.imc.classificacao).toBe("sobrepeso");
  });

  it("bloqueia antes de calcular quando a idade é menor que 18 (SEG-01)", () => {
    const dadosMenorDeIdade: DadosFormulario = {
      ...dadosFormularioPreenchido,
      idadeAnos: 15,
    };

    const dadosUsuario = montarDadosUsuario(dadosMenorDeIdade);
    const imc = calcularIMC(dadosUsuario.pesoKg, dadosUsuario.alturaCm);
    const verificacao = verificarBloqueios(dadosUsuario, imc);

    expect(verificacao.bloqueado).toBe(true);
    expect(verificacao.bloqueios).toHaveLength(1);
    expect(verificacao.bloqueios[0].regra).toBe("SEG-01");
  });

  it("acumula múltiplos bloqueios simultâneos (idade e condição de saúde)", () => {
    const dadosComDoisBloqueios: DadosFormulario = {
      ...dadosFormularioPreenchido,
      idadeAnos: 15,
      condicaoSaudeRelevante: true,
    };

    const dadosUsuario = montarDadosUsuario(dadosComDoisBloqueios);
    const imc = calcularIMC(dadosUsuario.pesoKg, dadosUsuario.alturaCm);
    const verificacao = verificarBloqueios(dadosUsuario, imc);

    expect(verificacao.bloqueado).toBe(true);
    const regras = verificacao.bloqueios.map((b) => b.regra);
    expect(regras).toContain("SEG-01");
    expect(regras).toContain("SEG-06");
  });
});
