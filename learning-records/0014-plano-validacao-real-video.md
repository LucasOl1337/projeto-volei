# 0014 - Plano de validacao real de video

## Dominio do volei

Um fundamento nao fica confiavel com um unico clip. Saque, recepcao, defesa, ataque e bloqueio precisam de repeticoes comparaveis, gravadas em condicoes parecidas.

Por isso, a IA deve ser testada como uma sequencia de treino: gravar, rodar analise, revisar com o treinador e so depois usar como criterio de relatorio.

## Conceito de desenvolvimento

Estado e a memoria da tela. Nesta mudanca, cada clip registrado vira um pequeno estado local: atleta, fundamento, marcador, status e data.

O app calcula um resumo a partir desses estados. Isso e parecido com uma estatistica de treino: cada jogada registrada alimenta o indicador do fundamento.

## Decisao implementada

- A tela `Videos` ganhou `Plano de validacao real`.
- O plano registra clips por fundamento em `localStorage`.
- O painel mostra clips gravados, clips revisados, rodadas de IA e checagens pareadas.
- A meta inicial continua simples: 3 clips reais revisados antes de tratar a IA como promissora naquele fundamento.

## Proximo teste real

Gravar 3 clips curtos de saque da Isa, registrar os clips no plano, rodar MediaPipe ou Sports2D e criar checagens manuais pareadas para comparar o criterio.
