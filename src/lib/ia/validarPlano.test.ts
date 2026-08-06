import { describe, expect, it } from "vitest";
import type { EntradaPromptPlano } from "./prompt";
import { parsearRespostaPlano, validarPlano } from "./validarPlano";

const entradaBase: EntradaPromptPlano = {
  metaCalorica: 2000,
  macros: { proteinaG: 150, gorduraG: 60, carboidratoG: 220 },
  numeroRefeicoes: 1,
};

function planoComItem(item: {
  alimento: string;
  calorias: number;
  proteinaG: number;
}) {
  return {
    refeicoes: [
      {
        nome: "Refeição única",
        horario: "12:00",
        itens: [
          {
            alimento: item.alimento,
            quantidade: "1 porção",
            calorias: item.calorias,
            proteinaG: item.proteinaG,
            carboidratoG: 220,
            gorduraG: 60,
          },
        ],
        totalCalorias: item.calorias,
        totalProteinaG: item.proteinaG,
        totalCarboidratoG: 220,
        totalGorduraG: 60,
      },
    ],
    substituicoes: [],
  };
}

function planoComItemESubstituicao(
  item: { alimento: string; calorias: number; proteinaG: number },
  alternativa: { alimento: string; calorias: number; proteinaG: number },
) {
  const plano = planoComItem(item);
  return {
    ...plano,
    substituicoes: [
      {
        alimentoOriginal: item.alimento,
        alternativas: [
          {
            alimento: alternativa.alimento,
            quantidade: "1 porção",
            calorias: alternativa.calorias,
            proteinaG: alternativa.proteinaG,
            carboidratoG: 220,
            gorduraG: 60,
          },
        ],
      },
    ],
  };
}

describe("parsearRespostaPlano", () => {
  it("lança erro descritivo quando o texto não é JSON válido", () => {
    expect(() => parsearRespostaPlano("isto não é json")).toThrow(/JSON válido/);
  });

  it("lança erro descritivo quando falta o campo refeicoes", () => {
    expect(() => parsearRespostaPlano(JSON.stringify({ substituicoes: [] }))).toThrow(
      /refeicoes/,
    );
  });

  it("normaliza itens e substituicoes ausentes para listas vazias", () => {
    const plano = parsearRespostaPlano(
      JSON.stringify({ refeicoes: [{ nome: "Almoço", horario: "12:00" }] }),
    );

    expect(plano.refeicoes[0].itens).toEqual([]);
    expect(plano.substituicoes).toEqual([]);
  });

  it("parseia um plano bem formado corretamente", () => {
    const bruto = planoComItem({ alimento: "Arroz", calorias: 2000, proteinaG: 150 });
    const plano = parsearRespostaPlano(JSON.stringify(bruto));

    expect(plano.refeicoes).toHaveLength(1);
    expect(plano.refeicoes[0].itens[0].alimento).toBe("Arroz");
  });
});

