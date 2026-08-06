import type { BloqueioSeguranca, DadosFormulario } from "@/types";
import type { ResultadoCalculo } from "./calcularResultado";

export type FaseCalculadora = "formulario" | "bloqueado" | "resultado";

export const TOTAL_ETAPAS = 5;

export interface EstadoCalculadora {
  dados: DadosFormulario;
  fase: FaseCalculadora;
  etapaIndex: number;
  bloqueios: BloqueioSeguranca[];
  resultado: ResultadoCalculo | null;
}

export type AcaoCalculadora =
  | { tipo: "atualizar_dados"; dados: DadosFormulario }
  | { tipo: "avancar_etapa" }
  | { tipo: "voltar_etapa" }
  | { tipo: "editar" }
  | { tipo: "bloquear"; bloqueios: BloqueioSeguranca[] }
  | { tipo: "concluir"; resultado: ResultadoCalculo };

export const estadoInicialCalculadora: EstadoCalculadora = {
  dados: {},
  fase: "formulario",
  etapaIndex: 0,
  bloqueios: [],
  resultado: null,
};

export function reduzirEstadoCalculadora(
  estado: EstadoCalculadora,
  acao: AcaoCalculadora,
): EstadoCalculadora {
  switch (acao.tipo) {
    case "atualizar_dados":
      return { ...estado, dados: acao.dados };
    case "avancar_etapa":
      return {
        ...estado,
        etapaIndex: Math.min(TOTAL_ETAPAS - 1, estado.etapaIndex + 1),
      };
    case "voltar_etapa":
      return { ...estado, etapaIndex: Math.max(0, estado.etapaIndex - 1) };
    case "editar":
      return { ...estado, fase: "formulario", bloqueios: [], resultado: null };
    case "bloquear":
      return { ...estado, fase: "bloqueado", bloqueios: acao.bloqueios, resultado: null };
    case "concluir":
      return { ...estado, fase: "resultado", resultado: acao.resultado, bloqueios: [] };
    default:
      return estado;
  }
}
