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
        <p className="text-sm text-zinc-500 dark:text-zinc-500">
          Projeto em construção.
        </p>
      </main>
    </div>
  );
}
