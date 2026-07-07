# Pesquisa: IA para video e movimento no volei

Data: 2026-07-01

## Pergunta

Como evoluir o modulo de videos para analisar movimentos de volei com IA sem pular a etapa de bons registros, criterios manuais e evidencias revisaveis?

## Decisao inicial

Nao clonar um repositorio pesado diretamente para dentro do app agora.

Em vez disso, o Projeto Isa passa a ter um contrato interno de evidencia de video. O contrato esta documentado em `docs/video-ai-integration-contract.md` e pode receber resultados de MediaPipe, Sports2D ou outra base futura.

Atualizacao de produto: o prototipo local com MediaPipe esta na tela publica de videos como verificacao controlada. Ele confirma que o modelo de pose carrega no navegador, mas a evidencia tecnica ainda deve ser importada/revisada antes de entrar no relatorio.

O primeiro caminho deve ser:

1. Registrar clips curtos por fundamento.
2. Marcar manualmente tempo, fundamento, atleta e criterio.
3. Testar extracao de pose e angulos em clips curtos, primeiro como pesquisa controlada.
4. Importar resultados externos quando vierem de MediaPipe, Sports2D ou outro pipeline.
5. Comparar marcacao manual contra sugestao automatica antes de gerar nota ou correcao.

## Bases avaliadas

### MediaPipe Pose Landmarker

- Fonte: https://developers.google.com/edge/mediapipe/solutions/vision/pose_landmarker
- Licenca do ecossistema: Apache-2.0.
- Valor para o Projeto Isa: melhor primeiro teste leve para detectar pontos do corpo em video, inclusive no navegador ou em Python.
- Uso inicial: clips individuais de saque, recepcao e ataque.
- Cuidado: videos com varias atletas, oclusao e camera distante podem reduzir a confianca.

Atualizacao: a tela `Videos` usa MediaPipe localmente para amostrar frames de clips curtos e gerar uma evidencia revisavel. A primeira regra calcula landmarks simples, como punho acima do ombro ou flexao de joelho, e nunca deve virar correcao automatica sem revisao.

### Sports2D

- Fonte: https://github.com/davidpagnon/Sports2D
- Licenca: BSD-3-Clause.
- Valor para o Projeto Isa: calcula trajetorias, angulos articulares e arquivos exportaveis a partir de video comum.
- Uso inicial: medir angulos de joelho, quadril, ombro e cotovelo em movimentos repetiveis.
- Cuidado: exige camera bem posicionada no plano do movimento.

### Volleyball Analytics

- Fonte: https://github.com/masouduut94/volleyball_analytics
- Licenca: GPL-2.0.
- Valor para o Projeto Isa: referencia especifica de volei para estado de jogo, bola e acoes como saque, recepcao, set, spike e block.
- Uso inicial: estudar arquitetura e classes de evento.
- Cuidado: licenca GPL-2.0 e stack pesada; copiar codigo pode contaminar a licenca do produto e aumentar complexidade cedo demais.

### VolleyVision

- Fonte: https://github.com/shukkkur/VolleyVision
- Valor para o Projeto Isa: referencia especifica de volei para detectar bola, atletas, quadra, eventos e estatisticas de jogo.
- Uso inicial: estudar a separacao entre deteccao de bola, jogador, quadra e evento.
- Cuidado: projeto academico/prototipo; bom como referencia de arquitetura, nao como dependencia direta do MVP.

### OpenVolley ovml

- Fonte: https://github.com/openvolley/ovml
- Licenca: MIT.
- Valor para o Projeto Isa: pacote de machine learning para analytics de volei, com YOLO e deteccao experimental de bola.
- Uso inicial: referencia para fase de bola/quadra e estatisticas coletivas.
- Cuidado: stack em R e foco diferente do app atual; nao e o primeiro caminho para gesto individual.

### ShotFormCorrecter

- Fonte: https://github.com/AggieSportsAnalytics/ShotFormCorrecter
- Valor para o Projeto Isa: exemplo de basquete que usa MediaPipe para medir angulos de arremesso, parecido com medir saque ou ataque.
- Uso inicial: adaptar a ideia de `articulacao -> angulo -> evidencia revisavel`, nao copiar a UI.
- Cuidado: especifico de basquete; os criterios tecnicos precisam ser traduzidos para fundamento de volei.