describe("validarPlano", () => {
  it("aceita um plano dentro das margens de calorias e proteína", () => {
    const plano = planoComItem({ alimento: "Frango grelhado", calorias: 2000, proteinaG: 150 });

    const resultado = validarPlano(plano, entradaBase);

    expect(resultado.valido).toBe(true);
  });

  it("rejeita um plano sem nenhum item", () => {
    const plano = {
      refeicoes: [
        {
          nome: "Almoço",
          horario: "12:00",
          itens: [],
          totalCalorias: 0,
          totalProteinaG: 0,
          totalCarboidratoG: 0,
          totalGorduraG: 0,
        },
      ],
      substituicoes: [],
    };

    const resultado = validarPlano(plano, entradaBase);

    expect(resultado.valido).toBe(false);
    expect(resultado.motivo).toMatch(/sem nenhum item/);
  });

  it("rejeita quando o total calórico está acima de +5% e explica a faixa aceita", () => {
    const plano = planoComItem({ alimento: "Massa", calorias: 2650, proteinaG: 150 });

    const resultado = validarPlano(plano, entradaBase);

    expect(resultado.valido).toBe(false);
    expect(resultado.motivo).toContain("2650 kcal");
    expect(resultado.motivo).toContain("1900 a 2100 kcal");
    expect(resultado.motivo).toMatch(/reduza as porções/);
  });

  it("rejeita quando o total calórico está abaixo de -5% e explica a faixa aceita", () => {
    const plano = planoComItem({ alimento: "Salada", calorias: 1500, proteinaG: 150 });

    const resultado = validarPlano(plano, entradaBase);

    expect(resultado.valido).toBe(false);
    expect(resultado.motivo).toContain("1500 kcal");
    expect(resultado.motivo).toMatch(/aumente as porções/);
  });

  it("rejeita quando a proteína está fora da margem de ±10% e explica a faixa aceita", () => {
    const plano = planoComItem({ alimento: "Frango", calorias: 2000, proteinaG: 100 });

    const resultado = validarPlano(plano, entradaBase);

    expect(resultado.valido).toBe(false);
    expect(resultado.motivo).toContain("100 g");
    expect(resultado.motivo).toContain("135 a 165 g");
  });

  it('rejeita "queijo minas" quando a restrição é sem_lactose, mesmo sem a palavra "lactose" no alimento', () => {
    const plano = planoComItem({ alimento: "Queijo minas", calorias: 2000, proteinaG: 150 });

    const resultado = validarPlano(plano, { ...entradaBase, restricoes: ["sem_lactose"] });

    expect(resultado.valido).toBe(false);
    expect(resultado.motivo).toContain("Queijo minas");
  });

  it('rejeita "molho shoyu" quando a restrição é sem_gluten, mesmo sem a palavra "glúten" no alimento', () => {
    const plano = planoComItem({ alimento: "Molho shoyu", calorias: 2000, proteinaG: 150 });

    const resultado = validarPlano(plano, { ...entradaBase, restricoes: ["sem_gluten"] });

    expect(resultado.valido).toBe(false);
    expect(resultado.motivo).toContain("Molho shoyu");
  });

  it("rejeita alimento de alergia ignorando acento e maiúsculas", () => {
    const plano = planoComItem({ alimento: "Camarão ao alho", calorias: 2000, proteinaG: 150 });

    const resultado = validarPlano(plano, { ...entradaBase, alergias: "CAMARAO, amendoim" });

    expect(resultado.valido).toBe(false);
    expect(resultado.motivo).toContain("Camarão ao alho");
  });

  it("não rejeita alimentos que não têm nenhum termo proibido em comum", () => {
    const plano = planoComItem({ alimento: "Batata doce", calorias: 2000, proteinaG: 150 });

    const resultado = validarPlano(plano, {
      ...entradaBase,
      restricoes: ["vegano"],
      alergias: "amendoim",
    });

    expect(resultado.valido).toBe(true);
  });

  it('rejeita quando uma ALTERNATIVA de substituição viola a restrição, mesmo com o item original compatível (ex.: trocar frango por queijo num plano "sem lactose")', () => {
    const plano = planoComItemESubstituicao(
      { alimento: "Frango grelhado", calorias: 2000, proteinaG: 150 },
      { alimento: "Queijo minas", calorias: 2000, proteinaG: 150 },
    );

    const resultado = validarPlano(plano, { ...entradaBase, restricoes: ["sem_lactose"] });

    expect(resultado.valido).toBe(false);
    expect(resultado.motivo).toContain("Queijo minas");
    expect(resultado.motivo).toContain("Frango grelhado");
    expect(resultado.motivo).toMatch(/substitui/i);
  });

  it("rejeita quando uma alternativa de substituição viola alergia em texto livre", () => {
    const plano = planoComItemESubstituicao(
      { alimento: "Frango grelhado", calorias: 2000, proteinaG: 150 },
      { alimento: "Camarão ao alho", calorias: 2000, proteinaG: 150 },
    );

    const resultado = validarPlano(plano, { ...entradaBase, alergias: "camarão" });

    expect(resultado.valido).toBe(false);
    expect(resultado.motivo).toContain("Camarão ao alho");
  });

  it("aceita quando item e todas as alternativas de substituição são compatíveis com as restrições", () => {
    const plano = planoComItemESubstituicao(
      { alimento: "Frango grelhado", calorias: 2000, proteinaG: 150 },
      { alimento: "Tofu grelhado", calorias: 2000, proteinaG: 150 },
    );

    const resultado = validarPlano(plano, { ...entradaBase, restricoes: ["sem_lactose"] });

    expect(resultado.valido).toBe(true);
  });
});
