# 0029 - Ambiente local Sports2D

Data: 2026-07-01

## Conceito

Um ambiente virtual Python e uma caixa de materiais exclusiva do projeto. Ele evita misturar o Sports2D do Projeto Isa com pacotes de outros trabalhos da maquina.

## Decisao

Criamos `npm run video:env:setup` para montar `.venv-video-ai/` e instalar Sports2D ali. O preflight `npm run video:env` e o runner Sports2D passam a procurar esse ambiente local antes do Python global.

## Regra de produto

Ambiente local pronto ainda nao significa analise confiavel. Ele so resolve o material tecnico. A evidencia real ainda precisa de video curto, angulos exportados, normalizacao e revisao manual.
