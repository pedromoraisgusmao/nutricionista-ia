# PRD — Nutricionista IA

**Versão:** 1.0
**Autor:** Pedro
**Data:** Agosto de 2026
**Status:** Aprovado para desenvolvimento

---

## 1. Visão geral

Aplicação web que calcula as necessidades energéticas e nutricionais de uma pessoa a partir de seus dados corporais e nível de atividade física, gera um plano alimentar es
truturado com apoio de IA, e acompanha a evolução do usuário semanalmente, ajustando o plano conforme os resultados reais.

**Problema que resolve:** acompanhamento nutricional individualizado é caro e pouco acessível. Calculadoras online entregam apenas um número solto, sem plano prático nem adaptação ao longo do tempo.

**Diferencial:** o ciclo de feedback semanal. O sistema não entrega um plano estático — ele mede o resultado real e recalibra.

**Objetivo do projeto:** peça central de portfólio, com arquitetura preparada para virar produto comercial sem reescrita.

---

## 2. Princípio de arquitetura (regra inegociável)

> **Todo cálculo numérico é feito por código determinístico. A IA nunca calcula. A IA apenas distribui alimentos dentro dos limites que o código já definiu.**

| Responsabilidade | Executor |
|---|---|
| TMB, TDEE, macros, água, IMC, projeções | Código TypeScript puro, testado |
| Escolha de alimentos, montagem de refeições, substituições, texto explicativo | API do Claude |
| Validação de que o plano gerado bate com as metas | Código TypeScript puro |

Se a IA devolver um plano cujo total calórico se desviar mais de 5% da meta, o código rejeita e solicita nova geração (máximo de 3 tentativas).

---

## 3. Stack técnica

- **Framework:** Next.js 15 ou superior (App Router) + TypeScript
- **Estilo:** Tailwind CSS
- **Banco de dados e autenticação:** Supabase (PostgreSQL + Supabase Auth)
- **IA:** API Anthropic (Claude), chamada exclusivamente no servidor
- **Gráficos:** Recharts
- **PDF:** react-pdf ou Puppeteer
- **Testes:** Vitest
- **Hospedagem:** Vercel
- **PWA:** manifest + service worker para instalação na tela inicial

**Restrição de segurança:** a chave da API Anthropic vive apenas em variável de ambiente no servidor. Nunca é exposta ao navegador. Toda chamada à IA passa por uma API Route do Next.js.

---

## 4. Requisitos funcionais

### RF-01 — Cadastro de dados do usuário
Formulário em etapas, com barra de progresso.

**Obrigatórios:**
- Sexo biológico (masculino / feminino)
- Idade (anos)
- Peso (kg)
- Altura (cm)
- Dias de treino por semana (0 a 7)
- Duração média da sessão de treino (minutos)
- Objetivo (perder gordura / manter / ganhar massa)
- Ritmo desejado (leve / moderado / agressivo)
- Gestação ou amamentação (sim / não) — resposta explícita obrigatória, sem valor padrão assumido
- Condição de saúde relevante: diabetes, doença renal, doença cardíaca ou transtorno alimentar (sim / não) — resposta explícita obrigatória, sem valor padrão assumido

**Nível de atividade física é derivado, não escolhido pelo usuário:** uma
função de mapeamento (dias de treino por semana × duração média da sessão)
calcula automaticamente qual dos cinco níveis do RF-02 se aplica — tabela
de conversão em RF-02, "Nível de atividade física (derivado)".
Motivo da mudança: o usuário se autoavalia mal entre categorias vizinhas
como "levemente ativo" e "moderadamente ativo"; dias e minutos são dados
objetivos, a categoria é inferida pelo sistema, não escolhida em uma lista.

A mesma dupla de campos (dias de treino, duração média da sessão) também é
a origem de `horasTreinoDia`, usado no cálculo de hidratação (RF-02).

