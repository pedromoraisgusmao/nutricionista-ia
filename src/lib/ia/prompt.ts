import type {
  DisponibilidadeCozinhar,
  Macros,
  NivelOrcamento,
  RestricaoAlimentar,
} from "@/types";

export interface EntradaPromptPlano {
  metaCalorica: number;
  macros: Macros;
  numeroRefeicoes: number;
  restricoes?: RestricaoAlimentar[];
  alergias?: string;
  alimentosPreferidos?: string;
  alimentosRejeitados?: string;
  orcamento?: NivelOrcamento;
  disponibilidadeCozinhar?: DisponibilidadeCozinhar;
}

const ROTULO_RESTRICAO: Record<RestricaoAlimentar, string> = {
  vegetariano: "vegetariano",
  vegano: "vegano",
  sem_lactose: "sem lactose",
  sem_gluten: "sem glúten",
  outro: "outra restrição não detalhada (siga também o campo de alergias)",
};

const ROTULO_ORCAMENTO: Record<NivelOrcamento, string> = {
  economico: "econômico — priorize alimentos baratos e de fácil acesso",
  medio: "médio",
  sem_restricao: "sem restrição de orçamento",
};

const ROTULO_DISPONIBILIDADE: Record<DisponibilidadeCozinhar, string> = {
  cozinha_diariamente: "cozinha diariamente — pode sugerir preparo no mesmo dia",
  faz_marmita_semanal: "faz marmita semanal — prefira receitas que rendem bem e aguentam refrigeração",
  depende_comida_pronta: "depende de comida pronta — prefira itens prontos ou de preparo mínimo",
};

function formatarLista(itens: string[] | undefined, vazio: string): string {
  if (!itens || itens.length === 0) return vazio;
  return itens.join(", ");
}

/**
 * Monta o prompt do RF-04. Propositalmente NÃO recebe gestação nem
 * condição de saúde: quem tem esses casos é barrado antes por
 * verificarBloqueios, então esses dados nunca chegam a este módulo (ver
 * PRD, seção 3, sobre não enviar dado de saúde de terceiros ao provedor
 * gratuito).
 *
 * O esquema JSON e o exemplo estão escritos no texto do prompt, não só
 * configurados via recurso de provedor (ex.: responseMimeType do Gemini)
 * — assim o prompt continua funcionando sozinho se o provedor mudar.
 */
