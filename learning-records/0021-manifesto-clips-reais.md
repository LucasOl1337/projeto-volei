# 0021 - Manifesto de clips reais

## Dominio do volei

Um teste de IA precisa saber exatamente quais clips entram. No volei, cada clip deve apontar para atleta, fundamento, fase do movimento e marcador tecnico.

Exemplo: `Isa - Saque - Contato - ponto de contato`.

## Conceito de desenvolvimento

Um manifesto e uma lista padronizada de arquivos e metadados. Ele evita confundir video bruto, arquivo de angulos e evidencia normalizada.

No Projeto Isa, o manifesto organiza:

- video bruto;
- exportacao Sports2D;
- evidencia normalizada;
- revisao manual obrigatoria.

## Decisao implementada

- A tela `Videos` ganhou `Manifesto de clips reais`.
- O manifesto usa `isa.video-clip-manifest.v1`.
- O botao `Preparar manifesto` gera JSON local.
- O botao `Baixar manifesto` exporta o plano de arquivos.
- O comando `npm run video:clips` gera o manifesto pelo terminal.
- O comando `npm run video:clips:validate` valida o contrato.
- O comando `npm run video:clips:check-files` confere se os arquivos reais ja existem.

## Preflight

O preflight da tela verifica se todos os clips tem caminhos planejados para video bruto, Sports2D, evidencia normalizada e revisao manual.

O preflight de terminal pode ir alem: com `--check-files`, ele procura os arquivos no disco. Enquanto os videos reais ainda nao foram colocados nas pastas, o resultado esperado e `needs-files`.

## Proximo teste real

Gravar 3 clips reais de `Saque - Contato`, salvar com os caminhos do manifesto, rodar Sports2D, normalizar a evidencia e parear com revisao manual.
