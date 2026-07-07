# Release 0.1.1 - Patch oficial

Data de preparo: 2026-07-06
Base publicada anterior: `e12066d407c051adf11f026d1d3035344b02e67a`
Repositorio remoto: `origin/main` em `LucasOl1337/projeto-volei`
Arte do patch notes: `public/assets/release-0.1.1-patch-notes.png`

## Resumo para GitHub

Este patch consolida o trabalho local feito apos o primeiro release publico. O foco do produto saiu de uma vitrine inicial para um MVP mais navegavel: plano de treino por posicao, progresso acionavel, biblioteca de exercicios, leitura de jogo com decisao primeiro e uma estacao de video mais limpa para revisao manual.

### Destaques

- Visao geral com menos cards e acao mais clara para continuar treino.
- Onboarding coloca posicao antes do questionario e mostra beneficios curtos antes dos cards.
- Plano de treino mostra o treino do dia como aba completa, com acao principal mais evidente.
- Exercicios em casa ganharam filtros, ficha simplificada e criterio tecnico mais objetivo.
- Fichas de exercicio agora separam quantidade de series do alvo pratico, como contatos, repeticoes ou segundos.
- Correcoes agora destacam uma correcao recomendada antes das metas secundarias.
- Progresso virou aba principal para registrar evidencia e proxima acao.
- Leitura de jogo coloca pergunta e opcoes antes da cena visual.
- Videos ganharam exemplos abertos, upload mais limpo, preview e veredito manual.
- Ferramentas avancadas de IA ficaram fora da tela publica principal, preservando o passo manual.
- Textos tecnicos de oposto, ponteiro e levantador foram corrigidos para evitar ambiguidade em treino.

### Qualidade e verificacao

- `npm run build` passou.
- `git diff --check` passou.
- `origin/main` foi atualizado antes da revisao e nao havia commits remotos novos.
- A pasta publica `public/assets/videos/` deixou de ser ignorada para evitar assets quebrados no release.
- Os caminhos publicos foram ajustados para funcionar tambem no GitHub Pages em `/projeto-volei/`.
- Como o Pages serve a raiz do repositorio, o app referencia assets versionados em `public/assets/...`.
- O app publico continua usando `index.html` + `src/static-app.js`; melhorias React paralelas foram auditadas, mas nao sao o entrypoint publicado hoje.

## Diferenca nuvem x local

Antes deste patch, a nuvem estava em `origin/main` no commit inicial `e12066d`.
O workspace local continha:

- Alteracoes rastreadas em app, estilos, dados, docs, lessons e registros de aprendizado.
- Novos registros em `learning-records/0042` ate `learning-records/0080`.
- Novos assets de leitura de jogo em `public/assets/game-reading-*-game.png`.
- Videos publicos de exemplo em `public/assets/videos/`.
- Arte de release em `public/assets/release-0.1.1-patch-notes.png`.

## Sessoes e agentes verificados

| Agente / fluxo | Evidencia local encontrada | Resultado para o release |
|---|---|---|
| CODEX | `docs/auditoria-enxame-codex-2026-07-01.md`, reflog, branches `swarm/*` e worktrees laterais. | Incluido. Sessoes Codex foram a parte mais rastreavel; entregas visiveis foram preservadas quando estavam no app estatico. |
| CLAUDE | Nao ha assinatura textual, autor Git, branch ou arquivo com `Claude` no repo local. | Incluido como delta local nao atribuido. Sem autoria verificavel, as mudancas entram por conteudo e verificacao, nao por nome de sessao. |
| ZCODE | Nao ha assinatura textual, autor Git, branch ou arquivo com `ZCode` no repo local. | Incluido como delta local nao atribuido. Sem evidencia de autoria, foi tratado como trabalho local pos-release. |
| WISPR FLOW | Nao ha assinatura textual, autor Git, branch ou arquivo com `Wispr Flow` no repo local. | Incluido como delta local nao atribuido. Os registros `0062` a `0080` cobrem parte desse periodo, mas sem assinatura de ferramenta. |

## Sessoes CODEX rastreadas

| Sessao | Objetivo | Estado |
|---|---|---|
| `019f2046` | Criar agendamento do enxame | Setup, sem mudanca de produto. |
| `019f204b` | Cadastro rapido para indicadores e evidencias | Parcial; parte ficou no React, fora do entrypoint publico. |
| `019f2050` | Dados de relatorio/evolucao | Parcial; dados foram reaproveitados/ajustados. |
| `019f2054` | Menu mobile prioritario | Parcial; branch lateral React. |
| `019f2059` | Status textual no `ScorePill` | Parcial; branch lateral React. |
| `019f205d` | Gate manual antes da IA de video | Alinhado ao app publico e mantido na linha do patch. |
| `019f2062` | Hierarquia visual e foco | Parcial; regra virou documentacao e parte visual foi absorvida. |
| `019f2066` | Evolucao por fundamento | No-op/falhou. |
| `019f206b` | Evidencias por fundamento no relatorio | No-op/falhou no log auditado, mas houve branch lateral posterior. |
| `019f2070` | Clareza dos registros de fundamento | No-op/falhou no log auditado. |

## Mudancas por area

### Treino

- Plano semanal por posicao ficou mais direto.
- Treino do dia ganhou foco de acao primeiro.
- Concluir treino local gera base para historico e progresso.

### Fundamento e atleta

- Biblioteca de exercicios em casa passou a considerar posicao, dificuldade, material e criterio observavel.
- Correcoes foram reorganizadas como metas praticas, com uma recomendacao principal.
- Textos de oposto e levantador foram corrigidos para manter criterio tecnico claro.

### Relatorio, indicador e evolucao

- Progresso ficou mais central no fluxo publico.
- Registro rapido prioriza evidencia, proxima correcao e proximo treino.
- A tela evita parecer uma gaveta de dados: resumo e acao aparecem antes dos detalhes.

### Evidencia e video

- Videos de exemplo com fonte/licenca entraram para testar a aba sem depender de material privado.
- Upload e preview foram simplificados.
- Veredito manual continua obrigatorio antes de tratar video como evidencia confiavel.
- Ferramentas avancadas de IA foram afastadas da tela publica principal.

### Leitura de jogo

- A pergunta passou a vir antes da cena.
- Novas cenas visuais de leitura de jogo apoiam decisao, cobertura e escolha de ataque.

## Riscos conhecidos

- `src/static-app.js` ainda e grande demais e concentra varias responsabilidades.
- Existem melhorias React em branches `swarm/*` que nao aparecem no app publico estatico.
- Muitos registros de aprendizado foram criados por ferramentas sem assinatura local verificavel.
- Os videos de exemplo aumentam o peso do repo; devem continuar como amostras curadas, nao como biblioteca bruta.

## Prompt da arte

Arte gerada via Image Gen com prompt de capa horizontal para patch notes de app de treino de volei, sem texto, sem logos e com quadra, bola, paineis abstratos de produto, marcadores taticos e clima premium de analise de treino.
