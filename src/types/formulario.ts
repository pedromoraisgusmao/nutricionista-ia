import type { Objetivo, Ritmo, Sexo } from "./usuario";
import type { DisponibilidadeCozinhar, NivelOrcamento, RestricaoAlimentar } from "./preferencias";

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
  objetivo?: Objetivo;
  ritmo?: Ritmo;
  gestanteOuAmamentando?: boolean;
  condicaoSaudeRelevante?: boolean;
  refeicoesPorDia?: number;
  restricoesAlimentares?: RestricaoAlimentar[];
  alergias?: string;
  alimentosPreferidos?: string;
  alimentosRejeitados?: string;
  orcamento?: NivelOrcamento;
  disponibilidadeCozinhar?: DisponibilidadeCozinhar;
}
