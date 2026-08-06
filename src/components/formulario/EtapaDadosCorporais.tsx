import type { DadosFormulario } from "@/types";
import {
  validarAltura,
  validarCircunferenciaCintura,
  validarCircunferenciaPescoco,
  validarCircunferenciaQuadril,
  validarIdade,
  validarPercentualGordura,
  validarPeso,
} from "@/lib/validacoes/formulario";
import { CampoNumero } from "./CampoNumero";
import { CampoOpcoes } from "./CampoOpcoes";

interface EtapaDadosCorporaisProps {
  dados: DadosFormulario;
  onChange: (dados: DadosFormulario) => void;
}

export function dadosCorporaisValidos(dados: DadosFormulario): boolean {
  if (!dados.sexo) return false;
  if (dados.idadeAnos === undefined || validarIdade(dados.idadeAnos)) return false;
  if (dados.pesoKg === undefined || validarPeso(dados.pesoKg)) return false;
  if (dados.alturaCm === undefined || validarAltura(dados.alturaCm)) return false;

  if (
    dados.percentualGordura !== undefined &&
    validarPercentualGordura(dados.percentualGordura)
  ) {
    return false;
  }
  if (dados.cinturaCm !== undefined && validarCircunferenciaCintura(dados.cinturaCm)) {
    return false;
  }
  if (dados.pescocoCm !== undefined && validarCircunferenciaPescoco(dados.pescocoCm)) {
    return false;
  }
  if (dados.quadrilCm !== undefined && validarCircunferenciaQuadril(dados.quadrilCm)) {
    return false;
  }

  return true;
}

export function EtapaDadosCorporais({ dados, onChange }: EtapaDadosCorporaisProps) {
  const atualizar = (campo: keyof DadosFormulario, valor: unknown) => {
    onChange({ ...dados, [campo]: valor });
  };

  return (
    <div className="flex flex-col gap-6">
      <CampoOpcoes
        nome="sexo"
        rotulo="Sexo biológico"
        opcoes={[
          { valor: "masculino", rotulo: "Masculino" },
          { valor: "feminino", rotulo: "Feminino" },
        ]}
        valorSelecionado={dados.sexo}
        onChange={(valor) => atualizar("sexo", valor)}
      />

      <CampoNumero
        id="idade"
        rotulo="Idade"
        unidade="anos"
        valor={dados.idadeAnos}
        onChange={(valor) => atualizar("idadeAnos", valor)}
        erro={dados.idadeAnos !== undefined ? validarIdade(dados.idadeAnos) : undefined}
      />

      <CampoNumero
        id="peso"
        rotulo="Peso"
        unidade="kg"
        valor={dados.pesoKg}
        onChange={(valor) => atualizar("pesoKg", valor)}
        erro={dados.pesoKg !== undefined ? validarPeso(dados.pesoKg) : undefined}
      />

      <CampoNumero
        id="altura"
        rotulo="Altura"
        unidade="cm"
        valor={dados.alturaCm}
        onChange={(valor) => atualizar("alturaCm", valor)}
        erro={dados.alturaCm !== undefined ? validarAltura(dados.alturaCm) : undefined}
      />

      <details className="rounded-md border border-zinc-200 p-4 dark:border-zinc-800">
        <summary className="cursor-pointer text-sm font-medium text-zinc-800 dark:text-zinc-200">
          Refinar precisão (opcional)
        </summary>
        <div className="mt-4 flex flex-col gap-4">
          <p className="text-sm text-zinc-600 dark:text-zinc-400">
            Informar o percentual de gordura corporal troca a fórmula usada
            para Katch-McArdle, mais precisa. Se preferir, informe as
            circunferências abaixo para estimá-lo automaticamente — se ambos
            forem preenchidos, o percentual de gordura tem prioridade.
          </p>

          <CampoNumero
            id="percentual-gordura"
            rotulo="Percentual de gordura corporal"
            unidade="%"
            opcional
            valor={dados.percentualGordura}
            onChange={(valor) => atualizar("percentualGordura", valor)}
            erro={
              dados.percentualGordura !== undefined
                ? validarPercentualGordura(dados.percentualGordura)
                : undefined
            }
          />

          <CampoNumero
            id="cintura"
            rotulo="Circunferência da cintura"
            unidade="cm"
            opcional
            valor={dados.cinturaCm}
            onChange={(valor) => atualizar("cinturaCm", valor)}
            erro={
              dados.cinturaCm !== undefined
                ? validarCircunferenciaCintura(dados.cinturaCm)
                : undefined
            }
          />

          <CampoNumero
            id="pescoco"
            rotulo="Circunferência do pescoço"
            unidade="cm"
            opcional
            valor={dados.pescocoCm}
            onChange={(valor) => atualizar("pescocoCm", valor)}
            erro={
              dados.pescocoCm !== undefined
                ? validarCircunferenciaPescoco(dados.pescocoCm)
                : undefined
            }
          />

          {dados.sexo === "feminino" && (
            <CampoNumero
              id="quadril"
              rotulo="Circunferência do quadril"
              unidade="cm"
              opcional
              valor={dados.quadrilCm}
              onChange={(valor) => atualizar("quadrilCm", valor)}
              erro={
                dados.quadrilCm !== undefined
                  ? validarCircunferenciaQuadril(dados.quadrilCm)
                  : undefined
              }
            />
          )}
        </div>
      </details>
    </div>
  );
}
