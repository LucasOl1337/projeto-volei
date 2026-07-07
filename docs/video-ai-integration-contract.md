# Contrato de integracao: evidencias de video

Data: 2026-07-01

## Objetivo

Definir o formato minimo para transformar uma analise externa de movimento em evidencia utilizavel no Projeto Isa.

Esse contrato permite testar MediaPipe, Sports2D ou outro projeto sem acoplar o app diretamente a uma biblioteca pesada.

## Entrada esperada do prototipo

O script `scripts/normalize-video-evidence.mjs` recebe um JSON com:

```json
{
  "provider": "mediapipe",
  "clip": {
    "id": "clip-saque-demo-001",
    "title": "Saque flutuante - serie curta",
    "athlete": "Atleta exemplo",
    "fundamental": "Saque",
    "durationSeconds": 18.4
  },
  "observations": [
    {
      "id": "saque-contato-alto",
      "startSeconds": 4.2,
      "endSeconds": 4.8,
      "phase": "Contato",
      "marker": "Ponto de contato",
      "metric": "Punho acima do ombro",
      "value": "sim, margem estimada de 18 cm",
      "confidence": 0.82,
      "reportUse": "Confirmar se o contato aconteceu alto o suficiente antes de registrar correcao.",
      "nextAction": "Repetir 3 series focando lancamento mais estavel antes da batida."
    }
  ]
}
```

Exemplo real no repositorio: `reference/sample-pose-result.json`.

## Saida normalizada

O comando:

```bash
npm run video:evidence
```

gera:

```json
{
  "schemaVersion": "isa.video-evidence.v1",
  "source": "MediaPipe",
  "clip": {
    "id": "clip-saque-demo-001",
    "title": "Saque flutuante - serie curta",
    "athlete": "Atleta exemplo",
    "fundamental": "Saque",
    "durationSeconds": 18.4
  },
  "evidence": [
    {
      "fundamental": "Saque",
      "phase": "Contato",
      "timeRange": "00:04.20 - 00:04.80",
      "marker": "Ponto de contato",
      "metric": "Punho acima do ombro",
      "value": "sim, margem estimada de 18 cm",
      "confidence": 0.82,
      "status": "Revisar",
      "reportUse": "Confirmar se o contato aconteceu alto o suficiente antes de registrar correcao.",
      "nextAction": "Repetir 3 series focando lancamento mais estavel antes da batida."
    }
  ]
}
```

Para gravar um arquivo pronto para copiar e colar na tela de videos:

```bash
npm run video:evidence:write
```

Isso gera `reference/sample-normalized-video-evidence.json`.

Para validar se a evidencia normalizada esta completa antes de importar ou usar no relatorio:

```bash
npm run video:evidence:validate
```

O validador confere `isa.video-evidence.v1`, clip, campos obrigatorios, confianca entre 0 e 1, status de revisao e `metricTargets`. Evidencias de IA/pose sem alvo tecnico geram aviso, porque ainda nao dizem qual criterio do volei a analise tentou medir. Quando a evidencia de IA/pose ja tem `metricTargets`, cada alvo precisa carregar `recommendedSource`, para preservar qual motor tentou medir o gesto.

A saida informa `withMetricTargets` e `withRecommendedSource`. Para uma evidencia automatica ficar pronta para revisao, esses dois contadores devem acompanhar o numero de evidencias importadas.

## Adaptador Sports2D

Sports2D pode exportar angulos em arquivos de planilha/OpenSim, como `.mot`. O Projeto Isa agora tem um adaptador local para transformar esses angulos em evidencia revisavel:

```bash
npm run video:sports2d
```

Para gerar um arquivo pronto para importar na tela `Videos`:

```bash
npm run video:sports2d:write
```

Isso usa `reference/sample-sports2d-saque.mot` e grava `reference/sample-sports2d-normalized-video-evidence.json`.

Para validar a amostra Sports2D normalizada:

```bash
npm run video:evidence:validate:sports2d
```

Na tela `Videos`, o mesmo fluxo tambem pode ser testado sem terminal:

1. Abrir `Importar evidencias normalizadas`.
2. Selecionar um arquivo Sports2D `.mot` ou `.csv`.
3. Clicar em `Converter Sports2D`.
4. Revisar o card criado antes de usar no relatorio.

A tela tambem tem `Testar amostra Sports2D`, que carrega `reference/sample-sports2d-saque.mot` para validar o fluxo.

O adaptador atual procura colunas como `time`, `Right_arm`, `Right_elbow` e `Right_knee`. Para saque, ataque e bloqueio, ele escolhe o frame com melhor combinacao de braco alto e cotovelo estendido. Para recepcao e defesa, ele escolhe o frame com maior flexao de joelho.

Esse resultado continua sendo IA/analise externa: nasce como `Revisar`, precisa de checagem manual e so deve entrar no relatorio depois de confirmacao.

## Matriz de candidatos open source

O arquivo `reference/video-ai-project-candidates.json` registra os projetos que podem virar base tecnica. Ele nao clona codigo automaticamente; ele organiza a decisao antes de trazer dependencias pesadas para o app.

O arquivo `reference/video-ai-source-audit.json` registra a auditoria de fonte: licenca, capacidade observada, encaixe no volei, modo de integracao e decisao sobre clonar ou nao clonar.

Para ranquear os candidatos atuais:

```bash
npm run video:candidates
```

Para revisar a decisao de fonte e clonagem:

```bash
npm run video:sources
```

Para conferir as fontes GitHub contra a API publica do GitHub antes de copiar ou adaptar codigo:

```bash
npm run video:sources:github
```

Esse comando compara o que o Projeto Isa registrou na auditoria com o estado atual do repositorio: licenca, repositorio privado/arquivado, data recente de push, estrelas e descricao. Ele nao clona nada. A funcao e evitar que uma fonte entre no produto sem verificacao minima.

Para rotear cada metrica de movimento para a fonte de IA mais adequada ao piloto:

```bash
npm run video:sources:route
```

Esse comando cruza `reference/video-ai-movement-metric-map.json` com `reference/video-ai-source-audit.json`. A regra atual prefere o candidato do piloto quando ele cobre a metrica; caso contrario, escolhe a fonte com modo de integracao mais proximo do MVP. A saida usa `isa.video-ai-source-route.v1` e mantém evidencias como `pilot-with-manual-review` quando a fonte pode rodar, mas ainda exige revisao humana.

Para validar o mapa de metricas que liga fundamento, fase, articulacoes, fonte e checagem manual:

```bash
npm run video:movement-map
```

Para checar se o ambiente local ja consegue rodar o piloto:

```bash
npm run video:env
```

Esse preflight verifica Node, npm, Python, `pip`, pacote/CLI `sports2d` e registra que o MediaPipe atual roda no navegador. Ele nao instala nada sozinho e nao executa analise em video real.

Para criar um ambiente local isolado com Sports2D dentro do projeto:

```bash
npm run video:env:setup
```

Esse comando cria `.venv-video-ai/`, instala Sports2D ali e deixa o runner preparado para usar esse executavel local. A pasta fica fora do versionamento.

O ranking usa quatro criterios simples, de 1 a 3:

- licenca;
- aderencia ao volei;
- facilidade de integracao;
- valor para o MVP.

Neste momento, `Sports2D` e `MediaPipe Pose` ficam como piloto. Projetos especificos de volei entram como referencia para bola, quadra e eventos coletivos. Projetos 3D ficam para depois de clips reais suficientes.

Decisao atual de fonte: nao clonar repositorios pesados ainda. Sports2D entra por CLI e arquivos `.mot/.csv`; MediaPipe entra como SDK no navegador; OpenVolley ovml entra como referencia permissiva para bola/jogo coletivo; Volleyball Analytics entra como referencia GPL, sem copiar codigo; volleystat fica como referencia especifica de volei enquanto nao houver licenca declarada; Vert Tracker fica como referencia de salto/aterrissagem; projetos de basquete ficam como referencia de maquina de estados do gesto.

## Como testar o normalizador

1. Rode `npm run video:evidence:write`.
2. Confira `reference/sample-normalized-video-evidence.json`.
3. Use o arquivo como referencia de formato para uma futura importacao.

