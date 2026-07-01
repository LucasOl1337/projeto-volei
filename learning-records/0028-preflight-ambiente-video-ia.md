# 0028 - Preflight de ambiente para video IA

Data: 2026-07-01

## Conceito

Preflight e uma checagem antes da execucao. No treino, antes do saque, conferimos bola, espaco, camera e objetivo. No codigo, antes da analise, conferimos Python, `pip`, Sports2D e o caminho dos arquivos.

## Decisao

Criamos `npm run video:env` para diagnosticar se o computador consegue rodar a etapa externa de IA.

O comando retorna:

- `needs-python`: falta Python 3.
- `needs-sports2d-install`: Python existe, mas falta Sports2D.
- `ready-for-real-clips`: ambiente pronto; o proximo gargalo sao os videos reais no manifesto.

## Regra de produto

Ambiente pronto nao significa evidencia pronta. Depois do preflight ainda precisamos de clip real, exportacao de angulos, evidencia normalizada e revisao manual.