**Opcionais:**
- Percentual de gordura corporal
- Circunferências: cintura, quadril, pescoço
- Número de refeições por dia (3 a 6)
- Restrições alimentares (vegetariano, vegano, sem lactose, sem glúten, outros)
- Alergias e intolerâncias (campo livre)
- Alimentos preferidos e rejeitados
- Nível de orçamento (econômico / médio / sem restrição)
- Disponibilidade para cozinhar (cozinha diariamente / faz marmita semanal / depende de comida pronta)

Todos os campos numéricos com validação de faixa plausível e mensagem de erro clara.

### RF-02 — Motor de cálculo
Funções puras, sem efeitos colaterais, cobertas por testes unitários.

**Taxa Metabólica Basal:**
- Padrão — Mifflin-St Jeor
  - Homens: `(10 × peso) + (6,25 × altura) − (5 × idade) + 5`
  - Mulheres: `(10 × peso) + (6,25 × altura) − (5 × idade) − 161`
- Quando houver percentual de gordura informado ou estimado — Katch-McArdle
  - `370 + (21,6 × massa magra em kg)`

**Estimativa de percentual de gordura** (quando circunferências forem fornecidas, método da Marinha dos EUA), usada como entrada da Katch-McArdle.

**Nível de atividade física (derivado):** calculado a partir dos minutos
semanais de treino (dias por semana × duração média da sessão, RF-01) —
não é escolhido pelo usuário.

| Minutos semanais de treino | Nível |
|---|---|
| 0 | Sedentário |
| 1 a 150 | Levemente ativo |
| 151 a 300 | Moderadamente ativo |
| 301 a 450 | Muito ativo |
| Acima de 450 | Extremamente ativo |

**Gasto Energético Total:** TMB × fator de atividade

| Nível | Fator |
|---|---|
| Sedentário | 1,2 |
| Levemente ativo | 1,375 |
| Moderadamente ativo | 1,55 |
| Muito ativo | 1,725 |
| Extremamente ativo | 1,9 |

**Meta calórica:**

| Ritmo | Perder gordura | Ganhar massa |
|---|---|---|
| Leve | −10% do GET | +5% do GET |
| Moderado | −20% do GET | +10% do GET |
| Agressivo | −25% do GET | +15% do GET |

Manutenção: meta = GET.

**Conversão de déficit calórico em projeção de perda de peso:** 1 kg de
gordura corporal ≈ 7.700 kcal (aproximação de Wishnofsky). Usada na regra
SEG-05 (RF-03) como teto de segurança para limitar o ritmo a no máximo 1%
do peso corporal por semana — não é uma previsão exata de perda.

**Distribuição de macronutrientes:**
- Proteína: 1,6 g/kg (manutenção) · 2,0 g/kg (perda de gordura) · 1,8 g/kg (ganho de massa)
- Gordura: 25% das calorias totais, com piso de 0,8 g/kg
- Carboidrato: calorias restantes ÷ 4

**Hidratação:** 35 ml por kg de peso + 500 ml por hora de treino **no
dia**. O cálculo recebe as horas de treino do dia específico, não uma
média semanal — a interface (Fase 2) exibe os dois valores lado a lado:
hidratação em dia de treino e hidratação em dia de descanso.

**Indicadores adicionais:** IMC com classificação, faixa de peso saudável pela altura, e projeção de semanas até a meta.

### RF-03 — Camada de segurança e conformidade
Aplicada **antes** de qualquer geração de plano. Bloqueio significa: não gerar plano, exibir mensagem explicativa e recomendar procurar nutricionista.

| ID | Regra | Ação |
|---|---|---|
| SEG-01 | Idade menor que 18 anos | Bloquear |
| SEG-02 | Usuária indica gestação ou amamentação | Bloquear |
| SEG-03 | IMC abaixo de 18,5 **e** objetivo de perder peso | Bloquear |
| SEG-04 | Meta calórica calculada abaixo de 1.200 kcal (feminino) ou 1.500 kcal (masculino) | Elevar ao piso e avisar o usuário do ajuste |
| SEG-05 | Ritmo implicando perda maior que 1% do peso corporal por semana | Limitar automaticamente a 1% |
| SEG-06 | Usuário informa condição de saúde relevante (diabetes, doença renal, doença cardíaca, transtorno alimentar) | Bloquear |

