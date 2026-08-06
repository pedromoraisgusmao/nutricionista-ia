import type { DadosFormulario } from "@/types";
import { CampoOpcoes } from "./CampoOpcoes";

type RespostaSimNao = "sim" | "nao";

const OPCOES_SIM_NAO: { valor: RespostaSimNao; rotulo: string }[] = [
  { valor: "sim", rotulo: "Sim" },
  { valor: "nao", rotulo: "Não" },
];

interface EtapaSaudeProps {
  dados: DadosFormulario;
  onChange: (dados: DadosFormulario) => void;
}

export function dadosSaudeValidos(dados: DadosFormulario): boolean {
  if (dados.sexo === "feminino" && dados.gestanteOuAmamentando === undefined) {
    return false;
  }
  if (dados.condicaoSaudeRelevante === undefined) return false;
  return true;
}

function paraSimNao(valor: boolean | undefined): RespostaSimNao | undefined {
  if (valor === undefined) return undefined;
  return valor ? "sim" : "nao";
}

export function EtapaSaude({ dados, onChange }: EtapaSaudeProps) {
  return (
    <div className="flex flex-col gap-6">
      <p className="text-sm text-zinc-600 dark:text-zinc-400">
        Perguntamos isso para não gerar um plano inadequado ao seu caso.
        Nesta versão, a informação fica só no seu navegador — não é enviada
        nem armazenada em nenhum servidor.
      </p>

      {dados.sexo === "feminino" && (
        <CampoOpcoes<RespostaSimNao>
          nome="gestante-amamentando"
          rotulo="Você está gestante ou amamentando?"
          opcoes={OPCOES_SIM_NAO}
          valorSelecionado={paraSimNao(dados.gestanteOuAmamentando)}
          onChange={(valor) =>
            onChange({ ...dados, gestanteOuAmamentando: valor === "sim" })
          }
        />
      )}

      <CampoOpcoes<RespostaSimNao>
        nome="condicao-saude"
        rotulo="Você tem diabetes, doença renal, doença cardíaca ou transtorno alimentar?"
        opcoes={OPCOES_SIM_NAO}
        valorSelecionado={paraSimNao(dados.condicaoSaudeRelevante)}
        onChange={(valor) =>
          onChange({ ...dados, condicaoSaudeRelevante: valor === "sim" })
        }
      />
    </div>
  );
}
