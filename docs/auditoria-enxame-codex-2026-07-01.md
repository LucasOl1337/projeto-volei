# Auditoria do enxame Codex - 2026-07-01

## Linha de base

- Base real antes das execucoes de produto: commit `e12066d407c051adf11f026d1d3035344b02e67a`, branch `main` / `origin/main`, mensagem `salva estado inicial do projeto volei`, criado em 2026-07-01 16:57:18 -03:00.
- Chat de setup do agendamento: `019f2046-927b-72a2-ba98-665ce5c9a32f`, iniciado em 2026-07-01 21:42 BRT. Resultado: criou a automacao `enxame-continuo-projeto-isa-5min`; nao foi melhoria de produto.
- Primeira execucao de produto: `019f204b-7305-71e3-99f4-a430687493fd`, iniciada em 2026-07-01 21:47 BRT.
- Estado final auditado: workspace principal em `main` ainda no `e12066d`, com mudancas nao commitadas. O app publico carrega `src/static-app.js` via `index.html`, nao o fluxo React de `src/App.tsx`.

## Sessoes lidas em ordem cronologica

| # | Inicio BRT | Sessao | Objetivo declarado | Arquivos tocados/logados | Resultado real |
|---|---:|---|---|---|---|
| 0 | 21:42 | `019f2046` | Criar agendamento do enxame | automacao Codex, sem commit de repo | Sucesso de setup; no-op para produto |
| 1 | 21:47 | `019f204b` | Cadastro rapido alimentar indicadores e evidencias | `src/App.tsx`, `TrainingPage.tsx`, `Dashboard.tsx`, `ReportsPage.tsx`, `SupportPages.tsx`, `learning-records/0056...` | Parcial: commit `15b27a1`, mas invisivel no app atual porque `index.html` usa `static-app.js` |
| 2 | 21:52 | `019f2050` | Semear dados de relatorio/evolucao | `src/data/volleyball.ts`, `learning-records/0046...`, `SWARM_COORDINATION.md` | Parcial: commit `d796fa1`; parte foi sobrescrita no workspace atual |
| 3 | 21:57 | `019f2054` | Menu mobile prioritario | `src/components/Layout.tsx`, `learning-records/0058...` | Parcial: commit `e854bba`; nao aplicado no app publico atual |
| 4 | 22:02 | `019f2059` | Status textual no `ScorePill` | `src/components/Primitives.tsx`, `learning-records/0045...`, `SWARM_COORDINATION.md` | Parcial: commit `88476f3`; branch lateral, nao integrado |
| 5 | 22:07 | `019f205d` | Gate manual antes de usar evidencia de IA no relatorio | `src/static-app.js`, `src/static-style.css`, `learning-records/0057...` | Sucesso tecnico em commit `b88ab0a`; esse tipo de mudanca e compativel com o app publico |
| 6 | 22:12 | `019f2062` | Hierarquia visual/foco em secoes | `src/index.css`, `learning-records/0059...` | Parcial: commit `81d87d6`; nao integrado no app publico atual |
| 7 | 22:17 | `019f2066` | Evolucao por fundamento | nenhum commit; parou apos leitura de coordenacao | Falhou/no-op |
| 8 | 22:22 | `019f206b` | Resumo de evidencias por fundamento no relatorio | nenhum commit; parou apos tentativa de titulo/coord | Falhou/no-op |
| 9 | 22:27 | `019f2070` | Clareza dos registros de fundamento | tentativa de criar worktree `ProjetoIsa-swarm-registro-evidencia-fundamento`; nao existe no disco | Falhou/no-op |

## Cruzamento log x diff

- Commits rastreaveis do enxame somam, por delta de commit, cerca de `+772/-110` linhas. A cadeia principal de swarm ate `e854bba` tem `14` arquivos, `+657/-46`.
- Branches laterais: `88476f3` tem `+35/-8` em 3 arquivos; `81d87d6` tem `+64/-0` em 2 arquivos.
- Workspace principal atual tem `42` arquivos rastreados modificados, `+2819/-871`, mais `24` arquivos nao rastreados. Desses nao rastreados, `21` sao docs/learning records (~197 linhas) e `3` sao PNGs (~5,77 MB).
- Divergencia principal: varias melhorias claimadas existem em branches, mas nao no app que abre hoje. Isso inclui menu mobile React, `ScorePill` com status e CSS global de hierarquia/foco.
- Mudancas existentes sem log nas sessoes 21:47-22:27: grande expansao em `src/static-app.js` e `src/static-style.css` sobre onboarding, videos, filtros, treino do dia, amostras de video e leitura de jogo. Ha learning records para isso, mas nao correspondem aos logs do enxame auditado.
- Sessoes se desfizeram/atropelaram: houve reset de `b83f685` para `b88ab0a` antes de recriar `e854bba`; `88476f3` foi amend de `eff6737`; a worktree compartilhada trocou de branch enquanto sessoes ainda rodavam.