**Aviso legal obrigatório**, exibido no rodapé de todas as telas, na tela de resultados e no PDF exportado:

> Esta ferramenta tem caráter educativo e informativo. Os valores apresentados são estimativas baseadas em fórmulas populacionais e não constituem prescrição dietética. A prescrição de dietas individualizadas é atividade privativa de nutricionista registrado no Conselho Federal de Nutricionistas. Consulte um profissional antes de iniciar qualquer plano alimentar.

Aceite explícito dos termos no primeiro acesso, com registro em banco.

### RF-04 — Geração do plano alimentar
Chamada à API do Claude a partir do servidor, recebendo em JSON estruturado.

**O prompt deve conter:**
- Meta calórica e macros em gramas, já calculados
- Número de refeições e horários
- Restrições, alergias, preferências e rejeições
- Nível de orçamento e disponibilidade para cozinhar
- Instrução para usar alimentos comuns no Brasil, com quantidades em gramas ou medidas caseiras
- Instrução para retornar exclusivamente JSON, sem texto adicional

**Resposta esperada:** objeto com lista de refeições, cada uma contendo nome, horário, itens (alimento, quantidade, calorias, proteína, carboidrato, gordura) e totais da refeição.

**Validação obrigatória após a resposta:**
1. O JSON parseia corretamente
2. O total calórico está dentro de ±5% da meta
3. A proteína total está dentro de ±10% da meta
4. Nenhum alimento das restrições ou alergias aparece no plano

Falhando qualquer item, reenviar com o erro descrito no prompt. Após 3 tentativas, exibir erro amigável.

### RF-05 — Substituições
Para cada item do plano, oferecer de 2 a 3 alternativas com equivalência calórica e de macros aproximada. Gerado junto com o plano, na mesma chamada.

### RF-06 — Contas de usuário
Cadastro e login por e-mail e senha (Supabase Auth). Cada usuário acessa exclusivamente seus próprios dados, garantido por Row Level Security no banco. Área logada com perfil, plano vigente e histórico.

### RF-07 — Acompanhamento semanal
Coração do produto.

- Check-in semanal: peso atual e, opcionalmente, circunferências
- Gráfico de evolução do peso ao longo do tempo
- Comparação entre a perda/ganho projetado e o real

**Lógica de recalibração**, executada a cada check-in:

| Situação | Ação |
|---|---|
| Variação de peso dentro de ±20% do previsto | Manter plano |
| Peso estagnado por 2 check-ins consecutivos, objetivo de perda | Reduzir a meta em 100 kcal, respeitando SEG-04, e regenerar o plano |
| Peso estagnado por 2 check-ins consecutivos, objetivo de ganho | Aumentar a meta em 150 kcal e regenerar |
| Perda maior que 1,2% do peso por semana | Aumentar a meta em 150 kcal e alertar o usuário |
| Variação de peso maior que 3 kg desde o cadastro | Recalcular TMB e GET com o peso atual |

Toda alteração automática deve ser explicada ao usuário em linguagem simples.

### RF-08 — Lista de compras
Consolidação dos alimentos do plano para 7 dias, agrupados por categoria (hortifrúti, proteínas, mercearia, laticínios), com quantidades somadas.

### RF-09 — Exportação em PDF
Plano completo, números calculados, lista de substituições, lista de compras e aviso legal.

---

## 5. Requisitos não funcionais

- **RNF-01** — Responsivo, projetado primeiro para celular
- **RNF-02** — Geração completa do plano em até 30 segundos, com indicador de carregamento
- **RNF-03** — Chaves de API exclusivamente no servidor
- **RNF-04** — Motor de cálculo com cobertura de testes acima de 90%
- **RNF-05** — Acessibilidade: contraste adequado, navegação por teclado, rótulos em todos os campos
- **RNF-06** — Instalável como PWA
- **RNF-07** — Limite de requisições por usuário para conter custo de API
- **RNF-08** — Interface integralmente em português do Brasil

