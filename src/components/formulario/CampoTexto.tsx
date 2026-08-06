interface CampoTextoProps {
  id: string;
  rotulo: string;
  valor: string | undefined;
  onChange: (valor: string | undefined) => void;
  opcional?: boolean;
  placeholder?: string;
}

export function CampoTexto({
  id,
  rotulo,
  valor,
  onChange,
  opcional,
  placeholder,
}: CampoTextoProps) {
  return (
    <div className="flex flex-col gap-1">
      <label htmlFor={id} className="text-sm font-medium text-zinc-800 dark:text-zinc-200">
        {rotulo}
        {opcional && (
          <span className="ml-1 font-normal text-zinc-500 dark:text-zinc-500">
            — opcional
          </span>
        )}
      </label>
      <textarea
        id={id}
        rows={2}
        value={valor ?? ""}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value === "" ? undefined : e.target.value)}
        className="rounded-md border border-zinc-300 bg-white px-3 py-2 text-base text-black focus:border-zinc-500 focus:outline-none dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50"
      />
    </div>
  );
}
