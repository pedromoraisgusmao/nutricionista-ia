import type { BloqueioSeguranca } from "@/types";

interface TelaBloqueioProps {
  bloqueios: BloqueioSeguranca[];
  onRevisar: () => void;
}

export function TelaBloqueio({ bloqueios, onRevisar }: TelaBloqueioProps) {
  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-xl font-semibold text-black dark:text-zinc-50">
        Não foi possível gerar seus resultados
      </h1>

      <div className="flex flex-col gap-4">
        {bloqueios.map((bloqueio) => (
          <div
            key={bloqueio.regra}
            className="rounded-md border border-amber-300 bg-amber-50 p-4 text-sm text-amber-900 dark:border-amber-800 dark:bg-amber-950 dark:text-amber-200"
          >
            {bloqueio.motivo}
          </div>
        ))}
      </div>

      <p className="text-sm text-zinc-600 dark:text-zinc-400">
        Recomendamos buscar acompanhamento de um nutricionista para uma
        avaliação individualizada e segura.
      </p>

      <button
        type="button"
        onClick={onRevisar}
        className="self-start rounded-md px-4 py-2 text-sm font-medium text-zinc-700 underline dark:text-zinc-300"
      >
        Revisar respostas
      </button>
    </div>
  );
}
