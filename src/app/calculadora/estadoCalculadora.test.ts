import { describe, expect, it } from "vitest";
import {
  estadoInicialCalculadora,
  reduzirEstadoCalculadora,
  TOTAL_ETAPAS,
} from "./estadoCalculadora";
import type { EstadoCalculadora } from "./estadoCalculadora";

describe("reduzirEstadoCalculadora", () => {
  it("atualiza os dados sem alterar fase nem etapa", () => {
    const estado = reduzirEstadoCalculadora(estadoInicialCalculadora, {
      tipo: "atualizar_dados",
      dados: { sexo: "masculino", idadeAnos: 25 },
    });

    expect(estado.dados).toEqual({ sexo: "masculino", idadeAnos: 25 });
    expect(estado.fase).toBe("formulario");
    expect(estado.etapaIndex).toBe(0);
  });

  it("avança a etapa sem alterar os dados", () => {
    const comDados: EstadoCalculadora = {
      ...estadoInicialCalculadora,
      dados: { sexo: "feminino" },
    };

    const estado = reduzirEstadoCalculadora(comDados, { tipo: "avancar_etapa" });

    expect(estado.etapaIndex).toBe(1);
    expect(estado.dados).toEqual({ sexo: "feminino" });
  });

  it("não avança além da última etapa", () => {
    const naUltimaEtapa: EstadoCalculadora = {
      ...estadoInicialCalculadora,
      etapaIndex: TOTAL_ETAPAS - 1,
    };

    const estado = reduzirEstadoCalculadora(naUltimaEtapa, { tipo: "avancar_etapa" });

    expect(estado.etapaIndex).toBe(TOTAL_ETAPAS - 1);
  });

  it("volta a etapa sem alterar os dados", () => {
    const naEtapa2: EstadoCalculadora = { ...estadoInicialCalculadora, etapaIndex: 2 };

    const estado = reduzirEstadoCalculadora(naEtapa2, { tipo: "voltar_etapa" });

    expect(estado.etapaIndex).toBe(1);
  });

  it("não volta antes da primeira etapa", () => {
    const estado = reduzirEstadoCalculadora(estadoInicialCalculadora, {
      tipo: "voltar_etapa",
    });

    expect(estado.etapaIndex).toBe(0);
  });

  it("editar troca a fase para formulario sem tocar nos dados ou na etapa", () => {
    const naTelaDeResultado: EstadoCalculadora = {
      dados: { sexo: "masculino", idadeAnos: 30, pesoKg: 90, alturaCm: 180 },
      fase: "resultado",
      etapaIndex: TOTAL_ETAPAS - 1,
    };

    const estado = reduzirEstadoCalculadora(naTelaDeResultado, { tipo: "editar" });

    expect(estado.fase).toBe("formulario");
    expect(estado.dados).toEqual(naTelaDeResultado.dados);
    expect(estado.etapaIndex).toBe(naTelaDeResultado.etapaIndex);
  });
});
