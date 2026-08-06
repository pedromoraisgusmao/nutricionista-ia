interface Opcao<T extends string> {
  valor: T;
  rotulo: string;
}

interface CampoMultiSelecaoProps<T extends string> {
  nome: string;
  rotulo: string;
  opcoes: Opcao<T>[];
  valoresSelecionados: T[] | undefined;
  onChange: (valores: T[]) => void;
  opcional?: boolean;
}

export function CampoMultiSelecao<T extends string>({
  nome,
  rotulo,
  opcoes,
  valoresSelecionados = [],
  onChange,
  opcional,
}: CampoMultiSelecaoProps<T>) {
  const alternar = (valor: T) => {
    if (valoresSelecionados.includes(valor)) {
      onChange(valoresSelecionados.filter((v) => v !== valor));
    } else {
      onChange([...valoresSelecionados, valor]);
    }
  };

  return (
    <fieldset className="flex flex-col gap-2">
      <legend className="text-sm font-medium text-zinc-800 dark:text-zinc-200">
        {rotulo}
        {opcional && (
          <span className="ml-1 font-normal text-zinc-500 dark:text-zinc-500">
            — opcional
          </span>
        )}
      </legend>
      <div className="flex flex-wrap gap-2">
        {opcoes.map((opcao) => {
          const selecionado = valoresSelecionados.includes(opcao.valor);
          return (
            <label
              key={opcao.valor}
              className={`cursor-pointer rounded-md border px-4 py-2 text-sm ${
                selecionado
                  ? "border-zinc-900 bg-zinc-900 text-white dark:border-zinc-50 dark:bg-zinc-50 dark:text-black"
                  : "border-zinc-300 bg-white text-zinc-800 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200"
              }`}
            >
              <input
                type="checkbox"
                name={nome}
                value={opcao.valor}
                checked={selecionado}
                onChange={() => alternar(opcao.valor)}
                className="sr-only"
              />
              {opcao.rotulo}
            </label>
          );
        })}
      </div>
    </fieldset>
  );
}
