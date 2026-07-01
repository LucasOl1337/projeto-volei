# 0018 - Dataset de calibracao IA x manual

## Dominio do volei

Para adaptar IA ao volei, nao basta ter o video. O sistema precisa guardar o que a IA sugeriu e o que a treinadora confirmou para o mesmo momento do fundamento.

Esse par e a unidade de aprendizado: `IA -> revisao manual`.

## Conceito de desenvolvimento

Um dataset e uma colecao organizada de exemplos. Cada exemplo precisa ter os mesmos campos principais para poder ser comparado depois.

No Projeto Isa, cada linha do dataset guarda fundamento, fase, marcador, leitura da IA, revisao manual e alinhamento.

## Decisao implementada

- A tela `Videos` ganhou `Dataset de calibracao`.
- O botao `Preparar dataset` gera JSON local.
- O botao `Baixar JSON` exporta o arquivo para uso em notebooks, repositorios externos ou scripts de comparacao.
- O JSON usa `isa.video-calibration-dataset.v1`.
- O dataset inclui prontidao por fase, clips do plano e pares IA x manual.
- O comando `npm run video:calibration` valida a amostra `reference/sample-video-calibration-dataset.json`.

## Proximo teste real

Depois de 3 clips reais de `Saque - Contato`, exportar o dataset e usar como referencia para comparar MediaPipe local, Sports2D e qualquer repositorio externo adaptado.
