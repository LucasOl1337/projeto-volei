# 0003 - Video IA com evidencia manual

Data: 2026-07-01

## Aprendizado

IA de video nao deve comecar como "o app corrige o movimento sozinho". Ela deve comecar como uma assistente que ajuda a transformar video em evidencia revisavel.

No volei, isso significa separar:

- Fundamento: saque, recepcao, ataque, bloqueio ou defesa.
- Movimento observado: lancamento, plataforma, passada, salto, aterrissagem.
- Indicador: angulo, ponto de contato, estabilidade, deslocamento ou tempo.
- Evidencia: trecho do video, marcacao manual e depois sugestao automatica.
- Evolucao: proxima acao no treino.

## Conceito de desenvolvimento

Dados antes de automacao.

Antes de pedir para uma IA classificar um movimento, o app precisa saber quais campos devem existir e como a treinadora vai revisar o resultado. Isso e parecido com treino: antes de cobrar velocidade no ataque, primeiro definimos a passada e o ponto de contato.

## Decisao

O Projeto Isa vai priorizar MediaPipe ou Sports2D como primeiro teste de pose e angulos em clips curtos. Projetos maiores, como Volleyball Analytics, MMPose e MMAction2, ficam como referencia para fases futuras.

## Resultado visivel

A tela de videos passou a mostrar:

- Pipeline inicial de analise.
- Marcadores planejados por fundamento.
- Evidencias que a IA poderia extrair.
- Bases open source avaliadas e riscos de cada uma.

## Evolucao seguinte

Foi criado o contrato `isa.video-evidence.v1` e um fluxo simples de importacao:

- `scripts/normalize-video-evidence.mjs` transforma uma saida externa em evidencias do Projeto Isa.
- `reference/sample-normalized-video-evidence.json` serve como exemplo copiavel.
- A tela de videos aceita colar o JSON normalizado e mostra as evidencias importadas junto das evidencias simuladas.

Isso aproxima o produto do uso real de MediaPipe ou Sports2D sem prender o app a uma biblioteca antes de validar os criterios de treino.

## Prototipo com MediaPipe controlado

O prototipo local com MediaPipe voltou para a tela publica de videos como verificacao controlada, nao como correcao automatica.

A tela agora testa se o Pose Landmarker carrega no navegador e aceita evidencias normalizadas por JSON. A deteccao frame a frame com video real ainda precisa ser validada antes de virar criterio automatico de saque, recepcao, ataque, bloqueio ou defesa.

Uma versao futura pode gerar evidencias com preview simplificado da pose. Esse desenho so deve aparecer quando ajudar a revisar se a deteccao faz sentido antes de aceitar uma metrica como evidencia.

Aprendizado importante: detectar pose nao e o mesmo que corrigir fundamento. O app transforma landmarks em perguntas revisaveis:

- O punho ficou acima do ombro?
- O cotovelo estendeu na finalizacao?
- A base teve flexao suficiente de joelho?

A resposta da IA, quando essa fase voltar, vira evidencia sugerida, nao veredito. A treinadora continua responsavel por validar contexto, criterio e proxima acao.

Conceito de desenvolvimento: separar `detectar` de `decidir`. O detector encontra pontos do corpo; o produto transforma esses pontos em evidencias; a decisao tecnica continua no criterio de treino.

## Integracao com relatorio

Cada card de evidencia pode ser enviado para o relatorio individual. Isso preenche o fundamento, a evidencia medida, a correcao principal e o proximo treino.

Aprendizado: integracao nao e apenas trocar dados entre telas. No produto de treino, a integracao precisa preservar a linha tecnica: `observacao do video -> criterio -> evidencia -> correcao -> proximo treino`.