export function montarPromptPlano(
  entrada: EntradaPromptPlano,
  erroTentativaAnterior?: string,
): string {
  const { metaCalorica, macros, numeroRefeicoes } = entrada;

  const restricoesTexto = formatarLista(
    entrada.restricoes?.map((r) => ROTULO_RESTRICAO[r]),
    "nenhuma restrição informada",
  );
  const orcamentoTexto = entrada.orcamento
    ? ROTULO_ORCAMENTO[entrada.orcamento]
    : "sem preferência informada";
  const disponibilidadeTexto = entrada.disponibilidadeCozinhar
    ? ROTULO_DISPONIBILIDADE[entrada.disponibilidadeCozinhar]
    : "sem preferência informada";

  const avisoCorrecao = erroTentativaAnterior
    ? `\n## Atenção: a tentativa anterior foi rejeitada\nO motivo da rejeição foi: ${erroTentativaAnterior}\nCorrija exatamente isso nesta nova resposta, mantendo todas as outras instruções abaixo.\n`
    : "";

  return `Você monta planos alimentares diários para uma pessoa no Brasil, dentro de metas nutricionais que já foram calculadas por outro sistema. Você NÃO decide as metas — só distribui alimentos dentro delas.
${avisoCorrecao}
## Metas nutricionais do dia (restrição rígida — a soma dos itens tem que bater com isto)
- Calorias totais: ${metaCalorica} kcal
- Proteína total: ${macros.proteinaG} g
- Gordura total: ${macros.gorduraG} g
- Carboidrato total: ${macros.carboidratoG} g
- Número de refeições: ${numeroRefeicoes}

## Restrições e preferências
- Restrições alimentares: ${restricoesTexto}
- Alergias e intolerâncias (nunca inclua): ${entrada.alergias || "nenhuma informada"}
- Alimentos preferidos (priorize quando possível): ${entrada.alimentosPreferidos || "nenhum informado"}
- Alimentos rejeitados (nunca inclua): ${entrada.alimentosRejeitados || "nenhum informado"}
- Nível de orçamento: ${orcamentoTexto}
- Disponibilidade para cozinhar: ${disponibilidadeTexto}

## Instruções de conteúdo
- Use alimentos comuns e fáceis de encontrar no Brasil, com nomes em português.
- Quantidades em gramas ou em medida caseira usual (ex.: "1 fatia", "1 xícara"), sempre acompanhadas do peso em gramas entre parênteses.
- Nunca inclua um alimento presente nas restrições, nas alergias ou nos alimentos rejeitados listados acima.
- Para cada item de cada refeição, gere de 2 a 3 substituições com calorias e macros aproximados ao item original.
- As substituições precisam respeitar as MESMAS restrições, alergias e alimentos rejeitados do item original — nunca sugira uma alternativa que viole alguma delas (ex.: não sugira queijo como alternativa em um plano "sem lactose").

## Confira antes de responder (não mostre esta conferência na resposta)
1. Some as calorias e os macros de todos os itens de cada refeição — esse é o total da refeição.
2. Some os totais de todas as refeições — esse é o total do dia.
3. Compare o total do dia com as metas do topo deste prompt. Se não baterem (fora de uma margem pequena de arredondamento), ajuste as quantidades dos alimentos e refaça a soma antes de responder. Não responda com totais que você não conferiu.

## Formato da resposta
Responda SOMENTE com um objeto JSON válido — sem texto antes, sem texto depois, sem markdown, sem blocos de código com \`\`\`. O JSON deve seguir exatamente este esquema:

{
  "refeicoes": [
    {
      "nome": "string",
      "horario": "string no formato HH:MM",
      "itens": [
        { "alimento": "string", "quantidade": "string, ex.: 150 g ou 1 xícara (150 g)", "calorias": number, "proteinaG": number, "carboidratoG": number, "gorduraG": number }
      ],
      "totalCalorias": number,
      "totalProteinaG": number,
      "totalCarboidratoG": number,
      "totalGorduraG": number
    }
  ],
  "substituicoes": [
    {
      "alimentoOriginal": "string, igual ao campo alimento de algum item do plano",
      "alternativas": [
        { "alimento": "string", "quantidade": "string", "calorias": number, "proteinaG": number, "carboidratoG": number, "gorduraG": number }
      ]
    }
  ]
}

Exemplo de formato (não copie estes valores, são só para ilustrar a estrutura):

{
  "refeicoes": [
    {
      "nome": "Café da manhã",
      "horario": "07:30",
      "itens": [
        { "alimento": "Pão francês", "quantidade": "1 unidade (50 g)", "calorias": 150, "proteinaG": 5, "carboidratoG": 28, "gorduraG": 1.5 },
        { "alimento": "Ovo cozido", "quantidade": "2 unidades (100 g)", "calorias": 155, "proteinaG": 13, "carboidratoG": 1.1, "gorduraG": 11 }
      ],
      "totalCalorias": 305,
      "totalProteinaG": 18,
      "totalCarboidratoG": 29.1,
      "totalGorduraG": 12.5
    }
  ],
  "substituicoes": [
    {
      "alimentoOriginal": "Pão francês",
      "alternativas": [
        { "alimento": "Tapioca", "quantidade": "2 colheres de sopa de goma (60 g)", "calorias": 150, "proteinaG": 0.5, "carboidratoG": 36, "gorduraG": 0 }
      ]
    }
  ]
}`;
}
