# 0038 - Evidencia com fonte IA roteada

## Dominio do volei

Quando uma analise marca contato alto, base baixa ou queda do bloqueio, precisamos saber tambem quem mediu esse sinal: MediaPipe no navegador, Sports2D por angulos ou uma referencia futura. Sem isso, a revisao fica sem origem tecnica.

## Conceito de desenvolvimento

Propagacao de contrato significa manter um campo importante vivo em todo o fluxo. No Projeto Isa, `recommendedSource` nasce no roteiro de fontes e agora acompanha `metricTargets` ate a evidencia revisavel.

## Mudanca feita

- O normalizador MediaPipe completa `recommendedSource`.
- O adaptador Sports2D grava `recommendedSource`.
- O processador do manifesto preserva a rota no relatorio.
- O validador de evidencia exige `recommendedSource` para evidencias de IA/pose com `metricTargets`.
- A tela mostra `Fonte IA` dentro do alvo tecnico do card.
- As fixtures demo foram atualizadas para o contrato novo.

## Decisao

Evidencia automatica precisa responder duas perguntas antes de relatorio:

1. Qual criterio de volei foi medido?
2. Qual fonte de IA tentou medir esse criterio?

Mesmo com essas respostas, o status continua `Revisar` ate existir checagem manual pareada.

## Proximo passo

Rodar a mesma estrutura com video real curto da Isa e comparar a rota Sports2D/MediaPipe com observacao manual.
