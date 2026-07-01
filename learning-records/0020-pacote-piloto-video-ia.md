# 0020 - Pacote piloto de video e IA

## Dominio do volei

Para saber se uma IA ajuda no volei, precisamos testar um fundamento e uma fase especifica. Exemplo: `Saque - Contato`.

O pacote piloto organiza esse teste:

- qual projeto sera usado;
- quais clips reais entram;
- qual fase do movimento sera medida;
- quantas checagens manuais ja existem;
- qual taxa de alinhamento precisa aparecer.

## Conceito de desenvolvimento

Um piloto e um experimento pequeno com criterio de aceite. Ele nao promete que o produto inteiro esta pronto; ele prova uma parte do fluxo.

No Projeto Isa, o piloto so pode virar recomendacao automatica quando a evidencia externa bate com a revisao manual.

## Decisao implementada

- A tela `Videos` ganhou `Pacote piloto de IA`.
- O pacote usa `isa.video-ai-pilot-package.v1`.
- O botao `Preparar pacote` gera JSON local.
- O botao `Baixar pacote` exporta o experimento.
- O comando `npm run video:pilot` gera o pacote pelo terminal.
- O comando `npm run video:pilot:evaluate` avalia se os gates ja liberam piloto.

## Criterio inicial

- 3 clips reais revisados da fase.
- 5 checagens manuais pareadas.
- 80% ou mais de alinhamento.
- Revisao final da treinadora antes do relatorio.

## Proximo teste real

Rodar o pacote em `Saque - Contato` com videos reais da Isa e comparar Sports2D, MediaPipe local e checagem manual.

## Licao de produto

Um pacote valido nao significa piloto pronto. O pacote pode estar correto e ainda assim retornar `Preparar piloto` quando faltam clips reais ou checagens manuais.
