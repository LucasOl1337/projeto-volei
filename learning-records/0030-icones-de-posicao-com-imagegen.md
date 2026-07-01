# 0030 - Icones de posicao com Image Gen

Data: 2026-07-01

## Aprendizado

As posicoes do volei ficam mais faceis de escolher quando o card mostra uma pista visual da funcao: toque do levantador, defesa do libero, bloqueio da central, ataque do ponteiro e ataque do oposto.

## Conceito de desenvolvimento

Um asset visual deve complementar a interface, nao substituir texto e controles. Os icones ficam em `public/assets/positions/`, enquanto os cards continuam sendo HTML, CSS e dados editaveis.

## Decisao

Foram gerados icones desenhados com Image Gen e recortados em PNGs transparentes:

- `levantador-icon.png`;
- `libero-icon.png`;
- `central-icon.png`;
- `ponteiro-icon.png`;
- `oposto-icon.png`.

Cada icone segue a cor da posicao ja usada no app.
