import type { ClassificacaoIMC, DadosFormulario, FormulaTMB, Objetivo, Ritmo } from "@/types";
import type { ResultadoCalculo } from "@/app/calculadora/calcularResultado";
import { montarEntradaPromptPlano } from "@/app/calculadora/montarEntradaPromptPlano";
import { SecaoPlanoAlimentar } from "@/components/plano/SecaoPlanoAlimentar";
import { formatarComDuasCasasDecimais, formatarComUmaCasaDecimal } from "./formatarNumero";

interface TelaResultadoProps {
  dados: DadosFormulario;
  resultado: ResultadoCalculo;
  onEditar: () => void;
}

const ROTULO_FORMULA_TMB: Record<FormulaTMB, string> = {
  "mifflin-st-jeor": "Mifflin-St Jeor",
  "katch-mcardle": "Katch-McArdle",
};

const ROTULO_CLASSIFICACAO_IMC: Record<ClassificacaoIMC, string> = {
  abaixo_do_peso: "Abaixo do peso",
  peso_normal: "Peso normal",
  sobrepeso: "Sobrepeso",
  obesidade: "Obesidade",
};

const ROTULO_OBJETIVO: Record<Objetivo, string> = {
  perder_gordura: "Perder gordura",
  manter: "Manter",
  ganhar_massa: "Ganhar massa",
};

const ROTULO_RITMO: Record<Ritmo, string> = {
  leve: "Leve",
  moderado: "Moderado",
  agressivo: "Agressivo",
};

function CardNumero({ rotulo, valor }: { rotulo: string; valor: string }) {
  return (
    <div className="rounded-md border border-zinc-200 p-4 dark:border-zinc-800">
      <p className="text-sm text-zinc-600 dark:text-zinc-400">{rotulo}</p>
      <p className="text-2xl font-semibold text-black dark:text-zinc-50">{valor}</p>
    </div>
  );
}

export function TelaResultado({ dados, resultado, onEditar }: TelaResultadoProps) {
  const litrosTreino = resultado.hidratacaoDiaDeTreino.mlPorDia / 1000;
  const litrosDescanso = resultado.hidratacaoDiaDeDescanso.mlPorDia / 1000;

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-xl font-semibold text-black dark:text-zinc-50">
        Seus resultados
      </h1>

      <div className="grid grid-cols-2 gap-4">
        <CardNumero
          rotulo={`TMB (${ROTULO_FORMULA_TMB[resultado.tmb.formulaUsada]})`}
          valor={`${formatarComUmaCasaDecimal(resultado.tmb.valorKcal)} kcal`}
        />
        <CardNumero
          rotulo={`GET (fator ${resultado.get.fatorAtividade})`}
          valor={`${formatarComUmaCasaDecimal(resultado.get.valorKcal)} kcal`}
        />
        <CardNumero
          rotulo="Meta calórica"
          valor={`${formatarComUmaCasaDecimal(resultado.metaFinalKcal)} kcal`}
        />
        <CardNumero
          rotulo="IMC"
          valor={`${formatarComDuasCasasDecimais(resultado.imc.valor)} — ${ROTULO_CLASSIFICACAO_IMC[resultado.imc.classificacao]}`}
        />
      </div>

      {(resultado.ajustePiso || resultado.ajusteRitmo) && (
        <div className="flex flex-col gap-3">
          {resultado.ajustePiso && (
            <div className="rounded-md border border-blue-300 bg-blue-50 p-4 text-sm text-blue-900 dark:border-blue-800 dark:bg-blue-950 dark:text-blue-200">
              {resultado.ajustePiso.motivo}
            </div>
          )}
          {resultado.ajusteRitmo && (
            <div className="rounded-md border border-blue-300 bg-blue-50 p-4 text-sm text-blue-900 dark:border-blue-800 dark:bg-blue-950 dark:text-blue-200">
              {resultado.ajusteRitmo.motivo}
            </div>
          )}
        </div>
      )}

      <div className="flex flex-col gap-2">
        <h2 className="text-sm font-medium text-zinc-800 dark:text-zinc-200">
          Macronutrientes
        </h2>
        <div className="grid grid-cols-3 gap-4">
          <CardNumero
            rotulo="Proteína"
            valor={`${formatarComUmaCasaDecimal(resultado.macros.proteinaG)} g`}
          />
          <CardNumero
            rotulo="Gordura"
            valor={`${formatarComUmaCasaDecimal(resultado.macros.gorduraG)} g`}
          />
          <CardNumero
            rotulo="Carboidrato"
            valor={`${formatarComUmaCasaDecimal(resultado.macros.carboidratoG)} g`}
          />
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <h2 className="text-sm font-medium text-zinc-800 dark:text-zinc-200">
          Hidratação
        </h2>
        <div className="grid grid-cols-2 gap-4">
          <CardNumero
            rotulo="Dia de treino"
            valor={`${formatarComUmaCasaDecimal(litrosTreino)} L`}
          />
          <CardNumero
            rotulo="Dia de descanso"
            valor={`${formatarComUmaCasaDecimal(litrosDescanso)} L`}
          />
        </div>
      </div>

      <div className="flex flex-col gap-3 rounded-md border border-zinc-200 p-4 dark:border-zinc-800">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-medium text-zinc-800 dark:text-zinc-200">
            Dados usados no cálculo
          </h2>
          <button
            type="button"
            onClick={onEditar}
            className="text-sm font-medium text-zinc-700 underline dark:text-zinc-300"
          >
            Editar
          </button>
        </div>
        <dl className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm text-zinc-600 dark:text-zinc-400">
          <dt>Sexo</dt>
          <dd>{dados.sexo === "feminino" ? "Feminino" : "Masculino"}</dd>
          <dt>Idade</dt>
          <dd>{dados.idadeAnos} anos</dd>
          <dt>Peso</dt>
          <dd>{dados.pesoKg} kg</dd>
          <dt>Altura</dt>
          <dd>{dados.alturaCm} cm</dd>
          <dt>Dias de treino</dt>
          <dd>{dados.diasTreinoSemana} por semana</dd>
          <dt>Duração da sessão</dt>
          <dd>{dados.duracaoSessaoMinutos} minutos</dd>
          <dt>Objetivo</dt>
          <dd>{dados.objetivo ? ROTULO_OBJETIVO[dados.objetivo] : "—"}</dd>
          <dt>Ritmo</dt>
          <dd>{dados.ritmo ? ROTULO_RITMO[dados.ritmo] : "—"}</dd>
        </dl>
      </div>

      <SecaoPlanoAlimentar entrada={montarEntradaPromptPlano(dados, resultado)} />

      <p className="text-sm text-zinc-600 dark:text-zinc-400">
        Esta ferramenta tem caráter educativo e informativo. Os valores
        apresentados são estimativas baseadas em fórmulas populacionais e não
        constituem prescrição dietética. A prescrição de dietas
        individualizadas é atividade privativa de nutricionista registrado no
        Conselho Federal de Nutricionistas. Consulte um profissional antes de
        iniciar qualquer plano alimentar.
      </p>
    </div>
  );
}