### CourtSense Vision Engine

- Fonte: https://github.com/oliver9842/courtsense-vision
- Valor para o Projeto Isa: referencia recente de API para analisar clip de basquete, separar fases do gesto e devolver feedback tecnico.
- Uso inicial: estudar o padrao `video -> frames -> fase do gesto -> feedback`, traduzindo para `preparacao -> contato -> finalizacao` no saque ou ataque.
- Cuidado: basquete e backend Python; nao deve virar dependencia antes dos clips reais de volei estarem revisados.

### Basketball Shot Analyzer

- Fonte: https://github.com/suryanch/basketball-shot-analyzer
- Valor para o Projeto Isa: exemplo de maquina de estados do movimento, ball tracking e frame de soltura.
- Uso inicial: adaptar a ideia de encontrar o momento-chave do gesto. No volei, esse momento pode ser contato do saque, contato do ataque, plataforma da recepcao ou aterrissagem do bloqueio.
- Cuidado: tracking de bola e mao aumenta complexidade; primeiro validar pose e angulos.

### Volleyball Court Keypoint Detection

- Fonte: https://github.com/asigatchov/Court-Keypoint-Detection
- Licenca: sem licenca declarada no GitHub no momento da pesquisa.
- Valor para o Projeto Isa: detectar pontos da quadra para mapear zonas, cobertura, recepcao e deslocamento.
- Uso inicial: referencia futura para posicionamento em quadra.
- Cuidado: repositorio pequeno, recente e dependente de camera de fundo em ginasio.

### OpenPose

- Fonte: https://github.com/CMU-Perceptual-Computing-Lab/openpose
- Licenca: livre para uso nao comercial.
- Valor para o Projeto Isa: referencia forte para multiplas pessoas e projetos de basquete com pose.
- Uso inicial: estudar conceitos e comparacoes.
- Cuidado: nao e a melhor base de produto comercial sem avaliar licenca; instalacao costuma ser pesada.

### MMPose e MMAction2

- Fontes:
  - https://github.com/open-mmlab/mmpose
  - https://github.com/open-mmlab/mmaction2
- Licenca: Apache-2.0.
- Valor para o Projeto Isa: toolkits maduros para pose, reconhecimento de acoes e modelos baseados em esqueleto.
- Uso inicial: segunda fase, depois de termos clips marcados manualmente.
- Cuidado: complexidade alta para o primeiro prototipo.

## Rota recomendada

### Fase A: evidencia manual

- Tela de videos lista marcadores planejados por fundamento.
- Cada marcador deve guardar: tempo, fundamento, atleta, criterio, observacao e relatorio associado.

### Fase B: extracao de pose controlada

- Testar MediaPipe ou Sports2D em clips curtos.
- Salvar saida como JSON ou CSV.
- Importar no app apenas os resultados relevantes: angulos, pontos de corpo, confianca e frame/tempo.
- Normalizar a saida com `npm run video:evidence` antes de exibir ou usar no relatorio.
- Levar qualquer sugestao automatica ao relatorio apenas depois de revisao tecnica.

Estado implementado: MediaPipe ja roda no navegador para uma primeira amostragem local, mostra preview do frame com landmarks e permite registrar uma checagem manual pareada com a sugestao da IA. Sports2D tambem ja tem adaptador local e importacao direta na tela `Videos` para converter `.mot/.csv` de angulos em evidencia importavel. O painel de calibracao agora mostra prontidao por fundamento para separar "em teste" de "pronto para piloto". A tela tambem tem um plano de validacao real para registrar clips por fundamento antes de confiar em recomendacoes automaticas. O proximo refinamento deve usar videos reais de volei para medir onde a IA acerta ou erra cada fundamento.

Atualizacao de adaptacao: os projetos de basquete pesquisados usam a ideia de fase do gesto, como preparacao, soltura e finalizacao. No Projeto Isa, isso foi traduzido para fases por fundamento: preparacao, contato/alcance e finalizacao/recuperacao. Essa camada orienta qual frame a IA deve procurar antes de gerar evidencia. A fase tambem virou dado no contrato (`phase`), para que cada evidencia carregue o momento tecnico que esta sendo validado.

