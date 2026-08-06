@AGENTS.md

# Nutricionista IA — convenções do projeto

Peça de portfólio: calculadora nutricional com plano alimentar gerado por IA e
acompanhamento semanal. Requisitos completos em `PRD.md` — leia lá antes de
implementar qualquer funcionalidade nova.

## Regra inegociável de arquitetura

> Todo cálculo numérico é feito por código TypeScript determinístico e testado.
> A IA **nunca** calcula — ela só distribui alimentos dentro dos limites que o
> código já definiu (ver PRD.md, seção 2).

Isso significa: TMB, TDEE/GET, macros, água, IMC e projeções nunca devem ser
delegados a um prompt. Se uma funcionalidade parece exigir que a IA "calcule"
algo, o cálculo deve ser extraído para uma função pura em `src/lib/calculos/`
e a IA recebe o resultado já pronto.

## Stack

- Next.js 15+ (App Router) + TypeScript, React 19
- Tailwind CSS
- Supabase (Postgres + Auth, Row Level Security em todas as tabelas)
- API Anthropic (Claude) — chamada **exclusivamente** em API Routes do
  servidor; a chave nunca é exposta ao navegador
- Recharts (gráficos), Vitest (testes)

## Convenções de código

- **Motor de cálculo (`src/lib/calculos/`):** funções puras, sem efeitos
  colaterais, sem chamadas de rede. Cobertura de testes acima de 90% (RNF-04).
- **Nomenclatura de domínio:** os termos do PRD (tmb, get, imc, macros,
  peso_kg, altura_cm etc., ver seção 6 do PRD) são usados em português tanto
  no schema do banco quanto no código do motor de cálculo, para bater com o
  vocabulário do PRD e do negócio. Código genérico (componentes, utilitários
  não ligados ao domínio, nomes de arquivo) segue o padrão em inglês do
  ecossistema React/Next.
- **Interface:** 100% em português do Brasil (RNF-08).
- **Segurança de conteúdo:** as regras SEG-01 a SEG-06 (PRD, seção RF-03) são
  aplicadas *antes* de qualquer geração de plano — não são um detalhe de UI,
  são bloqueio de fluxo.
- Sem comentários explicando o óbvio; só quando houver uma razão não óbvia
  (regra de negócio implícita, workaround).
- **Estado de formulários multi-etapa:** os dados do formulário ficam em um
  único objeto de estado, separado do controle de navegação (fase e etapa
  atual) — ver `src/app/calculadora/estadoCalculadora.ts`. Isso permite que
  ações como "editar" troquem apenas a fase, sem precisar repopular dados.

## Testes

- `npm run test` — roda a suíte uma vez
- `npm run test:watch` — modo interativo
- `npm run test:coverage` — com relatório de cobertura (v8)
- Testes ficam ao lado do código, em `*.test.ts`, dentro de `src/`

## Comandos

- `npm run dev` — ambiente local
- `npm run build` — build de produção
- `npm run lint` — ESLint (flat config, `eslint-config-next`)

## Sobre este arquivo e o AGENTS.md

Este `CLAUDE.md` é a fonte de verdade das convenções do projeto. O
`AGENTS.md` é gerado e mantido automaticamente pelo `next dev` — contém
apenas o aviso de que esta versão do Next.js pode divergir do que o modelo
já conhece, e instrui a consultar `node_modules/next/dist/docs/` antes de
codar. Não tem regras de projeto próprias, então não há conflito entre os
dois arquivos; não edite o bloco marcado `BEGIN:nextjs-agent-rules` /
`END:nextjs-agent-rules` nele, pois ele volta sozinho a cada `next dev`.
