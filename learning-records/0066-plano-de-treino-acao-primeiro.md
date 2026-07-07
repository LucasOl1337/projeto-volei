# 0066 - Plano de treino com acao primeiro

## Dominio

Quando o atleta abre o plano, a pergunta principal e simples: o que treino hoje?

Nesta mudanca, a tela `Plano de treino` passou a mostrar o treino do dia antes da grade semanal. A semana continua disponivel, mas fica como seletor de dias, nao como obstaculo antes da execucao.

## Conceito de desenvolvimento

Hierarquia de acao significa colocar a decisao principal antes das opcoes secundarias. Em codigo, isso nao exige tecnologia nova: basta ordenar os blocos pela prioridade real do usuario.

Antes:

1. Semana inteira.
2. Treino selecionado.
3. Historico.
4. Resumo.

Agora:

1. Treino do dia e botao `Concluir treino`.
2. Plano da semana.
3. Resumo simples.
4. Historico recolhido.

## Decisao de produto

O botao destrutivo `Excluir treino` nao deve competir com `Concluir treino`. Exclusao fica no historico, onde o usuario esta revisando registros, nao executando a sessao.