Atualizacao de integracao: a tela `Videos` agora prepara e baixa um dataset local de calibracao IA x manual. Esse arquivo e a ponte para testar reposititorios externos: primeiro exportamos os pares validados do Projeto Isa, depois avaliamos se MediaPipe, Sports2D ou outro pipeline reproduz o criterio do treinador. O comando `npm run video:calibration` valida a amostra versionada do contrato antes de usar o formato em scripts externos.

Atualizacao de selecao open source: a tela `Videos` agora mostra uma matriz de adaptacao. Ela separa projetos para pilotar agora, estudar depois e manter apenas como referencia. O arquivo `reference/video-ai-project-candidates.json` registra a decisao e o comando `npm run video:candidates` ranqueia os candidatos com criterios simples: licenca, aderencia ao volei, facilidade de integracao e valor para o MVP.

Atualizacao de piloto: a tela `Videos` agora prepara um pacote piloto `isa.video-ai-pilot-package.v1`. Esse pacote transforma a decisao de usar Sports2D/MediaPipe em experimento: candidato, criterio de aceite, fase do fundamento, clips reais e comandos. O comando `npm run video:pilot` gera a mesma estrutura pelo terminal.

Atualizacao de gates: o piloto agora tambem tem avaliacao objetiva. A tela mostra os gates e o comando `npm run video:pilot:evaluate` retorna `ready` ou `preparing`. Enquanto faltar clip real, checagem pareada ou alinhamento minimo, o proximo passo e coleta/revisao, nao automacao.

Atualizacao de clips reais: a tela `Videos` agora prepara um manifesto `isa.video-clip-manifest.v1`. Ele padroniza os caminhos de video bruto, angulos Sports2D e evidencia normalizada. O comando `npm run video:clips` gera o mesmo manifesto pelo terminal. O preflight visual confere campos planejados, `npm run video:clips:validate` valida o contrato e `npm run video:clips:check-files` confere se os arquivos reais ja existem no disco.

Atualizacao de pipeline: o comando `npm run video:clips:process` le o manifesto e tenta converter cada arquivo Sports2D existente para evidencia normalizada. Enquanto faltarem `.mot/.csv` ou videos brutos, ele retorna `needs-inputs`. Isso deixa a integracao pronta para clips reais sem fingir que a analise ja existe.

Atualizacao de execucao Sports2D: o comando `npm run video:sports2d:worklist` gera uma lista de comandos baseada no manifesto e no CLI do Sports2D. Ele traduz cada clip de volei para angulos de interesse, como ombro/cotovelo no contato do saque ou joelho/quadril na base e aterrissagem. A decisao atual e usar Sports2D como dependencia externa validada por worklist antes de clonar o repositorio para dentro do projeto.

Atualizacao de runner: o comando `npm run video:sports2d:run` diagnostica a worklist e so executa Sports2D quando chamado com `-- --execute`. O runner separa `needs-videos`, `needs-sports2d`, `ready-to-run`, `ran-needs-angles` e `has-angles`, para nao confundir uma chamada tecnica com evidencia pronta para revisao.

Atualizacao de revisao do runner: a tela `Videos` agora interpreta o JSON `isa.sports2d-run-report.v1`. Isso conecta terminal e produto: o usuario cola a saida do runner e recebe o estado de cada clip, como falta video, falta Sports2D, rodou sem arquivo final ou pronto para processar.

Atualizacao de fixture demo: o projeto agora tem um manifesto demo Sports2D e comandos `video:sports2d:worklist:demo`, `video:sports2d:run:demo` e `video:clips:process:demo`. Essa fixture usa arquivos conhecidos para validar o pipeline inteiro antes dos videos reais. Na tela, `Testar runner demo` carrega um relatorio `has-angles` para revisar o estado esperado sem confundir demo tecnico com evidencia esportiva real.

Atualizacao de fontes: alem do ranking de candidatos, o projeto agora tem `reference/video-ai-source-audit.json` e o comando `npm run video:sources`. Essa auditoria separa fonte para pilotar, fonte para estudar e fonte para adiar. A regra atual e nao clonar repositorio externo ate existir clip real revisado, ganho tecnico demonstravel e saida compativel com `isa.video-evidence.v1`.

