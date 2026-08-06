export type CodigoRegraSeguranca =
  | "SEG-01"
  | "SEG-02"
  | "SEG-03"
  | "SEG-04"
  | "SEG-05"
  | "SEG-06";

export interface BloqueioSeguranca {
  regra: CodigoRegraSeguranca;
  motivo: string;
}

export interface VerificacaoBloqueios {
  bloqueado: boolean;
  bloqueios: BloqueioSeguranca[];
}

export interface AjusteSeguranca {
  regra: CodigoRegraSeguranca;
  motivo: string;
  valorOriginalKcal: number;
  valorAjustadoKcal: number;
}
