export class ChaveApiAusenteError extends Error {
  constructor() {
    super("Chave de API do provedor de IA não configurada.");
    this.name = "ChaveApiAusenteError";
  }
}

export class LimiteRequisicoesExcedidoError extends Error {
  constructor() {
    super("Limite de requisições à API de IA foi excedido. Tente novamente em instantes.");
    this.name = "LimiteRequisicoesExcedidoError";
  }
}
