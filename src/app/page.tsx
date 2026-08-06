import Link from "next/link";

export default function Home() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center bg-zinc-50 px-6 text-center dark:bg-black">
      <main className="flex max-w-xl flex-col items-center gap-4">
        <h1 className="text-3xl font-semibold tracking-tight text-black dark:text-zinc-50">
          Nutricionista IA
        </h1>
        <p className="text-lg leading-8 text-zinc-600 dark:text-zinc-400">
          Cálculo de necessidades nutricionais e plano alimentar
          personalizado, com acompanhamento semanal da evolução.
        </p>
        <Link
          href="/calculadora"
          className="mt-2 rounded-md bg-zinc-900 px-6 py-3 text-base font-medium text-white dark:bg-zinc-50 dark:text-black"
        >
          Calcular minhas necessidades
        </Link>
      </main>
    </div>
  );
}
