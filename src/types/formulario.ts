import type { Sexo } from "./usuario";

export interface DadosFormulario {
  sexo?: Sexo;
  idadeAnos?: number;
  pesoKg?: number;
  alturaCm?: number;
  percentualGordura?: number;
  cinturaCm?: number;
  pescocoCm?: number;
  quadrilCm?: number;
  diasTreinoSemana?: number;
  duracaoSessaoMinutos?: number;
}
