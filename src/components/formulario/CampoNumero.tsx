interface CampoNumeroProps {
  id: string;
  rotulo: string;
  valor: number | undefined;
  onChange: (valor: number | undefined) => void;
  unidade?: string;
  opcional?: boolean;
  erro?: string;
}

export function CampoNumero({
  id,
  rotulo,
  valor,
  onChange,
  unidade,
  opcional,
  erro,
}: CampoNumeroProps) {
  return (
    <div className="flex flex-col gap-1">
      <label htmlFor={id} className="text-sm font-medium text-zinc-800 dark:text-zinc-200">
        {rotulo}
        {unidade ? ` (${unidade})` : ""}
        {opcional && (
          <span className="ml-1 font-normal text-zinc-500 dark:text-zinc-500">
            — opcional
          </span>
        )}
      </label>
      <input
        id={id}
        type="number"
        inputMode="decimal"
        value={valor ?? ""}
        onChange={(e) => {
          const novoValor = e.target.valueAsNumber;
          onChange(Number.isNaN(novoValor) ? undefined : novoValor);
        }}
        aria-invalid={erro ? true : undefined}
        aria-describedby={erro ? `${id}-erro` : undefined}
        className="rounded-md border border-zinc-300 bg-white px-3 py-2 text-base text-black focus:border-zinc-500 focus:outline-none dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50"
      />
      {erro && (
        <p id={`${id}-erro`} className="text-sm text-red-600 dark:text-red-400">
          {erro}
        </p>
      )}
    </div>
  );
}
