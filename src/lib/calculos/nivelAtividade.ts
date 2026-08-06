import type { NivelAtividade } from "@/types";

export function derivarNivelAtividadePorMinutos(
  minutosSemanais: number,
): NivelAtividade {
  if (minutosSemanais === 0) return "sedentario";
  if (minutosSemanais <= 150) return "levemente_ativo";
  if (minutosSemanais <= 300) return "moderadamente_ativo";
  if (minutosSemanais <= 450) return "muito_ativo";
  return "extremamente_ativo";
}

export function derivarNivelAtividade(
  diasPorSemana: number,
  duracaoSessaoMinutos: number,
): NivelAtividade {
  return derivarNivelAtividadePorMinutos(diasPorSemana * duracaoSessaoMinutos);
}
