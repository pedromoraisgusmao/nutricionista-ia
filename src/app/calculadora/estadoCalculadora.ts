import type { DadosFormulario } from "@/types";

export type FaseCalculadora = "formulario" | "bloqueado" | "resultado";

export const TOTAL_ETAPAS = 5;

export interface EstadoCalculadora {
  dados: DadosFormulario;
  fase: FaseCalculadora;
  etapaIndex: number;
}

export type AcaoCalculadora =
  | { tipo: "atualizar_dados"; dados: DadosFormulario }
  | { tipo: "avancar_etapa" }
  | { tipo: "voltar_etapa" }
  | { tipo: "editar" };

export const estadoInicialCalculadora: EstadoCalculadora = {
  dados: {},
  fase: "formulario",
  etapaIndex: 0,
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
      return { ...estado, fase: "formulario" };
    default:
      return estado;
  }
}
