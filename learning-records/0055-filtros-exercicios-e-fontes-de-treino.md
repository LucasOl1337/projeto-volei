# 0055 - Filtros de exercÃ­cios e fontes de treino

## DomÃ­nio de vÃ´lei

A aba `ExercÃ­cios em casa` passa a tratar cada exercÃ­cio como uma escolha de treino: fundamento, tempo, dificuldade, material, sÃ©ries e critÃ©rio de execuÃ§Ã£o. Isso reduz repetiÃ§Ã£o e ajuda o atleta a escolher uma tarefa Ãºtil para a posiÃ§Ã£o, em vez de navegar por uma lista longa.

## Conceito de desenvolvimento

Filtro Ã© estado: a interface guarda a escolha atual do usuÃ¡rio e recalcula a lista visÃ­vel. Quando o atleta troca de posiÃ§Ã£o, os filtros voltam para `Todos`, porque a biblioteca disponÃ­vel muda.

## DecisÃµes

- Mostrar etiquetas como `sem bola`, `com parede`, `com elÃ¡stico`, `5 minutos` e `iniciante`.
- Destacar aÃ§Ãµes principais no card: `ComeÃ§ar treino`, `Registrar treino` e `Ver correÃ§Ã£o`.
- Mostrar o motivo tÃ©cnico do exercÃ­cio para a posiÃ§Ã£o antes do modo de execuÃ§Ã£o.
- Usar sÃ©ries curtas e critÃ©rio observÃ¡vel, porque treino em casa precisa ser direto e fÃ¡cil de registrar.
- Manter valores internos estÃ¡veis e traduzir os rÃ³tulos visÃ­veis com acentos para nÃ£o quebrar filtros, relatÃ³rios e lÃ³gica existente.

## Fontes consultadas

- USA Volleyball - Training Without a Net or Friends: https://usavolleyball.org/resource/training-without-a-net-or-friends/
- USA Volleyball - Lesson Plans: https://usavolleyball.org/resources-for-coaches/lesson-plans/
- USA Volleyball - Coach Tools: https://usavolleyball.org/resources-for-coaches/coaches-tools/
- FIVB Level 1 Coaches Manual: https://www.vq.org.au/wp-content/uploads/2018/03/FIVB-Level-1-Coaches-Manual-2013.pdf
- Fittoplay Volleyball / VolleyVeilig: https://fittoplay.org/sports/volleyball/volleyball/
- AAOS Volleyball Injury Prevention: https://orthoinfo.aaos.org/en/staying-healthy/volleyball-injury-prevention/

## PrÃ³ximo refinamento

Auditar a biblioteca por posiÃ§Ã£o para remover exercÃ­cios muito parecidos, ajustar nomes com acento e separar melhor exercÃ­cios tÃ©cnicos, fÃ­sicos, mobilidade e leitura de jogo.

## Incremento seguinte

- Entrou um exercÃ­cio universal com elÃ¡stico: `RotaÃ§Ã£o externa e Y com elÃ¡stico`.
- A aba `FÃ­sico e Mobilidade` ganhou blocos mais especÃ­ficos por posiÃ§Ã£o:
  - ombro e escÃ¡pula para levantadors, ponteiros, opostos e centrais;
  - tornozelo e panturrilha para lÃ­bero;
  - pliometria lateral controlada para posiÃ§Ãµes com salto e deslocamento de bloqueio/ataque.
- O critÃ©rio de seleÃ§Ã£o segue a ideia de tempo otimizado: poucas sÃ©ries, execuÃ§Ã£o limpa e parar quando a qualidade cai.
- A prÃ³xima auditoria deve comparar exercÃ­cios parecidos dentro da mesma posiÃ§Ã£o e decidir qual fica, qual vira variaÃ§Ã£o e qual sai.

## Auditoria por posiÃ§Ã£o

Os cards da aba `ExercÃ­cios em casa` agora mostram uma nota de otimizaÃ§Ã£o:

- `Quando usar`: por que o exercÃ­cio vale para aquela funÃ§Ã£o em quadra.
- `Se repetir demais`: quando reduzir volume, transformar em variaÃ§Ã£o ou trocar por progressÃ£o.
- `CritÃ©rio de melhora`: o sinal observÃ¡vel que prova evoluÃ§Ã£o.

Exemplos de decisÃ£o:

- Ponteiro mantÃ©m dois exercÃ­cios de recepÃ§Ã£o porque um conecta passe com ataque e o outro treina responsabilidade de linha de passe.
- Central mantÃ©m dois blocos de bloqueio porque um Ã© base de deslocamento e outro Ã© fechamento com ponta imaginÃ¡ria.
- LÃ­bero separa postura defensiva de leitura curta/fundo para nÃ£o repetir deslocamento sem decisÃ£o.
- Oposto separa bola difÃ­cil de saÃ­da diagonal/paralela para alternar semana de soluÃ§Ã£o fora do sistema e semana de ataque planejado.
