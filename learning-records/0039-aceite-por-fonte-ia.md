# 0039 - Aceite por fonte IA

## Dominio do volei

Uma fonte de IA so ajuda se ela acerta o criterio do fundamento contra revisao manual. Para saque, nao basta detectar braco alto uma vez; precisamos repetir em clips reais e comparar com o olhar tecnico.

## Conceito de desenvolvimento

Uma metrica de aceite define quando uma funcionalidade pode avancar. Aqui, a fonte precisa de pares IA x manual suficientes, alinhamento minimo e confianca media antes de entrar em piloto controlado.

## Mudanca feita

- Criado `npm run video:calibration:evaluate`.
- O dataset de calibracao ganhou `sourceReadiness`.
- O pacote piloto ganhou `sourceAcceptance`.
- A tela `Videos` mostra aceite por fonte IA no painel do pacote piloto.
- `video:pilot:evaluate` tambem retorna `sourceAcceptance`.

## Regra atual

Uma fonte fica pronta para piloto controlado quando tem:

1. pelo menos 5 checagens manuais pareadas;
2. pelo menos 80% de alinhamento IA x manual;
3. confianca media de pelo menos 0.7;
4. revisao humana final antes de relatorio.

## Estado da amostra

Sports2D esta `Em calibracao`: 1 par, 100% de alinhamento nesse par e confianca 0.82. Isso e promissor, mas ainda nao suficiente para automatizar recomendacoes.
