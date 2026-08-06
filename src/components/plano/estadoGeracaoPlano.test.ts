import { describe, expect, it } from "vitest";
import type { PlanoAlimentar } from "@/types";
import { estadoAPartirDaResposta, indexarSubstituicoesPorAlimento } from "./estadoGeracaoPlano";

const planoValido: PlanoAlimentar = {
  refeicoes: [
    {
      nome: "Almoço",
      horario: "12:00",
      itens: [
        {
          alimento: "Frango grelhado",
          quantidade: "200 g",
          calorias: 2000,
          proteinaG: 150,
          carboidratoG: 220,
          gorduraG: 60,
        },
      ],
      totalCalorias: 2000,
      totalProteinaG: 150,
      totalCarboidratoG: 220,
      totalGorduraG: 60,
    },
  ],
  substituicoes: [
    {
      alimentoOriginal: "Frango grelhado",
      alternativas: [
        {
          alimento: "Tofu grelhado",
          quantidade: "200 g",
          calorias: 2000,
          proteinaG: 150,
          carboidratoG: 220,
          gorduraG: 60,
        },
      ],
    },
  ],
};

describe("estadoAPartirDaResposta", () => {
  it("retorna sucesso com o plano quando a resposta é ok e contém um plano", () => {
    const estado = estadoAPartirDaResposta(true, { plano: planoValido });

    expect(estado).toEqual({ status: "sucesso", plano: planoValido });
  });

  it("retorna erro genérico quando a resposta é ok mas não contém plano", () => {
    const estado = estadoAPartirDaResposta(true, {});

    expect(estado.status).toBe("erro");
  });

  it("retorna erro usando a mensagem do servidor quando a resposta não é ok", () => {
    const estado = estadoAPartirDaResposta(false, {
      erro: "O serviço está com muita procura agora.",
    });

    expect(estado).toEqual({
      status: "erro",
      mensagem: "O serviço está com muita procura agora.",
    });
  });

  it("usa uma mensagem padrão quando a resposta de erro não vem com o campo esperado", () => {
    const estado = estadoAPartirDaResposta(false, null);

    expect(estado.status).toBe("erro");
    if (estado.status === "erro") {
      expect(estado.mensagem.length).toBeGreaterThan(0);
    }
  });
});

describe("indexarSubstituicoesPorAlimento", () => {
  it("indexa as substituições pelo nome do alimento original", () => {
    const indice = indexarSubstituicoesPorAlimento(planoValido);

    expect(indice.get("Frango grelhado")?.alternativas[0].alimento).toBe("Tofu grelhado");
    expect(indice.get("Alimento inexistente")).toBeUndefined();
  });

  it("retorna um índice vazio quando não há substituições", () => {
    const indice = indexarSubstituicoesPorAlimento({ refeicoes: [], substituicoes: [] });

    expect(indice.size).toBe(0);
  });
});
