# 0027 - Mapa de fontes open source

Data: 2026-07-01

## Conceito

Antes de clonar um repositorio, fazemos uma auditoria de fonte. E como escolher um exercicio de treino: nao basta ele parecer bom, ele precisa ter objetivo, regra clara, material disponivel e criterio de revisao.

## Decisao

O Projeto Isa agora registra `reference/video-ai-source-audit.json` e valida com `npm run video:sources`.

- Sports2D segue como piloto por CLI e arquivos `.mot/.csv`.
- MediaPipe segue integrado no navegador.
- volleystat vira referencia especifica de volei para bola, quadra e multiplas pessoas, mas nao entra no MVP agora.
- Projetos de basquete entram como referencia de fases do gesto, nao como dependencia.
- Pose2Sim fica para cinematica 3D futura.

## Regra

Clonar codigo externo so vira uma boa decisao quando houver clip real revisado, ganho tecnico demonstravel e saida compativel com `isa.video-evidence.v1`.
