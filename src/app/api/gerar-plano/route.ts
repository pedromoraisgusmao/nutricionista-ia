import { NextResponse } from "next/server";
import { criarProvedorGemini } from "@/lib/ia/gemini";
import { gerarPlano } from "@/lib/ia/gerarPlano";
import { mensagemAmigavelParaErro } from "@/lib/ia/mensagemErroPlano";
import type { EntradaPromptPlano } from "@/lib/ia/prompt";

function entradaValida(corpo: unknown): corpo is EntradaPromptPlano {
  if (!corpo || typeof corpo !== "object") return false;
  const entrada = corpo as Partial<EntradaPromptPlano>;
  return (
    typeof entrada.metaCalorica === "number" &&
    typeof entrada.numeroRefeicoes === "number" &&
    typeof entrada.macros === "object" &&
    entrada.macros !== null &&
    typeof entrada.macros.proteinaG === "number" &&
    typeof entrada.macros.gorduraG === "number" &&
    typeof entrada.macros.carboidratoG === "number"
  );
}

/**
 * Só repassa números já calculados pelo motor (RF-02) para o prompt —
 * não faz nenhum cálculo aqui. Ver regra de arquitetura no CLAUDE.md.
 */
export async function POST(request: Request) {
  let corpo: unknown;
  try {
    corpo = await request.json();
  } catch {
    return NextResponse.json({ erro: "Corpo da requisição inválido." }, { status: 400 });
  }

  if (!entradaValida(corpo)) {
    return NextResponse.json(
      { erro: "Dados insuficientes para gerar o plano alimentar." },
      { status: 400 },
    );
  }

  try {
    const provedor = criarProvedorGemini();
    const plano = await gerarPlano(provedor, corpo);
    return NextResponse.json({ plano });
  } catch (erro) {
    const { mensagem, status, logTecnico } = mensagemAmigavelParaErro(erro);
    console.error("[api/gerar-plano]", logTecnico);
    return NextResponse.json({ erro: mensagem }, { status });
  }
}
