import { describe, expect, it } from "vitest";
import type { DadosFormulario } from "@/types";
import { dadosCorporaisValidos } from "./EtapaDadosCorporais";

const dadosBase: DadosFormulario = {
  sexo: "masculino",
  idadeAnos: 25,
  pesoKg: 80,
  alturaCm: 178,
};

describe("dadosCorporaisValidos", () => {
  it("é inválido enquanto os campos obrigatórios não estiverem preenchidos", () => {
    expect(dadosCorporaisValidos({})).toBe(false);
    expect(dadosCorporaisValidos({ sexo: "masculino" })).toBe(false);
  });

  it("é válido com apenas os campos obrigatórios preenchidos corretamente", () => {
    expect(dadosCorporaisValidos(dadosBase)).toBe(true);
  });

  it("é inválido se um campo obrigatório estiver fora da faixa plausível", () => {
    expect(dadosCorporaisValidos({ ...dadosBase, idadeAnos: 5 })).toBe(false);
  });

  it("é inválido se um campo opcional preenchido estiver fora da faixa", () => {
    expect(
      dadosCorporaisValidos({ ...dadosBase, percentualGordura: 1 }),
    ).toBe(false);
  });

  it("é válido se os campos opcionais preenchidos estiverem corretos", () => {
    expect(
      dadosCorporaisValidos({
        ...dadosBase,
        percentualGordura: 15,
        cinturaCm: 85,
        pescocoCm: 38,
      }),
    ).toBe(true);
  });

  it("aceita idade a partir de 10 anos para permitir o bloqueio da SEG-01", () => {
    expect(dadosCorporaisValidos({ ...dadosBase, idadeAnos: 15 })).toBe(true);
  });
});