Atualizacao de ambiente: o comando `npm run video:env` faz um preflight local para saber se o computador ja consegue rodar o piloto Sports2D. Ele checa Python, pip, pacote/CLI `sports2d`, Node/npm e registra que MediaPipe continua como SDK de navegador. Isso evita confundir problema de ambiente com problema de tecnica do fundamento.

Atualizacao de setup local: o comando `npm run video:env:setup` cria `.venv-video-ai/` e instala Sports2D dentro do projeto. O runner passa a preferir esse executavel local quando ele existe. Isso reduz dependencia do Python global e deixa a reproducao do piloto mais controlada.

Atualizacao de bloqueio de ambiente: o preflight agora executa um smoke test do Sports2D. Nesta maquina, a instalacao local existe, mas a politica de Controle de Aplicativo bloqueia `sports2d.exe` e uma DLL nativa (`rtoml`). O status correto passa a ser `blocked-by-app-control`, nao `ready-for-real-clips`. O proximo passo de ambiente e rodar Sports2D em um contexto permitido, como WSL/Conda liberado, ou ajustar a politica antes de usar videos reais.

Atualizacao de UI do bloqueio: o runner agora propaga `blocked-by-app-control` para o relatorio `isa.sports2d-run-report.v1`, e a tela `Videos` tem o botao `Testar bloqueio`. Isso permite revisar o bloqueio de ambiente na interface sem confundir com falta de video, falta de angulos ou erro tecnico do fundamento.

Ranking atual:

1. `Sports2D`: piloto principal para angulos 2D e evidencias comparaveis.
2. `MediaPipe Pose`: ja integrado no navegador para sugestoes revisaveis.
3. `volleystat`: referencia especifica de volei para bola, quadra, pose e tracking, mas sem copiar codigo enquanto nao houver licenca declarada.
4. `Vert Tracker`: referencia especifica de volei para salto, calibracao e maquina de estados, sem copiar codigo enquanto nao houver licenca declarada.
5. `my-computer-vision-jumpshot`: referencia de basquete para maquina de estados do gesto.
6. `Pose2Sim`: referencia futura para cinematica 3D, fora do MVP atual.

Atualizacao de metricas de movimento: a tela `Videos` agora mostra um `Mapa de metricas de movimento`. Esse mapa liga fundamento, fase, articulacoes, fonte de IA e checagem manual. Ele transforma a pesquisa open source em criterio de treino: antes de rodar um modelo, o app sabe se esta procurando contato alto no saque, plataforma na recepcao, alcance no ataque, queda no bloqueio, base defensiva ou maos altas no levantamento. O mesmo conteudo esta versionado em `reference/video-ai-movement-metric-map.json` e validado por `npm run video:movement-map`.

Atualizacao de propagacao do criterio: o manifesto `isa.video-clip-manifest.v1`, a worklist Sports2D, o runner e o pacote piloto agora carregam `metricTargets`. Isso significa que a metrica tecnica acompanha o clip ate o comando externo e volta para a revisao na tela. O pipeline passa a responder "qual sinal de volei estamos medindo?" antes de responder "qual arquivo foi gerado?".

Atualizacao MediaPipe: a evidencia local gerada no navegador agora tambem carrega `metricTargets`. O card de evidencia mostra o alvo tecnico e a checagem manual esperada. Assim, a sugestao do MediaPipe nasce conectada ao mesmo contrato usado por manifesto, Sports2D e pacote piloto.

Atualizacao de validacao de evidencia: o comando `npm run video:evidence:validate` valida `isa.video-evidence.v1` antes da importacao/revisao. Ele confere campos obrigatorios, confianca, status e `metricTargets`. A amostra MediaPipe e a amostra Sports2D agora passam sem avisos, mantendo evidencias de IA como `Revisar` ate a checagem manual.

Atualizacao de fonte GitHub: a verificacao atual via API publica do GitHub mostrou `Sports2D` com licenca BSD-3-Clause, mas `volleystat` e `vert-tracker` sem licenca declarada. Por isso, esses projetos ficam como referencia conceitual/arquitetural, nao como codigo a copiar. `Vert Tracker` entrou como referencia especifica de volei para salto, calibracao e maquina de estados, util para ataque, bloqueio e aterrissagem em fase futura.

