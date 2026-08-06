import { beforeEach, describe, expect, it, vi } from "vitest";

const gerarPlanoMock = vi.fn();
const criarProvedorGeminiMock = vi.fn(() => ({ gerarConteudo: vi.fn() }));

vi.mock("@/lib/ia/gerarPlano", async (importOriginal) => {
  const original = await importOriginal<typeof import("@/lib/ia/gerarPlano")>();
  return { ...original, gerarPlano: gerarPlanoMock };
});

vi.mock("@/lib/ia/gemini", () => ({
  criarProvedorGemini: criarProvedorGeminiMock,
}));

const { POST } = await import("./route");
const { PlanoInvalidoError } = await import("@/lib/ia/gerarPlano");
const { ChaveApiAusenteError } = await import("@/lib/ia/erros");

const entradaValida = {
  metaCalorica: 2000,
  macros: { proteinaG: 150, gorduraG: 60, carboidratoG: 220 },
  numeroRefeicoes: 4,
};

const planoValido = {
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
  substituicoes: [],
};

function criarRequisicao(corpo: unknown) {
  return new Request("http://localhost/api/gerar-plano", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: typeof corpo === "string" ? corpo : JSON.stringify(corpo),
  });
}

describe("POST /api/gerar-plano", () => {
  beforeEach(() => {
    gerarPlanoMock.mockReset();
    criarProvedorGeminiMock.mockClear();
    vi.spyOn(console, "error").mockImplementation(() => {});
  });

  it("retorna 400 quando o corpo não é JSON válido", async () => {
    const resposta = await POST(criarRequisicao("isto não é json"));

    expect(resposta.status).toBe(400);
    expect(gerarPlanoMock).not.toHaveBeenCalled();
  });

  it("retorna 400 quando faltam campos obrigatórios", async () => {
    const resposta = await POST(criarRequisicao({ metaCalorica: 2000 }));

    expect(resposta.status).toBe(400);
    expect(gerarPlanoMock).not.toHaveBeenCalled();
  });

  it("chama gerarPlano com os dados recebidos e devolve o plano em caso de sucesso", async () => {
    gerarPlanoMock.mockResolvedValue(planoValido);

    const resposta = await POST(criarRequisicao(entradaValida));
    const corpo = await resposta.json();

    expect(resposta.status).toBe(200);
    expect(corpo.plano).toEqual(planoValido);
    expect(gerarPlanoMock).toHaveBeenCalledTimes(1);
    expect(gerarPlanoMock.mock.calls[0][1]).toEqual(entradaValida);
  });

  it("nunca chama o provedor de IA quando a entrada é inválida", async () => {
    await POST(criarRequisicao({}));

    expect(criarProvedorGeminiMock).not.toHaveBeenCalled();
  });

  it("devolve a mensagem amigável e status 502 quando gerarPlano lança PlanoInvalidoError, sem vazar o motivo técnico", async () => {
    gerarPlanoMock.mockRejectedValue(
      new PlanoInvalidoError("total calórico 2650 kcal fora da faixa de 1900 a 2100 kcal"),
    );

    const resposta = await POST(criarRequisicao(entradaValida));
    const corpo = await resposta.json();

    expect(resposta.status).toBe(502);
    expect(corpo.erro).not.toContain("2650 kcal");
    expect(corpo).not.toHaveProperty("motivoTecnico");
  });

  it("devolve mensagem amigável e status 500 quando a chave de API está ausente, sem vazar o nome da variável de ambiente", async () => {
    gerarPlanoMock.mockRejectedValue(new ChaveApiAusenteError());

    const resposta = await POST(criarRequisicao(entradaValida));
    const corpo = await resposta.json();

    expect(resposta.status).toBe(500);
    expect(corpo.erro).not.toMatch(/GEMINI_API_KEY/);
  });
});
