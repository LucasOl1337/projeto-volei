# 0009 - Visao geral como placar do atleta

Data: 2026-07-01

## Aprendizado

No app de treino individual, a pagina inicial deve funcionar como placar do atleta: mostrar como estao os treinos, fundamentos e registros atuais.

## Conceito de desenvolvimento

Cada tela deve ter uma responsabilidade clara. A `Visao geral` mostra estado e progresso. A aba `Plano de treino` organiza novas sessoes. A aba `Exercicios em casa` guarda sugestoes e biblioteca.

## Decisao

Removemos da pagina inicial chamadas para novos exercicios, montagem de plano e checklist de quadra. Essas orientacoes continuam nas abas especificas, para que a primeira tela nao misture progresso com sugestao.

## Resultado visivel

A `Visao geral` agora mostra apenas:

- status do atleta;
- quantidade de treinos registrados;
- medias fisica, tecnica e de fundamentos;
- dados do progresso;
- mapa visual dos fundamentos.
