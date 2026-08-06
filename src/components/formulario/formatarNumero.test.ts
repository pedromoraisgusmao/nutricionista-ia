import { describe, expect, it } from "vitest";
import { formatarComDuasCasasDecimais, formatarComUmaCasaDecimal } from "./formatarNumero";

describe("formatarComUmaCasaDecimal", () => {
  it("reproduz os valores de referência do exemplo homem/25/80kg/178cm", () => {
    expect(formatarComUmaCasaDecimal(1792.5)).toBe("1792,5");
    expect(formatarComUmaCasaDecimal(2778.375)).toBe("2778,4");
    expect(formatarComUmaCasaDecimal(2222.7)).toBe("2222,7");
    expect(formatarComUmaCasaDecimal(251.675)).toBe("251,7");
  });

  it("omite a casa decimal quando o valor é um número inteiro", () => {
    expect(formatarComUmaCasaDecimal(160)).toBe("160");
    expect(formatarComUmaCasaDecimal(64)).toBe("64");
  });
});

describe("formatarComDuasCasasDecimais", () => {
  it("reproduz o IMC de referência", () => {
    expect(formatarComDuasCasasDecimais(25.2493)).toBe("25,25");
  });
});
