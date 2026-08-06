import type { PlanoAlimentar, SubstituicaoPlano } from "@/types";

export type EstadoGeracaoPlano =
  | { status: "ocioso" }
  | { status: "carregando" }
  | { status: "sucesso"; plano: PlanoAlimentar }
  | { status: "erro"; mensagem: string };

const MENSAGEM_ERRO_PADRAO =
  "Não foi possível gerar o plano alimentar agora. Tente novamente em instantes.";
export const MENSAGEM_ERRO_CONEXAO =
  "Não foi possível conectar ao servidor. Verifique sua internet e tente novamente.";

/**
 * Traduz a resposta HTTP da rota /api/gerar-plano num estado de tela.
 * Extraída do componente para poder ser testada sem precisar renderizar
 * React (o projeto não tem jsdom/testing-library configurado — ver
 * outros arquivos *.test.ts ao lado de componentes em
 * src/components/formulario).
 */
export function estadoAPartirDaResposta(ok: boolean, corpo: unknown): EstadoGeracaoPlano {
  if (ok) {
    const plano = (corpo as { plano?: PlanoAlimentar } | null)?.plano;
    if (!plano) {
      return { status: "erro", mensagem: MENSAGEM_ERRO_PADRAO };
    }
    return { status: "sucesso", plano };
  }

  const mensagem = (corpo as { erro?: string } | null)?.erro;
  return { status: "erro", mensagem: mensagem || MENSAGEM_ERRO_PADRAO };
}

export function indexarSubstituicoesPorAlimento(
  plano: PlanoAlimentar,
): Map<string, SubstituicaoPlano> {
  return new Map(
    plano.substituicoes.map((substituicao) => [substituicao.alimentoOriginal, substituicao]),
  );
}