---

## 6. Esquema do banco de dados

**profiles** — id, user_id, sexo, data_nascimento, altura_cm, criado_em, termos_aceitos_em

**medicoes** — id, user_id, data, peso_kg, percentual_gordura, cintura_cm, quadril_cm, pescoco_cm

**preferencias** — id, user_id, nivel_atividade, objetivo, ritmo, refeicoes_por_dia, restricoes (jsonb), alergias (texto), alimentos_preferidos (texto), alimentos_rejeitados (texto), orcamento, disponibilidade_cozinhar

**calculos** — id, user_id, data, tmb, formula_usada, get, meta_calorica, proteina_g, carboidrato_g, gordura_g, agua_ml, imc

**planos** — id, user_id, calculo_id, data_geracao, conteudo (jsonb), ativo (booleano)

**checkins** — id, user_id, data, peso_kg, observacoes, ajuste_aplicado (jsonb, nulo quando não houve ajuste)

Row Level Security ativada em todas as tabelas, com política restringindo cada linha ao seu `user_id`.

---

## 7. Fases de entrega e critérios de aceite

### Fase 0 — Fundação
Repositório no GitHub, Next.js + TypeScript + Tailwind configurados, deploy automático na Vercel.
**Aceite:** página inicial acessível por URL pública, atualizando a cada push na branch principal.

### Fase 1 — Motor de cálculo
Módulo `lib/calculos/` com todas as funções do RF-02 e as regras do RF-03, sem nenhuma interface.
**Aceite:** suíte de testes passando, incluindo casos de borda (IMC baixo, piso calórico, limite de ritmo) e ao menos 3 casos com valores conferidos manualmente.

### Fase 2 — Formulário e resultados
Formulário em etapas do RF-01, tela de resultados com todos os números, avisos legais.
**Aceite:** um visitante preenche os dados e vê TMB, GET, meta e macros corretos, com os bloqueios de segurança funcionando.

### Fase 3 — Geração do plano
API Route de integração com Claude, validação da resposta, exibição do plano e das substituições.
**Aceite:** plano gerado respeita restrições e fica dentro de ±5% da meta calórica; falhas de validação disparam nova tentativa automática.

### Fase 4 — Contas
Autenticação, tabelas com RLS, área logada, persistência do perfil e dos planos.
**Aceite:** dois usuários distintos não conseguem, sob nenhuma hipótese, acessar dados um do outro.

### Fase 5 — Acompanhamento semanal
Check-in, gráfico de evolução, motor de recalibração do RF-07.
**Aceite:** estagnação simulada em 2 check-ins consecutivos produz ajuste automático da meta, com explicação exibida ao usuário.

### Fase 6 — Acabamento
Lista de compras, exportação em PDF, PWA, revisão visual e de acessibilidade.
**Aceite:** fluxo completo executado do zero em celular real, sem erros.

---

## 8. Fora do escopo desta versão

- Aplicativo mobile nativo
- Reconhecimento de alimentos por foto
- Banco de dados próprio de alimentos (TACO/TBCA) — a IA fornece os valores nesta versão
- Integração com relógios e aplicativos de atividade física
- Pagamentos e assinaturas
- Área para nutricionistas acompanharem clientes
- Prescrição de suplementação

---

## 9. Riscos

| Risco | Mitigação |
|---|---|
| IA devolver valores nutricionais imprecisos | Validação automática do total; na v2, substituir por banco TACO |
| Custo da API crescer com o uso | Limite de gerações por usuário; cache do plano vigente |
| Escopo grande demais para o tempo disponível | Fases independentes, cada uma entregando algo apresentável |
| Questionamento legal sobre prescrição | Posicionamento educativo, avisos em todas as telas, aceite registrado, bloqueios de segurança |