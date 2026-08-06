import { describe, expect, it } from "vitest";
import {
  estadoInicialCalculadora,
  reduzirEstadoCalculadora,
  TOTAL_ETAPAS,
} from "./estadoCalculadora";
import type { EstadoCalculadora } from "./estadoCalculadora";
import type { ResultadoCalculo } from "./calcularResultado";

const RESULTADO_FICTICIO: ResultadoCalculo = {
  tmb: { valorKcal: 1792.5, formulaUsada: "mifflin-st-jeor" },
  get: { valorKcal: 2778.375, fatorAtividade: 1.55 },
  metaBruta: { valorKcal: 2222.7, percentualAjuste: -20 },
  ajustePiso: null,
  ajusteRitmo: null,
  metaFinalKcal: 2222.7,
  macros: { proteinaG: 160, gorduraG: 64, carboidratoG: 251.675 },
  hidratacaoDiaDeTreino: { mlPorDia: 3300 },
  hidratacaoDiaDeDescanso: { mlPorDia: 2800 },
  imc: { valor: 25.2493, classificacao: "sobrepeso" },
};

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

  it("editar troca a fase para formulario sem tocar nos dados ou na etapa, limpando bloqueios e resultado", () => {
    const naTelaDeResultado: EstadoCalculadora = {
      dados: { sexo: "masculino", idadeAnos: 30, pesoKg: 90, alturaCm: 180 },
      fase: "resultado",
      etapaIndex: TOTAL_ETAPAS - 1,
      bloqueios: [],
      resultado: RESULTADO_FICTICIO,
    };

    const estado = reduzirEstadoCalculadora(naTelaDeResultado, { tipo: "editar" });

    expect(estado.fase).toBe("formulario");
    expect(estado.dados).toEqual(naTelaDeResultado.dados);
    expect(estado.etapaIndex).toBe(naTelaDeResultado.etapaIndex);
    expect(estado.resultado).toBeNull();
    expect(estado.bloqueios).toEqual([]);
  });

  it("bloquear troca a fase para bloqueado e registra os motivos, sem gerar resultado", () => {
    const bloqueios = [{ regra: "SEG-01" as const, motivo: "Menor de idade." }];

    const estado = reduzirEstadoCalculadora(estadoInicialCalculadora, {
      tipo: "bloquear",
      bloqueios,
    });

    expect(estado.fase).toBe("bloqueado");
    expect(estado.bloqueios).toEqual(bloqueios);
    expect(estado.resultado).toBeNull();
  });

  it("concluir troca a fase para resultado e guarda o resultado, limpando bloqueios", () => {
    const comBloqueioAnterior: EstadoCalculadora = {
      ...estadoInicialCalculadora,
      bloqueios: [{ regra: "SEG-01", motivo: "Menor de idade." }],
    };

    const estado = reduzirEstadoCalculadora(comBloqueioAnterior, {
      tipo: "concluir",
      resultado: RESULTADO_FICTICIO,
    });

    expect(estado.fase).toBe("resultado");
    expect(estado.resultado).toBe(RESULTADO_FICTICIO);
    expect(estado.bloqueios).toEqual([]);
  });
});
