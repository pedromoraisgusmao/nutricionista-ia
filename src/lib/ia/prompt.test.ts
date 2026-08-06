import { describe, expect, it } from "vitest";
import { montarPromptPlano } from "./prompt";

const entradaBase = {
  metaCalorica: 2000,
  macros: { proteinaG: 150, gorduraG: 60, carboidratoG: 220 },
  numeroRefeicoes: 4,
};

describe("montarPromptPlano", () => {
  it("inclui a meta calórica e os macros como valores explícitos", () => {
    const prompt = montarPromptPlano(entradaBase);

    expect(prompt).toContain("2000 kcal");
    expect(prompt).toContain("150 g");
    expect(prompt).toContain("60 g");
    expect(prompt).toContain("220 g");
    expect(prompt).toContain("4");
  });

  it("instrui explicitamente o retorno em JSON, com esquema e exemplo, no texto do prompt", () => {
    const prompt = montarPromptPlano(entradaBase);

    expect(prompt).toMatch(/SOMENTE com um objeto JSON/i);
    expect(prompt).toContain('"refeicoes"');
    expect(prompt).toContain('"substituicoes"');
    expect(prompt).toContain("Exemplo de formato");
  });

  it("instrui o modelo a somar e conferir os totais antes de responder", () => {
    const prompt = montarPromptPlano(entradaBase);

    expect(prompt).toMatch(/some as calorias e os macros/i);
    expect(prompt).toMatch(/compare o total do dia com as metas/i);
  });

  it("nunca menciona gestação ou condição de saúde — esses casos são barrados antes de chegar aqui", () => {
    const prompt = montarPromptPlano(entradaBase);

    expect(prompt.toLowerCase()).not.toContain("gesta");
    expect(prompt.toLowerCase()).not.toContain("amamenta");
    expect(prompt.toLowerCase()).not.toContain("condição de saúde");
    expect(prompt.toLowerCase()).not.toContain("diabetes");
  });

  it("usa valores padrão amigáveis quando restrições e preferências não são informadas", () => {
    const prompt = montarPromptPlano(entradaBase);

    expect(prompt).toContain("nenhuma restrição informada");
    expect(prompt).toContain("nenhuma informada");
    expect(prompt).toContain("nenhum informado");
    expect(prompt).toContain("sem preferência informada");
  });

  it("inclui restrições, alergias e preferências quando informadas", () => {
    const prompt = montarPromptPlano({
      ...entradaBase,
      restricoes: ["vegano", "sem_gluten"],
      alergias: "amendoim, camarão",
      alimentosPreferidos: "frango, aveia",
      alimentosRejeitados: "brócolis",
      orcamento: "economico",
      disponibilidadeCozinhar: "faz_marmita_semanal",
    });

    expect(prompt).toContain("vegano");
    expect(prompt).toContain("sem glúten");
    expect(prompt).toContain("amendoim, camarão");
    expect(prompt).toContain("frango, aveia");
    expect(prompt).toContain("brócolis");
    expect(prompt).toMatch(/econômico/);
    expect(prompt).toMatch(/marmita semanal/);
  });

  it("acrescenta a explicação do erro da tentativa anterior quando fornecida", () => {
    const prompt = montarPromptPlano(
      entradaBase,
      "o total calórico ficou 15% acima da meta",
    );

    expect(prompt).toMatch(/tentativa anterior foi rejeitada/i);
    expect(prompt).toContain("o total calórico ficou 15% acima da meta");
  });

  it("não menciona tentativa anterior quando nenhum erro é passado", () => {
    const prompt = montarPromptPlano(entradaBase);

    expect(prompt).not.toMatch(/tentativa anterior foi rejeitada/i);
  });
});
