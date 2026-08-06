import { describe, expect, it } from "vitest";
import type { DadosFormulario } from "@/types";
import type { ResultadoCalculo } from "./calcularResultado";
import { montarEntradaPromptPlano } from "./montarEntradaPromptPlano";

const resultado: ResultadoCalculo = {
  tmb: { valorKcal: 1700, formulaUsada: "mifflin-st-jeor" },
  get: { valorKcal: 2295, fatorAtividade: 1.55 },
  metaBruta: { valorKcal: 1836, percentualAjuste: -0.2 },
  ajustePiso: null,
  ajusteRitmo: null,
  metaFinalKcal: 1836,
  macros: { proteinaG: 140, gorduraG: 51, carboidratoG: 190 },
  hidratacaoDiaDeTreino: { mlPorDia: 3300 },
  hidratacaoDiaDeDescanso: { mlPorDia: 2800 },
  imc: { valor: 24.5, classificacao: "peso_normal" },
};

describe("montarEntradaPromptPlano", () => {
  it("usa a meta calórica e os macros já calculados, sem recalcular nada", () => {
    const entrada = montarEntradaPromptPlano({}, resultado);

    expect(entrada.metaCalorica).toBe(resultado.metaFinalKcal);
    expect(entrada.macros).toEqual(resultado.macros);
  });

  it("usa o número de refeições informado no formulário quando presente", () => {
    const dados: DadosFormulario = { refeicoesPorDia: 5 };

    const entrada = montarEntradaPromptPlano(dados, resultado);

    expect(entrada.numeroRefeicoes).toBe(5);
  });

  it("usa um padrão de 4 refeições quando o formulário não informa", () => {
    const entrada = montarEntradaPromptPlano({}, resultado);

    expect(entrada.numeroRefeicoes).toBe(4);
  });

  it("repassa restrições, alergias e preferências do formulário", () => {
    const dados: DadosFormulario = {
      restricoesAlimentares: ["sem_lactose"],
      alergias: "camarão",
      alimentosPreferidos: "frango",
      alimentosRejeitados: "brócolis",
      orcamento: "economico",
      disponibilidadeCozinhar: "faz_marmita_semanal",
    };

    const entrada = montarEntradaPromptPlano(dados, resultado);

    expect(entrada.restricoes).toEqual(["sem_lactose"]);
    expect(entrada.alergias).toBe("camarão");
    expect(entrada.alimentosPreferidos).toBe("frango");
    expect(entrada.alimentosRejeitados).toBe("brócolis");
    expect(entrada.orcamento).toBe("economico");
    expect(entrada.disponibilidadeCozinhar).toBe("faz_marmita_semanal");
  });

  it("não inclui gestação nem condição de saúde no resultado", () => {
    const dados: DadosFormulario = {
      gestanteOuAmamentando: true,
      condicaoSaudeRelevante: true,
    };

    const entrada = montarEntradaPromptPlano(dados, resultado);

    expect(entrada).not.toHaveProperty("gestanteOuAmamentando");
    expect(entrada).not.toHaveProperty("condicaoSaudeRelevante");
  });
});