## Lista 1 - O que foi feito tecnico

1. Feature - registro/relatorio: foi criado um fluxo React para cadastro rapido alimentar indicadores e relatorios (`15b27a1`, 6 arquivos, `+235/-28`). Valor tecnico real, mas fora do entrypoint publico.
2. Feature - dados simulados: foram adicionados dados de evolucao de atleta em `src/data/volleyball.ts` (`d796fa1`, 3 arquivos, `+158/-10`). Parcialmente perdido/sobrescrito no workspace atual.
3. Feature/UX - video manual antes de IA: foi adicionado gate de revisao manual em `src/static-app.js` e estilos (`b88ab0a`, 4 arquivos, `+215/-18`). Esta e a entrega mais alinhada ao produto publico.
4. UX - navegacao mobile React: `Layout.tsx` ganhou proposta de menu inferior mobile (`e854bba`, 2 arquivos, `+65/-6`). Invisivel para usuario do app atual.
5. UX/acessibilidade - status de nota: `ScorePill` ganhou status textual, tooltip e `aria-label` (`88476f3`, 3 arquivos, `+35/-8`). Nao integrado.
6. UX/acessibilidade - hierarquia/foco: `src/index.css` ganhou trilho visual e foco visivel (`81d87d6`, 2 arquivos, `+64/-0`). Nao integrado no entrypoint estatico.
7. Docs - learning records de apoio: varios registros foram criados/alterados. Parte e util para rastreabilidade; parte virou ruido porque nao corresponde ao estado final integrado.
8. Infra/testes - validacao: sessoes reportaram `npm run build`, `git diff --check` e em uma worktree `npm ci`. No workspace atual, `npm run build` e `git diff --check` passam.

## Lista 2 - O que mudou na pratica para o humano

1. Usuario ve mais trabalho na tela `Videos`: ha fluxo de video mais rico, amostras, preview, processamento, evidencias e ferramentas avancadas. Valor perceptivel, mas grande e acima do passo manual recomendado.
2. Usuario nao ve as melhorias React de cadastro, menu mobile, `ScorePill` e CSS global, porque o app publico carrega `static-app.js`.
3. Usuario perde acesso direto a `Relatorio` pela navegacao principal: `pageItems` tem `relatorios`, mas `navItems` filtra essa pagina. Ainda ha botoes internos que chamam relatorio, mas a tela sumiu do menu.
4. Usuario pode perceber textos quebrados/errados: `Projeto VÃ´lei`, `FaÃ§a`, `paro`, `contro` e outros sinais de encoding/typo aparecem em dados ou UI.
5. Usuario recebe mais assets visuais de leitura de jogo e exemplos de video. Isso ajuda teste visual, mas aumenta peso do repo e precisa curadoria.
6. Mudancas puramente internas de docs/scripts sao invisiveis p/ usuario, exceto quando ajudam o time a decidir o proximo treino de desenvolvimento.

## Auditoria de qualidade e encaixe

- Risco alto: o processo confundiu duas aplicacoes: React/Vite e app estatico. Varias sessoes melhoraram React, mas o produto publicado por `index.html` usa JS estatico.
- Risco alto: trabalho concorrente em uma worktree compartilhada gerou resets, branch switching e commits duplicados/amendados. A rastreabilidade e fraca.
- Risco medio: `src/static-app.js` virou um arquivo monolitico grande demais, concentrando estado, renderizacao, video, relatorio, onboarding e regras de treino.
- Risco medio: a navegacao tem inconsistencia: `relatorios` existe mas e removido de `navItems`; numeracao tambem duplica `06`.
- Risco medio: encoding e linguagem ficaram inconsistentes. Ha mojibake em `index.html`, `Layout.tsx` e `volleyball.ts`, alem de typos em textos de treino.
- Risco medio: houve avanco forte em video/IA apesar da regra do projeto dizer que antes de IA avancada o app precisa de bons registros, criterios e fluxos manuais.
- Risco baixo/medio: os builds passam, mas nao ha teste de comportamento nem verificacao visual automatizada do fluxo principal.

## Veredito

Valor liquido: positivo, mas menor do que os logs sugerem. Eu estimaria cerca de 30-40% de valor real integrado, 30-40% de trabalho valido porem nao integrado ou invisivel, e 20-30% de ruido/rework.

Antes de considerar pronto, precisa retrabalho humano: escolher um entrypoint unico, portar ou descartar as melhorias React, restaurar `Relatorio` na navegacao, corrigir encoding/typos, reduzir o monolito `static-app.js` por modulos e reexecutar uma verificacao visual do fluxo `posicao -> treino -> video -> relatorio`.
