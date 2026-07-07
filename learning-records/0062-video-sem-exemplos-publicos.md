# 0062 - Video sem exemplos publicos

## Decisao

Removemos a biblioteca "Exemplos para teste" da tela de analise de exercicio.

## Por que

No treino de volei, a evidencia mais util vem do video real da atleta. Os exemplos abertos ajudavam a testar o fluxo tecnico, mas competiam visualmente com a acao principal: enviar um video curto, conferir o preview e processar a evidencia.

## Conceito de desenvolvimento

Uma tela deve ter uma acao principal clara. Quando uma secao de apoio deixa de ajudar essa acao, remover a renderizacao dela costuma ser melhor do que esconder com estilos, porque o componente deixa de ocupar espaco e deixa de criar botoes sem uso.

## Resultado esperado

A tela fica mais direta: escolha do exercicio, envio do video, preview do envio e status da analise.
