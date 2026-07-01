# 0037 - Roteador de fontes de video IA

## Dominio do volei

Cada fundamento pede uma pergunta tecnica diferente. No saque, a prioridade pode ser contato alto. Na recepcao, base baixa e plataforma. No bloqueio, alcance e queda precisam ser separados.

## Conceito de desenvolvimento

Um roteador escolhe qual ferramenta executa uma tarefa. No Projeto Isa, o roteador cruza fundamento, fase, metrica e fonte disponivel antes de decidir se a primeira tentativa deve ser Sports2D, MediaPipe ou apenas uma referencia futura.

## Mudanca feita

- Criado `npm run video:sources:route`.
- O comando gera `isa.video-ai-source-route.v1`.
- O manifesto de clips passou a incluir `recommendedSource` em cada `metricTargets`.
- O preflight do manifesto valida `Fonte IA escolhida por metrica`.
- A tela `Videos` mostra `Fonte escolhida` no mapa de metricas e `Fonte IA` no manifesto.

## Decisao

Com o candidato atual `Sports2D`, as 8 metricas planejadas sao roteadas para `Sports2D` como `pilot-with-manual-review`. MediaPipe continua como alternativa local no navegador, e fontes de volei coletivo seguem como referencia ate existir pergunta real de bola/quadra.

## Proximo passo

Usar clips reais curtos da Isa, gerar angulos onde o ambiente permitir e comparar a evidencia de IA contra revisao manual pareada.
