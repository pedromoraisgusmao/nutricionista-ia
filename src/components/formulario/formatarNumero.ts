export function formatarComUmaCasaDecimal(valor: number): string {
  const arredondado = Math.round(valor * 10) / 10;
  const texto = Number.isInteger(arredondado)
    ? arredondado.toString()
    : arredondado.toFixed(1);
  return texto.replace(".", ",");
}

export function formatarComDuasCasasDecimais(valor: number): string {
  return valor.toFixed(2).replace(".", ",");
}
