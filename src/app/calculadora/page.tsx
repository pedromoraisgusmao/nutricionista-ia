"use client";

import { BarraProgresso } from "@/components/formulario/BarraProgresso";
import {
  EtapaAtividadeFisica,
  dadosAtividadeValidos,
} from "@/components/formulario/EtapaAtividadeFisica";
import {
  EtapaDadosCorporais,
  dadosCorporaisValidos,
} from "@/components/formulario/EtapaDadosCorporais";
import {
  EtapaObjetivo,
  dadosObjetivoValidos,
} from "@/components/formulario/EtapaObjetivo";
import { EtapaPreferencias } from "@/components/formulario/EtapaPreferencias";
import { EtapaSaude, dadosSaudeValidos } from "@/components/formulario/EtapaSaude";
import { TelaBloqueio } from "@/components/formulario/TelaBloqueio";
import { TelaResultado } from "@/components/formulario/TelaResultado";
import { calcularIMC } from "@/lib/calculos/macros";
import { verificarBloqueios } from "@/lib/validacoes/seguranca";
import type { DadosFormulario } from "@/types";
import { calcularResultado } from "./calcularResultado";
import { montarDadosUsuario } from "./montarDadosUsuario";
import { TOTAL_ETAPAS } from "./estadoCalculadora";
import { useEstadoCalculadora } from "./useEstadoCalculadora";

const ROTULOS_ETAPAS = [
  "Dados corporais",
  "Atividade física",
  "Objetivo",
  "Saúde",
  "Preferências",
];

export default function CalculadoraPage() {
  const [estado, despachar] = useEstadoCalculadora();
  const { dados, etapaIndex, fase } = estado;

  const atualizarDados = (novosDados: DadosFormulario) =>
    despachar({ tipo: "atualizar_dados", dados: novosDados });

  const naUltimaEtapa = etapaIndex === TOTAL_ETAPAS - 1;

  const podeAvancar =
    etapaIndex === 0
      ? dadosCorporaisValidos(dados)
      : etapaIndex === 1
        ? dadosAtividadeValidos(dados)
        : etapaIndex === 2
          ? dadosObjetivoValidos(dados)
          : etapaIndex === 3
            ? dadosSaudeValidos(dados)
            : true;

  const finalizar = () => {
    const dadosUsuario = montarDadosUsuario(dados);
    const imc = calcularIMC(dadosUsuario.pesoKg, dadosUsuario.alturaCm);
    const verificacao = verificarBloqueios(dadosUsuario, imc);

    if (verificacao.bloqueado) {
      despachar({ tipo: "bloquear", bloqueios: verificacao.bloqueios });
      return;
    }

    const horasTreinoDia = (dados.duracaoSessaoMinutos ?? 0) / 60;
    const resultado = calcularResultado(dadosUsuario, horasTreinoDia);
    despachar({ tipo: "concluir", resultado });
  };

  if (fase === "bloqueado") {
    return (
      <div className="mx-auto flex w-full max-w-xl flex-1 flex-col px-6 py-8">
        <TelaBloqueio
          bloqueios={estado.bloqueios}
          onRevisar={() => despachar({ tipo: "editar" })}
        />
      </div>
    );
  }

  if (fase === "resultado" && estado.resultado) {
    return (
      <div className="mx-auto flex w-full max-w-xl flex-1 flex-col px-6 py-8">
        <TelaResultado
          dados={dados}
          resultado={estado.resultado}
          onEditar={() => despachar({ tipo: "editar" })}
        />
      </div>
    );
  }

  return (
    <div className="mx-auto flex w-full max-w-xl flex-1 flex-col gap-6 px-6 py-8">
      <BarraProgresso
        etapaAtual={etapaIndex + 1}
        totalEtapas={TOTAL_ETAPAS}
        rotulo={ROTULOS_ETAPAS[etapaIndex]}
        opcional={naUltimaEtapa}
      />

      {etapaIndex === 0 && (
        <EtapaDadosCorporais dados={dados} onChange={atualizarDados} />
      )}
      {etapaIndex === 1 && (
        <EtapaAtividadeFisica dados={dados} onChange={atualizarDados} />
      )}
      {etapaIndex === 2 && <EtapaObjetivo dados={dados} onChange={atualizarDados} />}
      {etapaIndex === 3 && <EtapaSaude dados={dados} onChange={atualizarDados} />}
      {etapaIndex === 4 && (
        <EtapaPreferencias dados={dados} onChange={atualizarDados} />
      )}

      <div className="flex justify-between">
        <button
          type="button"
          onClick={() => despachar({ tipo: "voltar_etapa" })}
          disabled={etapaIndex === 0}
          className="rounded-md px-4 py-2 text-sm font-medium text-zinc-700 disabled:opacity-40 dark:text-zinc-300"
        >
          Voltar
        </button>
        <button
          type="button"
          onClick={naUltimaEtapa ? finalizar : () => despachar({ tipo: "avancar_etapa" })}
          disabled={!podeAvancar}
          className="rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-40 dark:bg-zinc-50 dark:text-black"
        >
          {naUltimaEtapa ? "Calcular" : "Avançar"}
        </button>
      </div>
    </div>
  );
}