## Estado atual do app

A tela publica `Videos` ja tem uma primeira camada de IA controlada dentro de `src/static-app.js`.

Ela permite:

- verificar se o MediaPipe Pose Landmarker carrega no navegador;
- selecionar um video curto e gerar uma evidencia local inicial com landmarks amostrados;
- importar evidencias normalizadas no contrato `isa.video-evidence.v1`;
- revisar cards com fonte, fundamento, marcador, confianca e proxima acao;
- enviar uma evidencia para o relatorio individual.

Quando uma evidencia e enviada ao relatorio, o app preserva a linha tecnica: `observacao do video -> criterio -> evidencia -> correcao -> proximo treino`.

O app ainda nao salva o video original. Ele ja mostra um preview comprimido do frame analisado com landmarks, que serve como apoio para revisao tecnica antes de transformar a sugestao em relatorio.

## Analise local atual

A analise local usa uma amostragem curta do video no navegador:

- clips de ate 12 segundos;
- um atleta principal;
- ate 10 frames amostrados;
- uma evidencia gerada por analise;
- status sempre `Revisar`;
- preview simplificado dos landmarks usados na evidencia, com thumbnail comprimido do frame escolhido;
- validacao manual da sugestao antes de enviar evidencias de IA ao relatorio.

O arquivo `reference/sports2d-demo.mp4` foi baixado do repositorio Sports2D e fica disponivel como demo tecnico do prototipo. Ele serve para validar o fluxo de pose antes de usar um video proprio do atleta.

Regras iniciais:

- Saque, ataque e bloqueio: calcula se o punho estimado ficou acima do ombro e registra o angulo do cotovelo.
- Recepcao e defesa: calcula a flexao de joelho no momento mais baixo encontrado.
- Cada evidencia local tambem carrega `metricTargets`, vindo do mapa de metricas de movimento, para ligar a leitura automatica ao criterio tecnico e a checagem manual.

Essas regras sao ponto de partida para validar captura, nao substituem criterio de treino.

O preview visual mostra um thumbnail comprimido do frame escolhido com um esqueleto simplificado por cima. Pontos destacados indicam a cadeia usada no calculo, por exemplo ombro-cotovelo-punho no saque ou quadril-joelho-tornozelo na defesa. Ele existe para revisao, nao para substituir o video original.

Evidencias de IA seguem uma trava de qualidade:

1. A analise cria o card como `Revisar`.
2. O usuario confirma ou descarta a sugestao olhando frame, landmarks e criterio.
3. Apenas evidencias `Confirmada` podem ser enviadas ao relatorio.

## Calibracao IA x manual

A tela de videos tambem registra uma checagem manual pareada com a evidencia de IA. Essa etapa existe para adaptar modelos genericos ao volei:

1. A IA sugere um marcador, por exemplo `Punho acima do ombro`.
2. O treinador registra uma checagem manual olhando o frame e o criterio do fundamento.
3. O app mostra o par `IA -> manual` no painel de calibracao.
4. Divergencias viram ajuste de criterio antes de automatizar recomendacoes.

Esse pareamento usa `calibrationOf`, apontando a evidencia manual para o `id` da evidencia de IA. O objetivo nao e provar que o modelo esta certo em um clip, mas construir historico para saber quando confiar no criterio.

## Dataset de calibracao

A tela `Videos` pode preparar um JSON local com os pares IA x manual. Esse dataset serve para testar pipelines externos e comparar modelos open source sem copiar dados soltos manualmente.

Fluxo recomendado:

1. Revisar ou registrar checagens manuais pareadas com a sugestao de IA.
2. Clicar em `Preparar dataset`.
3. Conferir o resumo gerado na tela.
4. Clicar em `Baixar JSON`.
5. Validar o arquivo antes de usar em outro pipeline.

Formato:

