import { describe, expect, it } from "vitest";
import type { DadosFormulario } from "@/types";
import { montarDadosUsuario } from "./montarDadosUsuario";

const dadosBase: DadosFormulario = {
  sexo: "masculino",
  idadeAnos: 25,
  pesoKg: 80,
  alturaCm: 178,
  diasTreinoSemana: 4,
  duracaoSessaoMinutos: 60,
  objetivo: "perder_gordura",
  ritmo: "moderado",
  condicaoSaudeRelevante: false,
};

describe("montarDadosUsuario", () => {
  it("lança erro se um campo obrigatório estiver ausente", () => {
    expect(() => montarDadosUsuario({})).toThrow();
  });

  it("define gestanteOuAmamentando como false para sexo masculino, mesmo nunca perguntado", () => {
    const resultado = montarDadosUsuario(dadosBase);
    expect(resultado.gestanteOuAmamentando).toBe(false);
  });

  it("repassa a resposta explícita de gestação para sexo feminino", () => {
    const feminina: DadosFormulario = {
      ...dadosBase,
      sexo: "feminino",
      gestanteOuAmamentando: true,
    };
    expect(montarDadosUsuario(feminina).gestanteOuAmamentando).toBe(true);

    const femininaNegativa: DadosFormulario = {
      ...dadosBase,
      sexo: "feminino",
      gestanteOuAmamentando: false,
    };
    expect(montarDadosUsuario(femininaNegativa).gestanteOuAmamentando).toBe(false);
  });

  it("deriva o nível de atividade a partir de dias e duração", () => {
    const resultado = montarDadosUsuario(dadosBase);
    expect(resultado.nivelAtividade).toBe("moderadamente_ativo");
  });

  it("preenche um ritmo de preenchimento quando o objetivo é manter, já que o motor o ignora nesse caso", () => {
    const mantendo: DadosFormulario = {
      ...dadosBase,
      objetivo: "manter",
      ritmo: undefined,
    };
    const resultado = montarDadosUsuario(mantendo);
    expect(resultado.ritmo).toBeDefined();
  });

  it("repassa o ritmo escolhido quando o objetivo não é manter", () => {
    const resultado = montarDadosUsuario({ ...dadosBase, ritmo: "agressivo" });
    expect(resultado.ritmo).toBe("agressivo");
  });

  it("mantém percentual de gordura e circunferências ausentes quando não preenchidos", () => {
    const resultado = montarDadosUsuario(dadosBase);
    expect(resultado.percentualGordura).toBeUndefined();
    expect(resultado.circunferencias).toBeUndefined();
  });

  it("só monta circunferências quando cintura e pescoço estão presentes", () => {
    const comCinturaApenas = montarDadosUsuario({ ...dadosBase, cinturaCm: 85 });
    expect(comCinturaApenas.circunferencias).toBeUndefined();

    const comCinturaEPescoco = montarDadosUsuario({
      ...dadosBase,
      cinturaCm: 85,
      pescocoCm: 38,
    });
    expect(comCinturaEPescoco.circunferencias).toEqual({
      cinturaCm: 85,
      pescocoCm: 38,
      quadrilCm: undefined,
    });
  });
});
