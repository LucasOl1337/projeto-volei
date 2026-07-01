# 0033 - Metricas no manifesto e runner

## Dominio do volei

Um clip de saque, recepcao ou bloqueio nao deve ser analisado de forma generica. Ele precisa carregar a pergunta tecnica: contato alto, plataforma firme, alcance, queda equilibrada ou base baixa.

## Conceito de desenvolvimento

Propagar um campo pelo pipeline significa manter a mesma informacao em todas as etapas: tela, manifesto, worklist, runner, processador e pacote piloto.

Aqui o campo e `metricTargets`. Ele evita que o sistema perca o criterio do fundamento quando sai da interface e vai para um comando externo como Sports2D.

## Mudanca feita

- `build-video-clip-manifest.mjs` adiciona `metricTargets` a cada clip.
- `validate-video-clip-manifest.mjs` exige metrica, articulacoes e checagem manual.
- `build-sports2d-worklist.mjs` e `run-sports2d-worklist.mjs` preservam os alvos tecnicos.
- A tela `Videos` mostra a metrica no preview da worklist e na revisao do runner.
- O pacote piloto tambem carrega os alvos por fase.

## Proximo passo

Rodar o mesmo fluxo com video real em ambiente permitido. Enquanto o Windows bloquear Sports2D, o caminho e usar WSL/Conda liberado ou manter MediaPipe no navegador para a primeira rodada revisavel.
