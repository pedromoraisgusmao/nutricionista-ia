import { describe, expect, it } from "vitest";
import type { DadosFormulario } from "@/types";
import { dadosSaudeValidos } from "./EtapaSaude";

describe("dadosSaudeValidos", () => {
  it("é inválido para homens sem resposta sobre condição de saúde", () => {
    expect(dadosSaudeValidos({ sexo: "masculino" })).toBe(false);
  });

  it("é válido para homens só com a condição de saúde respondida (sem perguntar gestação)", () => {
    const dados: DadosFormulario = {
      sexo: "masculino",
      condicaoSaudeRelevante: false,
    };
    expect(dadosSaudeValidos(dados)).toBe(true);
  });

  it("é inválido para mulheres sem resposta sobre gestação/amamentação", () => {
    const dados: DadosFormulario = {
      sexo: "feminino",
      condicaoSaudeRelevante: false,
    };
    expect(dadosSaudeValidos(dados)).toBe(false);
  });

  it("é válido para mulheres com as duas perguntas respondidas", () => {
    const dados: DadosFormulario = {
      sexo: "feminino",
      gestanteOuAmamentando: false,
      condicaoSaudeRelevante: false,
    };
    expect(dadosSaudeValidos(dados)).toBe(true);
  });

  it("trata 'false' explícito como resposta válida (não confundir com não respondido)", () => {
    const dados: DadosFormulario = {
      sexo: "feminino",
      gestanteOuAmamentando: false,
      condicaoSaudeRelevante: false,
    };
    expect(dadosSaudeValidos(dados)).toBe(true);
  });
});
