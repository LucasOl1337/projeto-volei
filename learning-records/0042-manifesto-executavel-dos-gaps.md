# Manifesto executavel dos gaps de calibracao

Data: 2026-07-01

## Conceito

No volei, uma treinadora nao diz apenas "melhorar o saque". Ela define a repeticao: atleta, fundamento, fase do gesto, criterio de observacao e como registrar a evidencia.

No codigo, o manifesto faz esse mesmo papel. Ele transforma uma lista de gaps em entradas padronizadas para o pipeline executar.

## O que mudou

- Criado `npm run video:calibration:manifest`.
- O comando gera `isa.video-clip-manifest.v1` a partir de `isa.video-calibration-gap-plan.v1`.
- Cada clip planejado preserva fonte recomendada, metrica tecnica, caminhos de video, angulos Sports2D, evidencia normalizada e revisao manual obrigatoria.
- A tela `Videos` passou a indicar que os proximos pares podem virar manifesto executavel.

## Decisao

Sports2D continua como fonte de piloto por CLI, sem clonar o repositorio para dentro do produto ainda. O proximo passo confiavel e coletar clips reais curtos, gerar os arquivos de angulos, normalizar a evidencia e parear com checagem manual.

## Criterio de cuidado

Um manifesto pronto nao significa IA aprovada. Ele apenas organiza a coleta. A aprovacao depende de pares IA x manual suficientes, alinhamento tecnico e revisao final da treinadora.
