import type { DadosFormulario } from "@/types";
import { validarRefeicoesPorDia } from "@/lib/validacoes/formulario";
import { CampoMultiSelecao } from "./CampoMultiSelecao";
import { CampoNumero } from "./CampoNumero";
import { CampoOpcoes } from "./CampoOpcoes";
import { CampoTexto } from "./CampoTexto";

interface EtapaPreferenciasProps {
  dados: DadosFormulario;
  onChange: (dados: DadosFormulario) => void;
}

export function EtapaPreferencias({ dados, onChange }: EtapaPreferenciasProps) {
  const atualizar = (campo: keyof DadosFormulario, valor: unknown) => {
    onChange({ ...dados, [campo]: valor });
  };

  return (
    <div className="flex flex-col gap-6">
      <p className="text-sm text-zinc-600 dark:text-zinc-400">
        Esta etapa inteira é opcional — você pode pular direto para o
        cálculo sem preencher nada aqui.
      </p>

      <CampoNumero
        id="refeicoes-por-dia"
        rotulo="Refeições por dia"
        opcional
        valor={dados.refeicoesPorDia}
        onChange={(valor) => atualizar("refeicoesPorDia", valor)}
        erro={
          dados.refeicoesPorDia !== undefined
            ? validarRefeicoesPorDia(dados.refeicoesPorDia)
            : undefined
        }
      />

      <CampoMultiSelecao
        nome="restricoes-alimentares"
        rotulo="Restrições alimentares"
        opcional
        opcoes={[
          { valor: "vegetariano", rotulo: "Vegetariano" },
          { valor: "vegano", rotulo: "Vegano" },
          { valor: "sem_lactose", rotulo: "Sem lactose" },
          { valor: "sem_gluten", rotulo: "Sem glúten" },
          { valor: "outro", rotulo: "Outro" },
        ]}
        valoresSelecionados={dados.restricoesAlimentares}
        onChange={(valores) => atualizar("restricoesAlimentares", valores)}
      />

      <CampoTexto
        id="alergias"
        rotulo="Alergias e intolerâncias"
        opcional
        placeholder="Ex.: amendoim, camarão..."
        valor={dados.alergias}
        onChange={(valor) => atualizar("alergias", valor)}
      />

      <CampoTexto
        id="alimentos-preferidos"
        rotulo="Alimentos preferidos"
        opcional
        placeholder="Ex.: frango, batata doce, aveia..."
        valor={dados.alimentosPreferidos}
        onChange={(valor) => atualizar("alimentosPreferidos", valor)}
      />

      <CampoTexto
        id="alimentos-rejeitados"
        rotulo="Alimentos rejeitados"
        opcional
        placeholder="Ex.: brócolis, peixe..."
        valor={dados.alimentosRejeitados}
        onChange={(valor) => atualizar("alimentosRejeitados", valor)}
      />

      <CampoOpcoes
        nome="orcamento"
        rotulo="Nível de orçamento"
        opcional
        opcoes={[
          { valor: "economico", rotulo: "Econômico" },
          { valor: "medio", rotulo: "Médio" },
          { valor: "sem_restricao", rotulo: "Sem restrição" },
        ]}
        valorSelecionado={dados.orcamento}
        onChange={(valor) => atualizar("orcamento", valor)}
      />

      <CampoOpcoes
        nome="disponibilidade-cozinhar"
        rotulo="Disponibilidade para cozinhar"
        opcional
        opcoes={[
          { valor: "cozinha_diariamente", rotulo: "Cozinha diariamente" },
          { valor: "faz_marmita_semanal", rotulo: "Faz marmita semanal" },
          { valor: "depende_comida_pronta", rotulo: "Depende de comida pronta" },
        ]}
        valorSelecionado={dados.disponibilidadeCozinhar}
        onChange={(valor) => atualizar("disponibilidadeCozinhar", valor)}
      />
    </div>
  );
}
