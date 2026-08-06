export interface ItemPlano {
  alimento: string;
  quantidade: string;
  calorias: number;
  proteinaG: number;
  carboidratoG: number;
  gorduraG: number;
}

export interface RefeicaoPlano {
  nome: string;
  horario: string;
  itens: ItemPlano[];
  totalCalorias: number;
  totalProteinaG: number;
  totalCarboidratoG: number;
  totalGorduraG: number;
}

export interface SubstituicaoPlano {
  alimentoOriginal: string;
  alternativas: ItemPlano[];
}

export interface PlanoAlimentar {
  refeicoes: RefeicaoPlano[];
  substituicoes: SubstituicaoPlano[];
}