```json
{
  "schemaVersion": "isa.video-calibration-dataset.v1",
  "summary": {
    "evidenceCount": 3,
    "aiEvidenceCount": 2,
    "manualEvidenceCount": 1,
    "pairedChecks": 1,
    "validationClipCount": 1
  },
  "phaseReadiness": [
    {
      "fundamental": "Saque",
      "phase": "Contato",
      "aiCount": 2,
      "checkedCount": 1,
      "alignedCount": 1,
      "rate": 100,
      "status": "Em calibracao"
    }
  ],
  "pairs": [
    {
      "fundamental": "Saque",
      "phase": "Contato",
      "marker": "Ponto de contato",
      "alignment": "Alinhada",
      "paired": true,
      "ai": {
        "source": "Sports2D",
        "metric": "Braco alto e cotovelo estendido Sports2D",
        "value": "sim, braco 81 graus; cotovelo 154 graus"
      },
      "manual": {
        "calibrationOf": "sports2d-saque-braco"
      }
    }
  ]
}
```

Esse dataset nao substitui o video original. Ele registra a evidencia e a revisao tecnica para avaliar se a IA esta aprendendo o criterio certo.

Para validar a amostra versionada do repositorio:

```bash
npm run video:calibration
```

Para avaliar se uma fonte de IA ja tem pares suficientes contra revisao manual:

```bash
npm run video:calibration:evaluate
```

Esse comando agrupa os pares por fonte, por exemplo `Sports2D`, e calcula pares manuais, alinhamento, confianca media e status. A regra atual exige 5 pares manuais, pelo menos 80% de alinhamento e confianca media minima de 0.7 antes de considerar uma fonte pronta para piloto controlado.

Para transformar os gaps da calibracao em clips planejados:

```bash
npm run video:calibration:plan
```

Esse comando gera `isa.video-calibration-gap-plan.v1`. Ele calcula quantos pares ainda faltam por fonte e cria os proximos itens de coleta com fundamento, fase, marcador, caminho do video bruto, caminho esperado de angulos Sports2D e caminho da evidencia normalizada. Na amostra atual, o plano pede mais 4 pares de `Saque - Contato` para `Sports2D`.

Para transformar esse plano em um manifesto executavel pelo pipeline:

```bash
npm run video:calibration:manifest
```

Esse comando gera `isa.video-clip-manifest.v1` a partir dos pares faltantes. O manifesto preserva a fonte recomendada por metrica, exige revisao manual e pode ser salvo com `-- --out caminho/isa-gap-manifest.json` para alimentar a worklist:

```bash
node scripts/build-sports2d-worklist.mjs caminho/isa-gap-manifest.json
```

Tambem existe o fluxo direto para a coleta calibrada, sem salvar um manifesto intermediario:

```bash
npm run video:calibration:worklist
npm run video:calibration:run -- --execute
npm run video:calibration:process -- --write
```

Esse fluxo usa os gaps atuais como entrada, monta a worklist Sports2D, tenta executar os clips reais quando `--execute` e depois normaliza os arquivos `.mot` ou `.csv` encontrados nos caminhos planejados. Se faltar video bruto, Sports2D ou permissao de execucao no Windows, o runner retorna o motivo no contrato `isa.sports2d-run-report.v1`.

Para validar um arquivo exportado pela tela:

```bash
node scripts/validate-video-calibration-dataset.mjs caminho/para/isa-video-calibration-dataset.json
```

O validador confirma a versao do contrato, os campos principais dos pares e se `manual.calibrationOf` aponta para o `id` da evidencia de IA quando o par esta marcado como pareado.

## Pacote piloto de IA

A tela `Videos` tambem prepara um pacote piloto no contrato `isa.video-ai-pilot-package.v1`. Ele junta:

- candidato open source escolhido;
- criterios de aceite;
- fases do movimento;
- clips reais registrados;
- checagens pareadas disponiveis;
- comandos de comparacao.

Para gerar a amostra pelo terminal:

```bash
npm run video:pilot
```

Para avaliar os gates do piloto:

```bash
npm run video:pilot:evaluate
```

O pacote nao roda a IA sozinho. Ele prepara o experimento para rodar Sports2D, MediaPipe ou outro pipeline com o mesmo alvo tecnico. O criterio inicial para liberar piloto e:

- 3 clips reais revisados da fase;
- 5 checagens manuais pareadas;
- 80% ou mais de alinhamento;
- revisao final do treinador antes do relatorio.

