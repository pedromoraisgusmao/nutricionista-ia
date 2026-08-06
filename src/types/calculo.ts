export type FormulaTMB = "mifflin-st-jeor" | "katch-mcardle";

export interface ResultadoTMB {
  valorKcal: number;
  formulaUsada: FormulaTMB;
}

export interface ResultadoGET {
  valorKcal: number;
  fatorAtividade: number;
}

export interface MetaCalorica {
  valorKcal: number;
  percentualAjuste: number;
}

export interface Macros {
  proteinaG: number;
  gorduraG: number;
  carboidratoG: number;
}

export type ClassificacaoIMC =
  | "abaixo_do_peso"
  | "peso_normal"
  | "sobrepeso"
  | "obesidade";

export interface ResultadoIMC {
  valor: number;
  classificacao: ClassificacaoIMC;
}

export interface Hidratacao {
  mlPorDia: number;
}
