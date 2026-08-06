"use client";

import { useState } from "react";
import { BarraProgresso } from "@/components/formulario/BarraProgresso";
import {
  EtapaDadosCorporais,
  dadosCorporaisValidos,
} from "@/components/formulario/EtapaDadosCorporais";
import type { DadosFormulario } from "@/types";

const ROTULOS_ETAPAS = [
  "Dados corporais",
  "Atividade física",
  "Objetivo",
  "Saúde",
  "Preferências",
];

const TOTAL_ETAPAS = ROTULOS_ETAPAS.length;

export default function CalculadoraPage() {
  const [etapaIndex, setEtapaIndex] = useState(0);
  const [dados, setDados] = useState<DadosFormulario>({});

  const podeAvancar = etapaIndex === 0 ? dadosCorporaisValidos(dados) : false;

  return (
    <div className="mx-auto flex w-full max-w-xl flex-1 flex-col gap-6 px-6 py-8">
      <BarraProgresso
        etapaAtual={etapaIndex + 1}
        totalEtapas={TOTAL_ETAPAS}
        rotulo={ROTULOS_ETAPAS[etapaIndex]}
        opcional={etapaIndex === TOTAL_ETAPAS - 1}
      />

      {etapaIndex === 0 ? (
        <EtapaDadosCorporais dados={dados} onChange={setDados} />
      ) : (
        <p className="text-sm text-zinc-600 dark:text-zinc-400">
          Esta etapa ainda está em construção.
        </p>
      )}

      <div className="flex justify-between">
        <button
          type="button"
          onClick={() => setEtapaIndex((atual) => Math.max(0, atual - 1))}
          disabled={etapaIndex === 0}
          className="rounded-md px-4 py-2 text-sm font-medium text-zinc-700 disabled:opacity-40 dark:text-zinc-300"
        >
          Voltar
        </button>
        <button
          type="button"
          onClick={() => setEtapaIndex((atual) => Math.min(TOTAL_ETAPAS - 1, atual + 1))}
          disabled={!podeAvancar}
          className="rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-40 dark:bg-zinc-50 dark:text-black"
        >
          Avançar
        </button>
      </div>
    </div>
  );
}
