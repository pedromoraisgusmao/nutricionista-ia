import type { PlanoAlimentar } from "@/types";
import { montarPromptPlano, type EntradaPromptPlano } from "./prompt";
import type { ProvedorIA } from "./provedor";
import { parsearRespostaPlano, validarPlano } from "./validarPlano";

const MAX_TENTATIVAS = 3;
const ATRASO_BASE_MS = 1000;

/**
 * Mensagem voltada ao usuário final — não expõe o motivo técnico da
 * última rejeição (esse fica em `motivoTecnico`, para log/depuração).
 */
export class PlanoInvalidoError extends Error {
  readonly motivoTecnico: string;

  constructor(motivoTecnico: string) {
    super(
      "Não conseguimos gerar um plano alimentar dentro das suas metas depois de várias tentativas. Tente novamente em alguns instantes — se o problema continuar, ajuste suas preferências (restrições, alergias ou alimentos rejeitados) e gere de novo.",
    );
    this.name = "PlanoInvalidoError";
    this.motivoTecnico = motivoTecnico;
  }
}

export interface OpcoesGerarPlano {
  /** Injetável nos testes para não esperar o backoff de verdade. */
  esperar?: (ms: number) => Promise<void>;
}

const esperarPadrao = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));

/**
 * Orquestra o RF-04: monta o prompt, chama o provedor, parseia e valida
 * a resposta, e reenvia com o motivo da rejeição até 3 vezes. O atraso
 * entre tentativas cresce (1s, 2s, ...) para não somar às requisições
 * por minuto da camada gratuita e transformar uma falha de validação em
 * erro 429 do provedor.
 */
export async function gerarPlano(
  provedor: ProvedorIA,
  entrada: EntradaPromptPlano,
  opcoes: OpcoesGerarPlano = {},
): Promise<PlanoAlimentar> {
  const esperar = opcoes.esperar ?? esperarPadrao;
  let motivoTentativaAnterior: string | undefined;

  for (let tentativa = 0; tentativa < MAX_TENTATIVAS; tentativa++) {
    const prompt = montarPromptPlano(entrada, motivoTentativaAnterior);
    const respostaTexto = await provedor.gerarConteudo(prompt);

    let resultado: { valido: boolean; motivo?: string };
    let plano: PlanoAlimentar | undefined;

    try {
      plano = parsearRespostaPlano(respostaTexto);
      resultado = validarPlano(plano, entrada);
    } catch (erro) {
      resultado = {
        valido: false,
        motivo: erro instanceof Error ? erro.message : "Falha desconhecida ao interpretar a resposta.",
      };
    }

    if (resultado.valido && plano) {
      return plano;
    }

    motivoTentativaAnterior = resultado.motivo;

    const ehUltimaTentativa = tentativa === MAX_TENTATIVAS - 1;
    if (!ehUltimaTentativa) {
      await esperar(ATRASO_BASE_MS * 2 ** tentativa);
    }
  }

  throw new PlanoInvalidoError(motivoTentativaAnterior ?? "motivo não identificado");
}
