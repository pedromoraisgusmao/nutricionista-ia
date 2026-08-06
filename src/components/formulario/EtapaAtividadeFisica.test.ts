import { describe, expect, it } from "vitest";
import type { DadosFormulario } from "@/types";
import { dadosAtividadeValidos } from "./EtapaAtividadeFisica";

describe("dadosAtividadeValidos", () => {
  it("é inválido enquanto os campos não estiverem preenchidos", () => {
    expect(dadosAtividadeValidos({})).toBe(false);
    expect(dadosAtividadeValidos({ diasTreinoSemana: 3 })).toBe(false);
  });

  it("é válido com os dois campos preenchidos corretamente, incluindo zero", () => {
    const dados: DadosFormulario = {
      diasTreinoSemana: 0,
      duracaoSessaoMinutos: 0,
    };
    expect(dadosAtividadeValidos(dados)).toBe(true);
  });

  it("é inválido se um dos campos estiver fora da faixa plausível", () => {
    expect(
      dadosAtividadeValidos({ diasTreinoSemana: 8, duracaoSessaoMinutos: 60 }),
    ).toBe(false);
    expect(
      dadosAtividadeValidos({ diasTreinoSemana: 3, duracaoSessaoMinutos: 301 }),
    ).toBe(false);
  });
});
