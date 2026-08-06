export function validarIdade(idadeAnos: number): string | undefined {
  if (Number.isNaN(idadeAnos)) return "Informe a idade.";
  if (idadeAnos < 10 || idadeAnos > 120) {
    return "Idade deve estar entre 10 e 120 anos.";
  }
  return undefined;
}

export function validarPeso(pesoKg: number): string | undefined {
  if (Number.isNaN(pesoKg)) return "Informe o peso.";
  if (pesoKg < 30 || pesoKg > 300) {
    return "Peso deve estar entre 30 e 300 kg.";
  }
  return undefined;
}

export function validarAltura(alturaCm: number): string | undefined {
  if (Number.isNaN(alturaCm)) return "Informe a altura.";
  if (alturaCm < 100 || alturaCm > 250) {
    return "Altura deve estar entre 100 e 250 cm.";
  }
  return undefined;
}

export function validarPercentualGordura(percentual: number): string | undefined {
  if (Number.isNaN(percentual)) return "Informe o percentual de gordura.";
  if (percentual < 3 || percentual > 60) {
    return "Percentual de gordura deve estar entre 3 e 60%.";
  }
  return undefined;
}

export function validarCircunferenciaCintura(cinturaCm: number): string | undefined {
  if (Number.isNaN(cinturaCm)) return "Informe a circunferência da cintura.";
  if (cinturaCm < 40 || cinturaCm > 200) {
    return "Circunferência da cintura deve estar entre 40 e 200 cm.";
  }
  return undefined;
}

export function validarCircunferenciaPescoco(pescocoCm: number): string | undefined {
  if (Number.isNaN(pescocoCm)) return "Informe a circunferência do pescoço.";
  if (pescocoCm < 20 || pescocoCm > 60) {
    return "Circunferência do pescoço deve estar entre 20 e 60 cm.";
  }
  return undefined;
}

export function validarCircunferenciaQuadril(quadrilCm: number): string | undefined {
  if (Number.isNaN(quadrilCm)) return "Informe a circunferência do quadril.";
  if (quadrilCm < 40 || quadrilCm > 200) {
    return "Circunferência do quadril deve estar entre 40 e 200 cm.";
  }
  return undefined;
}
