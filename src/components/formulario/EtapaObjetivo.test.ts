import { describe, expect, it } from "vitest";
import type { DadosFormulario } from "@/types";
import { dadosObjetivoValidos } from "./EtapaObjetivo";

describe("dadosObjetivoValidos", () => {
  it("é inválido sem objetivo selecionado", () => {
    expect(dadosObjetivoValidos({})).toBe(false);
  });

  it("é válido com objetivo 'manter' mesmo sem ritmo", () => {
    const dados: DadosFormulario = { objetivo: "manter" };
    expect(dadosObjetivoValidos(dados)).toBe(true);
  });

  it("é inválido com objetivo de perda ou ganho sem ritmo selecionado", () => {
    expect(dadosObjetivoValidos({ objetivo: "perder_gordura" })).toBe(false);
    expect(dadosObjetivoValidos({ objetivo: "ganhar_massa" })).toBe(false);
  });

  it("é válido com objetivo de perda ou ganho e ritmo selecionado", () => {
    expect(
      dadosObjetivoValidos({ objetivo: "perder_gordura", ritmo: "moderado" }),
    ).toBe(true);
    expect(
      dadosObjetivoValidos({ objetivo: "ganhar_massa", ritmo: "leve" }),
    ).toBe(true);
  });
});
