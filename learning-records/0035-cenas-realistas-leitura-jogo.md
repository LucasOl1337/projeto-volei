# 0035 - Cenas realistas para leitura de jogo

Data: 2026-07-01

## Dominio do volei

O quiz de leitura de jogo passou a usar cenas realistas de volei para treinar decisao antes da acao terminar. Cada cena precisa mostrar pistas claras: levantador, bola, atacante, bloqueio, defesa, espaco vazio e angulo de observacao.

## Conceito de desenvolvimento

Um dado de cena funciona como a ficha do exercicio. Quando a cena guarda `image`, `imageAlt`, `angle`, `fundamental`, `question`, `options`, `answer` e `cues`, o componente consegue trocar o visual sem mudar a regra do quiz.

## Decisao

Foram geradas tres imagens realistas e salvas em `public/assets/`:

- `game-reading-setter-front.png`: levantadora equilibrada perto da rede.
- `game-reading-pass-off-net.png`: visao aberta para leitura de passe fora do sistema.
- `game-reading-open-line.png`: ataque contra bloqueio com corredor de paralela.

O app agora mostra essas imagens na aba `Leitura de jogo`, mantendo as perguntas, alternativas, pistas e resposta esperada.

## Criterio de produto

As imagens nao substituem a logica do treino. Elas servem como contexto visual para melhorar a tomada de decisao. Antes de usar IA de video, o projeto continua precisando de cenas bem descritas, respostas esperadas e criterios de avaliacao revisaveis.