Atualizacao de verificacao GitHub: o comando `npm run video:sources:github` agora consulta a API publica do GitHub para as fontes registradas em `reference/video-ai-source-audit.json`. A checagem confirma licenca, repositorio privado/arquivado, atividade recente e descricao. A auditoria passou a incluir `OpenVolley ovml` como referencia permissiva MIT para fase futura de bola/jogo coletivo e `Volleyball Analytics` como referencia GPL-2.0 para estudo de fluxo de jogo, sem copiar codigo para o produto atual.

Atualizacao de roteamento de fonte: o comando `npm run video:sources:route` cruza o mapa de metricas com a auditoria de fontes e escolhe a fonte de IA por fundamento/fase. Com o candidato atual `Sports2D`, as 8 metricas ficam como `pilot-with-manual-review`, e MediaPipe aparece como alternativa em varias fases. O manifesto de clips agora inclui `recommendedSource` dentro de cada `metricTargets`, entao o pipeline sabe qual motor tentar antes de pedir revisao manual.

Atualizacao de evidencia roteada: `recommendedSource` agora tambem acompanha a evidencia normalizada. O normalizador MediaPipe, o adaptador Sports2D, o processador do manifesto e as fixtures demo preservam essa rota. O validador `video:evidence:validate` passou a contar `withRecommendedSource` e exige esse campo quando uma evidencia de IA/pose ja declara `metricTargets`.

Atualizacao de aceite por fonte: o comando `npm run video:calibration:evaluate` avalia pares IA x manual por fonte, como Sports2D ou MediaPipe. Ele calcula pares manuais, alinhamento, confianca media e status. A amostra atual mostra Sports2D como `calibrating`: tem 1 par alinhado, mas ainda faltam pelo menos 5 pares e mais clips reais antes de automatizar recomendacoes.

Atualizacao de plano de coleta: o comando `npm run video:calibration:plan` transforma o gap de calibracao em uma lista de proximos pares a coletar. Com a amostra atual, ele gera 4 pares planejados para `Sports2D` em `Saque - Contato`, cada um com caminho de video bruto, caminho de angulos `.mot`, evidencia normalizada e checagem manual esperada. A tela `Videos` tambem mostra esses proximos pares no pacote piloto.

Atualizacao de manifesto de gaps: o comando `npm run video:calibration:manifest` converte os pares faltantes do plano em `isa.video-clip-manifest.v1`. Isso permite passar a coleta diretamente para a worklist do Sports2D, mantendo `recommendedSource`, caminhos de entrada/saida e revisao manual obrigatoria antes de qualquer recomendacao automatica.

Atualizacao de fluxo executavel: os comandos `npm run video:calibration:worklist`, `npm run video:calibration:run -- --execute` e `npm run video:calibration:process -- --write` agora usam diretamente os gaps de calibracao. Isso fecha a sequencia pratica: detectar pares faltantes, montar comandos Sports2D, diagnosticar execucao e normalizar evidencias para revisao.

Atualizacao de integracao MediaPipe/validacao: quando a tela gera evidencia local com MediaPipe, importa JSON externo ou converte Sports2D, o clip entra automaticamente no plano de validacao como `IA rodada`. O status da validacao agora diferencia coleta simples de `IA aguardando revisao`, deixando claro que a proxima etapa e parear a sugestao com checagem manual.

Atualizacao de usabilidade: a tela `Videos` foi reorganizada como uma estacao de analise. A primeira dobra agora prioriza escolher video, atleta, fundamento, processar com IA e ver o resultado/revisao. Pesquisa, importacao JSON, Sports2D, dataset, manifesto e pacote piloto continuam disponiveis, mas ficam recolhidos em `Ferramentas avancadas` para nao transformar a experiencia principal em uma pagina gigante de botoes.

### Fase C: comparacao

- Comparar marcacao manual com sugestao automatica.
- Medir onde a IA acerta e onde erra antes de gerar recomendacoes.
- Separar erro por fase do movimento: preparacao, contato/alcance e finalizacao/recuperacao.

### Fase D: eventos de jogo

- Usar Volleyball Analytics como referencia para eventos coletivos: saque, recepcao, levantamento, ataque, bloqueio, bola e estado de jogo.
- Avaliar se faz sentido treinar modelos proprios quando houver dados reais do Projeto Isa.

## Principio de produto

Para o volei, a IA so deve entrar como assistente de evidencia. O treinador continua definindo criterio, contexto e proxima acao.
