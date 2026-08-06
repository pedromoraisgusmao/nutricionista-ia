import { afterEach, describe, expect, it, vi } from "vitest";
import { ChaveApiAusenteError, LimiteRequisicoesExcedidoError } from "./erros";
import { criarProvedorGemini } from "./gemini";

describe("criarProvedorGemini", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("lança ChaveApiAusenteError quando não há chave de API, sem chamar a rede", async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);

    const provedor = criarProvedorGemini(undefined);

    await expect(provedor.gerarConteudo("prompt")).rejects.toThrow(ChaveApiAusenteError);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("lança LimiteRequisicoesExcedidoError quando a API retorna 429", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: false,
        status: 429,
        text: async () => "limite excedido",
      }),
    );

    const provedor = criarProvedorGemini("chave-de-teste");

    await expect(provedor.gerarConteudo("prompt")).rejects.toThrow(
      LimiteRequisicoesExcedidoError,
    );
  });

  it("lança um erro genérico quando a API retorna outro status de falha", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: false,
        status: 500,
        text: async () => "erro interno do servidor",
      }),
    );

    const provedor = criarProvedorGemini("chave-de-teste");

    await expect(provedor.gerarConteudo("prompt")).rejects.toThrow(/status 500/);
  });

  it("lança erro quando a resposta não contém texto no formato esperado", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => ({ candidates: [] }),
      }),
    );

    const provedor = criarProvedorGemini("chave-de-teste");

    await expect(provedor.gerarConteudo("prompt")).rejects.toThrow();
  });

  it("retorna o texto da resposta quando a chamada é bem-sucedida", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => ({
          candidates: [{ content: { parts: [{ text: '{"ok":true}' }] } }],
        }),
      }),
    );

    const provedor = criarProvedorGemini("chave-de-teste");
    const resultado = await provedor.gerarConteudo("prompt");

    expect(resultado).toBe('{"ok":true}');
  });

  it("envia o modelo, a chave de API e o prompt na requisição", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({
        candidates: [{ content: { parts: [{ text: "{}" }] } }],
      }),
    });
    vi.stubGlobal("fetch", fetchMock);

    const provedor = criarProvedorGemini("minha-chave");
    await provedor.gerarConteudo("meu prompt");

    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [url, opcoes] = fetchMock.mock.calls[0];

    expect(url).toContain("gemini-3.6-flash");
    expect(opcoes.headers["x-goog-api-key"]).toBe("minha-chave");

    const corpo = JSON.parse(opcoes.body);
    expect(corpo.contents[0].parts[0].text).toBe("meu prompt");
    expect(corpo.generationConfig.responseMimeType).toBe("application/json");
  });
});
