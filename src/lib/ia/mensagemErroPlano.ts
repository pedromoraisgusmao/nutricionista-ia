import { ChaveApiAusenteError, LimiteRequisicoesExcedidoError } from "./erros";
import { PlanoInvalidoError } from "./gerarPlano";

export interface RespostaErroPlano {
  mensagem: string;
  status: number;
  logTecnico: string;
}

const MENSAGEM_INDISPONIVEL =
  "O serviço de geração de plano está indisponível no momento. Tente novamente mais tarde.";
const MENSAGEM_LIMITE_EXCEDIDO =
  "O serviço está com muita procura agora. Aguarde alguns minutos e tente novamente.";
const MENSAGEM_FALHA_GENERICA =
  "Não foi possível gerar o plano alimentar agora. Tente novamente em instantes.";

/**
 * Traduz qualquer erro do pipeline de geração (provedor, parsing,
 * validação) para algo seguro de devolver ao navegador. `logTecnico`
 * — incluindo o `motivoTecnico` de um PlanoInvalidoError — é só para o
 * log do servidor; a rota nunca deve colocar esse campo no corpo da
 * resposta HTTP.
 */
export function mensagemAmigavelParaErro(erro: unknown): RespostaErroPlano {
  if (erro instanceof ChaveApiAusenteError) {
    return { mensagem: MENSAGEM_INDISPONIVEL, status: 500, logTecnico: erro.message };
  }

  if (erro instanceof LimiteRequisicoesExcedidoError) {
    return { mensagem: MENSAGEM_LIMITE_EXCEDIDO, status: 429, logTecnico: erro.message };
  }

  if (erro instanceof PlanoInvalidoError) {
    return { mensagem: erro.message, status: 502, logTecnico: erro.motivoTecnico };
  }

  return {
    mensagem: MENSAGEM_FALHA_GENERICA,
    status: 500,
    logTecnico: erro instanceof Error ? (erro.stack ?? erro.message) : String(erro),
  };
}
