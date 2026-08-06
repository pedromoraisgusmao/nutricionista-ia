import type { RestricaoAlimentar } from "@/types";

/**
 * Lista não exaustiva de palavras-chave por restrição, usada para
 * rejeitar planos que incluam alimentos incompatíveis (RF-04, item 4).
 * Não substitui uma base de dados de alimentos (fora do escopo desta
 * versão — ver PRD, seção 8) — é uma rede de segurança de texto.
 */
export const PALAVRAS_PROIBIDAS_POR_RESTRICAO: Record<RestricaoAlimentar, string[]> = {
  vegetariano: [
    "carne",
    "frango",
    "peixe",
    "bacon",
    "presunto",
    "salsicha",
    "linguica",
    "camarao",
    "atum",
    "boi",
    "porco",
    "peru",
    "gelatina",
  ],
  vegano: [
    "carne",
    "frango",
    "peixe",
    "bacon",
    "presunto",
    "salsicha",
    "linguica",
    "camarao",
    "atum",
    "boi",
    "porco",
    "peru",
    "gelatina",
    "leite",
    "queijo",
    "iogurte",
    "manteiga",
    "requeijao",
    "ovo",
    "mel",
    "whey",
  ],
  sem_lactose: ["leite", "queijo", "iogurte", "manteiga", "requeijao", "creme de leite", "whey"],
  sem_gluten: [
    "trigo",
    "pao",
    "macarrao",
    "cevada",
    "aveia",
    "centeio",
    "bolacha",
    "biscoito",
    "cerveja",
    "farinha de trigo",
    "shoyu",
    "molho ingles",
    "malte",
  ],
  outro: [],
};

/**
 * Checagem por termo é imperfeita de propósito (ver comentário em
 * validarPlano.ts): "queijo minas" é pego porque a lista tem "queijo",
 * mas um alimento composto com um termo fora da lista (ex.: uma marca
 * regional de embutido) passa batido. Resolver isso de verdade exigiria
 * uma base de alimentos (TACO/TBCA), fora do escopo desta versão — ver
 * PRD, seção 9 (riscos).
 */
export function normalizarTexto(texto: string): string {
  return texto
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .trim();
}
