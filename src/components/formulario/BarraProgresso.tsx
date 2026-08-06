interface BarraProgressoProps {
  etapaAtual: number;
  totalEtapas: number;
  rotulo: string;
  opcional?: boolean;
}

export function BarraProgresso({
  etapaAtual,
  totalEtapas,
  rotulo,
  opcional,
}: BarraProgressoProps) {
  const percentual = (etapaAtual / totalEtapas) * 100;

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-baseline justify-between text-sm text-zinc-600 dark:text-zinc-400">
        <span>
          Etapa {etapaAtual} de {totalEtapas}
          {opcional ? " (opcional)" : ""}
        </span>
        <span className="font-medium text-zinc-900 dark:text-zinc-50">{rotulo}</span>
      </div>
      <div
        role="progressbar"
        aria-valuenow={etapaAtual}
        aria-valuemin={1}
        aria-valuemax={totalEtapas}
        className="h-2 w-full overflow-hidden rounded-full bg-zinc-200 dark:bg-zinc-800"
      >
        <div
          className="h-full rounded-full bg-zinc-900 transition-all dark:bg-zinc-50"
          style={{ width: `${percentual}%` }}
        />
      </div>
    </div>
  );
}
