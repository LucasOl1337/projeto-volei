# 0032 - Exercicios em casa por posicao

## Dominio

O treino em casa nao substitui o treino coletivo, mas pode preparar o atleta para chegar melhor na quadra. A regra usada nesta mudanca foi: cada posicao treina em casa a decisao ou gesto que mais aparece em jogo.

- Central: leitura, bloqueio, deslocamento lateral e transicao.
- Levantador: toque, escolha de jogada e solucao para passe ruim.
- Oposto: ataque de saida, bola dificil, bloqueio e cobertura direita.
- Libero: recepcao, defesa, leitura, controle de plataforma e levantamento de emergencia.
- Ponteiro: recepcao, bola alta fora do sistema, ataque e cobertura.

## Conceito de desenvolvimento

Os exercicios foram adicionados como dados dentro de `positionContents`. Isso deixa a tela mais simples: ela so percorre a lista e desenha os cards.

E como montar uma planilha de treino antes de ir para a quadra: primeiro definimos criterio, objetivo, material, execucao e metrica; depois o app mostra isso na interface.

## Decisao de produto

A aba `Posicoes` agora mostra os exercicios especificos em casa da funcao escolhida. A aba `Exercicios em casa` tambem recebe automaticamente esses novos blocos, porque as duas telas usam a mesma fonte de dados.

Ainda mantivemos tudo manual, sem IA de video. O objetivo agora e ter criterios melhores para treinar, registrar e comparar evolucao.
