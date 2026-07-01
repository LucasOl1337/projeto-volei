# 0032 - Mapa de metricas de movimento

## Dominio do volei

Antes de pedir para a IA analisar um video, precisamos dizer qual pergunta tecnica ela deve responder. No saque, a pergunta pode ser contato alto. Na recepcao, pode ser plataforma e base baixa. No bloqueio, pode ser queda equilibrada.

## Conceito de desenvolvimento

Um mapa de metricas e um contrato de dados: ele combina nome do fundamento, fase do movimento, articulacoes observadas, fonte de IA e checagem manual obrigatoria.

Isso evita que o codigo vire uma caixa preta. A IA nao "corrige o movimento"; ela mede um sinal combinado previamente.

## Mudanca feita

- Criado `reference/video-ai-movement-metric-map.json`.
- Criado `npm run video:movement-map` para validar o mapa.
- A tela `Videos` ganhou `Mapa de metricas de movimento`.
- `Vert Tracker` entrou como referencia conceitual para salto de volei, mas sem copiar codigo porque nao ha licenca declarada.
- `volleystat` foi rebaixado para referencia sem copia de codigo enquanto a licenca nao estiver clara.

## Proximo passo

Escolher um fundamento, gravar 3 clips curtos, rodar MediaPipe ou Sports2D onde o ambiente permitir e parear cada sugestao com checagem manual.
