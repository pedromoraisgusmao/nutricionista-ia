export type Sexo = "masculino" | "feminino";

export type NivelAtividade =
  | "sedentario"
  | "levemente_ativo"
  | "moderadamente_ativo"
  | "muito_ativo"
  | "extremamente_ativo";

export type Objetivo = "perder_gordura" | "manter" | "ganhar_massa";

export type Ritmo = "leve" | "moderado" | "agressivo";

export interface Circunferencias {
  cinturaCm: number;
  pescocoCm: number;
  /** Obrigatório apenas para mulheres no método da Marinha dos EUA. */
  quadrilCm?: number;
}

export interface DadosCorporais {
  sexo: Sexo;
  idadeAnos: number;
  pesoKg: number;
  alturaCm: number;
  percentualGordura?: number;
  circunferencias?: Circunferencias;
}

export interface DadosSaude {
  gestanteOuAmamentando: boolean;
  condicaoSaudeRelevante: boolean;
}

export interface DadosUsuario extends DadosCorporais, DadosSaude {
  nivelAtividade: NivelAtividade;
  objetivo: Objetivo;
  ritmo: Ritmo;
}
