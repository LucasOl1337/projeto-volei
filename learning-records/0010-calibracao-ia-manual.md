# 0010 - Calibracao IA x manual

## Dominio do volei

Um fundamento nao vira indicador confiavel so porque apareceu no video. Primeiro existe uma leitura tecnica: qual foi o marcador, qual frame importa, o que a atleta fez e qual ajuste vem no proximo treino.

## Conceito de desenvolvimento

Calibracao e comparar duas leituras do mesmo evento. No app, a IA gera uma evidencia e a revisao manual cria outra evidencia ligada a ela por `calibrationOf`.

Esse vinculo funciona como um passe entre componentes: o card de IA passa seu `id`, a checagem manual guarda esse `id`, e o painel de calibracao mostra o par.

## Decisao implementada

- Evidencias de IA continuam nascendo como `Revisar`.
- O botao `Registrar checagem manual` cria uma evidencia manual pareada.
- O painel `Calibracao IA x manual` mostra quantas sugestoes de IA existem, quantas foram confirmadas e quantas ja tem checagem manual.
- A evidencia so deve virar automacao depois de acumular comparacoes com videos reais de volei.

## Proximo criterio

Testar com clips reais de saque, recepcao, ataque e defesa. Para cada fundamento, comparar o que a IA marcou com o que a treinadora marcou no mesmo frame.
