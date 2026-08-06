interface Opcao<T extends string> {
  valor: T;
  rotulo: string;
}

interface CampoOpcoesProps<T extends string> {
  nome: string;
  rotulo: string;
  opcoes: Opcao<T>[];
  valorSelecionado: T | undefined;
  onChange: (valor: T) => void;
  opcional?: boolean;
}

export function CampoOpcoes<T extends string>({
  nome,
  rotulo,
  opcoes,
  valorSelecionado,
  onChange,
  opcional,
}: CampoOpcoesProps<T>) {
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
          const selecionado = valorSelecionado === opcao.valor;
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
                type="radio"
                name={nome}
                value={opcao.valor}
                checked={selecionado}
                onChange={() => onChange(opcao.valor)}
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
