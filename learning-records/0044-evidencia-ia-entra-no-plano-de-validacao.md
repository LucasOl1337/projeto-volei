# Evidencia IA entra no plano de validacao

Data: 2026-07-01

## Conceito

Uma repeticao filmada pode ter tres estados diferentes:

- gravada;
- analisada por IA;
- revisada pelo treinador.

Esses estados nao sao iguais. A IA pode sugerir um marcador, mas o criterio tecnico so fica confiavel depois da revisao manual.

## O que mudou

- Evidencias geradas pelo MediaPipe local registram automaticamente um clip no plano de validacao como `IA rodada`.
- Evidencias importadas por JSON tambem entram no plano.
- Evidencias convertidas do Sports2D tambem entram no plano.
- O painel de validacao agora mostra `IA aguardando revisao` quando ja existe sugestao automatica, mas ainda faltam checagens manuais.

## Ponte com o volei

Para `Saque - Contato`, a IA pode apontar "contato alto e braco organizado". O app agora registra que essa repeticao ja foi analisada, mas ainda pede que o treinador pause no frame e confirme se a bola estava a frente do corpo.

## Decisao

Manter a IA como sugestao revisavel. O plano de validacao e o dataset de calibracao continuam sendo a fonte de verdade para liberar qualquer recomendacao automatica.
