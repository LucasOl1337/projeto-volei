# 0009 - Primeira evidencia MediaPipe local

Data: 2026-07-01

## Aprendizado

A primeira analise de movimento do Projeto Isa deve responder uma pergunta pequena de volei, nao tentar entender o jogo inteiro.

Nesta etapa, o app usa MediaPipe para gerar uma evidencia revisavel em clips curtos:

- Saque, ataque e bloqueio: punho acima do ombro e angulo do cotovelo.
- Recepcao e defesa: flexao de joelho no momento mais baixo.

## Conceito de desenvolvimento

Adaptar um projeto open source nao significa copiar tudo.

No basquete, projetos de arremesso usam o caminho `landmark -> angulo -> evidencia`. No volei, reaproveitamos esse caminho, mas trocamos a pergunta tecnica: em vez de "angulo de arremesso", perguntamos "contato alto no saque?" ou "base baixa na recepcao?".

## Decisao

MediaPipe fica como base do MVP no navegador porque permite testar sem backend pesado. Sports2D continua como referencia para uma fase mais forte de angulos e exportacao. Projetos especificos de volei, como Volleyball Analytics, VolleyVision e ovml, ficam como referencia para bola, quadra, evento e jogo coletivo.

## Proximo passo

Validar com um video real da atleta:

1. Gravar um clip curto de saque ou recepcao.
2. Rodar a analise local.
3. Conferir se o frame escolhido faz sentido.
4. Comparar a evidencia gerada com uma marcacao manual.
5. Ajustar o criterio antes de confiar no relatorio.

## Atualizacao: preview da pose

O card de evidencia agora pode mostrar um thumbnail comprimido do frame analisado com um esqueleto simplificado dos landmarks usados no calculo.

Isso ajuda a revisar se a IA olhou para o trecho certo do corpo. No treino, e parecido com pausar uma jogada e circular o detalhe importante: a imagem ajuda a conversa, mas a decisao tecnica ainda precisa de criterio.

## Atualizacao: confirmacao antes do relatorio

Evidencia de IA nasce como `Revisar`. Ela so deve ir para o relatorio depois de marcada como `Confirmada`.

Isso segue a logica do treino: uma sugestao pode ser util, mas antes de virar orientacao de proximo treino precisa passar pelo olhar tecnico.
