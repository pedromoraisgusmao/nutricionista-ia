import type { DadosFormulario } from "@/types";
import { CampoOpcoes } from "./CampoOpcoes";

interface EtapaObjetivoProps {
  dados: DadosFormulario;
  onChange: (dados: DadosFormulario) => void;
}

export function dadosObjetivoValidos(dados: DadosFormulario): boolean {
  if (!dados.objetivo) return false;
  if (dados.objetivo !== "manter" && !dados.ritmo) return false;
  return true;
}

export function EtapaObjetivo({ dados, onChange }: EtapaObjetivoProps) {
  const definirObjetivo = (objetivo: DadosFormulario["objetivo"]) => {
    if (objetivo === "manter") {
      onChange({ ...dados, objetivo, ritmo: undefined });
    } else {
      onChange({ ...dados, objetivo });
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <CampoOpcoes
        nome="objetivo"
        rotulo="Objetivo"
        opcoes={[
          { valor: "perder_gordura", rotulo: "Perder gordura" },
          { valor: "manter", rotulo: "Manter" },
          { valor: "ganhar_massa", rotulo: "Ganhar massa" },
        ]}
        valorSelecionado={dados.objetivo}
        onChange={definirObjetivo}
      />

      {dados.objetivo === "manter" ? (
        <p className="text-sm text-zinc-600 dark:text-zinc-400">
          Com o objetivo de manter o peso, a meta calórica é sempre igual ao
          seu gasto energético total — o ritmo não se aplica aqui.
        </p>
      ) : (
        <CampoOpcoes
          nome="ritmo"
          rotulo="Ritmo desejado"
          opcoes={[
            { valor: "leve", rotulo: "Leve" },
            { valor: "moderado", rotulo: "Moderado" },
            { valor: "agressivo", rotulo: "Agressivo" },
          ]}
          valorSelecionado={dados.ritmo}
          onChange={(ritmo) => onChange({ ...dados, ritmo })}
        />
      )}
    </div>
  );
}
