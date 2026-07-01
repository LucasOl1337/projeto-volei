# 0031 - Posicoes como abas de decisao

## Dominio

As posicoes do volei nao devem ser tratadas apenas como nomes. Cada uma tem uma decisao principal:

- Central: ler o levantador adversario e fechar bloqueio sem perder o meio.
- Levantador: distribuir a bola conforme passe, bloqueio e atacante disponivel.
- Oposto: virar bola pela saida e bloquear a ponteira adversaria.
- Libero: estabilizar recepcao, defesa e levantamento de emergencia no fundo.
- Ponteiro: equilibrar recepcao, ataque de entrada e bola fora do sistema.

## Conceito de desenvolvimento

Quando uma tela muda por escolha da usuaria, usamos estado. A posicao selecionada fica em `selectedPositionId`; o componente procura os dados dessa posicao e redesenha a mesma estrutura com conteudo diferente.

Isso e parecido com uma levantadora escolhendo a atacante: a estrutura da jogada continua, mas o destino muda conforme a leitura.

## Decisao de produto

Criamos uma pagina `Posicoes` com abas internas para cada funcao. Cada aba mostra:

- funcao em quadra;
- melhor decisao;
- erro a evitar;
- fundamentos-chave;
- indicadores;
- evidencias para relatorio;
- sugestoes de treino tecnico, tatico e fisico.

Ainda nao adicionamos IA nem analise automatica. A prioridade continua sendo registro manual bom, criterios claros e relatorios uteis.
