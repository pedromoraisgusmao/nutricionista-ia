# Publicar no GitHub e Vercel — passo a passo manual

Este roteiro é feito uma única vez, para colocar o repositório local no ar
com deploy automático a cada push na branch `main` (critério de aceite da
Fase 0 do PRD).

Onde aparecer `<SEU-USUARIO>` e `<NOME-DO-REPOSITORIO>`, troque pelo seu
usuário do GitHub e pelo nome que você quer dar ao repositório (sugestão:
`nutricionista-ia`).

---

## 1. Criar o repositório no GitHub

1. Acesse https://github.com/new
2. Nome do repositório: `<NOME-DO-REPOSITORIO>`
3. Visibilidade: pública ou privada, como preferir
4. **Não marque** nenhuma opção de "Initialize this repository with" (sem
   README, sem `.gitignore`, sem license) — o repositório local já tem
   tudo isso e commits próprios; marcar essas opções cria conflito na hora
   do push.
5. Clique em "Create repository"

O GitHub vai mostrar uma página com comandos. Ignore os que sugerem `git
init` (você já fez isso) e use os comandos abaixo.

## 2. Conectar o repositório local ao GitHub

No terminal, dentro da pasta do projeto:

```bash
git remote add origin https://github.com/<SEU-USUARIO>/<NOME-DO-REPOSITORIO>.git
git push -u origin main
```

Se o GitHub pedir autenticação, use um Personal Access Token no lugar da
senha (senha simples não é mais aceita) — gere um em
https://github.com/settings/tokens, ou autentique via `gh auth login` se
tiver o GitHub CLI instalado.

## 3. Verificar no GitHub

Recarregue a página `https://github.com/<SEU-USUARIO>/<NOME-DO-REPOSITORIO>`
e confirme que os 22 arquivos do commit inicial aparecem, na branch `main`.

---

## 4. Criar o projeto na Vercel

1. Acesse https://vercel.com/new
2. Faça login com a mesma conta do GitHub (ou conecte sua conta GitHub se
   ainda não conectou)
3. Na lista de repositórios, selecione `<NOME-DO-REPOSITORIO>` e clique em
   "Import"
4. A Vercel detecta Next.js automaticamente — não precisa mudar nada em
   "Build and Output Settings"
5. Nesta fase (Fase 0) ainda não há variáveis de ambiente para configurar
   (Supabase e Anthropic entram nas Fases 3 e 4) — pode pular a seção
   "Environment Variables" por enquanto
6. Clique em "Deploy"

O primeiro deploy leva 1-2 minutos. Ao terminar, a Vercel mostra uma URL
pública no formato `https://<nome-do-projeto>.vercel.app`.

## 5. Confirmar o critério de aceite da Fase 0

- Abra a URL pública e confirme que a página inicial "Nutricionista IA"
  carrega.
- Na Vercel, a branch `main` já fica configurada como Production Branch por
  padrão — todo `git push` para `main` dispara um novo deploy automático.
  Para testar: faça uma alteração pequena, `git commit`, `git push`, e
  acompanhe o novo deploy em `https://vercel.com/<SEU-USUARIO>/<NOME-DO-REPOSITORIO>/deployments`.

---

## Referência rápida dos comandos

```bash
# uma vez, para conectar
git remote add origin https://github.com/<SEU-USUARIO>/<NOME-DO-REPOSITORIO>.git
git push -u origin main

# depois disso, a cada novo commit
git push
```
