# 0026 - Fixture demo Sports2D

Data: 2026-07-01

## Conceito

Uma fixture e um conjunto conhecido de entrada e saida para testar o pipeline. No volei, ela funciona como um exercicio padrao: ajuda a conferir se o fluxo esta correto antes de analisar um video real de treino.

## Decisao

Criamos um manifesto demo com video, angulos Sports2D e evidencia normalizada ja existentes. Ele valida a conexao `manifesto -> worklist -> runner -> processador -> tela`, mas nao vale como analise real da Isa.

## Comandos

- `npm run video:sports2d:worklist:demo`
- `npm run video:sports2d:run:demo`
- `npm run video:clips:process:demo`

## Regra de produto

O demo prova o encanamento tecnico. A evolucao esportiva continua exigindo clip real, criterio do fundamento, evidencia revisavel e checagem manual.
