import { calcularGET, calcularMetaCalorica } from "@/lib/calculos/gastoEnergetico";
import { calcularHidratacao, calcularIMC, calcularMacros } from "@/lib/calculos/macros";
import { calcularTMB } from "@/lib/calculos/tmb";
import { aplicarPisoCalorico, limitarRitmoPerda } from "@/lib/validacoes/seguranca";
import type {
  AjusteSeguranca,
  DadosUsuario,
  Hidratacao,
  Macros,
  MetaCalorica,
  ResultadoGET,
  ResultadoIMC,
  ResultadoTMB,
} from "@/types";

export interface ResultadoCalculo {
  tmb: ResultadoTMB;
  get: ResultadoGET;
  metaBruta: MetaCalorica;
  ajustePiso: AjusteSeguranca | null;
  ajusteRitmo: AjusteSeguranca | null;
  metaFinalKcal: number;
  macros: Macros;
  hidratacaoDiaDeTreino: Hidratacao;
  hidratacaoDiaDeDescanso: Hidratacao;
  imc: ResultadoIMC;
}

/**
 * Orquestra a cadeia do RF-02 chamando só funções já existentes do motor
 * de cálculo. A meta final é o maior valor entre a meta bruta e os dois
 * alvos de segurança (SEG-04, SEG-05) — decisão documentada no PRD,
 * seção RF-03: as duas regras só elevam a meta, sem ordem entre si.
 */
export function calcularResultado(
  dadosUsuario: DadosUsuario,
  horasTreinoDia: number,
): ResultadoCalculo {
  const tmb = calcularTMB(dadosUsuario);
  const get = calcularGET(tmb.valorKcal, dadosUsuario.nivelAtividade);
  const metaBruta = calcularMetaCalorica(
    get.valorKcal,
    dadosUsuario.objetivo,
    dadosUsuario.ritmo,
  );

  const ajustePiso = aplicarPisoCalorico(metaBruta.valorKcal, dadosUsuario.sexo);
  const ajusteRitmo = limitarRitmoPerda(
    metaBruta.valorKcal,
    get.valorKcal,
    dadosUsuario.pesoKg,
  );

  const metaFinalKcal = Math.max(
    metaBruta.valorKcal,
    ajustePiso?.valorAjustadoKcal ?? -Infinity,
    ajusteRitmo?.valorAjustadoKcal ?? -Infinity,
  );

  const macros = calcularMacros(metaFinalKcal, dadosUsuario.pesoKg, dadosUsuario.objetivo);
  const hidratacaoDiaDeTreino = calcularHidratacao(dadosUsuario.pesoKg, horasTreinoDia);
  const hidratacaoDiaDeDescanso = calcularHidratacao(dadosUsuario.pesoKg, 0);
  const imc = calcularIMC(dadosUsuario.pesoKg, dadosUsuario.alturaCm);

  return {
    tmb,
    get,
    metaBruta,
    ajustePiso,
    ajusteRitmo,
    metaFinalKcal,
    macros,
    hidratacaoDiaDeTreino,
    hidratacaoDiaDeDescanso,
    imc,
  };
}
