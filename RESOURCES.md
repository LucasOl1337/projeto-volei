# Projeto Vôlei Resources

## Knowledge

- [FIVB: Official Volleyball Rules 2025-2028](https://www.fivb.com/volleyball/the-game/official-volleyball-rules/)
  Fonte oficial para regras, estrutura do jogo e termos formais. Use para validar qualquer regra de volei antes de transforma-la em logica do app.
- [FIVB: The Game](https://www.fivb.com/volleyball/the-game/)
  Referencia oficial curta sobre estrutura do jogo e restricoes do libero. Use para evitar que a tela de posicoes prometa acoes ilegais.
- [USA Volleyball: Rules of Volleyball](https://usavolleyball.org/play/rules-of-volleyball/)
  Referencia pratica sobre ataque de rede, fundo e linhas de quadra. Use ao desenhar criterios para defesa, ataque e restricoes de jogadores do fundo.
- [Gold Medal Squared: Volleyball Positions](https://www.goldmedalsquared.com/post/volleyball-positions)
  Referencia de treinamento para responsabilidades por posicao: ponteiro, oposto, central, levantador, libero e especialista defensivo.
- [VolleyballMag: Indoor volleyball player positions](https://volleyballmag.com/indoor-volleyball-player-positions/)
  Explicacao pratica das funcoes indoor, com destaque para onde cada posicao costuma atuar e quais habilidades sustentam cada papel.
- [USA Volleyball: Training Without a Net or Friends](https://usavolleyball.org/resource/training-without-a-net-or-friends/)
  Referencia para adaptar fundamentos a parede, treino solo e repeticoes em casa sem rede ou equipe.
- [USA Volleyball: 10 Keys to Middle Blocking](https://usavolleyball.org/resource/10-keys-to-middle-blocking/)
  Referencia para central: posicao carregada, leitura, movimento explosivo e fundamentos do bloqueio.
- [US Sports Camps: Volleyball Drills Against a Wall](https://www.ussportscamps.com/tips/volleyball/volleyball-drills-against-a-wall)
  Ideias praticas de parede para passe, levantamento e ataque controlado em casa.
- [JVA: Setting Drills to Train Proper Technique](https://jvavolleyball.org/drills-train-good-setting-habits/)
  Base para reforcar repeticao de qualidade, bola levantavel e bons habitos de levantador.
- [JVA: Attacking Drills to Train Proper Technique](https://jvavolleyball.org/attacking-drills-train-proper-technique-eliminate-bad-habits/)
  Base para adaptar ataque com passada, controle de contato, snap e correcao de habitos para ponteiro e oposto.
- [The Art of Coaching Volleyball: Out-of-system hitting drill for opposites](https://www.theartofcoachingvolleyball.com/out-of-system-hitting-drill-for-opposites/)
  Referencia de decisao para oposto em bola fora do sistema, adaptada no app para treino individual em casa.
- [The Art of Coaching Volleyball: Setting drills to do at home](https://www.theartofcoachingvolleyball.com/alisha-glass-on-setting/)
  Referencia de que levantadores podem melhorar tecnica de soltura e precisao com exercicios simples em casa.
- [React: Passing Props to a Component](https://react.dev/learn/passing-props-to-a-component)
  Guia oficial para entender como um componente recebe dados. Use quando uma tela precisar passar informacoes para componentes menores.
- [React: State, a Component's Memory](https://react.dev/learn/state-a-components-memory)
  Guia oficial sobre estado em React. Use para filtros, selecoes, formularios e qualquer dado que muda com interacao.
- [Vite: Features](https://vite.dev/guide/features)
  Documentacao oficial sobre o ambiente de desenvolvimento usado pelo projeto. Use para entender importacoes, HMR, TypeScript e build.
- [MDN: Web Storage API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Storage_API)
  Referencia de navegador para `localStorage` e `sessionStorage`. Use quando o app precisar lembrar escolhas ou rascunhos localmente.
- [MediaPipe Pose Landmarker](https://developers.google.com/edge/mediapipe/solutions/vision/pose_landmarker)
  Base leve para detectar pontos do corpo em imagem, video e webcam. Usado na tela `Videos` para gerar a primeira evidencia local revisavel.
- [Sports2D](https://github.com/davidpagnon/Sports2D)
  Projeto open source para calcular trajetorias e angulos 2D em videos de esporte. O app tem um adaptador local (`npm run video:sports2d`) para converter `.mot/.csv` em evidencia revisavel.
- [Volleyball Analytics](https://github.com/masouduut94/volleyball_analytics)
  Referencia open source especifica de volei com deteccao de bola, acoes e estado de jogo. Estudar antes de adaptar por causa da licenca GPL-2.0 e da complexidade.
- [VolleyVision](https://github.com/shukkkur/VolleyVision)
  Referencia de volei para bola, atletas, quadra, eventos e estatisticas. Use como inspiracao de arquitetura, nao como dependencia direta.
- [OpenVolley ovml](https://github.com/openvolley/ovml)
  Pacote MIT para machine learning em analytics de volei, incluindo YOLO e deteccao experimental de bola. Mais util para fase de jogo coletivo.
- [ShotFormCorrecter](https://github.com/AggieSportsAnalytics/ShotFormCorrecter)
  Exemplo de basquete usando MediaPipe para medir angulos. Bom padrao para adaptar `landmark -> angulo -> evidencia` ao saque e ataque.
- [CourtSense Vision Engine](https://github.com/oliver9842/courtsense-vision)
  Exemplo recente de basquete com API Flask, MediaPipe, OpenCV, fases do arremesso e feedback tecnico. Use como referencia de pipeline `upload -> frames -> fase -> feedback`, nao como dependencia direta.
- [Basketball Shot Analyzer](https://github.com/suryanch/basketball-shot-analyzer)
  Exemplo de gesto esportivo com pose, mao, bola, frame de soltura e maquina de estados. Bom para pensar `preparacao -> contato -> finalizacao` no saque e ataque.
- [OpenMMLab MMPose](https://github.com/open-mmlab/mmpose)
  Toolbox maduro de estimativa de pose em PyTorch. Use em fases futuras quando o projeto ja tiver videos marcados manualmente.
- [OpenMMLab MMAction2](https://github.com/open-mmlab/mmaction2)
  Toolbox de entendimento de video e reconhecimento de acoes. Use como referencia futura para classificar eventos por esqueleto ou por clip.
- [ACSM: 2026 Resistance Training Guidelines](https://acsm.org/resistance-training-guidelines-update-2026/)
  Base para dosar forca, potencia e treinamento com peso corporal/elastico. Use ao definir carga, volume e objetivo dos blocos fisicos.
- [ACSM Position Stand: Progression Models in Resistance Training](https://pubmed.ncbi.nlm.nih.gov/19204579/)
  Referencia para descanso por objetivo: potencia/forca pedem descansos mais longos; resistencia local usa descansos mais curtos.
- [Effects of Plyometric Jump Training on Vertical Jump Height of Volleyball Players](https://pubmed.ncbi.nlm.nih.gov/32874101/)
  Meta-analise especifica de volei. Use para justificar blocos de pliometria voltados a impulsao.
- [The Effect of Plyometric Training in Volleyball Players](https://pubmed.ncbi.nlm.nih.gov/31426481/)
  Revisao sobre pliometria no volei, com efeitos em salto, forca, salto horizontal, flexibilidade e agilidade/velocidade.
- [VolleyVeilig warm-up programme](https://repository.up.ac.za/server/api/core/bitstreams/ac5ec16e-8576-4012-888b-f96c8254b3f0/content)
  Estudo de programa de aquecimento para jovens atletas de volei. Use para embasar mobilidade, core, membros inferiores e ombro antes do treino.
- [IJSPT: Trunk and Balance Warm-up Exercises in Male Volleyball](https://ijspt.scholasticahq.com/article/38019-the-effectiveness-of-trunk-and-balance-warm-up-exercises-in-prevention-severity-and-length-of-limitation-from-overuse-and-acute-lower-limb-injuries)
  Estudo sobre aquecimento com tronco e equilibrio em volei masculino. Use como cuidado: pode reduzir severidade/carga de lesao, mas nao substitui gestao de volume.
- [University of Calgary SHRED: Volleyball Neuromuscular Training](https://www.ucalgary.ca/shred-injuries/all-sports/volleyball)
  Referencia de aquecimento neuromuscular de 10 a 12 minutos para volei. Use para desenhar blocos curtos antes de treino e jogo.
- [AAOS: Volleyball Injury Prevention](https://orthoinfo.aaos.org/en/staying-healthy/volleyball-injury-prevention/)
  Referencia clinica geral para prevencao de lesoes no volei, incluindo aquecimento, condicionamento, forca e flexibilidade.

## Wisdom (Communities)

- [Reactiflux Discord](https://www.reactiflux.com/)
  Comunidade grande de React. Use para duvidas praticas de componentes, estado e organizacao de app.
- [Stack Overflow: React](https://stackoverflow.com/questions/tagged/reactjs)
  Base publica de perguntas e respostas. Use para erros especificos, sempre conferindo data, versao e contexto.

## Gaps

- Ainda falta escolher recursos de volei em portugues para treinamento, metodologia de categorias de base e analise pedagogica de fundamentos.
- Ainda falta definir uma comunidade brasileira ou local para validar o produto com treinadores e atletas reais.
