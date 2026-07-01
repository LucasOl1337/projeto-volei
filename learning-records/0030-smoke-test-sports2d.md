# 0030 - Smoke test Sports2D

Data: 2026-07-01

## Conceito

Instalar uma ferramenta nao prova que ela executa. O smoke test e o primeiro saque do treino: confirma se a ferramenta realmente responde antes de colocar um video real na analise.

## Descoberta

Sports2D foi instalado em `.venv-video-ai/`, mas o Windows bloqueou a execucao direta de `sports2d.exe` e tambem bloqueou uma DLL nativa usada pelo pacote `rtoml`.

## Decisao

O preflight `npm run video:env` agora retorna `blocked-by-app-control` quando a instalacao existe, mas a politica do sistema impede a execucao.

## Proximo passo

Executar Sports2D em um ambiente permitido, como WSL/Conda liberado, ou ajustar a politica de Controle de Aplicativo. Depois disso, repetir `npm run video:env` antes de usar clips reais.
