import { describe, expect, it } from "vitest";
import type { DadosUsuario, ResultadoIMC } from "@/types";
import {
  aplicarPisoCalorico,
  limitarRitmoPerda,
  verificarBloqueios,
} from "./seguranca";

const dadosBase: DadosUsuario = {
  sexo: "masculino",
  idadeAnos: 30,
  pesoKg: 80,
  alturaCm: 178,
  gestanteOuAmamentando: false,
  condicaoSaudeRelevante: false,
  nivelAtividade: "moderadamente_ativo",
  objetivo: "manter",
  ritmo: "moderado",
};

const imcNormal: ResultadoIMC = { valor: 22, classificacao: "peso_normal" };
const imcBaixo: ResultadoIMC = { valor: 17.5, classificacao: "abaixo_do_peso" };

describe("verificarBloqueios", () => {
  it("não bloqueia quando nenhuma regra dispara", () => {
    const resultado = verificarBloqueios(dadosBase, imcNormal);
    expect(resultado.bloqueado).toBe(false);
    expect(resultado.bloqueios).toEqual([]);
  });

  it("SEG-01: bloqueia menor de 18 anos", () => {
    const resultado = verificarBloqueios(
      { ...dadosBase, idadeAnos: 17 },
      imcNormal,
    );
    expect(resultado.bloqueado).toBe(true);
    expect(resultado.bloqueios.map((b) => b.regra)).toContain("SEG-01");
    expect(resultado.bloqueios[0]?.motivo).toBeTruthy();
  });

  it("SEG-02: bloqueia gestação ou amamentação", () => {
    const resultado = verificarBloqueios(
      { ...dadosBase, gestanteOuAmamentando: true },
      imcNormal,
    );
    expect(resultado.bloqueado).toBe(true);
    expect(resultado.bloqueios.map((b) => b.regra)).toContain("SEG-02");
  });

  it("SEG-03: bloqueia IMC abaixo de 18,5 com objetivo de perder gordura", () => {
    const resultado = verificarBloqueios(
      { ...dadosBase, objetivo: "perder_gordura" },
      imcBaixo,
    );
    expect(resultado.bloqueado).toBe(true);
    expect(resultado.bloqueios.map((b) => b.regra)).toContain("SEG-03");
  });

  it("SEG-03: não bloqueia IMC abaixo de 18,5 quando o objetivo não é perder gordura", () => {
    const resultado = verificarBloqueios(
      { ...dadosBase, objetivo: "ganhar_massa" },
      imcBaixo,
    );
    expect(resultado.bloqueado).toBe(false);
  });

  it("SEG-06: bloqueia condição de saúde relevante", () => {
    const resultado = verificarBloqueios(
      { ...dadosBase, condicaoSaudeRelevante: true },
      imcNormal,
    );
    expect(resultado.bloqueado).toBe(true);
    expect(resultado.bloqueios.map((b) => b.regra)).toContain("SEG-06");
  });

  it("acumula mais de um bloqueio quando várias regras disparam ao mesmo tempo", () => {
    const resultado = verificarBloqueios(
      { ...dadosBase, idadeAnos: 16, condicaoSaudeRelevante: true },
      imcNormal,
    );
    const regras = resultado.bloqueios.map((b) => b.regra);
    expect(regras).toContain("SEG-01");
    expect(regras).toContain("SEG-06");
    expect(resultado.bloqueios).toHaveLength(2);
  });
});

describe("aplicarPisoCalorico (SEG-04)", () => {
  it("eleva ao piso de 1500kcal quando a meta calculada para homem fica abaixo", () => {
    const ajuste = aplicarPisoCalorico(1400, "masculino");
    expect(ajuste).not.toBeNull();
    expect(ajuste?.valorOriginalKcal).toBe(1400);
    expect(ajuste?.valorAjustadoKcal).toBe(1500);
    expect(ajuste?.regra).toBe("SEG-04");
  });

  it("eleva ao piso de 1200kcal quando a meta calculada para mulher fica abaixo", () => {
    const ajuste = aplicarPisoCalorico(1100, "feminino");
    expect(ajuste?.valorAjustadoKcal).toBe(1200);
  });

  it("não ajusta quando a meta já está acima do piso", () => {
    expect(aplicarPisoCalorico(1600, "masculino")).toBeNull();
  });
});

describe("limitarRitmoPerda (SEG-05)", () => {
  // Derivado à mão: 50kg, GET 3000kcal, meta 2250kcal (ritmo agressivo)
  // -> déficit 750kcal/dia -> 0,6818kg/semana projetado, limite de 1% é
  // 0,5kg/semana -> excede, meta ajustada para 2450kcal.
  it("limita o déficit quando a perda projetada excede 1% do peso por semana", () => {
    const ajuste = limitarRitmoPerda(2250, 3000, 50);
    expect(ajuste).not.toBeNull();
    expect(ajuste?.regra).toBe("SEG-05");
    expect(ajuste?.valorOriginalKcal).toBe(2250);
    expect(ajuste?.valorAjustadoKcal).toBeCloseTo(2450, 2);
  });

  // Derivado à mão: 80kg, GET 2778,375kcal, meta 2222,7kcal (ritmo moderado)
  // -> déficit 555,675kcal/dia -> 0,5052kg/semana, limite é 0,8kg/semana ->
  // dentro do limite, não deve ajustar.
  it("não ajusta quando a perda projetada está dentro do limite de 1%", () => {
    const ajuste = limitarRitmoPerda(2222.7, 2778.375, 80);
    expect(ajuste).toBeNull();
  });

  it("não ajusta quando não há déficit (manutenção ou ganho de massa)", () => {
    expect(limitarRitmoPerda(2500, 2500, 70)).toBeNull();
    expect(limitarRitmoPerda(2750, 2500, 70)).toBeNull();
  });
});
