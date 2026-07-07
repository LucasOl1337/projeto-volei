# 0081 - Release 0.1.1 com auditoria de agentes

## Dominio de volei

Um patch de produto e como fechar um ciclo de treino: revisar o que foi executado, separar evidencia real de ruido e registrar a proxima evolucao.

## Conceito aprendido

Release notes nao sao lista de arquivos. Elas traduzem mudancas de codigo em valor para atleta, treinador e produto.

## Decisoes

- A base oficial anterior foi `origin/main` no commit `e12066d`.
- A versao do projeto subiu de `0.1.0` para `0.1.1`.
- A auditoria incluiu CODEX, CLAUDE, ZCODE e WISPR FLOW; apenas CODEX deixou evidencia local verificavel por branch, reflog e documento.
- Mudancas sem assinatura de agente foram avaliadas por conteudo, build e impacto no app, nao por autoria declarada.
- `public/assets/videos/` passou a poder entrar no Git porque o app publico referencia esses arquivos.
- A arte do patch notes foi salva em `public/assets/release-0.1.1-patch-notes.png`.
- Os caminhos de `index.html`, `src/static-app.js` e `src/static-style.css` passaram a ser relativos para funcionar no GitHub Pages do projeto.

## Verificacao

- `npm run build`
- `git diff --check`
- Revisao de remoto com `git fetch --all --tags --prune`
- Conferencia de branches `swarm/*` e worktrees laterais

## Proxima melhoria

Depois do patch, o proximo treino de codigo deve reduzir o tamanho de `src/static-app.js` e escolher explicitamente se o produto publico continua estatico ou volta para o fluxo React/Vite.
