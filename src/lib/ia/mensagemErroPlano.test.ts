import { describe, expect, it } from "vitest";
import { ChaveApiAusenteError, LimiteRequisicoesExcedidoError } from "./erros";
import { PlanoInvalidoError } from "./gerarPlano";
import { mensagemAmigavelParaErro } from "./mensagemErroPlano";

describe("mensagemAmigavelParaErro", () => {
  it("mapeia ChaveApiAusenteError para uma mensagem amigável, status 500", () => {
    const resposta = mensagemAmigavelParaErro(new ChaveApiAusenteError());

    expect(resposta.status).toBe(500);
    expect(resposta.mensagem).not.toMatch(/GEMINI_API_KEY|chave/i);
  });

  it("mapeia LimiteRequisicoesExcedidoError para status 429", () => {
    const resposta = mensagemAmigavelParaErro(new LimiteRequisicoesExcedidoError());

    expect(resposta.status).toBe(429);
    expect(resposta.mensagem).toMatch(/procura|tente novamente/i);
  });

  it("mapeia PlanoInvalidoError usando a mensagem pública e isolando o motivo técnico", () => {
    const erro = new PlanoInvalidoError('O total calórico ficou fora da faixa de 1900 a 2100 kcal');

    const resposta = mensagemAmigavelParaErro(erro);

    expect(resposta.status).toBe(502);
    expect(resposta.mensagem).toBe(erro.message);
    expect(resposta.mensagem).not.toContain("kcal");
    expect(resposta.logTecnico).toContain("kcal");
  });

  it("mapeia um erro desconhecido para uma mensagem genérica, sem vazar detalhes técnicos", () => {
    const resposta = mensagemAmigavelParaErro(new Error("ECONNRESET at socket.js:42"));

    expect(resposta.status).toBe(500);
    expect(resposta.mensagem).not.toContain("ECONNRESET");
    expect(resposta.logTecnico).toContain("ECONNRESET");
  });

  it("lida com um valor lançado que não é uma instância de Error", () => {
    const resposta = mensagemAmigavelParaErro("string qualquer");

    expect(resposta.status).toBe(500);
    expect(resposta.logTecnico).toBe("string qualquer");
  });
});
