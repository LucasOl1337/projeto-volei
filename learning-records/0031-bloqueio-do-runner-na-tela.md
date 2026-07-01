# 0031 - Bloqueio do runner na tela

Data: 2026-07-01

## Conceito

Um erro tecnico precisa virar acao clara. Se o ambiente bloqueia a ferramenta, a resposta nao e repetir o treino; e liberar ou trocar o ambiente antes de analisar video real.

## Decisao

O runner Sports2D agora propaga `blocked-by-app-control` para o JSON `isa.sports2d-run-report.v1`. A tela `Videos` tem `Testar bloqueio`, que carrega uma amostra desse estado.

## Regra

Quando o ambiente bloqueia Sports2D, o app deve orientar WSL/Conda liberado ou ajuste da politica. Nao deve tratar isso como falta de video, falta de evidencia ou erro do fundamento.
