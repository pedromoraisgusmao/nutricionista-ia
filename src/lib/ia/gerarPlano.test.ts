import { describe, expect, it, vi } from "vitest";
import type { EntradaPromptPlano } from "./prompt";
import type { ProvedorIA } from "./provedor";
import { PlanoInvalidoError, gerarPlano } from "./gerarPlano";

const entrada: EntradaPromptPlano = {
  metaCalorica: 2000,
  macros: { proteinaG: 150, gorduraG: 60, carboidratoG: 220 },
  numeroRefeicoes: 1,
};

const respostaValida = JSON.stringify({
  refeicoes: [
    {
      nome: "Refeição única",
      horario: "12:00",
      itens: [
        {
          alimento: "Frango grelhado",
          quantidade: "1 porção",
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
  substituicoes: [],
});

function criarProvedorFalso(gerarConteudo: ProvedorIA["gerarConteudo"]): ProvedorIA {
  return { gerarConteudo };
}

function esperarFalso() {
  return vi.fn().mockResolvedValue(undefined);
}

describe("gerarPlano", () => {
  it("retorna o plano já na primeira tentativa, sem esperar", async () => {
    const gerarConteudo = vi.fn().mockResolvedValue(respostaValida);
    const esperar = esperarFalso();

    const plano = await gerarPlano(criarProvedorFalso(gerarConteudo), entrada, { esperar });

    expect(plano.refeicoes[0].itens[0].alimento).toBe("Frango grelhado");
    expect(gerarConteudo).toHaveBeenCalledTimes(1);
    expect(esperar).not.toHaveBeenCalled();
  });

  it("reenvia com o motivo da rejeição quando o JSON não parseia, e usa backoff de 1s", async () => {
    const gerarConteudo = vi
      .fn()
      .mockResolvedValueOnce("isto não é json")
      .mockResolvedValueOnce(respostaValida);
    const esperar = esperarFalso();

    const plano = await gerarPlano(criarProvedorFalso(gerarConteudo), entrada, { esperar });

    expect(plano.refeicoes[0].itens[0].alimento).toBe("Frango grelhado");
    expect(gerarConteudo).toHaveBeenCalledTimes(2);
    expect(esperar).toHaveBeenCalledTimes(1);
    expect(esperar).toHaveBeenCalledWith(1000);

    const promptDaSegundaTentativa = gerarConteudo.mock.calls[1][0] as string;
    expect(promptDaSegundaTentativa).toMatch(/tentativa anterior foi rejeitada/i);
    expect(promptDaSegundaTentativa).toMatch(/JSON válido/);
  });

  it("reenvia com o motivo específico da falha de calorias fora da faixa", async () => {
    const respostaForaDaFaixa = JSON.stringify({
      refeicoes: [
        {
          nome: "Refeição única",
          horario: "12:00",
          itens: [
            {
              alimento: "Massa",
              quantidade: "1 porção",
              calorias: 2650,
              proteinaG: 150,
              carboidratoG: 220,
              gorduraG: 60,
            },
          ],
          totalCalorias: 2650,
          totalProteinaG: 150,
          totalCarboidratoG: 220,
          totalGorduraG: 60,
        },
      ],
      substituicoes: [],
    });

    const gerarConteudo = vi
      .fn()
      .mockResolvedValueOnce(respostaForaDaFaixa)
      .mockResolvedValueOnce(respostaValida);
    const esperar = esperarFalso();

    await gerarPlano(criarProvedorFalso(gerarConteudo), entrada, { esperar });

    const promptDaSegundaTentativa = gerarConteudo.mock.calls[1][0] as string;
    expect(promptDaSegundaTentativa).toContain("2650 kcal");
    expect(promptDaSegundaTentativa).toContain("1900 a 2100 kcal");
  });

  it("usa backoff crescente (1s, depois 2s) entre as três tentativas quando todas falham", async () => {
    const gerarConteudo = vi.fn().mockResolvedValue("sempre inválido");
    const esperar = esperarFalso();

    await expect(
      gerarPlano(criarProvedorFalso(gerarConteudo), entrada, { esperar }),
    ).rejects.toThrow(PlanoInvalidoError);

    expect(gerarConteudo).toHaveBeenCalledTimes(3);
    expect(esperar).toHaveBeenCalledTimes(2);
    expect(esperar).toHaveBeenNthCalledWith(1, 1000);
    expect(esperar).toHaveBeenNthCalledWith(2, 2000);
  });

  it("depois de 3 tentativas falhas, lança erro com mensagem amigável e guarda o motivo técnico à parte", async () => {
    const gerarConteudo = vi.fn().mockResolvedValue("sempre inválido");
    const esperar = esperarFalso();

    let erroCapturado: PlanoInvalidoError | undefined;
    try {
      await gerarPlano(criarProvedorFalso(gerarConteudo), entrada, { esperar });
    } catch (erro) {
      erroCapturado = erro as PlanoInvalidoError;
    }

    expect(erroCapturado).toBeInstanceOf(PlanoInvalidoError);
    expect(erroCapturado?.message).not.toMatch(/JSON|kcal|refeicoes/);
    expect(erroCapturado?.message.toLowerCase()).toContain("não conseguimos gerar");
    expect(erroCapturado?.motivoTecnico).toMatch(/JSON válido/);
  });

  it("propaga imediatamente um erro do provedor, sem tentar de novo nem esperar", async () => {
    const erroDoProvedor = new Error("chave de API ausente");
    const gerarConteudo = vi.fn().mockRejectedValue(erroDoProvedor);
    const esperar = esperarFalso();

    await expect(
      gerarPlano(criarProvedorFalso(gerarConteudo), entrada, { esperar }),
    ).rejects.toThrow(erroDoProvedor);

    expect(gerarConteudo).toHaveBeenCalledTimes(1);
    expect(esperar).not.toHaveBeenCalled();
  });
});
