# 0011 - Leitura de jogo com simulacao

Data: 2026-07-01

## Aprendizado

Leitura de jogo no volei e perceber sinais antes da bola chegar: posicao do levantador, trajetoria, postura do atacante, cobertura, bloqueio adversario e espacos vazios.

## Conceito de desenvolvimento

Antes de usar videos reais, criamos um modelo de cena. Cada cena tem contexto, pergunta, alternativas, pistas e decisao esperada. Isso deixa claro quais dados um clip real precisara guardar depois.

## Decisao

Foi criada a aba `Leitura de jogo` como um projeto novo dentro do app. Nesta fase ela usa clips simulados com perguntas do tipo:

- qual ataque parece mais provavel?
- para onde voce defenderia primeiro?
- qual espaco vazio deve ser protegido?

## Proxima evolucao

Depois, cada cena simulada pode ser substituida por um video curto real, mantendo a mesma estrutura de pergunta, pistas e resposta esperada.

## Ajuste visual

Os marcadores da quadra precisam ensinar a jogada sem siglas ambÃ­guas. Por isso, a cena passou a mostrar nomes diretos como `Atacante entrada`, `Levantador`, `Defensor` e `espaco vazio`, com cada elemento posicionado no lado correto da quadra.
