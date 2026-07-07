# 0058 - Dificuldade avancado na biblioteca de exercicios

## Dominio de volei

A biblioteca de exercicios agora separa `Avancado` como uma progressao real de treino. O criterio nao e apenas fazer mais repeticoes: o nivel avancado aparece quando o exercicio exige decisao sob maior complexidade, como bola ruim, bola dificil, bola fora do sistema, pipe, bloqueio formado, bloqueio duplo ou variacao ofensiva.

## Conceito de desenvolvimento

Filtro e estado: a escolha de dificuldade fica guardada e a lista visivel e recalculada a cada interacao. Isso funciona como uma chamada de treino: quando o tecnico muda o criterio, os exercicios que combinam com aquele criterio entram na quadra.

## Decisao

- Adicionar `Avancado` ao filtro de dificuldade em `Exercicios em casa`.
- Manter `Iniciante` para execucao base e `Intermediario` para progressao fisica ou coordenativa.
- Classificar `Avancado` por sinais de decisao de jogo, nao por volume bruto.
- Alinhar o filtro da biblioteca com o nivel `Avancado` que ja existia no perfil da atleta.
