import { ChaveApiAusenteError, LimiteRequisicoesExcedidoError } from "./erros";
import type { ProvedorIA } from "./provedor";

/**
 * Modelo estável mais recente da família Flash (confirmado em
 * https://ai.google.dev/gemini-api/docs/models em 2026-08-06). Vive na
 * camada gratuita do Google AI Studio — ver PRD, seção 3.
 */
const MODELO_GEMINI = "gemini-3.6-flash";
const URL_GERAR_CONTEUDO = `https://generativelanguage.googleapis.com/v1beta/models/${MODELO_GEMINI}:generateContent`;

/**
 * Baixa de propósito: o plano alimentar precisa aderir às restrições
 * numéricas do prompt, não ser criativo. O JSON explícito no prompt (ver
 * src/lib/ia/prompt.ts) é o que garante o formato de saída entre
 * provedores — isto aqui é só um ajuste fino específico do Gemini.
 */
const TEMPERATURA_BAIXA = 0.2;

export function criarProvedorGemini(chaveApi = process.env.GEMINI_API_KEY): ProvedorIA {
  return {
    async gerarConteudo(prompt: string): Promise<string> {
      if (!chaveApi) {
        throw new ChaveApiAusenteError();
      }

      const resposta = await fetch(URL_GERAR_CONTEUDO, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-goog-api-key": chaveApi,
        },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            responseMimeType: "application/json",
            temperature: TEMPERATURA_BAIXA,
          },
        }),
      });

      if (resposta.status === 429) {
        throw new LimiteRequisicoesExcedidoError();
      }

      if (!resposta.ok) {
        const corpoErro = await resposta.text();
        throw new Error(`Erro na API do Gemini (status ${resposta.status}): ${corpoErro}`);
      }

      const dados = await resposta.json();
      const texto = dados?.candidates?.[0]?.content?.parts?.[0]?.text;

      if (typeof texto !== "string") {
        throw new Error("Resposta do Gemini não contém texto em candidates[0].content.parts[0].text.");
      }

      return texto;
    },
  };
}
