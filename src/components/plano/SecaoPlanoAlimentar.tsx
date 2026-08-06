"use client";

import { useState } from "react";
import type { EntradaPromptPlano } from "@/lib/ia/prompt";
import type { PlanoAlimentar } from "@/types";
import {
  MENSAGEM_ERRO_CONEXAO,
  estadoAPartirDaResposta,
  indexarSubstituicoesPorAlimento,
  type EstadoGeracaoPlano,
} from "./estadoGeracaoPlano";

interface SecaoPlanoAlimentarProps {
  entrada: EntradaPromptPlano;
}

export function SecaoPlanoAlimentar({ entrada }: SecaoPlanoAlimentarProps) {
  const [estado, setEstado] = useState<EstadoGeracaoPlano>({ status: "ocioso" });

  const gerarPlano = async () => {
    setEstado({ status: "carregando" });
    try {
      const resposta = await fetch("/api/gerar-plano", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(entrada),
      });
      const corpo = await resposta.json().catch(() => null);
      setEstado(estadoAPartirDaResposta(resposta.ok, corpo));
    } catch {
      setEstado({ status: "erro", mensagem: MENSAGEM_ERRO_CONEXAO });
    }
  };

  const rotuloBotao = estado.status === "erro" ? "Tentar novamente" : "Gerar meu plano alimentar";

  return (
    <div className="flex flex-col gap-4 rounded-md border border-zinc-200 p-4 dark:border-zinc-800">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-sm font-medium text-zinc-800 dark:text-zinc-200">Plano alimentar</h2>
        {estado.status !== "carregando" && (
          <button
            type="button"
            onClick={gerarPlano}
            className="rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white dark:bg-zinc-50 dark:text-black"
          >
            {rotuloBotao}
          </button>
        )}
      </div>

      <p className="text-xs text-zinc-500 dark:text-zinc-500">
        Quem tem alergia grave deve sempre conferir os ingredientes antes de consumir: a checagem
        automática de restrições e alergias é por palavra-chave e não substitui a leitura do
        rótulo.
      </p>

      {estado.status === "carregando" && (
        <div className="flex flex-col items-center gap-3 py-6 text-center">
          <div
            role="status"
            aria-label="Gerando plano alimentar"
            className="h-8 w-8 animate-spin rounded-full border-2 border-zinc-300 border-t-zinc-900 dark:border-zinc-700 dark:border-t-zinc-50"
          />
          <p className="text-sm text-zinc-600 dark:text-zinc-400">
            Gerando seu plano alimentar... isso pode levar até 30 segundos. Não feche esta página.
          </p>
        </div>
      )}

      {estado.status === "erro" && (
        <div className="rounded-md border border-red-300 bg-red-50 p-4 text-sm text-red-900 dark:border-red-800 dark:bg-red-950 dark:text-red-200">
          {estado.mensagem}
        </div>
      )}

      {estado.status === "sucesso" && <PlanoGerado plano={estado.plano} />}
    </div>
  );
}

function PlanoGerado({ plano }: { plano: PlanoAlimentar }) {
  const substituicaoPorAlimento = indexarSubstituicoesPorAlimento(plano);

  return (
    <div className="flex flex-col gap-6">
      {plano.refeicoes.map((refeicao, indiceRefeicao) => (
        <div key={`${refeicao.nome}-${indiceRefeicao}`} className="flex flex-col gap-3">
          <div className="flex items-baseline justify-between">
            <h3 className="text-sm font-semibold text-black dark:text-zinc-50">
              {refeicao.nome}
            </h3>
            <span className="text-xs text-zinc-500 dark:text-zinc-500">{refeicao.horario}</span>
          </div>

          <ul className="flex flex-col gap-3">
            {refeicao.itens.map((item, indiceItem) => {
              const substituicao = substituicaoPorAlimento.get(item.alimento);
              return (
                <li
                  key={`${item.alimento}-${indiceItem}`}
                  className="rounded-md border border-zinc-200 p-3 text-sm dark:border-zinc-800"
                >
                  <div className="flex items-baseline justify-between gap-2">
                    <span className="font-medium text-black dark:text-zinc-50">
                      {item.alimento}
                    </span>
                    <span className="text-zinc-500 dark:text-zinc-500">{item.quantidade}</span>
                  </div>
                  <p className="mt-1 text-xs text-zinc-600 dark:text-zinc-400">
                    {item.calorias} kcal · {item.proteinaG} g proteína · {item.carboidratoG} g
                    carboidrato · {item.gorduraG} g gordura
                  </p>

                  {substituicao && substituicao.alternativas.length > 0 && (
                    <div className="mt-2 border-t border-zinc-100 pt-2 dark:border-zinc-800">
                      <p className="text-xs font-medium text-zinc-700 dark:text-zinc-300">
                        Substituições
                      </p>
                      <ul className="mt-1 flex flex-col gap-1">
                        {substituicao.alternativas.map((alternativa, indiceAlternativa) => (
                          <li
                            key={`${alternativa.alimento}-${indiceAlternativa}`}
                            className="text-xs text-zinc-600 dark:text-zinc-400"
                          >
                            {alternativa.alimento} ({alternativa.quantidade}) —{" "}
                            {alternativa.calorias} kcal
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </li>
              );
            })}
          </ul>

          <p className="text-xs text-zinc-500 dark:text-zinc-500">
            Total da refeição: {refeicao.totalCalorias} kcal · {refeicao.totalProteinaG} g
            proteína · {refeicao.totalCarboidratoG} g carboidrato · {refeicao.totalGorduraG} g
            gordura
          </p>
        </div>
      ))}
    </div>
  );
}
