import type { DadosFormulario, NivelAtividade } from "@/types";
import { derivarNivelAtividade } from "@/lib/calculos/nivelAtividade";
import {
  validarDiasTreinoSemana,
  validarDuracaoSessaoMinutos,
} from "@/lib/validacoes/formulario";
import { CampoNumero } from "./CampoNumero";

const ROTULO_NIVEL_ATIVIDADE: Record<NivelAtividade, string> = {
  sedentario: "Sedentário",
  levemente_ativo: "Levemente ativo",
  moderadamente_ativo: "Moderadamente ativo",
  muito_ativo: "Muito ativo",
  extremamente_ativo: "Extremamente ativo",
};

interface EtapaAtividadeFisicaProps {
  dados: DadosFormulario;
  onChange: (dados: DadosFormulario) => void;
}

export function dadosAtividadeValidos(dados: DadosFormulario): boolean {
  if (
    dados.diasTreinoSemana === undefined ||
    validarDiasTreinoSemana(dados.diasTreinoSemana)
  ) {
    return false;
  }
  if (
    dados.duracaoSessaoMinutos === undefined ||
    validarDuracaoSessaoMinutos(dados.duracaoSessaoMinutos)
  ) {
    return false;
  }
  return true;
}

export function EtapaAtividadeFisica({ dados, onChange }: EtapaAtividadeFisicaProps) {
  const atualizar = (campo: keyof DadosFormulario, valor: unknown) => {
    onChange({ ...dados, [campo]: valor });
  };

  const { diasTreinoSemana, duracaoSessaoMinutos } = dados;
  const nivelDerivado =
    diasTreinoSemana !== undefined &&
    duracaoSessaoMinutos !== undefined &&
    dadosAtividadeValidos(dados)
      ? derivarNivelAtividade(diasTreinoSemana, duracaoSessaoMinutos)
      : undefined;

  return (
    <div className="flex flex-col gap-6">
      <CampoNumero
        id="dias-treino"
        rotulo="Dias de treino por semana"
        valor={dados.diasTreinoSemana}
        onChange={(valor) => atualizar("diasTreinoSemana", valor)}
        erro={
          dados.diasTreinoSemana !== undefined
            ? validarDiasTreinoSemana(dados.diasTreinoSemana)
            : undefined
        }
      />

      <CampoNumero
        id="duracao-sessao"
        rotulo="Duração média da sessão de treino"
        unidade="minutos"
        valor={dados.duracaoSessaoMinutos}
        onChange={(valor) => atualizar("duracaoSessaoMinutos", valor)}
        erro={
          dados.duracaoSessaoMinutos !== undefined
            ? validarDuracaoSessaoMinutos(dados.duracaoSessaoMinutos)
            : undefined
        }
      />

      {nivelDerivado && (
        <p className="rounded-md bg-zinc-100 px-4 py-3 text-sm text-zinc-700 dark:bg-zinc-900 dark:text-zinc-300">
          Isso equivale a:{" "}
          <span className="font-medium">{ROTULO_NIVEL_ATIVIDADE[nivelDerivado]}</span>
        </p>
      )}
    </div>
  );
}
