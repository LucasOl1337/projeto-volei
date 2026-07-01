# 0015 - Fases do movimento no video

## Dominio do volei

Um fundamento nao e um gesto unico. O saque tem preparacao, contato e finalizacao. A recepcao tem preparacao, plataforma no contato e recuperacao. Ataque e bloqueio tambem dependem do momento-chave do salto.

Para a IA ajudar de verdade, ela precisa procurar o frame certo do fundamento.

## Conceito de desenvolvimento

Uma maquina de estados divide um fluxo em etapas. No app, usamos uma versao simples: fases do movimento.

Cada fase tem uma funcao clara, como jogadoras em uma equipe. A preparacao organiza o corpo, o contato gera a evidencia principal e a finalizacao mostra controle para repetir o movimento.

## Decisao implementada

- A tela `Videos` ganhou o painel `Fases do movimento`.
- Cada fundamento mostra tres fases e um momento-chave.
- A decisao adapta ideias de projetos de basquete sem copiar codigo ou trazer backend pesado.
- Essa camada orienta futuras regras de MediaPipe e Sports2D.
- O contrato de evidencia agora aceita `phase`, e o app mostra essa fase nos cards e no plano de validacao real.

## Proximo teste real

Ao registrar um clip, escolher qual fase esta sendo validada. Para o primeiro saque real da Isa, o marcador recomendado e `Contato`: punho alto, cotovelo estendido e bola a frente do corpo.
