import type { PlanoAlimentar } from "@/types";
import type { EntradaPromptPlano } from "./prompt";
import { PALAVRAS_PROIBIDAS_POR_RESTRICAO, normalizarTexto } from "./palavrasProibidas";

export interface ResultadoValidacaoPlano {
  valido: boolean;
  motivo?: string;
}

const MARGEM_CALORIAS = 0.05;
const MARGEM_PROTEINA = 0.1;

/**
 * Interpreta o texto cru devolvido pelo provedor de IA. Cobre a checagem
 * 1 do RF-04 ("o JSON parseia corretamente") e uma verificação mínima de
 * formato — sem isso, um JSON tecnicamente válido mas fora do esquema
 * (ex.: `{}`) quebraria o cálculo dos totais mais abaixo em vez de virar
 * um motivo de rejeição claro para a próxima tentativa.
 */
export function parsearRespostaPlano(texto: string): PlanoAlimentar {
  let dados: unknown;
  try {
    dados = JSON.parse(texto);
  } catch {
    throw new Error(
      "A resposta não é um JSON válido — retorne apenas o objeto JSON pedido, sem texto ao redor e sem blocos de código.",
    );
  }

  const bruto = dados as Partial<PlanoAlimentar> | null;
  if (!bruto || !Array.isArray(bruto.refeicoes)) {
    throw new Error(
      'O JSON retornado não tem o campo "refeicoes" como uma lista, conforme o esquema pedido.',
    );
  }

  return {
    refeicoes: bruto.refeicoes.map((refeicao) => ({
      ...refeicao,
      itens: Array.isArray(refeicao?.itens) ? refeicao.itens : [],
    })),
    substituicoes: (Array.isArray(bruto.substituicoes) ? bruto.substituicoes : []).map(
      (substituicao) => ({
        ...substituicao,
        alternativas: Array.isArray(substituicao?.alternativas) ? substituicao.alternativas : [],
      }),
    ),
  };
}

function somarCampo(plano: PlanoAlimentar, campo: "calorias" | "proteinaG"): number {
  return plano.refeicoes
    .flatMap((refeicao) => refeicao.itens)
    .reduce((soma, item) => soma + (Number(item?.[campo]) || 0), 0);
}

interface AlimentoParaChecar {
  alimento: string;
  origem: string;
}

/**
 * Reúne tanto os itens do plano quanto as alternativas de substituição
 * (RF-05) — uma alternativa que viole a restrição falha no mesmo
 * objetivo que um item do plano violando (ex.: sugerir queijo como
 * substituição num plano "sem lactose").
 */
function coletarAlimentosParaChecar(plano: PlanoAlimentar): AlimentoParaChecar[] {
  const doPlano = plano.refeicoes.flatMap((refeicao) =>
    refeicao.itens.map((item) => ({
      alimento: item?.alimento ?? "",
      origem: "item do plano",
    })),
  );

  const dasSubstituicoes = plano.substituicoes.flatMap((substituicao) =>
    substituicao.alternativas.map((alternativa) => ({
      alimento: alternativa?.alimento ?? "",
      origem: `substituição sugerida para "${substituicao.alimentoOriginal}"`,
    })),
  );

  return [...doPlano, ...dasSubstituicoes];
}

/**
 * Checagem determinística e imperfeita de propósito: compara o nome do
 * alimento (de itens do plano e de alternativas de substituição) contra
 * listas de termos por restrição (palavrasProibidas.ts) e contra os
 * termos soltos do campo de alergias, ignorando acento e caixa. Pega
 * "queijo minas" (restrição sem_lactose) e "molho shoyu" (sem_gluten)
 * porque "queijo" e "shoyu" estão nas listas — não pega um termo fora da
 * lista. Ver limitação registrada no PRD, seção 9.
 */
function encontrarAlimentoProibido(
  plano: PlanoAlimentar,
  entrada: EntradaPromptPlano,
): { alimento: string; termo: string; origem: string } | null {
  const termosDeRestricoes = (entrada.restricoes ?? []).flatMap(
    (restricao) => PALAVRAS_PROIBIDAS_POR_RESTRICAO[restricao],
  );
  const termosDeAlergias = (entrada.alergias ?? "")
    .split(/[,;]| e /i)
    .map((termo) => termo.trim())
    .filter(Boolean);

  const termosProibidos = [...termosDeRestricoes, ...termosDeAlergias].map(normalizarTexto);
  if (termosProibidos.length === 0) return null;

  for (const candidato of coletarAlimentosParaChecar(plano)) {
    const alimentoNormalizado = normalizarTexto(candidato.alimento);
    const termoEncontrado = termosProibidos.find(
      (termo) => termo.length > 0 && alimentoNormalizado.includes(termo),
    );
    if (termoEncontrado) {
      return { alimento: candidato.alimento, termo: termoEncontrado, origem: candidato.origem };
    }
  }

  return null;
}

export function validarPlano(
  plano: PlanoAlimentar,
  entrada: EntradaPromptPlano,
): ResultadoValidacaoPlano {
  const totalItens = plano.refeicoes.reduce((soma, refeicao) => soma + refeicao.itens.length, 0);
  if (totalItens === 0) {
    return {
      valido: false,
      motivo:
        'O plano veio sem nenhum item de alimento em "refeicoes[].itens" — inclua ao menos uma refeição com itens.',
    };
  }

  const totalCalorias = somarCampo(plano, "calorias");
  const minCalorias = entrada.metaCalorica * (1 - MARGEM_CALORIAS);
  const maxCalorias = entrada.metaCalorica * (1 + MARGEM_CALORIAS);
  if (totalCalorias < minCalorias || totalCalorias > maxCalorias) {
    const ajuste = totalCalorias > maxCalorias ? "reduza as porções" : "aumente as porções";
    return {
      valido: false,
      motivo: `O total calórico do plano foi ${totalCalorias.toFixed(0)} kcal, fora da faixa de ${minCalorias.toFixed(0)} a ${maxCalorias.toFixed(0)} kcal (±5% da meta de ${entrada.metaCalorica} kcal) — ${ajuste} para caber na faixa.`,
    };
  }

  const totalProteina = somarCampo(plano, "proteinaG");
  const metaProteina = entrada.macros.proteinaG;
  const minProteina = metaProteina * (1 - MARGEM_PROTEINA);
  const maxProteina = metaProteina * (1 + MARGEM_PROTEINA);
  if (totalProteina < minProteina || totalProteina > maxProteina) {
    const ajuste =
      totalProteina > maxProteina
        ? "reduza os itens ricos em proteína"
        : "aumente os itens ricos em proteína";
    return {
      valido: false,
      motivo: `A proteína total do plano foi ${totalProteina.toFixed(0)} g, fora da faixa de ${minProteina.toFixed(0)} a ${maxProteina.toFixed(0)} g (±10% da meta de ${metaProteina} g) — ${ajuste} para caber na faixa.`,
    };
  }

  const alimentoProibido = encontrarAlimentoProibido(plano, entrada);
  if (alimentoProibido) {
    return {
      valido: false,
      motivo: `O alimento "${alimentoProibido.alimento}" (${alimentoProibido.origem}) parece conter "${alimentoProibido.termo}", que está nas restrições ou alergias informadas — troque por uma alternativa compatível em todo o plano, inclusive nas substituições.`,
    };
  }

  return { valido: true };
}
