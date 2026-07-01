# 0016 - Fase no contrato de evidencia

## Dominio do volei

Dois clips do mesmo fundamento podem medir coisas diferentes. No saque, um clip pode validar o lancamento; outro, o contato alto; outro, o equilibrio final.

Por isso, fundamento sozinho nao basta. A evidencia precisa dizer a fase do movimento.

## Conceito de desenvolvimento

Um contrato de dados e um combinado entre partes do sistema. Se MediaPipe, Sports2D e a tela `Videos` usam o mesmo campo `phase`, todos falam a mesma lingua.

Isso e como combinar a chamada da jogada: cada pessoa sabe o que aquela palavra significa antes de executar.

## Decisao implementada

- Evidencias normalizadas aceitam `phase`.
- MediaPipe local e Sports2D preenchem fase automaticamente.
- O plano de validacao real permite escolher a fase do clip.
- Cards de evidencia mostram fase junto com atleta, tempo e confianca.
- A calibracao agora mostra prontidao por fase, para nao misturar `Contato` com `Preparacao` ou `Finalizacao`.

## Proximo teste real

Registrar clips de saque separados por fase: `Preparacao`, `Contato` e `Finalizacao`. Depois comparar se MediaPipe/Sports2D encontra o frame certo para cada uma.
