# 0034 - MediaPipe com alvo tecnico

## Dominio do volei

MediaPipe detecta pontos do corpo, mas o volei define a pergunta. No saque, punho e cotovelo ajudam a revisar contato alto. Na recepcao, joelho e quadril ajudam a revisar base. No bloqueio, precisamos separar alcance de queda.

## Conceito de desenvolvimento

Um mesmo dado bruto pode alimentar criterios diferentes. Por isso a evidencia agora carrega `metricTargets`: ela diz qual criterio tecnico a leitura automatica tentou medir.

## Mudanca feita

- A evidencia MediaPipe local agora salva `metricTargets`.
- O card de evidencia mostra `Alvo tecnico` e a checagem manual esperada.
- O normalizador externo preserva `metricTargets` quando um pipeline enviar esse campo.
- A amostra `reference/sample-pose-result.json` e a saida normalizada foram atualizadas.
- O mapa de metricas separa `Bloqueio - Alcance` de `Bloqueio - Queda`.

## Proximo passo

Rodar a demo MediaPipe na tela e depois repetir com um clip real curto da Isa, mantendo a evidencia como `Revisar` ate existir checagem manual pareada.