Enquanto esses criterios nao forem atingidos, o status correto e `Preparar piloto`, nao `Pronto para piloto`.

O avaliador retorna `ready` apenas quando todos os gates passam. Se retornar `preparing`, o pacote esta valido, mas ainda nao deve gerar recomendacao automatica.

## Manifesto de clips reais

A tela `Videos` tambem prepara um manifesto no contrato `isa.video-clip-manifest.v1`. Ele existe para organizar os arquivos antes de rodar Sports2D, MediaPipe ou outro pipeline.

Para gerar pelo terminal:

```bash
npm run video:clips
```

Para validar o contrato do manifesto:

```bash
npm run video:clips:validate
```

Para checar se os arquivos ja existem nos caminhos planejados:

```bash
npm run video:clips:check-files
```

Para gerar a lista de comandos Sports2D por clip:

```bash
npm run video:sports2d:worklist
```

A worklist usa o comando documentado pelo Sports2D (`sports2d --video_input ...`) e escolhe angulos por fundamento:

- saque, ataque e bloqueio: ombro, cotovelo, braco e antebraco;
- recepcao, defesa, base e aterrissagem: joelho, quadril, coxa e tronco.

Ela tambem aponta o caminho `expectedAngles`, que deve receber o `.mot/.csv` final antes de rodar o processador.

Para diagnosticar se a worklist ja pode ser executada:

```bash
npm run video:sports2d:run
```

Antes de executar Sports2D em clip real, rode:

```bash
npm run video:env
```

Se o resultado for `needs-python`, instale Python 3. Se for `needs-sports2d-install`, rode `npm run video:env:setup` ou instale Sports2D no Python ativo com o comando sugerido no JSON. Se for `blocked-by-app-control`, o pacote existe, mas o Windows bloqueou a execucao de componentes nativos; use um ambiente permitido, como WSL/Conda liberado, ou ajuste a politica antes de executar clips reais. Se for `ready-for-real-clips`, o gargalo passa a ser colocar videos reais nos caminhos do manifesto.

Para testar o encadeamento com arquivos demo ja versionados:

```bash
npm run video:sports2d:worklist:demo
npm run video:sports2d:run:demo
npm run video:sports2d:run:blocked-demo
npm run video:clips:process:demo
```

Esse demo usa `reference/sample-sports2d-demo-manifest.json`, `reference/sports2d-demo.mp4` e `reference/sample-sports2d-saque.mot`. Ele valida o encanamento tecnico, nao uma analise real da Isa.

O comando `video:sports2d:run:blocked-demo` forca uma checagem de ambiente mesmo quando ja existe `.mot` demo. Ele serve para verificar se o app diferencia `blocked-by-app-control` de `has-angles`.

Esse comando nao roda Sports2D por padrao. Ele verifica:

- se o comando `sports2d` esta disponivel no ambiente;
- se o video bruto existe no caminho `sourceVideo`;
- se o arquivo de angulos ja existe em `expectedAngles`.

Para executar de fato o Sports2D, use:

```bash
npm run video:sports2d:run -- --execute
```

Se o comando retornar `ran-needs-angles`, o Sports2D foi chamado, mas o arquivo final ainda nao apareceu no caminho `expectedAngles`. Nesse caso, copie o `.mot/.csv` gerado para o caminho esperado antes de processar evidencias.

A tela `Videos` tambem aceita a saida JSON desse runner. Cole o relatorio em `Relatorio do runner Sports2D` e clique em `Revisar runner`. O app resume o estado por clip e mostra a proxima acao sem exigir leitura manual do JSON.

A mesma area tem `Testar runner demo`, que carrega `reference/sample-sports2d-run-report.json` para revisar o estado `Pronto para processar` sem depender de instalacao local do Sports2D. Esse botao e uma fixture de produto: mostra o fluxo esperado, mas nao libera recomendacao automatica.

A tela tambem tem `Testar bloqueio`, que carrega `reference/sample-sports2d-blocked-run-report.json`. Esse exemplo mostra o estado `blocked-by-app-control`, usado quando o Windows bloqueia o Sports2D ou uma DLL nativa. Nesse caso, a proxima acao nao e revisar fundamento; e liberar um ambiente de execucao, como WSL/Conda permitido, antes de tentar clips reais.

