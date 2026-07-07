# Personalizacao por perfil e posicao

O app passou a abrir com um questionario em cards, um card por vez, antes da escolha final de posicao. Isso evita mostrar informacao demais no celular e combina com a logica do volei: cada pergunta entra no fluxo como uma jogada organizada.

Dados coletados no perfil:

- posicao de referencia
- idade
- altura
- nivel
- equipamentos em casa
- dores ou regioes para cuidado
- objetivo principal
- tempo disponivel
- limitacoes e espaco

Depois do questionario, o atleta confirma a posicao em cards: Levantador, Libero, Central, Ponteiro ou Oposto. A posicao confirmada fica salva no navegador e passa a filtrar fundamentos, exercicios, leitura de jogo, foco fisico, foco mental, plano semanal, relatorios, indicadores e videos.

Conceito de desenvolvimento: estado e a informacao que muda com a interacao. Neste passo, o perfil e a posicao escolhida viraram estados salvos localmente. A interface le esses estados e monta o treino certo para aquela pessoa.
