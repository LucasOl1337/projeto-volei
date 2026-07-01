# 0035 - Validador de evidencia de video

## Dominio do volei

Uma evidencia de video so ajuda se responder uma pergunta tecnica clara. "O punho ficou alto?" e melhor do que "a IA viu pose". "A base ficou baixa antes do contato?" e melhor do que "o joelho dobrou em algum momento".

## Conceito de desenvolvimento

Um validador de contrato verifica se um arquivo tem todos os campos combinados antes de entrar no fluxo principal.

No Projeto Isa, `isa.video-evidence.v1` agora pode ser validado pelo comando:

```bash
npm run video:evidence:validate
```

## Mudanca feita

- Criado `scripts/validate-video-evidence.mjs`.
- Adicionados `video:evidence:validate` e `video:evidence:validate:sports2d`.
- O normalizador preserva `metricTargets`.
- O adaptador Sports2D do terminal e da tela gera `metricTargets`.
- A importacao na tela resume quantas evidencias vieram com alvo tecnico e quantas precisam revisao.
- O mapa ganhou `Saque - Finalizacao`, para a amostra MediaPipe passar sem aviso.

## Proximo passo

Usar o validador em qualquer saida externa antes de importar na tela `Videos`. Depois, parear a evidencia com checagem manual para calibrar a IA.