Para processar o manifesto e converter as exportacoes Sports2D que ja existirem:

```bash
npm run video:clips:process
```

Por padrao, esse comando gera um relatorio sem gravar arquivos. Quando os `.mot/.csv` reais estiverem nos caminhos planejados, rode com `-- --write` para criar os JSONs de evidencia normalizada:

```bash
npm run video:clips:process -- --write
```

Cada clip do manifesto guarda:

- atleta;
- fundamento;
- fase do movimento;
- marcador tecnico;
- metricas tecnicas planejadas (`metricTargets`);
- fonte recomendada por metrica (`recommendedSource`);
- caminho esperado do video bruto;
- caminho esperado do arquivo de angulos Sports2D;
- caminho esperado da evidencia normalizada;
- revisao manual obrigatoria.

Esse manifesto nao salva o video original dentro do app. Ele padroniza os nomes e caminhos para evitar misturar video bruto, angulos exportados e evidencia validada.

O campo `metricTargets` vem de `reference/video-ai-movement-metric-map.json`. Ele liga a coleta a uma pergunta tecnica: metrica, articulacoes, fontes possiveis e checagem manual. Exemplo: `Saque - Contato` usa `Punho acima do ombro + cotovelo estendido`, com punho, ombro e cotovelo como articulacoes principais. Isso impede que o pipeline rode uma fonte externa sem criterio de volei.

Cada item de `metricTargets` tambem carrega `recommendedSource`. Esse campo diz qual fonte deve tentar medir primeiro aquela metrica, qual e o modo de integracao, qual licenca foi registrada e por que a evidencia continua exigindo revisao manual. Exemplo:

```json
{
  "metric": "Punho acima do ombro + cotovelo estendido",
  "recommendedSource": {
    "name": "Sports2D",
    "integrationMode": "external-cli",
    "license": "BSD-3-Clause",
    "status": "pilot-with-manual-review"
  }
}
```

O preflight da tela valida campos planejados, incluindo as metricas tecnicas e a fonte escolhida por metrica. O comando `video:clips:check-files` valida o disco local e deve retornar `needs-files` enquanto os videos reais e exportacoes ainda nao tiverem sido criados.

O processador do manifesto retorna `needs-inputs` quando ainda faltam entradas reais. Esse status e correto antes da coleta: ele impede que o app finja ter analise de movimento sem o video bruto ou sem os angulos Sports2D. Quando houver conversao, o resultado ainda nasce como evidencia `Revisar` e precisa de checagem manual pareada.

Decisao atual: o projeto usa Sports2D como fonte open source de referencia e dependencia externa, mas ainda nao clona o repositorio para dentro do app. Primeiro precisamos validar clips reais, comandos, saidas e revisao manual. Se o piloto ficar repetivel, a proxima decisao e escolher entre clonar em uma pasta `external/`, manter via `pip install sports2d`, ou criar um worker isolado.

## Prontidao por fundamento e fase

A tela `Videos` mostra um painel de prontidao por fundamento e por fase do movimento. Ele nao mede performance esportiva do atleta; mede se o criterio automatico ja tem checagens manuais pareadas suficientes contra revisao manual.

Para contar nessa prontidao, a evidencia manual precisa usar `calibrationOf` apontando para a evidencia de IA. Comparacoes relacionadas ajudam a revisao visual, mas nao liberam piloto.

O resumo por fundamento mostra a visao geral. O resumo por fase mostra se uma parte especifica do gesto, como `Saque - Contato` ou `Ataque - Aterrissagem`, ja tem dados suficientes.

Estados atuais:

- `Sem dados`: ainda nao existe checagem manual pareada naquele fundamento.
- `Em calibracao`: ja existe pelo menos uma checagem, mas ainda faltam exemplos.
- `Promissor`: pelo menos 3 checagens manuais e 70% ou mais de alinhamento.
- `Pronto para piloto`: pelo menos 5 checagens manuais e 80% ou mais de alinhamento.

Mesmo em `Pronto para piloto`, a IA continua como assistente. O treinador valida o contexto antes de automatizar recomendacoes.

