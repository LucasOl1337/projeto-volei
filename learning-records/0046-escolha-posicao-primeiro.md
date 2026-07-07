# 0046 - Escolha de posicao antes do questionario

## Dominio do volei

A primeira decisao agora e a funcao em quadra. Antes de perguntar idade, nivel, equipamentos ou tempo, o app pede que o atleta escolha se o treino sera guiado por Levantador, Libero, Central, Ponteiro ou Oposto.

## Conceito de desenvolvimento

Um fluxo de telas pode ser controlado pela ordem das condicoes no `render()`. Ao colocar a selecao de posicao antes do questionario, a tela de personalizacao aparece primeiro sem precisar duplicar a interface.

## Decisao

A pergunta simples de posicao saiu do questionario. A tela visual de personalizacao por posicao passou a ser a entrada do app, e a posicao escolhida fica salva no perfil quando o questionario termina.
