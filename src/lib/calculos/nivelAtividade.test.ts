import { describe, expect, it } from "vitest";
import {
  derivarNivelAtividade,
  derivarNivelAtividadePorMinutos,
} from "./nivelAtividade";

describe("derivarNivelAtividadePorMinutos", () => {
  it("0 minutos -> sedentario", () => {
    expect(derivarNivelAtividadePorMinutos(0)).toBe("sedentario");
  });

  it("1 minuto -> levemente_ativo (início da faixa)", () => {
    expect(derivarNivelAtividadePorMinutos(1)).toBe("levemente_ativo");
  });

  it("150 minutos -> levemente_ativo (fim exato da faixa)", () => {
    expect(derivarNivelAtividadePorMinutos(150)).toBe("levemente_ativo");
  });

  it("151 minutos -> moderadamente_ativo (início exato da faixa seguinte)", () => {
    expect(derivarNivelAtividadePorMinutos(151)).toBe("moderadamente_ativo");
  });

  it("300 minutos -> moderadamente_ativo (fim exato da faixa)", () => {
    expect(derivarNivelAtividadePorMinutos(300)).toBe("moderadamente_ativo");
  });

  it("301 minutos -> muito_ativo (início exato da faixa seguinte)", () => {
    expect(derivarNivelAtividadePorMinutos(301)).toBe("muito_ativo");
  });

  it("450 minutos -> muito_ativo (fim exato da faixa)", () => {
    expect(derivarNivelAtividadePorMinutos(450)).toBe("muito_ativo");
  });

  it("451 minutos -> extremamente_ativo (início exato da faixa seguinte)", () => {
    expect(derivarNivelAtividadePorMinutos(451)).toBe("extremamente_ativo");
  });

  it("valor bem acima de 450 -> extremamente_ativo", () => {
    expect(derivarNivelAtividadePorMinutos(1000)).toBe("extremamente_ativo");
  });
});

describe("derivarNivelAtividade", () => {
  it("multiplica dias por semana pela duração da sessão antes de mapear", () => {
    // 4 treinos de 60min = 240min/semana -> faixa 151-300 -> moderadamente_ativo
    expect(derivarNivelAtividade(4, 60)).toBe("moderadamente_ativo");
  });

  it("0 dias de treino -> sedentario, independente da duração informada", () => {
    expect(derivarNivelAtividade(0, 45)).toBe("sedentario");
  });

  it("7 dias de 90min = 630min/semana -> extremamente_ativo", () => {
    expect(derivarNivelAtividade(7, 90)).toBe("extremamente_ativo");
  });
});