## Plano de validacao real

A tela `Videos` tambem tem um plano de clips reais por fundamento. Ele guarda apenas metadados locais do teste:

- atleta;
- fundamento;
- marcador do clip;
- status da coleta;
- data do registro.

Status atuais:

- `Gravado`: clip existe e ainda precisa de analise.
- `IA rodada`: MediaPipe, Sports2D ou outro pipeline ja gerou uma sugestao.
- `Revisado com treinador`: o clip ja foi conferido tecnicamente.

Quando uma evidencia de IA e gerada ou importada pela tela `Videos`, o app registra automaticamente um item no plano de validacao com status `IA rodada`. Isso conecta a analise ao controle de coleta: o clip passa a aparecer nos gates do piloto, mas ainda precisa de checagem manual pareada antes de contar como revisado.

Esse plano nao substitui `calibrationOf`. Ele prepara a coleta: primeiro 3 clips reais revisados, depois evidencias automaticas pareadas com checagem manual.

## Fases do movimento

A tela `Videos` tambem explicita as fases tecnicas que a IA deve procurar. Essa decisao adapta o padrao de projetos de basquete, que separam preparacao, frame de soltura e finalizacao.

No volei, a divisao inicial e:

- `Saque`: preparacao, contato e finalizacao.
- `Recepcao`: preparacao, contato e recuperacao.
- `Ataque`: preparacao, contato e aterrissagem.
- `Bloqueio`: preparacao, alcance e queda.
- `Defesa`: preparacao, contato e recuperacao.

Cada evidencia automatica deve apontar para uma fase ou momento-chave antes de virar recomendacao. Exemplos: contato alto no saque, plataforma na recepcao, maior alcance no ataque/bloqueio e base mais baixa na defesa.

No contrato `isa.video-evidence.v1`, essa fase fica em `phase`. Quando a fonte externa nao envia esse campo, o normalizador tenta inferir pela combinacao de `fundamental` e `marker`.

Recomendacoes para o primeiro teste:

- usar video de ate 12 segundos;
- um atleta principal visivel;
- camera parada;
- corpo inteiro ou pelo menos tronco, bracos e pernas visiveis;
- um fundamento por clip;
- preferir saque, ataque, recepcao ou defesa antes de jogo coletivo.

Limitacoes atuais:

- a primeira analise automatica comeca com uma pose por frame e nao identifica varias atletas;
- as metricas sao aproximadas e devem ser revisadas visualmente;
- ainda nao salva o video original nem um frame real anotado;
- o preview guarda apenas um thumbnail comprimido, nao o video original;
- a IA deve sugerir evidencia; o treinador valida criterio e contexto.

## Como adaptar MediaPipe

1. Rodar MediaPipe no video curto.
2. Extrair landmarks por frame.
3. Calcular metricas simples:
   - punho acima do ombro;
   - angulo do cotovelo;
   - altura do centro do corpo;
   - distancia entre apoios;
   - sequencia de pontos do pe.
4. Gerar `observations` apenas para momentos relevantes do fundamento.
5. Incluir `metricTargets` quando o pipeline externo ja souber qual criterio tecnico esta medindo.
6. Passar o JSON pelo normalizador.

## Como adaptar Sports2D

1. Rodar Sports2D no video curto.
2. Exportar angulos ou trajetorias.
3. Rodar `npm run video:sports2d` ou passar o arquivo `.mot/.csv` para `scripts/sports2d-to-video-evidence.mjs`.
4. Conferir a evidencia gerada no contrato `isa.video-evidence.v1`.
5. Importar na tela `Videos` e comparar com uma checagem manual.

## Criterio para entrar no relatorio

Uma evidencia so deve entrar em relatorio quando tiver:

- tempo do video;
- fundamento;
- marcador;
- metrica;
- valor observado;
- fonte;
- confianca ou revisao manual;
- status `Confirmada` quando a fonte for IA.
- proxima acao de treino.
- checagem manual pareada quando a evidencia vier de IA e for usada para calibracao.

## Regra de produto

IA sugere evidencia. O treinador valida criterio e contexto.
