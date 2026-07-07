const styles = ['Todos', 'Tecnico', 'Tatico', 'Fisico'];

const localStorage = (() => {
  try {
    const storage = window.localStorage;
    const probeKey = '__isa_storage_probe__';
    storage.setItem(probeKey, '1');
    storage.removeItem(probeKey);
    return storage;
  } catch {
    const fallback = new Map();
    return {
      getItem: (key) => (fallback.has(key) ? fallback.get(key) : null),
      setItem: (key, value) => fallback.set(key, String(value)),
      removeItem: (key) => fallback.delete(key),
    };
  }
})();

const pageItems = [
  ['dashboard', '01', 'Visão geral', 'Resumo do atleta'],
  ['treinos', '02', 'Plano de treino', 'Semana de treino'],
  ['exercicios', '03', 'Exercícios em casa', 'Biblioteca por posição'],
  ['fisico-mobilidade', '04', 'Físico e Mobilidade', 'Força, mobilidade e prevenção'],
  ['individual', '05', 'Correções', 'Metas práticas'],
  ['leitura', '06', 'Leitura de jogo', 'Decisões em quadra'],
  ['videos', '07', 'Vídeos', 'Análise premium'],
  ['relatorios', '08', 'Progresso', 'Registro e evolução'],
];

const navItems = pageItems;

const completedTrainingStorageKey = 'isa.completedTrainings';
let sessions = readCompletedTrainingSessions();

const fundamentals = [
  { name: 'Saque', score: 0, delta: 0, color: '#45d7c8' },
  { name: 'Recepcao', score: 0, delta: 0, color: '#ffb238' },
  { name: 'Levantamento', score: 0, delta: 0, color: '#76dc6e' },
  { name: 'Ataque', score: 0, delta: 0, color: '#ff6a57' },
  { name: 'Bloqueio', score: 0, delta: 0, color: '#86a8ff' },
  { name: 'Defesa', score: 0, delta: 0, color: '#b5c8c6' },
];

const videoMotionPhases = [
  {
    fundamental: 'Saque',
    phases: [
      ['Preparacao', 'Lancamento estavel, tronco organizado e base equilibrada.'],
      ['Contato', 'Punho acima do ombro, cotovelo estendido e bola a frente do corpo.'],
      ['Finalizacao', 'Braco acompanha a direcao e corpo termina equilibrado.'],
    ],
    signal: 'Momento-chave: contato alto com a bola.',
    sourceHint: 'MediaPipe ou Sports2D podem medir punho, ombro e cotovelo.',
  },
  {
    fundamental: 'Recepcao',
    phases: [
      ['Preparacao', 'Base baixa, peso a frente e leitura da trajetoria.'],
      ['Contato', 'Plataforma firme, bracos alinhados e angulo direcionado ao alvo.'],
      ['Recuperacao', 'Controle apos o contato para voltar ao proximo movimento.'],
    ],
    signal: 'Momento-chave: plataforma no contato.',
    sourceHint: 'MediaPipe ajuda com quadril, joelho, ombro e punho; bola fica para fase futura.',
  },
  {
    fundamental: 'Ataque',
    phases: [
      ['Preparacao', 'Ritmo da passada e armacao do braco antes do salto.'],
      ['Contato', 'Alcance alto, cotovelo estendido e tronco controlado.'],
      ['Aterrissagem', 'Queda equilibrada com joelhos absorvendo impacto.'],
    ],
    signal: 'Momento-chave: maior alcance do braco de ataque.',
    sourceHint: 'O padrao de basquete de release frame vira contato de ataque no volei.',
  },
  {
    fundamental: 'Bloqueio',
    phases: [
      ['Preparacao', 'Passo lateral curto e maos prontas antes do salto.'],
      ['Alcance', 'Maos acima da rede simulada e tronco sem cair para frente.'],
      ['Queda', 'Pouso equilibrado e pronto para a proxima defesa.'],
    ],
    signal: 'Momento-chave: maior alcance das maos.',
    sourceHint: 'Pose estima maos, ombros, quadril, joelhos e tornozelos para checar eixo.',
  },
  {
    fundamental: 'Defesa',
    phases: [
      ['Preparacao', 'Postura baixa, leitura e centro de gravidade pronto.'],
      ['Contato', 'Deslocamento curto com plataforma ou mao controlada.'],
      ['Recuperacao', 'Volta rapida para base depois da defesa.'],
    ],
    signal: 'Momento-chave: base mais baixa antes ou durante o contato.',
    sourceHint: 'Sports2D ajuda a comparar flexao de joelho e inclinacao do tronco.',
  },
];

const videoSampleClips = [
  {
    id: 'saque-baixo-animado',
    title: 'Saque baixo animado',
    fundamental: 'Saque',
    phase: 'Contato',
    duration: '14 s',
    source: 'public/assets/videos/sample-saque-baixo.webm',
    fileName: 'sample-saque-baixo.webm',
    license: 'CC BY-SA 4.0',
    credit: 'Daniel Sanchez Moll / Wikimedia Commons',
    sourceUrl: 'https://commons.wikimedia.org/wiki/File:Volleyball_serve.ogv',
    focus: 'Bom para testar contato alto, linha do braco e preview sem expor atleta real.',
  },
  {
    id: 'jogo-quadra-curto',
    title: 'Jogo curto em quadra',
    fundamental: 'Recepcao',
    phase: 'Preparacao',
    duration: '12 s',
    source: 'public/assets/videos/sample-jogo-quadra.webm',
    fileName: 'sample-jogo-quadra.webm',
    license: 'CC BY-SA 4.0',
    credit: 'Nsambaivan / Wikimedia Commons',
    sourceUrl: 'https://commons.wikimedia.org/wiki/File:Volleyball.ogv',
    focus: 'Ajuda a testar video real de quadra, enquadramento amplo e leitura de base.',
  },
  {
    id: 'ace-paris',
    title: 'Ace em rally curto',
    fundamental: 'Saque',
    phase: 'Finalizacao',
    duration: '8 s',
    source: 'public/assets/videos/sample-ace-paris.webm',
    fileName: 'sample-ace-paris.webm',
    license: 'CC0',
    credit: 'Shev123 / Wikimedia Commons',
    sourceUrl: 'https://commons.wikimedia.org/wiki/File:Paris_Volley_-_Chaumont,_18_February_2014_-_43_-_Ace.webm',
    focus: 'Serve para testar processamento com movimento de jogo e acao rapida.',
  },
];

const videoMovementMetricMap = [
  {
    fundamental: 'Saque',
    phase: 'Contato',
    signal: 'Contato alto e braco organizado',
    metric: 'Punho acima do ombro + cotovelo estendido',
    joints: 'punho, ombro e cotovelo',
    sources: 'MediaPipe agora; Sports2D para angulos exportados',
    manualCheck: 'Pausar no contato e confirmar se a bola esta a frente do corpo.',
    nextAction: 'Gravar 3 saques laterais curtos e parear com checagem manual.',
  },
  {
    fundamental: 'Saque',
    phase: 'Finalizacao',
    signal: 'Braco acompanha a direcao do saque',
    metric: 'Linha ombro-cotovelo-punho na finalizacao',
    joints: 'ombro, cotovelo e punho',
    sources: 'MediaPipe para linha do braco; Sports2D para angulo de cotovelo',
    manualCheck: 'Confirmar se o braco terminou alto e na direcao do alvo, sem perder equilibrio.',
    nextAction: 'Comparar finalizacao com o mesmo alvo em 3 saques controlados.',
  },
  {
    fundamental: 'Recepcao',
    phase: 'Contato',
    signal: 'Plataforma firme com base baixa',
    metric: 'Flexao de joelho + alinhamento dos bracos',
    joints: 'quadril, joelho, tornozelo, ombro e punho',
    sources: 'MediaPipe para postura; Sports2D para flexao de joelho',
    manualCheck: 'Confirmar se a plataforma aponta para o alvo e se o tronco nao subiu cedo.',
    nextAction: 'Filmar 3 recepcoes com camera parada e uma trajetoria por clip.',
  },
  {
    fundamental: 'Ataque',
    phase: 'Contato',
    signal: 'Maior alcance do braco de ataque',
    metric: 'Punho alto + extensao de cotovelo + tronco controlado',
    joints: 'punho, cotovelo, ombro, quadril e joelho',
    sources: 'MediaPipe no navegador; Sports2D quando houver plano lateral claro',
    manualCheck: 'Confirmar o frame de contato antes de avaliar altura ou correcao.',
    nextAction: 'Separar contato e aterrissagem em clips curtos diferentes.',
  },
  {
    fundamental: 'Bloqueio',
    phase: 'Alcance',
    signal: 'Maos acima da rede simulada',
    metric: 'Maos altas + extensao de cotovelo',
    joints: 'punho, cotovelo, ombro e tronco',
    sources: 'MediaPipe para alcance; Sports2D para angulos de braco',
    manualCheck: 'Confirmar se as maos chegam juntas e acima da linha-alvo do bloqueio.',
    nextAction: 'Filmar bloqueios curtos separando alcance e queda para nao misturar criterios.',
  },
  {
    fundamental: 'Bloqueio',
    phase: 'Queda',
    signal: 'Aterrissagem equilibrada depois do alcance',
    metric: 'Flexao de joelho + eixo do tronco',
    joints: 'quadril, joelho, tornozelo, ombro e tronco',
    sources: 'Sports2D para angulos; Vert Tracker como referencia futura de salto',
    manualCheck: 'Checar se o atleta cai pronto para a proxima defesa, sem joelho colapsar.',
    nextAction: 'Usar primeiro como prevencao e qualidade de queda, nao como nota automatica.',
  },
  {
    fundamental: 'Defesa',
    phase: 'Preparacao',
    signal: 'Base mais baixa antes da leitura',
    metric: 'Altura relativa do quadril + flexao de joelho',
    joints: 'quadril, joelho e tornozelo',
    sources: 'MediaPipe para landmarks; Sports2D para tendencia de angulo',
    manualCheck: 'Confirmar se a base baixa aparece antes do contato, nao so depois.',
    nextAction: 'Filmar deslocamentos curtos por zona e comparar estabilidade.',
  },
  {
    fundamental: 'Levantamento',
    phase: 'Contato',
    signal: 'Maos altas e corpo de frente para o alvo',
    metric: 'Maos acima da testa + alinhamento de tronco',
    joints: 'punho, cotovelo, ombro e quadril',
    sources: 'MediaPipe como primeiro teste; Sports2D se o plano estiver limpo',
    manualCheck: 'Confirmar se a decisao do alvo foi escolhida antes do toque.',
    nextAction: 'Conectar a metrica com leitura de jogo, nao apenas gesto de braco.',
  },
];

const videoAiProjectCandidates = [
  {
    name: 'Sports2D',
    url: 'github.com/davidpagnon/Sports2D',
    license: 'BSD-3-Clause',
    priority: 'Pilotar agora',
    scope: 'Angulos 2D, trajetorias e cinematica de um atleta.',
    volleyballUse: 'Saque, ataque, bloqueio e defesa em clips curtos com camera parada.',
    nextTest: 'Rodar .mot/.csv e comparar punho, cotovelo e joelho contra checagem manual.',
    caution: 'Funciona melhor quando o movimento acontece em um plano claro.',
  },
  {
    name: 'MediaPipe Pose',
    url: 'developers.google.com/mediapipe',
    license: 'Apache-2.0',
    priority: 'Ja integrado',
    scope: 'Landmarks do corpo no navegador, sem backend pesado.',
    volleyballUse: 'Primeira leitura de contato alto, base baixa e aterrissagem.',
    nextTest: 'Validar 3 clips reais por fundamento e medir divergencias por fase.',
    caution: 'Sugere evidencia; nao decide correcao sozinha.',
  },
  {
    name: 'volleystat',
    url: 'github.com/SettNozz/volleystat',
    license: 'Sem licenca declarada',
    priority: 'Estudar depois',
    scope: 'Pipeline de volei com bola, pose, quadra e tracking.',
    volleyballUse: 'Referencia para fase futura de bola, quadra e eventos coletivos.',
    nextTest: 'Separar ideias de calibracao de quadra e trajetoria da bola sem trazer stack pesada.',
    caution: 'Sem licenca clara para copiar codigo; exige GPU, modelos YOLO e calibracao de quadra.',
  },
  {
    name: 'OpenVolley ovml',
    url: 'github.com/openvolley/ovml',
    license: 'MIT',
    priority: 'Referencia permissiva',
    scope: 'Machine learning para analytics de volei, com foco em bola e jogo.',
    volleyballUse: 'Referencia para fase futura de bola, quadra e leitura coletiva.',
    nextTest: 'Estudar formato de dados quando existir pergunta clara de bola/quadra.',
    caution: 'Mesmo com licenca permissiva, nao substitui o piloto de gesto individual.',
  },
  {
    name: 'Volleyball Analytics',
    url: 'github.com/masouduut94/volleyball_analytics',
    license: 'GPL-2.0',
    priority: 'Referencia GPL',
    scope: 'Deep learning para jogo de volei, bola, acoes e estado de rally.',
    volleyballUse: 'Referencia para jogo completo, nao para copiar codigo no MVP atual.',
    nextTest: 'Usar apenas como estudo de fluxo e implementar criterios proprios.',
    caution: 'Licenca GPL-2.0 exige cuidado; nao clonar como base direta do produto.',
  },
  {
    name: 'Vert Tracker',
    url: 'github.com/fatokik/vert-tracker',
    license: 'Sem licenca declarada',
    priority: 'Referencia salto',
    scope: 'Mede altura de salto em aproximacao de volei com MediaPipe e estados do movimento.',
    volleyballUse: 'Referencia para ataque, bloqueio e aterrissagem, principalmente no criterio de salto.',
    nextTest: 'Aproveitar ideias de calibracao e maquina de estados sem copiar codigo.',
    caution: 'Projeto de drone e sem licenca declarada; fica como referencia conceitual.',
  },
  {
    name: 'Pose2Sim',
    url: 'github.com/perfanalytics/pose2sim',
    license: 'BSD-3-Clause',
    priority: 'Pesquisa 3D',
    scope: 'Cinematica 3D e OpenSim com multiplas cameras.',
    volleyballUse: 'Comparar aterrissagem, bloqueio e carga de joelho quando houver coleta melhor.',
    nextTest: 'Manter como referencia; nao entra no MVP sem necessidade de 3D.',
    caution: 'Mais poderoso, mas complexo para o momento atual.',
  },
  {
    name: 'Basquete com maquina de estados',
    url: 'github.com/Ez-C99/my-computer-vision-jumpshot',
    license: 'Apache-2.0',
    priority: 'Adaptar conceito',
    scope: 'Fases do arremesso, tracking e metricas testaveis.',
    volleyballUse: 'Traduzir release frame para contato do saque/ataque e aterrissagem.',
    nextTest: 'Usar como desenho de algoritmo, nao como dependencia direta.',
    caution: 'O criterio tecnico precisa virar volei antes de virar codigo.',
  },
];

const videoAiSourceRouteCatalog = {
  sports2d: {
    name: 'Sports2D',
    integrationMode: 'external-cli',
    license: 'BSD-3-Clause',
    status: 'pilot-with-manual-review',
    cloneDecision: 'do-not-clone-yet',
    nextAction: 'Rodar em clips reais curtos e comparar com checagem manual.',
  },
  mediapipe: {
    name: 'MediaPipe Pose',
    integrationMode: 'browser-sdk',
    license: 'Apache-2.0',
    status: 'pilot-with-manual-review',
    cloneDecision: 'do-not-clone',
    nextAction: 'Gerar sugestao local no navegador e manter como Revisar.',
  },
  'vert-tracker': {
    name: 'Vert Tracker',
    integrationMode: 'reference-later',
    license: 'Sem licenca declarada',
    status: 'reference-only',
    cloneDecision: 'do-not-clone',
    nextAction: 'Aproveitar ideias de salto sem copiar codigo.',
  },
};

const styleGuides = [
  {
    name: 'Tecnico',
    focus: 'Precisao dos fundamentos em exercicios solo',
    activities: 'Parede, bola leve, toalha, alvo com fita e repeticoes curtas',
    dose: '3 series curtas',
    evidence: 'acertos, controle e gesto limpo',
    caution: 'Use menos forca e mais repeticao comparavel.',
    exercise: 'Manchete controlada na parede',
    metric: 'percentual de bolas no alvo',
  },
  {
    name: 'Tatico',
    focus: 'Leitura individual e tomada de decisao em casa',
    activities: 'Simulacao de posicao, marcas visuais no chao, alvos na parede e revisao manual de video',
    dose: '2 blocos de leitura',
    evidence: 'decisao escolhida e zona de referencia',
    caution: 'Adapte quadra para parede, alvo ou marca no chao.',
    exercise: 'Base defensiva e reacao curta',
    metric: 'decisao escolhida antes do movimento',
  },
  {
    name: 'Fisico',
    focus: 'Forca, potencia, mobilidade e prevencao em pouco espaco',
    activities: 'Core, estabilidade, agachamento, deslocamento curto, aterrissagem controlada e preparacao de ombro',
    dose: '20 a 30 segundos',
    evidence: 'equilibrio, postura e controle final',
    caution: 'Pare antes de perder tecnica ou seguranca.',
    exercise: 'Passada de ataque com toalha',
    metric: 'repeticoes equilibradas',
  },
];

const sharedServeDefenseFocus = {
  items: [
    'Estratégia de alvo: escolher zona vulnerável antes de executar.',
    'Pressão: manter intenção mesmo em repetições curtas dentro de casa.',
    'Zonas vulneráveis: simular corredor, fundo centro e bola curta com marcas no chão.',
    'Controle de erro: contar perdas por série e ajustar a próxima repetição.',
  ],
  exercises: [
    {
      id: 'universal-saque-alvo',
      fundamental: 'Saque',
      title: 'Mapa de alvo do saque na parede',
      objective: 'Treinar escolha de alvo, pressão e controle do erro sem precisar de quadra.',
      environment: 'Individual em casa',
      materials: 'Parede livre, fita adesiva e bola leve ou bola de meia.',
      duration: '8 a 10 min',
      setup: 'Marque três alvos na parede. Siga uma ordem escrita de alvos e execute com controle, anotando acerto, erro curto ou erro longo.',
      variations: ['Alternar alvo a cada repetição', 'Fazer 5 bolas seguidas no mesmo alvo', 'Reduzir força quando errar duas vezes seguidas'],
      metric: 'Acertos por alvo e erros evitáveis por série.',
    },
    {
      id: 'universal-defesa-zonas',
      fundamental: 'Defesa',
      title: 'Defesa curta por zonas no chão',
      objective: 'Criar leitura de zonas vulneráveis e resposta defensiva curta em pouco espaço.',
      environment: 'Individual em casa',
      materials: 'Fita no chão, cronômetro e bola de meia.',
      duration: '6 a 9 min',
      setup: 'Marque três zonas pequenas no chão. Siga uma sequência visual de zonas, desloque em base baixa, toque a marca e volte ao centro.',
      variations: ['Usar ordem aleatória', 'Adicionar controle da bola de meia ao voltar', 'Fazer séries de 20 segundos'],
      metric: 'Repetições com base baixa, decisão rápida e retorno equilibrado.',
    },
    {
      id: 'universal-ombro-elastico',
      fundamental: 'Físico',
      title: 'Rotação externa e Y com elástico',
      objective: 'Preparar manguito, escápulas e costas para saque, ataque, levantamento e defesa alta sem aumentar impacto.',
      environment: 'Individual em casa',
      materials: 'Elástico leve preso com segurança ou segurado nas mãos.',
      duration: '5 a 7 min',
      setup: 'Faça rotação externa com cotovelo colado ao corpo e depois elevação em Y com braços estendidos. Movimento lento, ombros longe da orelha e sem dor.',
      variations: ['Sem elástico, só ativação do gesto', 'Elástico mais leve e mais controle', 'Fazer antes de saque, ataque ou treino de ombro'],
      metric: '2 séries de 8 a 12 repetições sem dor, sem arquear a lombar e sem elevar os ombros.',
    },
  ],
};

const positionContents = [
  {
    id: 'levantador',
    name: 'Levantador',
    description: 'Treino para organizar o jogo: ler bloqueio, escolher a jogada, manter ritmo e entregar a bola com precisão.',
    fundamentals: ['Leitura do bloqueio', 'Escolha de jogada', 'Ritmo do toque', 'Precisao do toque', 'Engano corporal'],
    homeExercises: [
      {
        id: 'levantador-toque-alvo',
        fundamental: 'Levantamento',
        title: 'Toque de dedos com alvo alternado',
        objective: 'Unir precisao do toque com escolha de alvo antes do contato.',
        environment: 'Individual em casa',
        materials: 'Parede, fita para alvo e bola leve.',
        duration: '8 a 12 min',
        setup: 'Marque dois alvos na parede. Alterne entrada e saida por uma sequência escrita e envie a bola para o alvo correspondente.',
        variations: ['Alternar alvo alto e medio', 'Agachar levemente entre toques', 'Fazer uma finta corporal antes do toque'],
        metric: 'Acertos no alvo correto mantendo pes ajustados antes das maos.',
      },
      {
        id: 'levantador-ritmo-pes',
        fundamental: 'Levantamento',
        title: 'Ritmo de pe e quadril para levantar',
        objective: 'Chegar equilibrado para escolher jogada sem atrasar o corpo.',
        environment: 'Individual em casa',
        materials: 'Fita no chao e cronometro.',
        duration: '6 a 8 min',
        setup: 'Marque centro, esquerda e direita. Desloque, enquadre quadril para o alvo e simule o levantamento com maos altas.',
        variations: ['Sem bola', 'Com bola leve', 'Alternando alvo alto e alvo medio'],
        metric: 'Repeticoes chegando de frente e sem cruzar os pes.',
      },
      {
        id: 'levantador-engano',
        fundamental: 'Leitura',
        title: 'Engano corporal controlado',
        objective: 'Treinar olhar, tronco e maos para esconder a escolha da jogada.',
        environment: 'Individual em casa',
        materials: 'Espelho ou camera do celular.',
        duration: '5 a 8 min',
        setup: 'Simule olhar para um alvo e finalizar para outro. Grave tres repeticoes e veja se o corpo entrega a decisao cedo demais.',
        variations: ['Olhar para entrada e finalizar saida', 'Simular bola de segunda', 'Fazer sem salto para manter controle'],
        metric: 'Repeticoes em que a decisao fica escondida ate o gesto final.',
      },
      {
        id: 'levantador-front-back-parede',
        fundamental: 'Levantamento',
        title: 'Frente e costas na parede',
        objective: 'Treinar decisao rapida entre bola para frente e bola para tras, sem depender de atacante.',
        environment: 'Individual em casa',
        materials: 'Parede livre, fita para dois alvos e bola leve.',
        duration: '8 a 10 min',
        setup: 'Marque um alvo a esquerda e outro a direita. Use uma ordem escrita de frente/costas e envie para o alvo correspondente com toque alto.',
        variations: ['Alternar alvo por serie', 'Alternar passe A, B e C imaginario', 'Fazer uma recuperacao de base antes do toque'],
        metric: 'Bolas que chegam no alvo certo depois da escolha planejada.',
      },
      {
        id: 'levantador-bola-ruim-segura',
        fundamental: 'Decisao',
        title: 'Bola ruim para escolha segura',
        objective: 'Aprender a simplificar a jogada quando o passe tira o levantador da zona ideal.',
        environment: 'Individual em casa',
        materials: 'Fita no chao, bola leve e parede opcional.',
        duration: '6 a 8 min',
        setup: 'Marque uma zona ideal e duas zonas ruins. Saia de cada zona, enquadre o corpo e escolha: bola alta na ponta, bola alta na saida ou bola de seguranca.',
        variations: ['Sem bola para treinar pes', 'Com toque de dedos', 'Com manchete de emergencia'],
        metric: 'Decisoes seguras feitas sem cair para tras ou girar o corpo tarde demais.',
      },
    ],
    gameReading: ['Identificar se o bloqueio esta atrasado, aberto ou adiantado.', 'Escolher jogada pela qualidade do passe e pelo tempo das atacantes imaginadas.', 'Registrar a escolha e conferir se o gesto combinou com o alvo.'],
    physicalFocus: ['Mobilidade de punho e ombro', 'Base baixa com deslocamento curto', 'Estabilidade de core para tocar equilibrado'],
    mentalFocus: ['Decidir antes do contato', 'Executar o alvo escolhido sem hesitar', 'Aceitar uma escolha simples quando a bola esta dificil'],
    weeklyPlan: [
      ['Segunda', 'Toque e ritmo', 'Toque de dedos com alvo alternado.'],
      ['Terca', 'Fisico curto', 'Core, ombro e deslocamento lateral controlado.'],
      ['Quarta', 'Leitura', 'Simular bloqueio aberto, fechado e atrasado antes do toque.'],
      ['Quinta', 'Engano corporal', 'Olhar para um alvo e finalizar para outro com video curto.'],
      ['Sexta', 'Saque e defesa', 'Mapa de alvo e defesa curta por zonas.'],
      ['Sabado', 'Revisao', 'Anotar uma decisao boa e uma decisao confusa.'],
      ['Domingo', 'Recuperacao', 'Mobilidade de ombro, punho e coluna toracica.'],
    ],
  },
  {
    id: 'libero',
    name: 'Líbero',
    description: 'Treino para sustentar a linha de passe: ler ataque, defender no lugar certo, receber com plataforma firme e controlar a direcao da bola.',
    fundamentals: ['Leitura de ataque', 'Posicionamento defensivo', 'Recepcao', 'Levantamento de emergencia', 'Controle de plataforma'],
    homeExercises: [
      {
        id: 'libero-manchete-alvo',
        fundamental: 'Recepcao',
        title: 'Manchete com alvo e ajuste de zona',
        objective: 'Treinar plataforma e direcao como se estivesse sustentando a linha de passe.',
        environment: 'Individual em casa',
        materials: 'Parede, fita para alvo e bola leve.',
        duration: '8 a 12 min',
        setup: 'Marque um alvo na parede e duas marcas de base no chao. Alterne a base antes da manchete e controle a bola para o alvo.',
        variations: ['Base parada', 'Um passo lateral antes do contato', 'Alternar alvo baixo e medio'],
        metric: 'Sequencia maxima com plataforma estavel, base ajustada e alvo correto.',
      },
      {
        id: 'libero-defesa-postura',
        fundamental: 'Defesa',
        title: 'Base baixa com leitura de ataque',
        objective: 'Manter postura defensiva e reagir sem levantar o tronco antes da hora.',
        environment: 'Individual em casa',
        materials: 'Fita no chao, cronometro e bola de meia.',
        duration: '6 a 10 min',
        setup: 'Marque tres pontos. Siga uma ordem visual de direcoes, toque o ponto em base baixa e recupere o centro.',
        variations: ['Com ordem escrita de zonas', 'Com bola de meia para controlar no retorno', 'Series de 15 segundos com descanso curto'],
        metric: 'Repeticoes sem perder base baixa.',
      },
      {
        id: 'libero-plataforma-curta-funda',
        fundamental: 'Recepcao',
        title: 'Plataforma curta e funda',
        objective: 'Treinar angulo de plataforma para controlar bola curta, media e funda.',
        environment: 'Individual em casa',
        materials: 'Parede, fita para alvo e tres marcas no chao.',
        duration: '7 a 9 min',
        setup: 'Marque curta, media e funda no chao. Receba na parede e ajuste o angulo da plataforma para mandar a bola ao alvo depois de pisar na marca da serie.',
        variations: ['Series por zona', 'Um passo lateral antes do contato', 'Gravar de lado para ver se a plataforma muda cedo'],
        metric: 'Bolas no alvo com plataforma ajustada antes do contato.',
      },
      {
        id: 'libero-dig-set-parede',
        fundamental: 'Defesa',
        title: 'Defesa e levantamento de emergencia',
        objective: 'Transformar defesa baixa em segunda bola alta e jogavel para a ponta.',
        environment: 'Individual em casa',
        materials: 'Parede, fita para alvo alto e bola leve.',
        duration: '8 a 10 min',
        setup: 'Jogue a bola na parede, defenda para cima com manchete controlada e em seguida envie uma bola alta para o alvo marcado.',
        variations: ['Defender e pegar a bola antes de levantar', 'Defender, ajustar os pes e tocar de dedos', 'Alternar alvo de ponta e saida'],
        metric: 'Defesas que viram bola alta controlada para o alvo.',
      },
      {
        id: 'libero-angulo-curta-fundo',
        fundamental: 'Leitura',
        title: 'Leitura curta ou fundo',
        objective: 'Treinar primeiro passo e angulo de plataforma para largada curta ou ataque no fundo.',
        environment: 'Individual em casa',
        materials: 'Tres marcas no chao, cronometro e bola de meia.',
        duration: '6 a 8 min',
        setup: 'Marque curta, meio e fundo. Use uma ordem de zonas, de o primeiro passo em base baixa e finalize com plataforma apontada para o alvo.',
        variations: ['Com ordem alternada de zonas', 'Com bola de meia no final', 'Gravar de lado para ver se o tronco sobe cedo'],
        metric: 'Primeiro passo correto antes de levantar o tronco.',
      },
    ],
    gameReading: ['Ler ombro e passada do atacante.', 'Ajustar um passo antes do contato, nao depois.', 'Organizar mentalmente quem cobre curta, fundo e corredor.'],
    physicalFocus: ['Quadril e tornozelo para base baixa', 'Core anti-rotacao', 'Deslocamento lateral curto'],
    mentalFocus: ['Coragem para ocupar a bola', 'Calma depois de erro de recepcao', 'Atencao ao sinal do atacante'],
    weeklyPlan: [
      ['Segunda', 'Recepcao', 'Manchete com alvo e ajuste de zona.'],
      ['Terca', 'Defesa', 'Base baixa e reacao curta por zonas.'],
      ['Quarta', 'Fisico', 'Mobilidade de quadril, core e tornozelo.'],
      ['Quinta', 'Leitura', 'Simular ataque forte, largada e bola no corpo.'],
      ['Sexta', 'Saque e defesa', 'Mapa de alvo e controle de erro.'],
      ['Sabado', 'Plataforma', 'Alternar plataforma curta, media e funda.'],
      ['Domingo', 'Recuperacao', 'Alongamento leve e revisao das anotacoes.'],
    ],
  },
  {
    id: 'central',
    name: 'Central',
    description: 'Treino para acelerar bloqueio e transicao: tempo correto, leitura do levantador, deslocamento lateral e primeira passada rapida.',
    fundamentals: ['Tempo de bloqueio', 'Leitura do levantador', 'Deslocamento lateral', 'Transicao rapida', 'Alcance com controle'],
    homeExercises: [
      {
        id: 'central-passo-bloqueio',
        fundamental: 'Bloqueio',
        title: 'Passo de bloqueio com leitura de maos',
        objective: 'Treinar deslocamento lateral e tempo de subida sem depender de rede.',
        environment: 'Individual em casa',
        materials: 'Parede livre e fita no chao.',
        duration: '8 a 10 min',
        setup: 'Marque centro, esquerda e direita. Siga uma ordem de direcoes, desloque, suba maos e aterrisse equilibrado.',
        variations: ['Sem salto', 'Mini salto', 'Centro-direita-centro em sequencia'],
        metric: 'Aterrissagens estaveis e maos chegando juntas.',
      },
      {
        id: 'central-leitura-levantador',
        fundamental: 'Leitura',
        title: 'Sombra do levantador',
        objective: 'Responder a pistas de bola rapida, ponta e saida com decisao antecipada.',
        environment: 'Individual em casa',
        materials: 'Tres marcas no chao.',
        duration: '6 a 9 min',
        setup: 'Associe cada marca a uma jogada: meio, ponta e saida. Siga a jogada da sequencia e faca o primeiro passo defensivo ou de bloqueio.',
        variations: ['Aumentar velocidade aos poucos', 'Usar cartoes com meio, ponta e saida', 'Voltar ao centro sempre equilibrado'],
        metric: 'Escolha feita antes do deslocamento.',
      },
      {
        id: 'central-transicao',
        fundamental: 'Ataque',
        title: 'Transicao rapida sem rede',
        objective: 'Sair do bloqueio simulado e preparar ataque curto com controle.',
        environment: 'Individual em casa',
        materials: 'Fita no chao e toalha pequena.',
        duration: '6 a 8 min',
        setup: 'Simule bloqueio, aterrisse, abra um passo para tras e arme o braco com a toalha como se fosse atacar bola rapida.',
        variations: ['Sem salto', 'Com mini salto', 'Com foco em armar o braco alto'],
        metric: 'Tempo entre queda e braco armado sem perder equilibrio.',
      },
      {
        id: 'central-eye-sequence',
        fundamental: 'Bloqueio',
        title: 'Sequencia olho-bola-ombro',
        objective: 'Criar rotina de leitura para nao saltar antes da hora no bloqueio.',
        environment: 'Individual em casa',
        materials: 'Celular com video de jogo ou highlights e tres marcas no chao.',
        duration: '7 a 9 min',
        setup: 'Pause o video antes do levantamento, anote a pista observada e pise na marca meio, ponta ou saida antes de simular o bloqueio.',
        variations: ['Assistir em velocidade normal', 'Pausar no passe', 'Registrar acertos de previsao em papel'],
        metric: 'Previsoes corretas antes da bola sair da mao do levantador.',
      },
      {
        id: 'central-fecha-ponta',
        fundamental: 'Bloqueio',
        title: 'Fechamento com a ponta imaginaria',
        objective: 'Treinar deslocamento para fechar o bloqueio duplo sem cruzar demais os pes.',
        environment: 'Individual em casa',
        materials: 'Fita no chao e parede livre.',
        duration: '6 a 8 min',
        setup: 'Marque centro e antena imaginaria. Saia carregada no centro, faca passo lateral curto para a antena e alinhe as maos na parede.',
        variations: ['Sem salto', 'Mini salto com queda travada', 'Voltar ao centro depois de cada fechamento'],
        metric: 'Chegadas com maos paralelas e aterrissagem equilibrada.',
      },
    ],
    gameReading: ['Ler ombro e maos do levantador.', 'Separar bola rapida de bola alta pela chegada do passe.', 'Voltar do bloqueio pronto para transicao curta.'],
    physicalFocus: ['Potencia com aterrissagem segura', 'Deslocamento lateral', 'Ombro e core para alcance acima da cabeca'],
    mentalFocus: ['Paciencia para nao saltar cedo', 'Compromisso com o primeiro passo', 'Reacao rapida depois do bloqueio'],
    weeklyPlan: [
      ['Segunda', 'Bloqueio', 'Passo lateral e maos juntas na parede.'],
      ['Terca', 'Fisico', 'Saltos baixos, aterrissagem e core.'],
      ['Quarta', 'Leitura', 'Sombra do levantador com tres marcas.'],
      ['Quinta', 'Transicao', 'Bloqueio simulado para armacao de ataque.'],
      ['Sexta', 'Saque e defesa', 'Alvo de saque e defesa curta por zonas.'],
      ['Sabado', 'Revisao', 'Filmar uma sequencia de bloqueio e queda.'],
      ['Domingo', 'Recuperacao', 'Mobilidade de tornozelo, quadril e ombro.'],
    ],
  },
  {
    id: 'ponteiro',
    name: 'Ponteiro',
    description: 'Treino para equilibrar recepcao e ataque: decidir bem, cobrir a jogada e variar a solucao ofensiva.',
    fundamentals: ['Recepcao e ataque', 'Tomada de decisao', 'Cobertura', 'Variacao ofensiva', 'Controle de erro'],
    homeExercises: [
      {
        id: 'ponteiro-recepcao-ataque',
        fundamental: 'Recepcao',
        title: 'Recepcao para passada marcada',
        objective: 'Conectar plataforma de recepcao com preparacao de ataque.',
        environment: 'Individual em casa',
        materials: 'Parede, fita para alvo e marcas no chao.',
        duration: '9 a 12 min',
        setup: 'Faca uma manchete controlada na parede, recupere a base e entre em uma passada curta marcada no chao.',
        variations: ['Sem bola na passada', 'Com toalha no movimento de ataque', 'Alternar alvo de recepcao'],
        metric: 'Recepcoes controladas que viram passada equilibrada.',
      },
      {
        id: 'ponteiro-variacao-ofensiva',
        fundamental: 'Ataque',
        title: 'Variação ofensiva com toalha',
        objective: 'Treinar escolha entre diagonal, paralela e bola curta sem bater forte.',
        environment: 'Individual em casa',
        materials: 'Toalha pequena e tres marcas na parede ou no chao.',
        duration: '7 a 10 min',
        setup: 'Antes da passada escolha pela sequencia: diagonal, paralela ou curta. Finalize o movimento com a toalha apontando para a marca.',
        variations: ['Sem salto', 'Mini salto controlado', 'Escolha aleatoria antes da passada'],
        metric: 'Decisoes escolhidas antes do ultimo apoio.',
      },
      {
        id: 'ponteiro-cobertura',
        fundamental: 'Cobertura',
        title: 'Cobertura depois do ataque',
        objective: 'Criar habito de atacar e voltar para proteger a bola rebatida.',
        environment: 'Individual em casa',
        materials: 'Fita no chao e cronometro.',
        duration: '5 a 8 min',
        setup: 'Marque ponto de ataque e ponto de cobertura. Simule ataque, recue para cobertura e toque o ponto em base baixa.',
        variations: ['Cobertura curta', 'Cobertura profunda', 'Alternar zona antes de voltar'],
        metric: 'Tempo para sair do ataque e chegar na cobertura em postura baixa.',
      },
      {
        id: 'ponteiro-out-of-system',
        fundamental: 'Ataque',
        title: 'Bola alta fora do sistema',
        objective: 'Treinar solucao de entrada quando a bola chega alta, lenta ou fora da antena ideal.',
        environment: 'Individual em casa',
        materials: 'Fita no chao, toalha pequena e parede opcional.',
        duration: '8 a 10 min',
        setup: 'Marque uma bola ideal e uma bola longe. Alterne a passada, espere a bola imaginaria e escolha diagonal, paralela, largada ou bola mantida.',
        variations: ['Escolher a solucao antes do ultimo apoio', 'Sem salto', 'Mini salto com queda equilibrada'],
        metric: 'Escolhas definidas antes do contato e queda sem invadir a marca.',
      },
      {
        id: 'ponteiro-recepcao-linha',
        fundamental: 'Recepcao',
        title: 'Linha de recepcao e ajuste lateral',
        objective: 'Treinar responsabilidade de passe antes de pensar no ataque.',
        environment: 'Individual em casa',
        materials: 'Parede, fita para alvo e duas marcas laterais no chao.',
        duration: '8 a 12 min',
        setup: 'Faca manchete na parede, ajuste um passo para a marca lateral da sequencia e volte para o centro antes da proxima bola.',
        variations: ['Direita-esquerda alternado', 'Ajustar base antes do contato', 'Reduzir forca e aumentar precisao'],
        metric: 'Passes no alvo sem perder a linha de recepcao.',
      },
    ],
    gameReading: ['Decidir entre passar com seguranca e preparar ataque.', 'Ver bloqueio para variar diagonal, paralela ou bola curta.', 'Cobrir o proprio ataque depois da finalizacao.'],
    physicalFocus: ['Ombro saudavel', 'Ritmo de passada', 'Aterrissagem e deslocamento para cobertura'],
    mentalFocus: ['Equilibrar risco e controle', 'Nao carregar erro de passe para o ataque', 'Escolher uma solucao antes do ultimo apoio'],
    weeklyPlan: [
      ['Segunda', 'Recepcao', 'Manchete para alvo e recuperacao para passada.'],
      ['Terca', 'Ataque', 'Passada com toalha e variacao ofensiva.'],
      ['Quarta', 'Fisico', 'Core, ombro e aterrissagem controlada.'],
      ['Quinta', 'Cobertura', 'Ataque simulado e retorno para zona de cobertura.'],
      ['Sexta', 'Saque e defesa', 'Mapa de alvo e defesa curta por zonas.'],
      ['Sabado', 'Decisao', 'Anotar quando variar e quando controlar a bola.'],
      ['Domingo', 'Recuperacao', 'Mobilidade de ombro, quadril e tornozelo.'],
    ],
  },
  {
    id: 'oposto',
    name: 'Oposto',
    description: 'Treino para resolver bolas dificeis: atacar com pouco conforto, explorar bloqueio e preparar bloqueio contra ponteiros e pipe.',
    fundamentals: ['Ataque em bolas dificeis', 'Exploracao do bloqueio', 'Bloqueio contra ponteiros', 'Leitura do pipe', 'Potencia com controle'],
    homeExercises: [
      {
        id: 'oposto-bola-dificil',
        fundamental: 'Ataque',
        title: 'Ataque de bola dificil com toalha',
        objective: 'Treinar solucao ofensiva quando a bola nao chega perfeita.',
        environment: 'Individual em casa',
        materials: 'Toalha pequena e marcas no chao.',
        duration: '8 a 10 min',
        setup: 'Marque uma passada curta e uma passada atrasada. Alterne as duas e finalize com braco alto, buscando equilibrio antes de potencia.',
        variations: ['Sem salto', 'Mini salto', 'Alternar bola alta, longe ou apertada por serie'],
        metric: 'Repeticoes com braco alto e queda equilibrada em bola dificil.',
      },
      {
        id: 'oposto-explorar-bloqueio',
        fundamental: 'Ataque',
        title: 'Explorar bloqueio na parede',
        objective: 'Pensar em mao para fora, desvio e controle quando o bloqueio fecha a bola.',
        environment: 'Individual em casa',
        materials: 'Parede, fita para duas marcas e bola leve.',
        duration: '6 a 9 min',
        setup: 'Marque "mao esquerda" e "mao direita" na parede. Toque a bola leve ou simule com a mao buscando a borda do alvo.',
        variations: ['Alternar bordas', 'Escolher a borda antes do gesto', 'Reduzir velocidade para melhorar precisao'],
        metric: 'Acertos na borda escolhida sem perder controle do corpo.',
      },
      {
        id: 'oposto-bloqueio-pipe',
        fundamental: 'Bloqueio',
        title: 'Bloqueio contra ponteiro e pipe',
        objective: 'Treinar leitura de entrada e fundo com deslocamento curto.',
        environment: 'Individual em casa',
        materials: 'Tres marcas no chao e parede livre.',
        duration: '7 a 10 min',
        setup: 'Use uma marca para ponteiro, uma para pipe e uma para centro. Siga uma ordem de jogadas e ajuste maos na parede sem tocar forte.',
        variations: ['Sem salto', 'Mini salto', 'Voltar ao centro depois de cada leitura'],
        metric: 'Decisao correta e maos alinhadas antes da simulacao de bloqueio.',
      },
      {
        id: 'oposto-saida-diagonal-paralela',
        fundamental: 'Ataque',
        title: 'Saida: diagonal ou paralela',
        objective: 'Criar decisao ofensiva de oposto antes do contato, sem bater forte em casa.',
        environment: 'Individual em casa',
        materials: 'Toalha pequena, fita no chao e duas marcas na parede.',
        duration: '8 a 10 min',
        setup: 'Monte uma passada curta de saida. Antes do ultimo apoio escolha diagonal ou paralela e finalize com a toalha na direcao da marca.',
        variations: ['Sem salto', 'Mini salto', 'Adicionar escolha "explorar" quando a marca estiver bloqueada'],
        metric: 'Decisoes definidas antes do ultimo apoio e braco finalizando alto.',
      },
      {
        id: 'oposto-cobertura-direita',
        fundamental: 'Cobertura',
        title: 'Cobertura da saida e defesa direita',
        objective: 'Treinar a troca entre ataque, cobertura e defesa de direita.',
        environment: 'Individual em casa',
        materials: 'Tres marcas no chao e cronometro.',
        duration: '6 a 8 min',
        setup: 'Marque ataque na saida, cobertura curta e defesa direita. Simule ataque, toque a cobertura e recupere para defesa em base baixa.',
        variations: ['Com ordem alternada de zonas', 'Com bola de meia no final', 'Cronometrar 15 segundos de repeticoes limpas'],
        metric: 'Transicoes completas sem subir demais a postura.',
      },
    ],
    gameReading: ['Reconhecer bola ruim e escolher solucao segura.', 'Ver mao do bloqueio para explorar em vez de forcar sempre.', 'Preparar bloqueio para ponteiro e pipe pela trajetoria do passe.'],
    physicalFocus: ['Potencia de pernas com aterrissagem', 'Estabilidade de ombro', 'Core para atacar fora do eixo'],
    mentalFocus: ['Resolver bola dificil sem pressa', 'Usar o bloqueio como alvo', 'Manter agressividade com controle de erro'],
    weeklyPlan: [
      ['Segunda', 'Ataque dificil', 'Passada atrasada e braco alto com toalha.'],
      ['Terca', 'Bloqueio', 'Leitura contra ponteiro e pipe em tres marcas.'],
      ['Quarta', 'Fisico', 'Potencia, core e aterrissagem controlada.'],
      ['Quinta', 'Exploracao', 'Bordas do bloqueio na parede.'],
      ['Sexta', 'Saque e defesa', 'Mapa de alvo e defesa curta por zonas.'],
      ['Sabado', 'Revisao', 'Anotar uma solucao segura para bola dificil.'],
      ['Domingo', 'Recuperacao', 'Mobilidade de ombro, quadril e tornozelo.'],
    ],
  },
];

const positionDecisionGuides = [
  {
    id: 'central',
    shortName: 'MB',
    role: 'Defende o centro da rede, fecha bloqueios nas pontas e ataca bolas rapidas quando o passe permite.',
    courtBase: 'Z3 na rede; em muitos sistemas sai para o libero no fundo.',
    primaryDecision: 'Ler o levantador adversario cedo sem abandonar o atacante de meio.',
    priority: 'Tempo de bloqueio, deslocamento curto na rede e transicao rapida para ataque.',
    avoid: 'Saltar no chute do levantador antes de enxergar ombro, bola e atacante.',
    keyFundamentals: ['Bloqueio', 'Ataque rapido', 'Transicao', 'Saque tatico'],
    indicators: ['Toques de bloqueio que viram contra-ataque', 'Ataques de primeiro tempo apos passe bom', 'Fechamento correto com ponta ou oposto', 'Erros de rede ou invasao'],
    evidence: ['Maos passando a rede sem tocar na fita', 'Primeiro passo lateral curto e limpo', 'Aterrissagem equilibrada depois do bloqueio', 'Preparacao de bola rapida antes do levantamento'],
    trainingTabs: [
      ['Tecnico', 'Fechar maos e invadir espaco no bloqueio.', 'Passo lateral curto na parede com parada de 2 segundos e maos acima da cabeca.'],
      ['Tatico', 'Escolher entre marcar meio ou ajudar na ponta.', 'Assistir 6 bolas e pausar antes do levantamento para prever a direcao.'],
      ['Fisico', 'Saltos repetidos com queda estavel.', '3 series de 4 saltos verticais, descanso longo e aterrissagem silenciosa.'],
    ],
  },
  {
    id: 'levantador',
    shortName: 'S',
    role: 'Organiza o ataque no segundo toque, ajusta o ritmo do jogo e escolhe a melhor atacante para cada bola.',
    courtBase: 'Busca a zona de levantamento perto da Z2/Z3, mesmo quando recebe fora do alvo.',
    primaryDecision: 'Distribuir a bola pelo melhor equilibrio entre qualidade do passe, bloqueio adversario e atacante disponivel.',
    priority: 'Precisao de bola alta, velocidade de decisao e corpo equilibrado antes do contato.',
    avoid: 'Forcar uma bola rapida quando o passe tirou a equipe do sistema.',
    keyFundamentals: ['Levantamento', 'Defesa', 'Bloqueio na Z2', 'Saque'],
    indicators: ['Bolas atacaveis por tipo de passe', 'Distribuicao entre ponta, central e oposto', 'Ataques com bloqueio simples', 'Erros de dois toques ou conducao'],
    evidence: ['Pe chegando antes das maos', 'Bola saindo com altura e distancia combinadas', 'Ombro neutro para esconder a escolha', 'Backup de levantamento quando defende a primeira bola'],
    trainingTabs: [
      ['Tecnico', 'Chegar embaixo da bola antes de levantar.', 'Toque na parede alternando alvo alto e alvo medio, recuperando base a cada contato.'],
      ['Tatico', 'Escolher atacante conforme passe e bloqueio.', 'Simular passe A para central, passe B para ponta e passe C para bola alta segura.'],
      ['Fisico', 'Deslocamento curto e estabilidade de tronco.', 'Shuffle ate uma marca, parada em base e toque de dedos controlado.'],
    ],
  },
  {
    id: 'oposto',
    shortName: 'OPP',
    role: 'Ataca pela saida, oferece bola de seguranca e bloqueia muitas bolas do ponteiro adversario.',
    courtBase: 'Z2 na rede e opcoes de ataque do fundo conforme sistema da equipe.',
    primaryDecision: 'Ser agressiva na bola boa e inteligente na bola quebrada.',
    priority: 'Ataque de saida, bloqueio contra ponteiro e virada de bola sob pressao.',
    avoid: 'Bater forte em toda bola sem observar bloqueio, cobertura e espaco livre.',
    keyFundamentals: ['Ataque', 'Bloqueio', 'Defesa direita', 'Cobertura'],
    indicators: ['Eficiencia de ataque na saida', 'Bloqueios ou amortecimentos contra ponteiro', 'Erros nao forcados em bola alta', 'Pontos em rally longo'],
    evidence: ['Passada ajustada para bola um pouco fora da antena', 'Mao atacando diagonal ou paralela com intencao', 'Fechamento de bloqueio com o central', 'Recuperacao depois de cobrir largada'],
    trainingTabs: [
      ['Tecnico', 'Controlar direcao do ataque na saida.', 'Passada com toalha alternando finalizacao em diagonal e paralela imaginaria.'],
      ['Tatico', 'Decidir entre bater, explorar ou colocar.', 'Pausar videos de ataque e nomear a melhor decisao antes do contato.'],
      ['Fisico', 'Potencia de salto com ombro protegido.', 'Salto vertical com armacao de braco e mobilidade de ombro antes da serie.'],
    ],
  },
  {
    id: 'libero',
    shortName: 'L',
    role: 'Especialista de fundo que estabiliza recepcao, defesa, cobertura e levantamento de emergencia.',
    courtBase: 'Fundo de quadra, principalmente zonas de recepcao e defesa; nao atua como atacante de rede.',
    primaryDecision: 'Entregar uma segunda bola jogavel quando a primeira acao quebra o sistema.',
    priority: 'Qualidade da recepcao, leitura de ataque e controle emocional em bolas dificeis.',
    avoid: 'Resolver tudo com manchete alta sem direcionar a bola para uma zona util.',
    keyFundamentals: ['Recepcao', 'Defesa', 'Cobertura', 'Levantamento de emergencia'],
    indicators: ['Passe positivo para zona de levantamento', 'Defesas que mantem rally vivo', 'Bolas cobertas apos bloqueio', 'Erros de posicionamento no fundo'],
    evidence: ['Plataforma formando angulo antes do contato', 'Base baixa antes do ataque adversario', 'Primeiro passo ajustado a zona da bola', 'Levantamento de emergencia alto para a ponta'],
    trainingTabs: [
      ['Tecnico', 'Plataforma estavel e direcao do passe.', 'Manchete na parede mirando uma fita, contando sequencias de controle.'],
      ['Tatico', 'Ler largada, diagonal e bola forte.', 'Marcar em video o ombro do atacante e pausar antes do contato para prever a zona.'],
      ['Fisico', 'Base baixa com deslocamento curto.', 'Tres marcas no chao, sequencia de direcoes e volta ao centro em 20 segundos.'],
    ],
  },
  {
    id: 'ponteiro',
    shortName: 'OH',
    role: 'Atacante da entrada que tambem participa muito da recepcao, defesa e bolas fora do sistema.',
    courtBase: 'Z4 na rede, Z5/Z6 no fundo conforme linha de recepcao e sistema defensivo.',
    primaryDecision: 'Manter eficiencia mesmo quando a bola chega alta, longe ou sem passe perfeito.',
    priority: 'Recepcao confiavel, ataque de entrada e solucao de bola quebrada.',
    avoid: 'Pensar so no ataque e deixar a recepcao sem criterio de alvo.',
    keyFundamentals: ['Recepcao', 'Ataque', 'Defesa', 'Saque'],
    indicators: ['Passe positivo sob saque forte', 'Ataques pontuados em bola alta', 'Erros de ataque fora do sistema', 'Cobertura depois do proprio ataque'],
    evidence: ['Linha de recepcao ajustada antes do saque', 'Passada esperando a bola chegar no ponto certo', 'Escolha entre diagonal, paralela e largada', 'Retorno rapido para defesa apos atacar'],
    trainingTabs: [
      ['Tecnico', 'Equilibrar recepcao e passada de ataque.', 'Recepcao controlada na parede seguida de duas passadas marcadas no chao.'],
      ['Tatico', 'Resolver bola alta contra bloqueio formado.', 'Analisar 5 ataques e classificar: ponto, erro, exploracao ou bola mantida.'],
      ['Fisico', 'Repetir salto e defesa sem perder postura.', 'Passada curta, mini salto, queda estavel e deslocamento para base defensiva.'],
    ],
  },
];

const profileQuestionOptions = {
  levels: [
    ['iniciante', 'Iniciante'],
    ['intermediario', 'Intermediário'],
    ['avancado', 'Avançado'],
  ],
  equipment: [
    ['bola', 'Bola'],
    ['parede', 'Parede livre'],
    ['fita', 'Fita no chão'],
    ['toalha', 'Toalha'],
    ['elastico', 'Elástico'],
    ['colchonete', 'Colchonete'],
  ],
  pains: [
    ['sem-dor', 'Sem dor'],
    ['ombro', 'Ombro'],
    ['joelho', 'Joelho'],
    ['lombar', 'Lombar'],
    ['tornozelo', 'Tornozelo'],
    ['punho', 'Punho'],
  ],
  objectives: [
    ['fundamentos', 'Melhorar fundamentos'],
    ['saque', 'Saque mais consistente'],
    ['defesa', 'Defesa e recepção'],
    ['ataque', 'Ataque com controle'],
    ['fisico', 'Força e mobilidade'],
    ['leitura', 'Leitura de jogo'],
  ],
  time: [
    ['15', 'Até 15 min'],
    ['25', '20 a 30 min'],
    ['40', '30 a 45 min'],
    ['60', '45 min ou mais'],
  ],
};

const correctionPlaybook = [
  {
    fundamental: 'Recepcao',
    signal: 'A bola sobe sem direcao ou escapa para o lado.',
    correction: 'Fechar plataforma e apontar os ombros para o alvo.',
    priority: 'Alta',
    status: 'Modelo',
    observed: 'video ou relatorio de recepcao',
    metric: '7 de 10 bolas voltando para o alvo na parede.',
    drill: 'Manchete controlada na parede',
    next: 'Repetir com alvo mais baixo e anotar perdas de controle.',
  },
  {
    fundamental: 'Saque',
    signal: 'Contato baixo ou lancamento variando muito.',
    correction: 'Separar lancamento e contato antes de aumentar forca.',
    priority: 'Media',
    status: 'Modelo',
    observed: 'serie curta de saque em casa',
    metric: '20 lancamentos com queda perto do pe da frente.',
    drill: 'Gesto de saque na parede',
    next: 'Filmar 3 repeticoes de lado e comparar altura do contato.',
  },
  {
    fundamental: 'Ataque',
    signal: 'Passada sem ritmo ou finalizacao desequilibrada.',
    correction: 'Marcar apoios no chao e terminar com braco alto.',
    priority: 'Media',
    status: 'Modelo',
    observed: 'passada marcada com fita',
    metric: '10 repeticoes com equilibrio apos a passada.',
    drill: 'Passada de ataque com toalha',
    next: 'Reduzir velocidade ate a aterrissagem ficar estavel.',
  },
  {
    fundamental: 'Defesa',
    signal: 'Postura sobe antes do contato.',
    correction: 'Manter base baixa ate recuperar o centro.',
    priority: 'Baixa',
    status: 'Modelo',
    observed: 'deslocamento curto em casa',
    metric: '3 series de 20 segundos sem perder postura.',
    drill: 'Base defensiva e reacao curta',
    next: 'Usar uma sequencia escrita de zonas e voltar ao centro a cada toque.',
  },
];

const exerciseLibrary = [
  {
    id: 'ex-saque-gesto-parede',
    fundamental: 'Saque',
    title: 'Gesto de saque na parede',
    objective: 'Melhorar lancamento, ponto de contato e finalizacao do saque sem depender de espaco externo.',
    environment: 'Individual em casa',
    materials: 'Parede livre, fita para alvo e bola leve ou bola de meia.',
    duration: '8 a 12 min',
    setup: 'Marque um alvo na parede acima da linha dos olhos. Execute o lancamento e toque controlado mirando o alvo, sem usar forca maxima.',
    variations: ['Fazer so o lancamento por 20 repeticoes', 'Alternar alvo alto e alvo medio', 'Executar sem bola usando uma toalha para treinar o braco'],
    metric: 'Acertos no alvo, consistencia do lancamento e contatos limpos por serie.',
  },
  {
    id: 'ex-recepcao-parede',
    fundamental: 'Recepcao',
    title: 'Manchete controlada na parede',
    objective: 'Treinar plataforma, angulo dos bracos e controle de direcao em pouco espaco.',
    environment: 'Individual em casa',
    materials: 'Parede livre, fita para alvo e bola leve.',
    duration: '8 a 15 min',
    setup: 'Fique a uma distancia segura da parede. Jogue a bola contra a parede e controle o retorno com manchete para o alvo marcado.',
    variations: ['Manchete parada', 'Um passo lateral antes do contato', 'Alternar alvo da esquerda e da direita'],
    metric: 'Sequencia maxima sem perder controle e percentual de bolas no alvo.',
  },
  {
    id: 'ex-levantamento-parede',
    fundamental: 'Levantamento',
    title: 'Toque de dedos na parede',
    objective: 'Melhorar toque, extensao dos bracos e precisao do levantamento sem depender de parceiro.',
    environment: 'Individual em casa',
    materials: 'Parede livre, fita para alvo e bola leve.',
    duration: '8 a 12 min',
    setup: 'Marque um alvo na parede. Faca toques de dedos enviando a bola para o alvo e recuperando a posicao entre os contatos.',
    variations: ['Toque parado', 'Toque com agachamento leve entre repeticoes', 'Toque alternando alvo alto e alvo medio'],
    metric: 'Contatos consecutivos corretos e acertos no alvo.',
  },
  {
    id: 'ex-ataque-passada-toalha',
    fundamental: 'Ataque',
    title: 'Passada de ataque com toalha',
    objective: 'Ajustar ritmo da passada, giro de tronco e braco alto sem saltar forte dentro de casa.',
    environment: 'Individual em casa',
    materials: 'Toalha pequena e fita no chao para marcar as passadas.',
    duration: '8 a 12 min',
    setup: 'Marque os apoios no chao. Execute a passada de ataque e finalize o movimento do braco segurando a toalha, sem bater em objetos.',
    variations: ['Sem salto', 'Com mini salto controlado', 'Finalizar mirando uma marca alta na parede sem tocar nela'],
    metric: 'Repeticoes com ritmo correto, equilibrio final e braco acima da linha do ombro.',
  },
  {
    id: 'ex-bloqueio-parede',
    fundamental: 'Bloqueio',
    title: 'Passo de bloqueio na parede',
    objective: 'Treinar deslocamento lateral, fechamento das maos e aterrissagem equilibrada.',
    environment: 'Individual em casa',
    materials: 'Parede livre e fita no chao para marcar centro, esquerda e direita.',
    duration: '8 a 12 min',
    setup: 'Fique de frente para a parede, desloque para a marca lateral, suba os bracos e simule o bloqueio sem tocar com forca na parede.',
    variations: ['Sem salto', 'Com mini salto', 'Alternar esquerda-centro-direita em sequencia'],
    metric: 'Repeticoes com aterrissagem estavel e maos fechando acima da cabeca.',
  },
  {
    id: 'ex-defesa-base-reacao',
    fundamental: 'Defesa',
    title: 'Base defensiva e reacao curta',
    objective: 'Melhorar postura baixa, leitura rapida e deslocamento curto em espaco pequeno.',
    environment: 'Individual em casa',
    materials: 'Fita no chao, bola de meia ou objeto leve e cronometro.',
    duration: '6 a 10 min',
    setup: 'Marque tres pontos no chao. Saia da base defensiva, toque o ponto da sequencia e volte ao centro mantendo postura baixa.',
    variations: ['Usar sequencia escrita de zonas', 'Adicionar bola de meia para controlar apos o deslocamento', 'Fazer series de 20 segundos'],
    metric: 'Repeticoes com postura baixa e tempo sem perder equilibrio.',
  },
];

const physicalTrainingLibrary = [
  {
    id: 'fis-potencia-salto',
    focus: 'Potência de salto',
    title: 'Saltos verticais com aterrissagem travada',
    objective: 'Melhorar impulsão para ataque e bloqueio mantendo joelho, quadril e tronco alinhados na queda.',
    athletes: '1 a 6 atletas',
    materials: 'Fita no chão, cone baixo ou caixa baixa opcional.',
    duration: '10 a 12 min',
    setup: 'Marque uma zona de queda. Execute 3 a 5 saltos por série, buscando subir rápido e aterrissar silencioso por 2 segundos.',
    mobility: 'Antes: tornozelo joelho-na-parede, agachamento profundo assistido e balanço de braços.',
    variations: ['Salto sem contramovimento', 'Salto com aproximação curta de ataque', 'Salto lateral baixo antes do salto vertical'],
    metric: 'Altura percebida, aterrissagens estáveis e queda silenciosa em cada repetição.',
    rest: '90 a 150 s entre séries; pare antes da altura cair muito.',
    evidence: 'Pliometria melhora salto vertical em atletas de vôlei; o descanso precisa preservar potência, não cansar por cansar.',
  },
  {
    id: 'fis-aterrissagem-desaceleracao',
    focus: 'Aterrissagem e desaceleração',
    title: 'Queda controlada e freio lateral',
    objective: 'Reduzir perda de eixo depois de bloqueio, ataque ou defesa curta.',
    athletes: '1 a 8 atletas',
    materials: 'Fita no chão, cones e espaço de 3 a 5 metros.',
    duration: '8 a 10 min',
    setup: 'Faça um deslocamento lateral curto, freie dentro da marca e segure a base por 2 segundos antes de voltar.',
    mobility: 'Antes: mobilidade de tornozelo, 90/90 de quadril e rotação torácica em base baixa.',
    variations: ['Freio bilateral', 'Freio em uma perna com baixa altura', 'Sinal visual para mudar direita/esquerda'],
    metric: 'Número de freios sem joelho cair para dentro e sem perder equilíbrio.',
    rest: '45 a 75 s entre séries curtas.',
    evidence: 'Aquecimentos com core, equilíbrio e controle de tronco podem reduzir severidade e carga de lesões por sobreuso.',
  },
  {
    id: 'fis-forca-unilateral',
    focus: 'Força unilateral',
    title: 'Agachamento dividido para base de ataque',
    objective: 'Construir perna forte para passada, bloqueio, defesa baixa e recuperação entre saltos.',
    athletes: '1 a 6 atletas',
    materials: 'Peso corporal, mochila ou halter quando houver tecnica segura.',
    duration: '12 a 16 min',
    setup: 'Fique em passada, desça controlando o joelho da frente e suba empurrando o chão sem perder alinhamento.',
    mobility: 'Antes: flexor de quadril dinâmico, tornozelo e ponte de glúteo curta.',
    variations: ['Sem carga', 'Com mochila no peito', 'Pe traseiro elevado somente quando houver controle'],
    metric: 'Repetições por lado com joelho alinhado, tronco estável e mesma amplitude.',
    rest: '90 a 150 s entre séries; use mais descanso quando a carga subir.',
    evidence: 'Diretrizes de resistência indicam força com cargas mais altas e 2 a 3 séries; em casa, peso corporal e elásticos também servem.',
  },
  {
    id: 'fis-agilidade-curta',
    focus: 'Agilidade curta',
    title: 'Shuffle, freio e volta ao centro',
    objective: 'Melhorar deslocamento curto para defesa, cobertura e ajuste antes da bola chegar.',
    athletes: '1 a 10 atletas',
    materials: 'Três marcas no chão e cronômetro.',
    duration: '8 a 12 min',
    setup: 'Marque centro, direita e esquerda. Saia do centro, toque a marca da sequencia, freie e volte mantendo base baixa.',
    mobility: 'Antes: deslocamento lateral leve, abertura de quadril e ativação de panturrilha.',
    variations: ['Com sequencia escrita', 'Com sinal visual', 'Com bola leve apos o freio'],
    metric: 'Repetições limpas em 15 a 20 s sem subir demais a postura.',
    rest: '60 a 90 s entre tiros para manter velocidade real.',
    evidence: 'Preparação física de vôlei costuma combinar agilidade intensa com movimentos parecidos com o ritmo do jogo.',
  },
  {
    id: 'fis-core-ombro',
    focus: 'Core e ombro',
    title: 'Prancha lateral com rotação e ombro ativo',
    objective: 'Dar estabilidade para saque, ataque, defesa baixa e aterrissagem sem perder linha do tronco.',
    athletes: '1 a 8 atletas',
    materials: 'Colchonete e elastico leve opcional.',
    duration: '8 a 10 min',
    setup: 'Segure prancha lateral curta, rode o tronco com controle e mantenha ombro longe da orelha.',
    mobility: 'Antes: rotação torácica, wall slide e rotação externa leve com elástico.',
    variations: ['Joelho apoiado', 'Prancha lateral completa', 'Rotação externa com elástico após a prancha'],
    metric: 'Tempo com tronco alinhado e ombro estável, sem compensar lombar.',
    rest: '30 a 60 s entre lados ou séries.',
    evidence: 'Programas de aquecimento de vôlei incluem core, membros inferiores e ombro; estudos do VolleyVeilig apontam redução de lesões agudas e de membro superior.',
  },
  {
    id: 'fis-ombro-elastico-escapula',
    focus: 'Ombro e escápula',
    title: 'Rotação externa + Y com elástico',
    objective: 'Fortalecer manguito rotador e escápulas para reduzir sobrecarga em saque, ataque, levantamento e defesa alta.',
    athletes: '1 a 8 atletas',
    materials: 'Elástico leve e parede opcional.',
    duration: '6 a 9 min',
    setup: 'Faça rotação externa com cotovelo junto ao corpo, depois elevação em Y com braços estendidos. A força deve vir do ombro estável, não da lombar.',
    mobility: 'Antes: wall slide, círculos leves de ombro e respiração com costelas baixas.',
    variations: ['Sem elástico para aprender o caminho', 'Elástico leve com pausa de 1 segundo', 'Y deitado no chão quando não houver elástico'],
    metric: '8 a 12 repetições limpas por série, ombros longe da orelha e sem dor.',
    rest: '30 a 60 s entre séries; qualidade vale mais que carga.',
    evidence: 'Programas de prevenção para vôlei incluem rotação externa, exercícios em Y e controle escapular para estabilidade do ombro.',
  },
  {
    id: 'fis-tornozelo-panturrilha',
    focus: 'Tornozelo e panturrilha',
    title: 'Elevação unilateral de panturrilha com equilíbrio',
    objective: 'Melhorar controle de tornozelo para recepção, defesa, deslocamento lateral e aterrissagem após salto.',
    athletes: '1 a 10 atletas',
    materials: 'Parede para apoio leve e marca no chão.',
    duration: '6 a 8 min',
    setup: 'Fique em uma perna, suba na ponta do pé, pause no alto e desça devagar. Use a parede apenas para não perder alinhamento.',
    mobility: 'Antes: joelho na parede e saltitos baixos no lugar.',
    variations: ['Duas pernas para iniciantes', 'Uma perna com pausa no topo', 'Adicionar alcance lateral curto com a mão livre'],
    metric: '8 a 15 repetições por lado sem virar o tornozelo para fora e sem cair para a parede.',
    rest: '30 a 60 s entre lados.',
    evidence: 'Treino de panturrilha, equilíbrio e salto baixo ajuda a preparar tornozelo para mudanças de direção e aterrissagens.',
  },
  {
    id: 'fis-salto-lateral-controlado',
    focus: 'Pliometria lateral',
    title: 'Saltos laterais baixos com pouso silencioso',
    objective: 'Treinar força lateral e freio para bloqueio, cobertura, defesa e retomada de base sem excesso de volume.',
    athletes: '1 a 8 atletas',
    materials: 'Fita no chão e superfície segura.',
    duration: '6 a 8 min',
    setup: 'Salte de uma marca para outra com pouca altura, aterrisse flexionando joelho e quadril, segure 2 segundos e só então volte.',
    mobility: 'Antes: abertura de quadril, tornozelo e dois freios laterais sem salto.',
    variations: ['Passo lateral sem salto', 'Salto bilateral baixo', 'Salto unilateral só quando o pouso estiver estável'],
    metric: '6 a 10 pousos por lado com joelho alinhado e queda silenciosa.',
    rest: '60 a 90 s; pare quando o pouso ficar barulhento ou desalinhado.',
    evidence: 'Pliometria melhora salto, agilidade e potência no vôlei quando o volume é baixo e a aterrissagem é bem controlada.',
  },
];

const mobilityPrep = [
  ['Tornozelo', 'Joelho na parede + saltitos leves', '2 x 30 s por lado', 'Ajuda aterrissagem, defesa baixa e deslocamento sem compensar no joelho.'],
  ['Quadril', '90/90 dinâmico + avanço com rotação', '2 x 5 repetições por lado', 'Prepara base baixa, passada de ataque e mudança de direção.'],
  ['Tronco', 'Rotação torácica em quatro apoios', '2 x 6 repetições por lado', 'Ajuda saque e ataque a girar sem jogar toda carga no ombro.'],
  ['Ombro', 'Wall slide + rotação externa com elástico', '2 x 8 repetições', 'Prepara membros superiores para saque, ataque, bloqueio e defesa alta.'],
  ['Escápula', 'Y no chão + puxada leve com elástico', '2 x 8 repetições', 'Ajuda ombro a ficar estável antes de sacar, atacar, bloquear ou levantar.'],
  ['Panturrilha', 'Elevação unilateral + equilíbrio', '2 x 8 por lado', 'Prepara tornozelo e tendão de Aquiles para saltos e mudanças de direção.'],
];

const gameReadingPatterns = [
  ['Levantador', 'Onde ele está, se chega equilibrado e se pode jogar de segunda.'],
  ['Trajetória da bola', 'Altura, velocidade e distância da rede indicam tempo de ataque.'],
  ['Postura do atacante', 'Ombro, passada e braço armado mostram direção provável.'],
  ['Cobertura', 'Quem protege a bola curta depois do bloqueio ou ataque.'],
  ['Bloqueio adversário', 'Mãos fechadas, atraso ou espaço entre bloqueadoras.'],
  ['Espaço vazio', 'Zona descoberta para defender, largar ou contra-atacar.'],
];

const gameReadingScenes = [
  {
    id: 'leitura-levantador-frente',
    clip: 'Cena 01',
    title: 'Levantador chega de frente para a ponta',
    image: 'public/assets/game-reading-setter-front-game.png',
    imageAlt: 'Cena de jogo com levantador perto da rede preparando bola para atacante de entrada.',
    angle: 'visao de jogo perto da rede',
    fundamental: 'levantamento e distribuicao',
    question: 'Qual ataque parece mais provavel?',
    answer: 'Ataque pela entrada',
    options: ['Ataque pela entrada', 'Bola de segunda', 'Ataque pelo fundo'],
    cues: ['levantador equilibrado', 'bola perto da rede', 'atacante de entrada ja iniciou passada'],
    decision: 'Defesa prepara diagonal e cobertura fecha bola curta.',
    court: ['Levantador na zona 3', 'Atacante na entrada', 'Espaco livre na diagonal curta'],
  },
  {
    id: 'leitura-bola-afastada',
    clip: 'Cena 02',
    title: 'Passe afasta o levantador da rede',
    image: 'public/assets/game-reading-pass-off-net-game.png',
    imageAlt: 'Cena de jogo com passe afastado da rede e equipe reorganizando a defesa.',
    angle: 'visao alta de jogo',
    fundamental: 'passe fora do sistema',
    question: 'Para onde voce defenderia primeiro?',
    answer: 'Bola alta na ponta',
    options: ['Bola rapida no meio', 'Bola alta na ponta', 'Bola de segunda'],
    cues: ['levantador fora da rede', 'central sem tempo de ataque', 'ponta esperando bola alta'],
    decision: 'Defesa ganha tempo, abre base e observa direcao do ombro do atacante.',
    court: ['Bola longe da rede', 'Meio atrasado', 'Ponta com mais tempo'],
  },
  {
    id: 'leitura-bloqueio-aberto',
    clip: 'Cena 03',
    title: 'Bloqueio adversario deixa corredor',
    image: 'public/assets/game-reading-open-line-game.png',
    imageAlt: 'Cena de jogo com ataque de entrada contra bloqueio e corredor de paralela aberto.',
    angle: 'camera da defesa no jogo',
    fundamental: 'bloqueio e cobertura',
    question: 'Qual espaco vazio deve ser protegido?',
    answer: 'Corredor paralela',
    options: ['Fundo centro', 'Corredor paralela', 'Bola curta no meio'],
    cues: ['bloqueio nao fecha a antena', 'defesa adversaria afundada', 'atacante com braco alto'],
    decision: 'Defensor da paralela ajusta meio passo e cobertura acompanha rebote.',
    court: ['Bloqueio aberto', 'Paralela vazia', 'Cobertura perto da rede'],
  },
];

const storageVersion = 'onboarding-combined-profile-v1';
if (localStorage.getItem('isa.version') !== storageVersion) {
  [
    'isa.profile',
    'isa.activePage',
    'isa.selectedPosition',
    'isa.selectedStyle',
    'isa.selectedSessionId',
    'isa.reportNote',
    'isa.reportPositive',
    'isa.reportCorrection',
    'isa.reportFundamental',
    'isa.reportExercise',
    'isa.reportEvidence',
    'isa.reportNext',
  ].forEach((key) => {
    localStorage.removeItem(key);
  });
  localStorage.setItem('isa.version', storageVersion);
}

const requestedParams = new URLSearchParams(window.location.search);
const requestedPage = requestedParams.get('page');
const requestedPosition = requestedParams.get('position');
const visiblePageItems = pageItems.filter(([id]) => id !== 'posicoes');
let activePage = visiblePageItems.some(([id]) => id === requestedPage)
  ? requestedPage
  : localStorage.getItem('isa.activePage') || 'dashboard';
if (activePage === 'posicoes' || !visiblePageItems.some(([id]) => id === activePage)) {
  activePage = 'dashboard';
  localStorage.setItem('isa.activePage', activePage);
} else if (requestedPage === activePage) {
  localStorage.setItem('isa.activePage', activePage);
}
let selectedStyle = localStorage.getItem('isa.selectedStyle') || 'Todos';
if (!styles.includes(selectedStyle)) {
  selectedStyle = 'Todos';
  localStorage.setItem('isa.selectedStyle', selectedStyle);
}
let selectedPositionId = positionContents.some((position) => position.id === requestedPosition)
  ? requestedPosition
  : localStorage.getItem('isa.selectedPosition') || '';
if (requestedPosition === selectedPositionId) {
  localStorage.setItem('isa.selectedPosition', selectedPositionId);
}
let selectedFundamental = localStorage.getItem('isa.selectedFundamental') || 'Todos';
let selectedExerciseTime = localStorage.getItem('isa.exerciseTime') || 'Todos';
let selectedExerciseDifficulty = localStorage.getItem('isa.exerciseDifficulty') || 'Todos';
let selectedExerciseMaterial = localStorage.getItem('isa.exerciseMaterial') || 'Todos';
let selectedSessionId = localStorage.getItem('isa.selectedSessionId') || '';
let selectedTrainingDay = Number(localStorage.getItem('isa.selectedTrainingDay') || 'NaN');
let reportNote = localStorage.getItem('isa.reportNote') || '';
let reportPositive = localStorage.getItem('isa.reportPositive') || '';
let reportCorrection = localStorage.getItem('isa.reportCorrection') || '';
let reportFundamental = localStorage.getItem('isa.reportFundamental') || 'Recepcao';
let reportExercise = localStorage.getItem('isa.reportExercise') || exerciseLibrary[1]?.title || '';
let reportEvidence = localStorage.getItem('isa.reportEvidence') || '';
let reportNext = localStorage.getItem('isa.reportNext') || '';
let selectedReadingSceneId = localStorage.getItem('isa.selectedReadingSceneId') || gameReadingScenes[0]?.id || '';
let selectedReadingAnswer = localStorage.getItem('isa.selectedReadingAnswer') || '';
let selectedVideoExerciseId = localStorage.getItem('isa.selectedVideoExerciseId') || '';
let editingProfile = false;
let profileQuestionStep = Number(localStorage.getItem('isa.profileStep') || '0');
let profileDraft = null;
let onboardingPositionWarning = false;

const profileQuestionSteps = ['body', 'level', 'equipment', 'pains', 'objective', 'time'];

const emptySession = {
  id: 'empty',
  date: '--',
  weekday: '--',
  title: 'Comece seu plano individual',
  style: 'Tecnico',
  focus: 'Nenhum treino registrado',
  duration: 0,
  quality: 0,
  load: 'Baixa',
  notes: 'Seus indicadores comecam zerados. Registre seu primeiro treino para acompanhar exercicios, correcoes e evolucao.',
};

function parseStoredTrainings() {
  try {
    const parsed = JSON.parse(localStorage.getItem(completedTrainingStorageKey) || '[]');
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function readCompletedTrainingSessions() {
  return parseStoredTrainings()
    .filter((item) => item && typeof item === 'object' && item.id && item.completedAt)
    .map((item) => ({
      ...item,
      style: item.style || item.type || 'Tecnico',
      duration: Number(item.duration || item.durationMinutes || 0),
      durationLabel: item.durationLabel || `${Number(item.duration || item.durationMinutes || 0)} min`,
      quality: Number.isFinite(Number(item.quality)) ? Number(item.quality) : 8,
      load: item.load || 'Concluído',
      exercises: Array.isArray(item.exercises) ? item.exercises : [],
    }))
    .sort((a, b) => String(b.completedAt).localeCompare(String(a.completedAt)));
}

function saveCompletedTrainingSessions(nextSessions) {
  sessions = [...nextSessions].sort((a, b) => String(b.completedAt).localeCompare(String(a.completedAt)));
  localStorage.setItem(completedTrainingStorageKey, JSON.stringify(sessions));
}

function trainingCompletionKey(dateKey, positionId, day, type) {
  return [dateKey, positionId || 'sem-posicao', normalizeText(day), normalizeText(type)].join('|');
}

function completedTrainingForDaily(dailyTraining, dateKey = localDateKey()) {
  const positionId = selectedPositionId || athleteProfile.position || 'sem-posicao';
  const key = trainingCompletionKey(dateKey, positionId, dailyTraining.day, dailyTraining.type);
  return sessions.find((session) => session.completionKey === key) || null;
}

function trainingDurationMinutes(value) {
  const match = String(value || '').match(/\d+/);
  return match ? Number(match[0]) : Number(athleteProfile.time || 25);
}

function mainTrainingSteps(dailyTraining) {
  return dailyTraining.steps.filter((step) => normalizeText(step.label).startsWith('exercicio'));
}

function completedTrainingQuality(dailyTraining) {
  const mainCount = mainTrainingSteps(dailyTraining).length;
  return Math.min(10, 7 + mainCount * 0.35);
}

function buildCompletedTrainingRecord(dailyTraining, completedAt = new Date()) {
  const currentPosition = getSelectedPosition();
  const dateKey = localDateKey(completedAt);
  const positionId = currentPosition?.id || selectedPositionId || athleteProfile.position || 'sem-posicao';
  const mainSteps = mainTrainingSteps(dailyTraining);
  return {
    id: `treino-${dateKey}-${positionId}-${normalizeText(dailyTraining.day)}-${normalizeText(dailyTraining.type)}`,
    completionKey: trainingCompletionKey(dateKey, positionId, dailyTraining.day, dailyTraining.type),
    completedAt: completedAt.toISOString(),
    dateKey,
    date: formatDateBr(completedAt),
    time: formatTimeBr(completedAt),
    weekday: formatWeekdayBr(completedAt),
    title: `${ptText(displayLabel(dailyTraining.day))}: ${ptText(displayLabel(dailyTraining.focus))}`,
    positionId,
    position: currentPosition?.name || displayLabel(positionId),
    style: dailyTraining.type || 'Tecnico',
    type: dailyTraining.type || 'Tecnico',
    focus: dailyTraining.focus,
    duration: trainingDurationMinutes(dailyTraining.duration),
    durationLabel: dailyTraining.duration || `${trainingDurationMinutes(dailyTraining.duration)} min`,
    quality: completedTrainingQuality(dailyTraining),
    load: 'Concluído',
    exercises: mainSteps.map((step) => ({
      title: step.title,
      fundamental: step.fundamental,
      duration: step.duration,
      series: step.series,
      criterion: step.metric,
    })),
  };
}

function completeDailyTraining(dailyTraining) {
  const record = buildCompletedTrainingRecord(dailyTraining);
  if (sessions.some((session) => session.completionKey === record.completionKey)) return false;
  saveCompletedTrainingSessions([record, ...sessions]);
  return true;
}

function deleteCompletedTraining(sessionId) {
  const nextSessions = sessions.filter((session) => session.id !== sessionId);
  if (nextSessions.length === sessions.length) return false;
  saveCompletedTrainingSessions(nextSessions);
  return true;
}

function completedTrainingProgressPercent() {
  return Math.min(100, sessions.length * 14);
}

function scoreForTrainingCount(count) {
  return Math.min(10, count ? 5.5 + count * 0.9 : 0);
}

function sessionMatchesFundamental(session, fundamentalName) {
  const target = normalizeText(fundamentalName);
  const targetWords = target.split(/\s+/).filter((word) => word.length > 4);
  return (session.exercises || []).some((exercise) => {
    const text = normalizeText(`${exercise.fundamental} ${exercise.title}`);
    return text.includes(target) || targetWords.some((word) => text.includes(word));
  });
}

function scoreForFundamentalName(fundamentalName) {
  const directCount = sessions.filter((session) => sessionMatchesFundamental(session, fundamentalName)).length;
  const count = directCount || sessions.length;
  return scoreForTrainingCount(count);
}

function completedTrainingHistoryMarkup(limit = 6) {
  const history = sessions.slice(0, limit);
  if (!history.length) {
    return `
      <article class="note-box training-history-empty">
        <p><strong style="color:white">Nenhum treino concluído ainda</strong></p>
        <p>Quando você finalizar uma ficha, ela aparece aqui com data, horário, posição, tipo, duração e exercícios.</p>
      </article>
    `;
  }
  return `
    <div class="training-history-list">
      ${history.map((session) => `
        <article class="training-history-row">
          <div>
            <span class="metric-label">${ptText(session.date)} · ${ptText(session.time)}</span>
            <h4>${ptText(session.title)}</h4>
            <p>${ptText(session.position)} · ${ptText(displayLabel(session.type))} · ${session.durationLabel} · ${exerciseCountLabel((session.exercises || []).length)}</p>
          </div>
          <div class="training-history-actions">
            <span class="badge">${ptText(session.load)}</span>
            <button class="btn-ghost danger-action training-delete-button" type="button" data-delete-training="${session.id}" aria-label="Excluir ${ptText(session.title)}">
              Excluir
            </button>
          </div>
        </article>
      `).join('')}
    </div>
  `;
}

const app = document.querySelector('#app');

function defaultAthleteProfile() {
  return {
    completed: false,
    position: 'levantador',
    age: '',
    level: 'iniciante',
    height: '',
    limitations: '',
    equipment: ['bola', 'parede', 'fita'],
    pains: ['sem-dor'],
    objective: 'fundamentos',
    time: '25',
    updatedAt: '',
  };
}

function cloneProfile(profile) {
  return {
    ...defaultAthleteProfile(),
    ...profile,
    equipment: [...(profile?.equipment || defaultAthleteProfile().equipment)],
    pains: [...(profile?.pains || defaultAthleteProfile().pains)],
  };
}

function readAthleteProfile() {
  try {
    const parsed = JSON.parse(localStorage.getItem('isa.profile') || 'null');
    if (!parsed || typeof parsed !== 'object') return defaultAthleteProfile();
    return {
      ...defaultAthleteProfile(),
      ...parsed,
      equipment: Array.isArray(parsed.equipment) ? parsed.equipment : defaultAthleteProfile().equipment,
      pains: Array.isArray(parsed.pains) ? parsed.pains : defaultAthleteProfile().pains,
    };
  } catch {
    return defaultAthleteProfile();
  }
}

let athleteProfile = readAthleteProfile();

function getSelectedPosition() {
  return positionContents.find((position) => position.id === selectedPositionId) || null;
}

function getSelectedPositionGuide() {
  const current = getSelectedPosition();
  return positionDecisionGuides.find((guide) => guide.id === current?.id)
    || positionDecisionGuides.find((guide) => guide.id === selectedPositionId)
    || positionDecisionGuides[0];
}

function positionThemeVars(positionId) {
  const themes = {
    levantador: ['#3b82f6', '59, 130, 246'],
    libero: ['#22c55e', '34, 197, 94'],
    central: ['#f97316', '249, 115, 22'],
    ponteiro: ['#ef4444', '239, 68, 68'],
    oposto: ['#a855f7', '168, 85, 247'],
  };
  const [color, rgb] = themes[positionId] || ['#45d7c8', '69, 215, 200'];
  return `--position-color:${color};--position-rgb:${rgb};--teal:${color};--line-strong:rgba(${rgb}, 0.42);`;
}

function getPositionExerciseFundamentals(position = getSelectedPosition()) {
  const exercises = [...(position?.homeExercises || []), ...sharedServeDefenseFocus.exercises];
  return [...new Set(exercises.map((exercise) => exercise.fundamental))];
}

function getVideoAnalysisExercises(position = getSelectedPosition()) {
  const allowedFundamentals = new Set(videoMotionPhases.map((item) => item.fundamental));
  const candidates = [
    ...exerciseLibrary,
    ...(position?.homeExercises || []),
    ...sharedServeDefenseFocus.exercises,
  ].filter((exercise) => allowedFundamentals.has(exercise.fundamental));
  const unique = new Map();
  candidates.forEach((exercise) => {
    const id = exercise.id || `${exercise.fundamental}-${exercise.title}`;
    if (!unique.has(id)) unique.set(id, { ...exercise, id });
  });
  return [...unique.values()];
}

function findVideoAnalysisExercise(exerciseId, position = getSelectedPosition()) {
  const exercises = getVideoAnalysisExercises(position);
  return exercises.find((exercise) => exercise.id === exerciseId) || exercises[0] || null;
}

function findExerciseForVideoSample(sample, position = getSelectedPosition()) {
  const exercises = getVideoAnalysisExercises(position);
  return exercises.find((exercise) => exercise.id === selectedVideoExerciseId && exercise.fundamental === sample.fundamental)
    || exercises.find((exercise) => exercise.fundamental === sample.fundamental)
    || exercises[0]
    || null;
}

function findVideoSampleClip(sampleId) {
  return videoSampleClips.find((sample) => sample.id === sampleId) || null;
}

function getPositionVideoMarkers(position = getSelectedPosition()) {
  if (!position) {
    return [
      ['Saque', 'Lançamento, braço alto, contato e equilíbrio final'],
      ['Recepção', 'Base baixa, plataforma, ângulo dos braços e direção'],
      ['Ataque', 'Ritmo da passada, armação do braço, contato e aterrissagem'],
      ['Bloqueio', 'Passo lateral, fechamento das mãos e queda equilibrada'],
      ['Defesa', 'Postura baixa, leitura, deslocamento curto e recuperação'],
    ];
  }
  return position.fundamentals.map((fundamental, index) => [
    fundamental,
    position.gameReading[index % position.gameReading.length] || 'Marque o momento-chave e a próxima correção.',
  ]);
}

function getPositionPhysicalTraining(position = getSelectedPosition()) {
  const idsByPosition = {
    levantador: ['fis-ombro-elastico-escapula', 'fis-agilidade-curta', 'fis-forca-unilateral', 'fis-core-ombro'],
    libero: ['fis-agilidade-curta', 'fis-tornozelo-panturrilha', 'fis-aterrissagem-desaceleracao', 'fis-core-ombro'],
    central: ['fis-potencia-salto', 'fis-salto-lateral-controlado', 'fis-aterrissagem-desaceleracao', 'fis-ombro-elastico-escapula'],
    ponteiro: ['fis-ombro-elastico-escapula', 'fis-aterrissagem-desaceleracao', 'fis-agilidade-curta', 'fis-salto-lateral-controlado'],
    oposto: ['fis-potencia-salto', 'fis-ombro-elastico-escapula', 'fis-salto-lateral-controlado', 'fis-aterrissagem-desaceleracao'],
  };
  const ids = idsByPosition[position?.id] || physicalTrainingLibrary.map((item) => item.id);
  return physicalTrainingLibrary.filter((item) => ids.includes(item.id));
}

function physicalCategoryForExercise(exercise) {
  const focus = String(exercise?.focus || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();
  if (focus.includes('potencia') || focus.includes('forca') || focus.includes('pliometria') || focus.includes('core')) return 'Força';
  if (focus.includes('agilidade')) return 'Mobilidade';
  return 'Prevenção';
}

function physicalBenefitForExercise(exercise) {
  const category = physicalCategoryForExercise(exercise);
  const byCategory = {
    Força: 'Ajuda a repetir salto, passada e bloqueio com mais potência e menos perda de técnica.',
    Mobilidade: 'Ajuda a chegar melhor na bola, frear com controle e manter base baixa por mais tempo.',
    Prevenção: 'Ajuda a proteger ombro, joelho, tornozelo e coluna durante ações repetidas de treino.',
  };
  return byCategory[category] || 'Ajuda a preparar o corpo para treinar com mais qualidade.';
}

function labelForOption(group, value) {
  return profileQuestionOptions[group]?.find(([id]) => id === value)?.[1] || value;
}

function profileSummaryItems() {
  const equipment = athleteProfile.equipment?.length
    ? athleteProfile.equipment.map((item) => labelForOption('equipment', item)).join(', ')
    : 'sem equipamento marcado';
  const pains = athleteProfile.pains?.length
    ? athleteProfile.pains.map((item) => labelForOption('pains', item)).join(', ')
    : 'não informado';
  return [
    ['Nível', labelForOption('levels', athleteProfile.level)],
    ['Objetivo', labelForOption('objectives', athleteProfile.objective)],
    ['Tempo', labelForOption('time', athleteProfile.time)],
    ['Equipamentos', equipment],
    ['Dores', pains],
  ];
}

function profileTrainingDose() {
  const minutes = Number(athleteProfile.time || 25);
  if (minutes <= 15) return { duration: '15 min', series: '2 blocos curtos', note: 'Use um exercício principal e um ajuste técnico.' };
  if (minutes <= 25) return { duration: '25 min', series: '3 blocos curtos', note: 'Use técnica, leitura e um bloco físico leve.' };
  if (minutes <= 40) return { duration: '35 min', series: '4 blocos', note: 'Inclua aquecimento, fundamento principal, saque/defesa e registro.' };
  return { duration: '45 min', series: '4 a 5 blocos', note: 'Aumente volume sem perder qualidade e registre sinais de fadiga.' };
}

function profileSafetyNote() {
  const pains = athleteProfile.pains || [];
  return pains.includes('sem-dor') || pains.length === 0
    ? 'Sem dor marcada: avance volume apenas se a técnica continuar limpa.'
    : `Dores marcadas: ${pains.map((item) => labelForOption('pains', item)).join(', ')}. Reduza impacto e pare se a dor aumentar.`;
}

function normalizeText(value) {
  return String(value || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();
}

function exerciseMinutes(exercise) {
  const matches = String(exercise.duration || '').match(/\d+/g) || [];
  const values = matches.map(Number).filter((value) => Number.isFinite(value));
  return values.length ? Math.max(...values) : 10;
}

function exerciseTimeTag(exercise) {
  const minutes = exerciseMinutes(exercise);
  if (minutes <= 6) return '5 minutos';
  if (minutes <= 10) return '10 minutos';
  return '15 minutos';
}

function exerciseDifficulty(exercise) {
  const text = normalizeText(`${exercise.title} ${exercise.objective} ${exercise.setup} ${(exercise.variations || []).join(' ')}`);
  const advancedSignals = [
    'bola dificil',
    'bola ruim',
    'bola de seguranca',
    'fora do sistema',
    'fora da antena',
    'pipe',
    'explorar bloqueio',
    'bloqueio formado',
    'bloqueio duplo',
    'variacao ofensiva',
  ];
  const intermediateSignals = [
    'mini salto',
    'potencia',
    'transicao',
    'sinal visual',
    'mudar direita/esquerda',
    'uma perna',
    'salto unilateral',
  ];
  if (advancedSignals.some((signal) => text.includes(signal))) return 'avançado';
  return intermediateSignals.some((signal) => text.includes(signal)) ? 'intermediário' : 'iniciante';
}

function exerciseMaterialTags(exercise) {
  const text = normalizeText(`${exercise.materials} ${exercise.setup} ${(exercise.variations || []).join(' ')}`);
  const tags = [];
  if (text.includes('parede')) tags.push('com parede');
  if (text.includes('bola')) tags.push('com bola');
  if (text.includes('elastico')) tags.push('com elástico');
  if (text.includes('toalha')) tags.push('com toalha');
  if (text.includes('fita')) tags.push('com fita');
  if (text.includes('cronometro')) tags.push('com cronômetro');
  if (text.includes('celular') || text.includes('camera') || text.includes('video')) tags.push('com celular');
  if (!text.includes('bola')) tags.unshift('sem bola');
  return [...new Set(tags)];
}

function exerciseTags(exercise) {
  return [
    exercise.fundamental,
    exerciseTimeTag(exercise),
    exerciseDifficulty(exercise),
    ...exerciseMaterialTags(exercise),
  ].filter(Boolean);
}

function exerciseSeriesLabel(exercise, preferredSets = null) {
  const parts = exerciseSeriesParts(exercise, preferredSets);
  return `${parts.sets} · ${parts.target}`;
}

function exerciseSeriesParts(exercise, preferredSets = null) {
  const coreText = normalizeText([
    exercise.fundamental,
    exercise.focus,
    exercise.title,
    exercise.objective,
    exercise.setup,
    exercise.metric,
    exercise.materials,
  ].join(' '));
  const searchText = normalizeText([
    coreText,
    ...(exercise.variations || []),
  ].join(' '));
  const fundamental = normalizeText(exercise.fundamental || exercise.focus || '');
  const sets = exerciseSeriesCount(exercise, preferredSets);
  const setsLabel = `${sets} ${sets === 1 ? 'série' : 'séries'}`;

  if (hasAnyExerciseSignal(coreText, ['salto', 'saltos', 'pliometr', 'explosivo', 'aterrissagem', 'queda'])) {
    return { sets: setsLabel, target: '3 a 5 repetições' };
  }
  if (hasAnyExerciseSignal(coreText, ['prancha', 'sustente', 'segure', 'isometr'])) {
    return { sets: setsLabel, target: '15 a 30 segundos' };
  }
  if (hasAnyExerciseSignal(coreText, ['elastico', 'rotacao externa', 'elevacao em y', 'afundo', 'panturrilha', 'mochila', 'halter'])) {
    return { sets: setsLabel, target: '8 a 12 repetições' };
  }
  if (fundamental.includes('saque')) {
    return { sets: setsLabel, target: '8 a 10 saques' };
  }
  if (fundamental.includes('levantamento') || searchText.includes('toque de dedos')) {
    return { sets: setsLabel, target: '12 a 20 toques' };
  }
  if (fundamental.includes('recepcao') || searchText.includes('manchete')) {
    return { sets: setsLabel, target: '10 a 15 contatos' };
  }
  if (fundamental.includes('defesa') || hasAnyExerciseSignal(searchText, ['cronometro', '20 segundos', 'base defensiva', 'reacao', 'desloque', 'zonas'])) {
    return { sets: setsLabel, target: '6 a 10 deslocamentos' };
  }
  if (hasAnyExerciseSignal(searchText, ['ataque', 'bloqueio', 'passada', 'cobertura', 'transicao'])) {
    return { sets: setsLabel, target: '6 a 10 repetições' };
  }
  return { sets: setsLabel, target: '8 a 12 repetições' };
}

function exerciseSeriesCount(exercise, preferredSets = null) {
  if (preferredSets !== null && preferredSets !== undefined && Number.isFinite(Number(preferredSets))) {
    return Math.max(1, Number(preferredSets));
  }
  const minutes = exerciseMinutes(exercise);
  return minutes <= 6 ? 2 : 3;
}

function hasAnyExerciseSignal(text, signals) {
  return signals.some((signal) => text.includes(signal));
}

function exerciseSeriesPartsFromLabel(label) {
  const [sets, ...targetParts] = String(label || '').split(' · ');
  return {
    sets: sets || '3 séries',
    target: targetParts.join(' · ') || '',
  };
}

function exercisePracticeMarkup(exercise, series = null) {
  const seriesParts = series ? exerciseSeriesPartsFromLabel(series) : exerciseSeriesParts(exercise);
  return `
    <div class="exercise-practice-grid">
      <div class="exercise-practice-item">
        <span class="metric-label">Como fazer</span>
        <p>${ptText(exercise.setup || 'Execute com controle e pare se perder a técnica.')}</p>
      </div>
      <div class="exercise-practice-item exercise-series-item">
        <span class="metric-label">Séries</span>
        <strong>${ptText(seriesParts.sets)}</strong>
        ${seriesParts.target ? `<span>${ptText(seriesParts.target)}</span>` : ''}
      </div>
    </div>
  `;
}

function exerciseMoreDetailsMarkup(items) {
  const visibleItems = items.filter((item) => item?.value);
  if (!visibleItems.length) return '';
  return `
    <details class="exercise-more">
      <summary>Ver detalhes</summary>
      <div class="exercise-more-grid">
        ${visibleItems.map((item) => `
          <div class="exercise-more-item">
            <span class="metric-label">${ptText(item.label)}</span>
            ${Array.isArray(item.value)
              ? `<ul>${item.value.map((value) => `<li>${ptText(value)}</li>`).join('')}</ul>`
              : `<p>${ptText(item.value)}</p>`}
          </div>
        `).join('')}
      </div>
    </details>
  `;
}

function exerciseBenefitForPosition(exercise, position = getSelectedPosition()) {
  const positionName = position?.name || 'atleta';
  const byFundamental = {
    Ataque: `Ajuda ${positionName} a escolher a direção antes do último apoio, mantendo braço alto e queda controlada.`,
    Bloqueio: `Ajuda ${positionName} a chegar com mãos organizadas, tempo de subida e aterrissagem segura.`,
    Cobertura: `Ajuda ${positionName} a sair da ação principal e proteger a bola rebatida sem perder postura.`,
    Decisao: `Ajuda ${positionName} a simplificar a escolha quando a bola não chega perfeita.`,
    Decisão: `Ajuda ${positionName} a simplificar a escolha quando a bola não chega perfeita.`,
    Defesa: `Ajuda ${positionName} a sustentar base baixa, primeiro passo e recuperação depois do contato.`,
    Físico: `Ajuda ${positionName} a preparar o corpo para repetir fundamento com menos perda de técnica e menor risco de sobrecarga.`,
    Fisico: `Ajuda ${positionName} a preparar o corpo para repetir fundamento com menos perda de técnica e menor risco de sobrecarga.`,
    Leitura: `Ajuda ${positionName} a reconhecer pistas do jogo antes de reagir tarde demais.`,
    Levantamento: `Ajuda ${positionName} a tocar alto, chegar equilibrado e variar a jogada com mais precisão.`,
    Recepcao: `Ajuda ${positionName} a ajustar pés e plataforma para entregar uma bola mais jogável.`,
    Recepção: `Ajuda ${positionName} a ajustar pés e plataforma para entregar uma bola mais jogável.`,
    Saque: `Ajuda ${positionName} a escolher alvo, controlar força e reduzir erro evitável.`,
  };
  return byFundamental[exercise.fundamental] || `Ajuda ${positionName} a treinar um fundamento com critério mensurável em casa.`;
}

const exerciseOptimizationNotes = {
  'levantador-toque-alvo': {
    use: 'Melhor exercício inicial para levantador quando a prioridade é precisão do toque.',
    replace: 'Se ficar fácil, não aumente força: troque para frente/costas na parede para treinar decisão.',
    criterion: 'Bola chega no alvo escolhido, com pés ajustados antes das mãos.',
  },
  'levantador-ritmo-pes': {
    use: 'Mantém porque o erro do levantador muitas vezes começa nos pés, não nas mãos.',
    replace: 'Se o espaço for muito pequeno, faça sem bola e conte só chegadas equilibradas.',
    criterion: 'Chegar de frente sem cruzar os pés e sem tocar caindo para trás.',
  },
  'levantador-engano': {
    use: 'Vale quando o atleta já consegue tocar com controle e precisa esconder melhor a jogada.',
    replace: 'Se a técnica do toque ainda falha, use como variação curta depois do toque de dedos.',
    criterion: 'Olhar e tronco não entregam a escolha antes do gesto final.',
  },
  'levantador-front-back-parede': {
    use: 'Substitui repetições iguais de toque porque força escolha entre bola para frente e para trás.',
    replace: 'Se houver pouco tempo, faça este no lugar do toque simples.',
    criterion: 'Escolha correta antes do contato e alvo certo depois do toque.',
  },
  'levantador-bola-ruim-segura': {
    use: 'Treina a decisão que mais economiza erro: simplificar quando o passe sai da zona ideal.',
    replace: 'Se não tiver bola, mantenha só pés e escolha da solução.',
    criterion: 'Escolher uma bola segura sem girar tarde nem cair para trás.',
  },
  'libero-manchete-alvo': {
    use: 'É o principal exercício técnico do líbero porque o primeiro contato destrava o ataque.',
    replace: 'Se repetir demais, varie alvo baixo/médio em vez de criar outro exercício parecido.',
    criterion: 'Plataforma firme, bola no alvo e base ajustada antes do contato.',
  },
  'libero-defesa-postura': {
    use: 'Fica como base física-técnica para sustentar postura baixa em defesa.',
    replace: 'Se a postura já está boa, avance para leitura curta ou fundo.',
    criterion: 'Responder sem levantar o tronco antes de voltar ao centro.',
  },
  'libero-plataforma-curta-funda': {
    use: 'Substitui treino verbal por controle técnico de plataforma, que aparece no passe.',
    replace: 'Se o alvo ainda falha, reduza para duas zonas antes de usar curta, media e funda.',
    criterion: 'Plataforma muda cedo e a bola chega no alvo da zona planejada.',
  },
  'libero-dig-set-parede': {
    use: 'Mantém porque todo líbero precisa transformar defesa ruim em bola alta jogável.',
    replace: 'Se o controle cair, separe em defesa para cima e só depois levantamento.',
    criterion: 'Defesa vira segunda bola alta para uma zona útil.',
  },
  'libero-angulo-curta-fundo': {
    use: 'É a progressão da defesa de postura: troca repetição por leitura de zona.',
    replace: 'Se estiver confundindo, volte para três zonas sem bola.',
    criterion: 'Primeiro passo correto antes de levantar o tronco.',
  },
  'central-passo-bloqueio': {
    use: 'Exercício base do central: deslocar curto, fechar mãos e cair bem.',
    replace: 'Se o tempo for curto, faça este antes de qualquer ataque simulado.',
    criterion: 'Mãos chegam juntas e aterrissagem fica silenciosa.',
  },
  'central-leitura-levantador': {
    use: 'Evita salto no chute: treina leitura antes de gastar salto.',
    replace: 'Se não tiver vídeo, use cartões alternados de meio/ponta/saída.',
    criterion: 'Escolha feita antes do primeiro passo.',
  },
  'central-transicao': {
    use: 'Diferencio central boa: bloquear e já preparar ataque rápido.',
    replace: 'Se parecer igual ao bloqueio, reduza salto e foque queda + braço armado.',
    criterion: 'Tempo curto entre queda e armação do braço.',
  },
  'central-eye-sequence': {
    use: 'Fica como exercício de vídeo/leitura, não como repetição física.',
    replace: 'Se cansar visualmente, faça 5 pausas boas e pare.',
    criterion: 'Prever a jogada antes da bola sair da mão do levantador.',
  },
  'central-fecha-ponta': {
    use: 'Complementa o passo de bloqueio porque treina fechar bloqueio duplo na antena.',
    replace: 'Se cruzar demais os pés, volte para passo lateral sem salto.',
    criterion: 'Chegar alinhada com a ponta imaginária sem perder eixo.',
  },
  'ponteiro-recepcao-ataque': {
    use: 'Melhor exercício de ponteiro porque conecta passe e preparação de ataque.',
    replace: 'Se repetir com linha de recepção, mantenha este quando o objetivo for virar bola.',
    criterion: 'Recepção controlada que vira passada equilibrada.',
  },
  'ponteiro-variacao-ofensiva': {
    use: 'Treina tomada de decisão ofensiva sem precisar bater forte dentro de casa.',
    replace: 'Se a passada ainda está instável, faça sem salto.',
    criterion: 'Escolha definida antes do último apoio.',
  },
  'ponteiro-cobertura': {
    use: 'Não compete com ataque: treina a ação logo depois do ataque.',
    replace: 'Se o treino for muito curto, use como fechamento de 5 minutos.',
    criterion: 'Sair do ataque e chegar em cobertura com base baixa.',
  },
  'ponteiro-out-of-system': {
    use: 'Prioritário para ponteiro avançar: resolver bola alta, lenta ou fora da antena.',
    replace: 'Se parecer com variação ofensiva, use este só em semana de bola difícil.',
    criterion: 'Escolha segura antes do contato e queda equilibrada.',
  },
  'ponteiro-recepcao-linha': {
    use: 'Fica quando a necessidade é responsabilidade de passe, não ataque.',
    replace: 'Se o atleta já passa bem, faça menos volume e use recepção para passada.',
    criterion: 'Passe no alvo sem perder a linha lateral.',
  },
  'oposto-bola-dificil': {
    use: 'É o exercício central do oposto para resolver bola imperfeita sem erro grátis.',
    replace: 'Se houver pouco tempo, faça este antes de diagonal/paralela.',
    criterion: 'Braço alto e queda equilibrada em bola desconfortável.',
  },
  'oposto-explorar-bloqueio': {
    use: 'Mantém porque ensina a usar o bloqueio como alvo, não só bater forte.',
    replace: 'Se não tiver bola, simule com mão na borda do alvo.',
    criterion: 'Escolha da borda antes do gesto e corpo sob controle.',
  },
  'oposto-bloqueio-pipe': {
    use: 'Específico do oposto: ler ponteiro e pipe antes de fechar a mão.',
    replace: 'Se o salto pesar, faça sem salto e conte decisão correta.',
    criterion: 'Mãos alinhadas depois da leitura certa.',
  },
  'oposto-saida-diagonal-paralela': {
    use: 'Treina a bola planejada da saída; não substitui bola difícil.',
    replace: 'Se ficar repetitivo com explorar bloqueio, alterne por semana.',
    criterion: 'Escolha diagonal/paralela antes do último apoio.',
  },
  'oposto-cobertura-direita': {
    use: 'Liga ataque, cobertura e defesa de direita, que aparecem no mesmo rally.',
    replace: 'Se estiver cansando, tire a bola e mantenha a sequência de marcas.',
    criterion: 'Transições completas sem subir demais a postura.',
  },
  'universal-saque-alvo': {
    use: 'Fica para todas as posições porque saque com alvo dá ponto e reduz erro não forçado.',
    replace: 'Se o saque estiver pesado para o espaço, use bola de meia e conte alvo.',
    criterion: 'Acerto por alvo e ajuste após erro curto ou longo.',
  },
  'universal-defesa-zonas': {
    use: 'Fica como bloco curto para leitura defensiva e retorno ao centro.',
    replace: 'Se parecer com outro exercício defensivo, use como aquecimento ou fechamento.',
    criterion: 'Base baixa, decisão rápida e volta equilibrada.',
  },
  'universal-ombro-elastico': {
    use: 'É preparação, não treino principal: entra antes de saque, ataque, bloqueio ou levantamento.',
    replace: 'Se não houver elástico, faça Y no chão e wall slide.',
    criterion: 'Repetições sem dor, sem elevar ombros e sem arquear lombar.',
  },
};

function exerciseOptimizationNote(exercise) {
  const note = exerciseOptimizationNotes[exercise.id];
  if (note) return note;
  return {
    use: 'Use quando este fundamento for prioridade no treino da semana.',
    replace: 'Se parecer repetitivo, reduza volume e transforme em variação curta.',
    criterion: exercise.metric || 'Mantenha critério observável antes de aumentar intensidade.',
  };
}

function exerciseMatchesFilters(exercise) {
  return (selectedFundamental === 'Todos' || exercise.fundamental === selectedFundamental)
    && (selectedExerciseTime === 'Todos' || exerciseTimeTag(exercise) === selectedExerciseTime)
    && (selectedExerciseDifficulty === 'Todos' || exerciseDifficulty(exercise) === selectedExerciseDifficulty)
    && (selectedExerciseMaterial === 'Todos' || exerciseMaterialTags(exercise).includes(selectedExerciseMaterial));
}

function displayLabel(value) {
  const labels = {
    Decisao: 'Decisão',
    Fisico: 'Físico',
    iniciante: 'Iniciante',
    intermediário: 'Intermediário',
    avançado: 'Avançado',
    Preparacao: 'Preparação',
    Recepcao: 'Recepção',
    Recuperacao: 'Recuperação',
    Revisao: 'Revisão',
    Sabado: 'Sábado',
    Terca: 'Terça',
    Tecnico: 'Técnico',
    Tatico: 'Tático',
  };
  return labels[value] || value;
}

function ptText(value) {
  const replacements = [
    [/\bAnalise\b/g, 'Análise'], [/\banalise\b/g, 'análise'],
    [/\bAnotacoes\b/g, 'Anotações'], [/\banotacoes\b/g, 'anotações'],
    [/\bapos\b/g, 'após'],
    [/\badversario\b/g, 'adversário'], [/\bAdversario\b/g, 'Adversário'],
    [/\bbraco\b/g, 'braço'], [/\bbracos\b/g, 'braços'],
    [/\bcabeca\b/g, 'cabeça'],
    [/\bcamera\b/g, 'câmera'], [/\bCamera\b/g, 'Câmera'],
    [/\bchao\b/g, 'chão'],
    [/\bcorrecao\b/g, 'correção'], [/\bcorrecoes\b/g, 'correções'], [/\bCorrecao\b/g, 'Correção'], [/\bCorrecoes\b/g, 'Correções'],
    [/\bcriterio\b/g, 'critério'], [/\bcriterios\b/g, 'critérios'], [/\bCriterio\b/g, 'Critério'],
    [/\bdecisao\b/g, 'decisão'], [/\bdecisoes\b/g, 'decisões'], [/\bDecisao\b/g, 'Decisão'],
    [/\bdirecao\b/g, 'direção'],
    [/\bdistribuicao\b/g, 'distribuição'],
    [/\bemergencia\b/g, 'emergência'],
    [/\bequilibrio\b/g, 'equilíbrio'],
    [/\bespaco\b/g, 'espaço'], [/\bEspaco\b/g, 'Espaço'],
    [/\bestavel\b/g, 'estável'], [/\bestaveis\b/g, 'estáveis'],
    [/\bevidencia\b/g, 'evidência'], [/\bevidencias\b/g, 'evidências'], [/\bEvidencia\b/g, 'Evidência'],
    [/\bevolucao\b/g, 'evolução'], [/\bEvolucao\b/g, 'Evolução'],
    [/\bexercicio\b/g, 'exercício'], [/\bexercicios\b/g, 'exercícios'], [/\bExercicio\b/g, 'Exercício'], [/\bExercicios\b/g, 'Exercícios'],
    [/\bfinalizacao\b/g, 'finalização'],
    [/\bfisico\b/g, 'físico'], [/\bFisico\b/g, 'Físico'],
    [/\bforca\b/g, 'força'],
    [/\bfuncao\b/g, 'função'],
    [/\bjoelho\b/g, 'joelho'],
    [/\blancamento\b/g, 'lançamento'],
    [/\blideranca\b/g, 'liderança'], [/\bLideranca\b/g, 'Liderança'],
    [/\bmaos\b/g, 'mãos'], [/\bMaos\b/g, 'Mãos'], [/\bmao\b/g, 'mão'], [/\bMao\b/g, 'Mão'],
    [/\bmaxima\b/g, 'máxima'], [/\bmedia\b/g, 'média'], [/\bMedia\b/g, 'Média'], [/\bmedio\b/g, 'médio'], [/\bmedio\b/g, 'médio'],
    [/\bnao\b/g, 'não'], [/\bNao\b/g, 'Não'],
    [/\borganizacao\b/g, 'organização'], [/\bOrganizacao\b/g, 'Organização'],
    [/\bpe\b/g, 'pé'], [/\bpes\b/g, 'pés'],
    [/\bposicao\b/g, 'posição'], [/\bPosicao\b/g, 'Posição'],
    [/\bpreparacao\b/g, 'preparação'], [/\bPreparacao\b/g, 'Preparação'],
    [/\bprecisao\b/g, 'precisão'],
    [/\bprovavel\b/g, 'provável'],
    [/\bproxima\b/g, 'próxima'], [/\bproximo\b/g, 'próximo'],
    [/\brapida\b/g, 'rápida'], [/\brapido\b/g, 'rápido'],
    [/\breacao\b/g, 'reação'],
    [/\brecepcao\b/g, 'recepção'], [/\bRecepcao\b/g, 'Recepção'],
    [/\brelatorio\b/g, 'relatório'], [/\bRelatorio\b/g, 'Relatório'],
    [/\brepeticao\b/g, 'repetição'], [/\bRepeticao\b/g, 'Repetição'], [/\brepeticoes\b/g, 'repetições'], [/\bRepeticoes\b/g, 'Repetições'],
    [/\brevisao\b/g, 'revisão'], [/\bRevisao\b/g, 'Revisão'],
    [/\brotacao\b/g, 'rotação'], [/\bRotacao\b/g, 'Rotação'],
    [/\bsaída\b/g, 'saída'], [/\bsaida\b/g, 'saída'],
    [/\bsequencia\b/g, 'sequência'],
    [/\bserie\b/g, 'série'], [/\bseries\b/g, 'séries'],
    [/\btatica\b/g, 'tática'], [/\btatico\b/g, 'tático'], [/\bTatico\b/g, 'Tático'],
    [/\btecnica\b/g, 'técnica'], [/\bTecnica\b/g, 'Técnica'], [/\btecnico\b/g, 'técnico'], [/\bTecnico\b/g, 'Técnico'],
    [/\btoracica\b/g, 'torácica'],
    [/\btransicao\b/g, 'transição'],
    [/\bacao\b/g, 'ação'], [/\bacoes\b/g, 'ações'], [/\bAcoes\b/g, 'Ações'],
    [/\butil\b/g, 'útil'], [/\bvideo\b/g, 'vídeo'], [/\bvideos\b/g, 'vídeos'], [/\bVideo\b/g, 'Vídeo'], [/\bVideos\b/g, 'Vídeos'], [/\bvisao\b/g, 'visão'], [/\bvolei\b/g, 'vôlei'], [/\bvoce\b/g, 'você'],
  ];
  return replacements.reduce((text, [pattern, replacement]) => text.replace(pattern, replacement), String(value ?? ''));
}

function exerciseCountLabel(count) {
  return `${count} ${count === 1 ? 'exercício' : 'exercícios'}`;
}

function renderExerciseFilterGroup(label, filter, options, selected) {
  return `
    <div class="exercise-filter-group">
      <span>${label}</span>
      <div class="exercise-filter-row" role="group" aria-label="${label}">
        ${options.map((option) => `
          <button
            type="button"
            data-exercise-filter="${filter}"
            data-exercise-value="${option}"
            class="${selected === option ? 'active' : ''}"
            aria-pressed="${selected === option}"
          >${displayLabel(option)}</button>
        `).join('')}
      </div>
    </div>
  `;
}

function scoreColor(score) {
  if (score >= 8.2) return 'var(--green)';
  if (score >= 7.6) return 'var(--amber)';
  return 'var(--coral)';
}

function badge(status) {
  const hot = status === 'Pendente' || status === 'Alta';
  return `<span class="badge ${hot ? 'hot' : ''}">${status}</span>`;
}

function preserveContentScroll(callback) {
  const content = document.querySelector('.content');
  const contentTop = content?.scrollTop || 0;
  const windowTop = window.scrollY || 0;
  callback();
  const nextContent = document.querySelector('.content');
  if (nextContent) nextContent.scrollTop = contentTop;
  window.scrollTo(0, windowTop);
  requestAnimationFrame(() => {
    const frameContent = document.querySelector('.content');
    if (frameContent) frameContent.scrollTop = contentTop;
    window.scrollTo(0, windowTop);
  });
}

function setPage(page) {
  activePage = page;
  localStorage.setItem('isa.activePage', page);
  render();
}

function setStyle(style) {
  selectedStyle = style;
  localStorage.setItem('isa.selectedStyle', style);
  render();
}

function setFundamental(fundamental) {
  selectedFundamental = fundamental;
  localStorage.setItem('isa.selectedFundamental', fundamental);
  render();
}

function resetExerciseFilters() {
  selectedFundamental = 'Todos';
  selectedExerciseTime = 'Todos';
  selectedExerciseDifficulty = 'Todos';
  selectedExerciseMaterial = 'Todos';
  localStorage.setItem('isa.selectedFundamental', selectedFundamental);
  localStorage.setItem('isa.exerciseTime', selectedExerciseTime);
  localStorage.setItem('isa.exerciseDifficulty', selectedExerciseDifficulty);
  localStorage.setItem('isa.exerciseMaterial', selectedExerciseMaterial);
}

function setExerciseFilter(filter, value) {
  if (filter === 'fundamental') selectedFundamental = value;
  if (filter === 'time') selectedExerciseTime = value;
  if (filter === 'difficulty') selectedExerciseDifficulty = value;
  if (filter === 'material') selectedExerciseMaterial = value;
  localStorage.setItem('isa.selectedFundamental', selectedFundamental);
  localStorage.setItem('isa.exerciseTime', selectedExerciseTime);
  localStorage.setItem('isa.exerciseDifficulty', selectedExerciseDifficulty);
  localStorage.setItem('isa.exerciseMaterial', selectedExerciseMaterial);
  render();
}

function setPosition(positionId, nextPage = 'dashboard') {
  if (!positionContents.some((position) => position.id === positionId)) return;
  selectedPositionId = positionId;
  resetExerciseFilters();
  activePage = nextPage;
  localStorage.setItem('isa.selectedPosition', positionId);
  localStorage.setItem('isa.activePage', activePage);
  render();
}

function selectOnboardingPosition(positionId) {
  if (!positionContents.some((position) => position.id === positionId)) return;
  selectedPositionId = positionId;
  resetExerciseFilters();
  onboardingPositionWarning = false;
  const profile = getProfileDraft();
  profile.position = positionId;
  localStorage.setItem('isa.selectedPosition', positionId);
  renderOnboardingPage();
}

function saveAthleteProfile(profile) {
  athleteProfile = {
    ...defaultAthleteProfile(),
    ...profile,
    position: selectedPositionId || profile.position || defaultAthleteProfile().position,
    completed: true,
    updatedAt: new Date().toISOString(),
  };
  localStorage.setItem('isa.profile', JSON.stringify(athleteProfile));
  editingProfile = false;
  profileDraft = null;
  onboardingPositionWarning = false;
  profileQuestionStep = 0;
  localStorage.removeItem('isa.profileStep');
  render();
}

function openProfileEditor() {
  editingProfile = true;
  profileDraft = cloneProfile(athleteProfile);
  profileQuestionStep = 0;
  localStorage.setItem('isa.profileStep', String(profileQuestionStep));
  renderProfileQuestionnairePage();
}

function resetPosition() {
  selectedPositionId = '';
  selectedFundamental = 'Todos';
  activePage = 'dashboard';
  localStorage.removeItem('isa.selectedPosition');
  localStorage.setItem('isa.selectedFundamental', selectedFundamental);
  localStorage.setItem('isa.activePage', activePage);
  render();
}

function setSession(id) {
  selectedSessionId = id;
  localStorage.setItem('isa.selectedSessionId', id);
  render();
}

function choiceButtons(group, options, selected, multi = false) {
  const values = multi ? selected || [] : [selected];
  return options.map(([value, label]) => {
    const style = group === 'position' ? ` style="${positionThemeVars(value)}"` : '';
    return `
    <button
      class="profile-choice ${values.includes(value) ? 'active' : ''}"
      type="button"
      data-profile-${multi ? 'multi' : 'single'}="${group}"
      data-value="${value}"
      aria-pressed="${values.includes(value)}"
      ${style}
    >${label}</button>
  `;
  }).join('');
}

function getProfileDraft() {
  if (!profileDraft) profileDraft = cloneProfile(athleteProfile);
  if (!Number.isFinite(profileQuestionStep) || profileQuestionStep < 0 || profileQuestionStep >= profileQuestionSteps.length) {
    profileQuestionStep = Math.max(0, Math.min(profileQuestionSteps.length - 1, profileQuestionStep || 0));
  }
  return profileDraft;
}

function currentProfileStepData(profile) {
  const step = profileQuestionSteps[profileQuestionStep];
  const number = String(profileQuestionStep + 1).padStart(2, '0');
  if (step === 'body') {
    return {
      number,
      title: 'Idade e altura',
      detail: 'Esses dados ajudam a calibrar volume, impacto e cuidado físico.',
      body: `
        <div class="profile-field-grid">
          <label><span class="metric-label">Idade</span><input id="profile-age" type="number" min="8" max="99" inputmode="numeric" value="${profile.age || ''}" placeholder="Ex: 16" /></label>
          <label><span class="metric-label">Altura</span><input id="profile-height" type="text" value="${profile.height || ''}" placeholder="Ex: 1,72 m" /></label>
        </div>
      `,
    };
  }
  if (step === 'level') {
    return {
      number,
      title: 'Nível atual',
      detail: 'O nível define a dificuldade inicial dos exercícios e a tolerância de volume.',
      body: `<div class="profile-choice-grid">${choiceButtons('level', profileQuestionOptions.levels, profile.level)}</div>`,
    };
  }
  if (step === 'equipment') {
    return {
      number,
      title: 'Equipamentos em casa',
      detail: 'Marque tudo que você consegue usar sem sair de casa.',
      body: `<div class="profile-choice-grid">${choiceButtons('equipment', profileQuestionOptions.equipment, profile.equipment, true)}</div>`,
    };
  }
  if (step === 'pains') {
    return {
      number,
      title: 'Dores ou regiões para cuidado',
      detail: 'O plano reduz impacto quando existe dor marcada.',
      body: `<div class="profile-choice-grid">${choiceButtons('pains', profileQuestionOptions.pains, profile.pains, true)}</div>`,
    };
  }
  if (step === 'objective') {
    return {
      number,
      title: 'Objetivo principal',
      detail: 'Escolha uma prioridade para o primeiro ciclo de treino.',
      body: `<div class="profile-choice-grid">${choiceButtons('objective', profileQuestionOptions.objectives, profile.objective)}</div>`,
    };
  }
  if (step === 'time') {
    return {
      number,
      title: 'Tempo disponível',
      detail: 'A dose do plano muda conforme o tempo real que você tem por treino.',
      body: `<div class="profile-choice-grid">${choiceButtons('time', profileQuestionOptions.time, profile.time)}</div>`,
    };
  }
  return {
    number,
    title: 'Tempo disponível',
    detail: 'A dose do plano muda conforme o tempo real que você tem por treino.',
    body: `<div class="profile-choice-grid">${choiceButtons('time', profileQuestionOptions.time, profile.time || '25')}</div>`,
  };
}

function persistCurrentProfileCard() {
  const profile = getProfileDraft();
  const step = profileQuestionSteps[profileQuestionStep];
  const activeSingle = (group, fallback) => document.querySelector(`[data-profile-single="${group}"].active`)?.dataset.value || fallback;
  const activeMulti = (group, fallback) => {
    const values = [...document.querySelectorAll(`[data-profile-multi="${group}"].active`)].map((button) => button.dataset.value);
    return values.length ? values : fallback;
  };
  if (step === 'body') {
    profile.age = document.querySelector('#profile-age')?.value.trim() || '';
    profile.height = document.querySelector('#profile-height')?.value.trim() || '';
  }
  if (step === 'level') profile.level = activeSingle('level', profile.level || 'iniciante');
  if (step === 'equipment') profile.equipment = activeMulti('equipment', profile.equipment || []);
  if (step === 'pains') profile.pains = activeMulti('pains', profile.pains || ['sem-dor']);
  if (step === 'objective') profile.objective = activeSingle('objective', profile.objective || 'fundamentos');
  if (step === 'time') profile.time = activeSingle('time', profile.time || '25');
}

function moveProfileStep(delta) {
  persistCurrentProfileCard();
  profileQuestionStep = Math.max(0, Math.min(profileQuestionSteps.length - 1, profileQuestionStep + delta));
  localStorage.setItem('isa.profileStep', String(profileQuestionStep));
  renderProfileQuestionnairePage();
}

function moveOnboardingProfileStep(delta) {
  persistCurrentProfileCard();
  profileQuestionStep = Math.max(0, Math.min(profileQuestionSteps.length - 1, profileQuestionStep + delta));
  localStorage.setItem('isa.profileStep', String(profileQuestionStep));
  renderOnboardingPage();
}

function bindProfileQuestionControls({ isAutoAdvanceStep, isLastStep, onMove, onComplete, allowCancel = false }) {
  document.querySelectorAll('[data-profile-single]').forEach((button) => {
    button.addEventListener('click', () => {
      const group = button.dataset.profileSingle;
      document.querySelectorAll(`[data-profile-single="${group}"]`).forEach((item) => {
        item.classList.remove('active');
        item.setAttribute('aria-pressed', 'false');
      });
      button.classList.add('active');
      button.setAttribute('aria-pressed', 'true');
      if (isAutoAdvanceStep) {
        window.setTimeout(() => onMove(1), 120);
      }
    });
  });

  document.querySelectorAll('[data-profile-multi]').forEach((button) => {
    button.addEventListener('click', () => {
      const group = button.dataset.profileMulti;
      const value = button.dataset.value;
      if (group === 'pains' && value === 'sem-dor') {
        document.querySelectorAll('[data-profile-multi="pains"]').forEach((item) => {
          item.classList.toggle('active', item.dataset.value === 'sem-dor');
          item.setAttribute('aria-pressed', item.dataset.value === 'sem-dor' ? 'true' : 'false');
        });
        return;
      }
      if (group === 'pains') {
        const noPain = document.querySelector('[data-profile-multi="pains"][data-value="sem-dor"]');
        noPain?.classList.remove('active');
        noPain?.setAttribute('aria-pressed', 'false');
      }
      button.classList.toggle('active');
      button.setAttribute('aria-pressed', button.classList.contains('active') ? 'true' : 'false');
    });
  });

  if (allowCancel) {
    document.querySelector('[data-cancel-profile]')?.addEventListener('click', () => {
      editingProfile = false;
      profileDraft = null;
      profileQuestionStep = 0;
      localStorage.removeItem('isa.profileStep');
      render();
    });
  }
  document.querySelector('[data-profile-prev]')?.addEventListener('click', () => onMove(-1));

  document.querySelector('#profile-form').addEventListener('submit', (event) => {
    event.preventDefault();
    persistCurrentProfileCard();
    if (isLastStep) onComplete();
    else onMove(1);
  });
}

function renderProfileQuestionCard({ currentCard, progress, isFirstStep, isLastStep, isAutoAdvanceStep, submitLabel, showCancel = false }) {
  return `
    <form class="profile-form panel" id="profile-form">
      <div class="panel-header profile-fullscreen-header">
        <div>
          <p class="eyebrow">Questionário inicial</p>
          <h3>Receba um plano feito para o seu jogo.</h3>
          <p class="panel-subtitle">Dados simples para ajustar dose, cuidados e prioridade do treino.</p>
        </div>
        <span class="pill active">${profileQuestionStep + 1} de ${profileQuestionSteps.length}</span>
      </div>
      <div class="panel-body profile-form-body">
        <div class="profile-step-track" aria-label="Progresso do questionário"><span style="width:${progress}%"></span></div>
        <article class="profile-question-card active-step-card">
          <div class="profile-question-head">
            <span class="position-card-index">${currentCard.number}</span>
            <div><h4>${currentCard.title}</h4><p>${currentCard.detail}</p></div>
          </div>
          ${currentCard.body}
        </article>

        <div class="profile-actions">
          <button class="btn-ghost" type="button" data-profile-prev ${isFirstStep ? 'disabled' : ''}>Voltar</button>
          ${isAutoAdvanceStep ? '' : `<button class="btn-primary" type="submit">${isLastStep ? submitLabel : 'Próximo'}</button>`}
          ${showCancel ? '<button class="btn-ghost" type="button" data-cancel-profile>Cancelar</button>' : ''}
        </div>
      </div>
    </form>
  `;
}

function renderProfileQuestionnairePage() {
  const profile = getProfileDraft();
  const currentCard = currentProfileStepData(profile);
  const isFirstStep = profileQuestionStep === 0;
  const isLastStep = profileQuestionStep === profileQuestionSteps.length - 1;
  const isAutoAdvanceStep = ['level', 'objective'].includes(profileQuestionSteps[profileQuestionStep]);
  const progress = ((profileQuestionStep + 1) / profileQuestionSteps.length) * 100;
  app.innerHTML = `
    <div class="position-select-screen profile-screen">
      <main class="profile-shell profile-fullscreen-shell">
        <div class="brand position-select-brand profile-inline-brand">
          <div class="brand-mark" aria-hidden="true"><img src="public/assets/site-icon-192.png" alt="" /></div>
          <div>
            <h1>Projeto Vôlei</h1>
            <p>Perfil de treino</p>
          </div>
        </div>
        ${renderProfileQuestionCard({
          currentCard,
          progress,
          isFirstStep,
          isLastStep,
          isAutoAdvanceStep,
          submitLabel: 'Salvar dados',
          showCancel: true,
        })}
      </main>
    </div>
  `;

  bindProfileQuestionControls({
    isAutoAdvanceStep,
    isLastStep,
    onMove: moveProfileStep,
    onComplete: () => saveAthleteProfile(profileDraft),
    allowCancel: true,
  });
}

function renderOnboardingPage() {
  if (!getSelectedPosition()) {
    renderPositionSelectionPage();
    return;
  }
  const profile = getProfileDraft();
  const currentCard = currentProfileStepData(profile);
  const isFirstStep = profileQuestionStep === 0;
  const isLastStep = profileQuestionStep === profileQuestionSteps.length - 1;
  const isAutoAdvanceStep = ['level', 'objective'].includes(profileQuestionSteps[profileQuestionStep]);
  const progress = ((profileQuestionStep + 1) / profileQuestionSteps.length) * 100;
  const selectedPosition = positionContents.find((position) => position.id === selectedPositionId);
  app.innerHTML = `
    <div class="position-select-screen">
      <main class="position-select-shell onboarding-shell questionnaire-after-position-shell">
        <section class="position-select-intro onboarding-intro">
          <div class="brand position-select-brand">
            <div class="brand-mark" aria-hidden="true"><img src="public/assets/site-icon-192.png" alt="" /></div>
            <div>
              <h1>Projeto Vôlei</h1>
              <p>Treino individual em casa</p>
            </div>
          </div>
          <p class="eyebrow">Personalização inicial</p>
          <h2>Agora ajuste o treino para ${selectedPosition.name}.</h2>
          <p>
            A posição já definiu o contexto do plano. Responda o questionário para ajustar dose,
            cuidados e prioridade do primeiro ciclo.
          </p>
          <article class="position-common-card">
            <span class="tag">Posição escolhida</span>
            <h3>${selectedPosition.name}</h3>
            <p>${selectedPosition.description}</p>
            <button class="btn-ghost" type="button" data-change-onboarding-position>Trocar posição</button>
          </article>
          ${onboardingPositionWarning ? '<article class="position-common-card onboarding-warning"><span class="tag">Falta escolher posição</span><p>Escolha sua função em quadra antes de salvar o perfil.</p></article>' : ''}
        </section>
        <section class="onboarding-profile-slot">
          ${renderProfileQuestionCard({
            currentCard,
            progress,
            isFirstStep,
            isLastStep,
            isAutoAdvanceStep,
            submitLabel: 'Salvar e entrar no site',
          })}
        </section>
      </main>
    </div>
  `;

  document.querySelector('[data-change-onboarding-position]')?.addEventListener('click', () => {
    selectedPositionId = '';
    profileQuestionStep = 0;
    localStorage.removeItem('isa.selectedPosition');
    localStorage.removeItem('isa.profileStep');
    renderPositionSelectionPage();
  });

  bindProfileQuestionControls({
    isAutoAdvanceStep,
    isLastStep,
    onMove: moveOnboardingProfileStep,
    onComplete: () => {
      if (!selectedPositionId) {
        onboardingPositionWarning = true;
        renderOnboardingPage();
        return;
      }
      saveAthleteProfile(profileDraft);
    },
  });
}

function renderPositionSelectionPage() {
  const suggestedPosition = athleteProfile.position || 'levantador';
  const profileCard = athleteProfile.completed
    ? `
          <article class="position-common-card profile-summary-card">
            <span class="tag">Perfil salvo</span>
            <div class="profile-mini-grid">
              ${profileSummaryItems().slice(0, 3).map(([label, value]) => `<span><strong>${label}</strong>${value}</span>`).join('')}
            </div>
            <button class="btn-ghost" type="button" data-edit-profile>Ajustar perfil</button>
          </article>
      `
    : `
          <article class="position-common-card profile-summary-card">
            <span class="tag">Próximo passo</span>
            <p>Escolha sua posição e responda um perfil rápido para receber um plano mais adequado ao seu treino em casa.</p>
          </article>
      `;
  app.innerHTML = `
    <div class="position-select-screen">
      <main class="position-select-shell">
        <section class="position-select-intro">
          <div class="brand position-select-brand">
            <div class="brand-mark" aria-hidden="true"><img src="public/assets/site-icon-192.png" alt="" /></div>
            <div>
              <h1>Projeto Vôlei</h1>
              <p>Treino individual em casa</p>
            </div>
          </div>
          <p class="eyebrow">Personalização por posição</p>
          <h2>Treine de acordo com a sua posição.</h2>
          <p>Receba exercícios, plano semanal e correções alinhados à função que você joga.</p>
          <div class="position-benefit-strip" aria-label="Benefícios principais">
            <span>Plano da semana</span>
            <span>Exercícios em casa</span>
            <span>Evolução registrada</span>
          </div>
          ${profileCard}
        </section>
          <section class="position-card-grid" aria-label="Escolher posição de vôlei">
          ${positionContents.map((position) => `
            <button class="position-card ${position.id === suggestedPosition ? 'suggested' : ''}" type="button" data-position-id="${position.id}" style="${positionThemeVars(position.id)}">
              <span class="position-card-index">${String(positionContents.indexOf(position) + 1).padStart(2, '0')}</span>
              <span class="position-card-icon" aria-hidden="true"><img src="public/assets/positions/${position.id}-icon.png" alt="" /></span>
              <strong>${position.name}</strong>
              <span>${position.description}</span>
              <small>${position.id === suggestedPosition ? 'sugestão inicial | ' : ''}${position.fundamentals.slice(0, 3).map(displayLabel).join(' | ')}</small>
            </button>
          `).join('')}
        </section>
      </main>
    </div>
  `;

  document.querySelectorAll('[data-position-id]').forEach((button) => {
    button.addEventListener('click', () => {
      if (athleteProfile.completed) setPosition(button.dataset.positionId);
      else selectOnboardingPosition(button.dataset.positionId);
    });
  });
  document.querySelectorAll('[data-edit-profile]').forEach((button) => {
    button.addEventListener('click', openProfileEditor);
  });
}

function renderShell(content) {
  const current = pageItems.find(([id]) => id === activePage) || pageItems[0];
  const currentPosition = getSelectedPosition();
  const topbarCopy = {
    dashboard: 'Veja o treino ideal para hoje e acompanhe sua evolução.',
    treinos: 'Sua semana organizada por posição, tempo e objetivo.',
    exercicios: 'Filtre exercícios por fundamento, tempo e material.',
    'fisico-mobilidade': 'Prepare o corpo para treinar melhor e reduzir sobrecarga.',
    individual: 'Transforme erros em metas simples de correção.',
    leitura: 'Treine decisões de jogo com situações rápidas.',
    videos: 'Revise movimento quando fizer sentido, sem complicar o treino.',
    relatorios: 'Registre progresso e transforme treino em evolução.',
  };
  app.innerHTML = `
    <div class="app" style="${positionThemeVars(currentPosition?.id)}">
      <aside class="sidebar">
        <div class="brand">
          <div class="brand-mark" aria-hidden="true"><img src="public/assets/site-icon-192.png" alt="" /></div>
          <div>
            <h1>Projeto Vôlei</h1>
            <p>Treino em casa</p>
          </div>
        </div>
        <nav class="nav">
          ${navItems.map(([id, icon, label]) => `
            <button data-page="${id}" class="${activePage === id ? 'active' : ''}" ${activePage === id ? 'aria-current="page"' : ''}>
              <span class="nav-icon" aria-hidden="true">${icon}</span><span>${label}</span>
            </button>
          `).join('')}
        </nav>
        <div class="sidebar-footer">
          <div class="team-box">Ciclo do treino<br><span class="muted">Planejar, executar, registrar, evoluir</span></div>
        </div>
      </aside>
      <main class="main">
        <header class="topbar">
          <div>
            <p class="eyebrow">${current[3]}</p>
            <p>${topbarCopy[activePage] || 'Treine com clareza e registre sua evolução.'}</p>
          </div>
          <div class="top-actions">
            <span class="pill active">${currentPosition?.name || 'Sem posição'}</span>
            <span class="pill">${labelForOption('time', athleteProfile.time)}</span>
            <button class="pill position-switch" type="button" data-change-position>Trocar posição</button>
            <button class="pill position-switch" type="button" data-edit-profile>Ajustar perfil</button>
          </div>
        </header>
        <div class="content">${content}</div>
      </main>
    </div>
  `;

  document.querySelectorAll('[data-page]').forEach((button) => {
    button.addEventListener('click', () => setPage(button.dataset.page));
  });
  document.querySelectorAll('[data-edit-profile]').forEach((button) => {
    button.addEventListener('click', openProfileEditor);
  });
  document.querySelector('[data-change-position]')?.addEventListener('click', resetPosition);

  document.querySelector('.nav button.active')?.scrollIntoView({
    block: 'nearest',
    inline: 'center',
  });
}

function renderDashboard() {
  const currentPosition = getSelectedPosition();
  const dose = profileTrainingDose();
  const positionFundamentals = currentPosition?.fundamentals || fundamentals.map((item) => item.name);
  const fundamentalScore = positionFundamentals.length
    ? positionFundamentals.reduce((sum, name) => sum + scoreForFundamentalName(name), 0) / positionFundamentals.length
    : 0;
  const totalSessions = sessions.length;
  const totalFundamentals = fundamentals.length;
  const weeklyPlan = (currentPosition?.weeklyPlan || []).map(([day, focus, task]) => [
    day,
    focus,
    focus === 'Fisico' ? 'Fisico' : focus === 'Revisao' ? 'Revisao' : focus === 'Recuperacao' ? 'Recuperacao' : 'Tecnico',
    task,
    focus === 'Recuperacao' ? '15 min' : focus === 'Revisao' ? '20 min' : dose.duration,
  ]);
  const todayPlan = weeklyPlan[todayTrainingDayIndex()] || weeklyPlan[0] || ['Hoje', 'Fundamentos', 'Tecnico', 'Treino técnico principal', dose.duration];
  const todayTraining = buildDailyTrainingPlan(todayPlan, currentPosition, dose);
  const mainStep = todayTraining.steps.find((step) => String(step.label || '').startsWith('Exercício')) || todayTraining.steps[1] || todayTraining.steps[0];
  const bestFundamental = positionFundamentals
    .map((name) => ({ name, score: scoreForFundamentalName(name) }))
    .reduce((best, item) => (item.score > best.score ? item : best), { name: 'Sem dado', score: 0 });
  const statusSummary = totalSessions
    ? 'Treinos registrados e prontos para comparar evolução.'
    : 'Ainda sem treinos registrados nesta base local.';

  const benefitCards = [
    ['Treino por posição', `Conteúdo ajustado para ${currentPosition?.name || 'sua função'} desde o primeiro acesso.`],
    ['Plano da semana', 'Dias organizados para saber o que treinar hoje e o que vem depois.'],
    ['Exercícios em casa', 'Fundamentos com material simples, tempo curto e critério claro.'],
    ['Correções práticas', 'Erros viram metas de treino, não textos longos de relatório.'],
  ];
  const progressHighlights = [
    ['Treinos', totalSessions, totalSessions ? 'sessões concluídas' : 'comece pelo treino de hoje'],
    ['Fundamentos', currentPosition?.fundamentals.length || totalFundamentals, 'priorizados para sua posição'],
    ['Melhor ponto', bestFundamental?.name || 'Sem dado', `${(bestFundamental?.score || 0).toFixed(1)} de 10`],
  ];
  const profileHighlights = profileSummaryItems().slice(0, 3);

  renderShell(`
    <div class="content-inner stack">
      <section class="hero dashboard-hero">
        <img src="public/assets/home-training-court.webp" alt="" aria-hidden="true" />
        <div class="hero-content">
          <div>
            <h2>Treine de acordo com a sua posição.</h2>
            <p class="hero-copy">
              Veja o treino ideal para hoje, acompanhe sua semana e evolua seus fundamentos com exercícios simples para fazer em casa.
            </p>
            <div class="hero-actions">
              <button class="btn-primary" type="button" data-page="treinos">Começar treino</button>
              <button class="btn-ghost" type="button" data-page="treinos">Ver plano da semana</button>
              <button class="btn-ghost" type="button" data-page="relatorios">Registrar progresso</button>
            </div>
            <div class="training-cycle status-cycle" aria-label="Resumo do progresso atual">
              <div class="cycle-item"><strong>${currentPosition?.name || 'Atleta'}</strong><span>posição escolhida</span></div>
              <div class="cycle-item"><strong>${todayTraining.duration}</strong><span>treino de hoje</span></div>
              <div class="cycle-item"><strong>${totalSessions}</strong><span>treinos concluídos</span></div>
              <div class="cycle-item"><strong>${fundamentalScore.toFixed(1)}</strong><span>progresso médio</span></div>
            </div>
          </div>
          <article class="today-training-card">
            <p class="metric-label">Treino de hoje</p>
            <h3>${ptText(displayLabel(todayTraining.day))}: ${ptText(displayLabel(todayTraining.focus))}</h3>
            <p>${ptText(todayTraining.detail)}</p>
            <div class="today-training-main">
              <span>${ptText(displayLabel(mainStep?.fundamental || todayTraining.type))}</span>
              <strong>${ptText(mainStep?.title || 'Exercício principal')}</strong>
              <small>${ptText(mainStep?.series || dose.series)} · ${ptText(mainStep?.duration || todayTraining.duration)}</small>
            </div>
            <button class="btn-primary" type="button" data-page="treinos">Abrir treino completo</button>
          </article>
        </div>
      </section>

      <section class="benefit-strip" aria-label="Principais benefícios">
        ${benefitCards.map(([title, text]) => `
          <article class="benefit-card">
            <strong>${ptText(title)}</strong>
            <p>${ptText(text)}</p>
          </article>
        `).join('')}
      </section>

      <section class="home-summary-grid">
        <article class="panel home-week-panel">
          <div class="panel-header">
            <div>
              <h3>Semana de treino</h3>
              <p class="panel-subtitle">Veja o que vem depois do treino de hoje.</p>
            </div>
            <button class="btn-ghost" data-page="treinos">Ver plano</button>
          </div>
          <div class="panel-body home-week-list">
            ${weeklyPlan.slice(0, 4).map(([day, focus, type, task], index) => `
              <div class="home-week-row ${index === todayTrainingDayIndex() ? 'is-today' : ''}">
                <span>${ptText(displayLabel(day))}</span>
                <div>
                  <strong>${ptText(displayLabel(focus))}</strong>
                  <p>${ptText(task)}</p>
                </div>
              </div>
            `).join('')}
          </div>
        </article>

        <article class="panel home-progress-panel">
          <div class="panel-header">
            <div>
              <h3>Progresso do atleta</h3>
              <p class="panel-subtitle">${ptText(statusSummary)}</p>
            </div>
            <button class="btn-ghost" data-page="relatorios">Registrar</button>
          </div>
          <div class="panel-body home-progress-list">
            ${progressHighlights.map(([label, value, detail]) => `
              <div>
                <span>${ptText(label)}</span>
                <strong>${ptText(value)}</strong>
                <small>${ptText(detail)}</small>
              </div>
            `).join('')}
          </div>
          <div class="home-profile-strip">
            ${profileHighlights.map(([label, value]) => `<span><strong>${ptText(label)}</strong>${ptText(value)}</span>`).join('')}
          </div>
        </article>
      </section>

      <details class="panel dashboard-details-panel">
        <summary>
          <span>Fundamentos da posição</span>
          <small>Ver prioridades de ${currentPosition?.name || 'sua posição'}</small>
        </summary>
        <div class="dashboard-details-body">
          <div class="panel-header">
            <div>
              <h3>Prioridades técnicas</h3>
              <p class="panel-subtitle">Use estes fundamentos para escolher exercícios e registrar evolução.</p>
            </div>
          </div>
          <div class="home-court-visual" aria-hidden="true">
            <span class="target-wall"></span>
            <span class="court-target"></span>
            <span class="court-player"></span>
          </div>
          <div class="panel-body stack">
            ${(currentPosition?.fundamentals || []).map((fundamental) => {
              const score = scoreForFundamentalName(fundamental);
              return `
              <div class="fundamental-status-row">
                <span>${ptText(displayLabel(fundamental))}</span>
                <div class="indicator-track"><span style="width:${score * 10}%"></span></div>
                <strong>${score.toFixed(1)}</strong>
              </div>
            `;
            }).join('')}
          </div>
        </div>
      </details>
    </div>
  `);
}

function simpleTextMatch(text, value) {
  return String(text || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .includes(String(value || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase());
}

function trainingSeriesForDose(multiplier = 1) {
  const minutes = Number(athleteProfile.time || 25);
  const base = minutes <= 15 ? 2 : minutes <= 25 ? 3 : 4;
  return Math.max(1, Math.round(base * multiplier));
}

function localDateKey(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function formatDateBr(date = new Date()) {
  return date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

function formatTimeBr(date = new Date()) {
  return date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
}

function formatWeekdayBr(date = new Date()) {
  return date.toLocaleDateString('pt-BR', { weekday: 'long' });
}

function todayTrainingDayIndex() {
  return [6, 0, 1, 2, 3, 4, 5][new Date().getDay()] || 0;
}

function syncSelectedTrainingDayWithToday(weekLength) {
  const todayKey = localDateKey();
  const storedDate = localStorage.getItem('isa.selectedTrainingDate');
  if (storedDate !== todayKey || !Number.isFinite(selectedTrainingDay)) {
    selectedTrainingDay = todayTrainingDayIndex();
    localStorage.setItem('isa.selectedTrainingDate', todayKey);
    localStorage.setItem('isa.selectedTrainingDay', String(selectedTrainingDay));
  }
  if (selectedTrainingDay < 0 || selectedTrainingDay >= weekLength) {
    selectedTrainingDay = 0;
    localStorage.setItem('isa.selectedTrainingDay', String(selectedTrainingDay));
  }
}

function exerciseMatchesWeeklyFocus(exercise, focusText) {
  const searchable = `${exercise.fundamental} ${exercise.title} ${exercise.objective}`;
  return simpleTextMatch(focusText, exercise.fundamental)
    || simpleTextMatch(focusText, exercise.title)
    || searchable.split(/\s+/).some((word) => word.length > 4 && simpleTextMatch(focusText, word));
}

function weeklyExercisesForDay(dayPlan, position) {
  const [day, focus, type, detail] = dayPlan;
  const focusText = `${day} ${focus} ${type} ${detail}`;
  if (simpleTextMatch(focusText, 'recuperacao')) {
    return mobilityPrep.slice(0, 3).map(([title, setup, series, reason]) => ({
      title: `${title}: ${setup}`,
      fundamental: 'Mobilidade',
      setup: reason,
      metric: 'Movimento leve, sem dor e com respiração controlada.',
      series,
      duration: 'leve',
    }));
  }
  if (simpleTextMatch(focusText, 'fisico')) {
    return getPositionPhysicalTraining(position).slice(0, 3).map((exercise) => ({
      ...exercise,
      fundamental: exercise.focus,
      series: exerciseSeriesLabel(exercise, trainingSeriesForDose(0.75)),
    }));
  }
  if (simpleTextMatch(focusText, 'saque') || simpleTextMatch(focusText, 'defesa')) {
    return sharedServeDefenseFocus.exercises.map((exercise) => ({
      ...exercise,
      series: exerciseSeriesLabel(exercise, trainingSeriesForDose()),
    }));
  }
  const positionExercises = position?.homeExercises || [];
  const matched = positionExercises.filter((exercise) => exerciseMatchesWeeklyFocus(exercise, focusText));
  const fallback = matched.length ? matched : positionExercises.slice(0, 2);
  return fallback.slice(0, 3).map((exercise, index) => ({
    ...exercise,
    series: exerciseSeriesLabel(exercise, trainingSeriesForDose(index === 0 ? 1 : 0.75)),
  }));
}

function buildDailyTrainingPlan(dayPlan, position, dose) {
  const [day, focus, type, detail, duration] = dayPlan;
  const exercises = weeklyExercisesForDay(dayPlan, position);
  const mainExercises = exercises.length ? exercises : sharedServeDefenseFocus.exercises;
  const steps = [
    {
      label: 'Preparação',
      title: 'Aquecimento técnico curto',
      fundamental: 'Entrada do treino',
      series: '1 bloco',
      setup: `Prepare espaço, material e objetivo do dia: ${ptText(detail)}`,
      metric: 'Começar leve e sem pressa para manter técnica limpa.',
      duration: '3 a 5 min',
    },
    ...mainExercises.map((exercise, index) => ({
      label: `Exercício ${index + 1}`,
      title: ptText(exercise.title),
      fundamental: ptText(displayLabel(exercise.fundamental || type)),
      series: exercise.series || exerciseSeriesLabel(exercise, trainingSeriesForDose(index === 0 ? 1 : 0.75)),
      setup: ptText(exercise.setup),
      metric: ptText(exercise.metric),
      duration: ptText(exercise.duration || duration || dose.duration),
    })),
    {
      label: 'Fechamento',
      title: 'Registro rápido do treino',
      fundamental: 'Evolução',
      series: '1 anotação',
      setup: 'Anote o que saiu melhor, o que perdeu qualidade e o que deve repetir no próximo treino.',
      metric: 'Uma evidência objetiva: acertos, repetições limpas, dor, vídeo ou decisão tomada.',
      duration: '2 min',
    },
  ];
  return { day, focus, type, detail, duration, steps };
}

function dailyTrainingPanelMarkup(dailyTraining) {
  const completed = completedTrainingForDaily(dailyTraining);
  const buttonLabel = completed ? 'Treino concluído' : 'Concluir treino';
  return `
    <section class="panel daily-training-panel" id="daily-training-panel" role="tabpanel" aria-live="polite">
      <div class="panel-header">
        <div>
          <h3>Treino de ${ptText(displayLabel(dailyTraining.day))}: ${ptText(displayLabel(dailyTraining.focus))}</h3>
          <p class="panel-subtitle">Comece pelo aquecimento, faça os exercícios na ordem e conclua para registrar evolução.</p>
        </div>
        <div class="daily-training-actions">
          <span class="pill active">${dailyTraining.duration}</span>
          <button class="${completed ? 'btn-ghost training-completed-button' : 'btn-primary'}" type="button" data-complete-training ${completed ? 'disabled aria-disabled="true"' : ''}>
            ${buttonLabel}
          </button>
        </div>
      </div>
      <div class="panel-body">
        ${completed ? `<article class="training-completed-note"><strong>Registro salvo hoje</strong><span>${ptText(completed.date)} às ${ptText(completed.time)} · ${ptText(completed.position)} · ${ptText(displayLabel(completed.type))}</span></article>` : ''}
        <div class="training-kickoff-strip" aria-label="Resumo do treino do dia">
          <article>
            <span>Fundamento do dia</span>
            <strong>${ptText(displayLabel(dailyTraining.focus))}</strong>
          </article>
          <article>
            <span>Dose</span>
            <strong>${dailyTraining.steps.length} blocos · ${ptText(dailyTraining.duration)}</strong>
          </article>
          <article>
            <span>Critério</span>
            <strong>Técnica limpa antes de volume</strong>
          </article>
        </div>
        <ol class="daily-training-list">
          ${dailyTraining.steps.map((step, index) => `
            <li class="daily-training-step">
              <span class="session-step-number">${index + 1}</span>
              <div>
                <div class="daily-training-step-top">
                  <span class="tag">${ptText(step.label)}</span>
                  <strong>${ptText(step.series)}</strong>
                </div>
                <h4>${ptText(step.title)}</h4>
                <p>${ptText(step.setup)}</p>
                <div class="daily-training-meta">
                  <span>${ptText(displayLabel(step.fundamental))}</span>
                  <span>${ptText(step.duration)}</span>
                </div>
                <p class="muted"><strong>Critério:</strong> ${ptText(step.metric)}</p>
              </div>
            </li>
          `).join('')}
        </ol>
      </div>
    </section>
  `;
}

function bindCompleteTrainingButton(dailyTraining) {
  document.querySelector('[data-complete-training]')?.addEventListener('click', () => {
    preserveContentScroll(() => {
      completeDailyTraining(dailyTraining);
      renderTrainingPage();
    });
  });
  document.querySelector('[data-delete-current-training]')?.addEventListener('click', (event) => {
    const sessionId = event.currentTarget.dataset.deleteCurrentTraining;
    if (!sessionId) return;
    preserveContentScroll(() => {
      deleteCompletedTraining(sessionId);
      renderTrainingPage();
    });
  });
}

function bindDeleteTrainingButtons() {
  document.querySelectorAll('[data-delete-training]').forEach((button) => {
    button.addEventListener('click', () => {
      preserveContentScroll(() => {
        deleteCompletedTraining(button.dataset.deleteTraining);
        renderTrainingPage();
      });
    });
  });
}

function renderTrainingPage() {
  const currentPosition = getSelectedPosition();
  const dose = profileTrainingDose();
  const objectiveLabel = labelForOption('objectives', athleteProfile.objective);
  const weeklyPlan = (currentPosition?.weeklyPlan || []).map(([day, focus, task]) => [
    day,
    focus,
    focus === 'Fisico' ? 'Fisico' : focus === 'Revisao' ? 'Revisao' : focus === 'Recuperacao' ? 'Recuperacao' : 'Tecnico',
    task,
    focus === 'Recuperacao' ? '15 min' : focus === 'Revisao' ? '20 min' : dose.duration,
  ]);
  syncSelectedTrainingDayWithToday(weeklyPlan.length);
  const selectedDayPlan = weeklyPlan[selectedTrainingDay] || weeklyPlan[0] || ['Hoje', 'Treino', 'Tecnico', 'Exercício principal', dose.duration];
  const dailyTraining = buildDailyTrainingPlan(selectedDayPlan, currentPosition, dose);
  const weekSummary = [
    ['Posição', currentPosition?.name || 'Atleta'],
    ['Objetivo', objectiveLabel],
    ['Dose base', dose.duration],
    ['Progresso', `${sessions.length} ${sessions.length === 1 ? 'treino' : 'treinos'}`],
  ];
  renderShell(`
    <div class="content-inner stack">
      ${dailyTrainingPanelMarkup(dailyTraining)}

      <section class="panel training-week-tabs-panel">
        <div class="panel-header">
          <div>
            <h3>Plano da semana</h3>
            <p class="panel-subtitle">Escolha um dia para ver o treino completo. O dia atual já vem selecionado.</p>
          </div>
          <span class="pill active">${currentPosition?.name || 'Atleta'}</span>
        </div>
        <div class="panel-body">
          <div class="training-plan-strip" aria-label="Resumo simples do plano">
            ${weekSummary.map(([label, value]) => `<article><span>${ptText(label)}</span><strong>${ptText(value)}</strong></article>`).join('')}
          </div>
          <div class="weekly-plan-grid" role="tablist" aria-label="Dias da semana personalizada">
            ${weeklyPlan.map(([day, focus, type, detail, duration], index) => `
              <button class="weekly-plan-card weekly-plan-button ${index === selectedTrainingDay ? 'active' : ''}" type="button" role="tab" data-training-day="${index}" aria-selected="${index === selectedTrainingDay}" aria-controls="daily-training-panel">
                <div class="weekly-plan-top">
                  <span class="tag">${ptText(displayLabel(type))}</span>
                  <time>${ptText(duration)}</time>
                </div>
                <h4>${ptText(displayLabel(day))}</h4>
                <strong>${ptText(displayLabel(focus))}</strong>
                <p>${ptText(detail)}</p>
              </button>
            `).join('')}
          </div>
          <div class="training-plan-support">
            <p><strong>Como usar:</strong> ${ptText(dose.series)}. ${ptText(dose.note)}</p>
            <p><strong>Cuidado:</strong> ${profileSafetyNote()}</p>
          </div>
        </div>
      </section>

      <details class="panel training-history-panel">
        <summary>
          <span>Histórico de treinos</span>
          <small>${sessions.length} ${sessions.length === 1 ? 'registro salvo' : 'registros salvos'}</small>
        </summary>
        <div class="panel-body">
          ${completedTrainingHistoryMarkup()}
        </div>
      </details>
    </div>
  `);

  bindCompleteTrainingButton(dailyTraining);
  bindDeleteTrainingButtons();

  document.querySelectorAll('[data-training-day]').forEach((button) => {
    button.addEventListener('click', () => {
      selectedTrainingDay = Number(button.dataset.trainingDay || 0);
      localStorage.setItem('isa.selectedTrainingDate', localDateKey());
      localStorage.setItem('isa.selectedTrainingDay', String(selectedTrainingDay));
      document.querySelectorAll('[data-training-day]').forEach((item) => {
        const isActive = Number(item.dataset.trainingDay || 0) === selectedTrainingDay;
        item.classList.toggle('active', isActive);
        item.setAttribute('aria-selected', isActive ? 'true' : 'false');
      });
      const nextPlan = weeklyPlan[selectedTrainingDay] || weeklyPlan[0];
      const nextTraining = buildDailyTrainingPlan(nextPlan, currentPosition, dose);
      const currentPanel = document.querySelector('#daily-training-panel');
      if (currentPanel) currentPanel.outerHTML = dailyTrainingPanelMarkup(nextTraining);
      bindCompleteTrainingButton(nextTraining);
    });
  });
}

function renderPhysicalMobilityPage() {
  const currentPosition = getSelectedPosition();
  const dose = profileTrainingDose();
  const physicalBlocks = getPositionPhysicalTraining(currentPosition);
  const physicalCategories = [
    ['Força', 'Potência e estabilidade para salto, ataque, bloqueio e defesa.'],
    ['Mobilidade', 'Base baixa, freio e deslocamento com mais liberdade.'],
    ['Prevenção', 'Ombro, joelho e tornozelo preparados para repetir sem sobrecarga.'],
    ['Recuperação', 'Baixar a carga, respirar e ajustar quando o corpo pedir.'],
  ];
  const physicalCategoryOrder = ['Força', 'Mobilidade', 'Prevenção'];
  const physicalGroups = physicalCategoryOrder
    .map((category) => ({
      category,
      description: physicalCategories.find(([name]) => name === category)?.[1] || '',
      items: physicalBlocks.filter((exercise) => physicalCategoryForExercise(exercise) === category),
    }))
    .filter((group) => group.items.length);
  const recoverySteps = [
    ['Respirar', '2 minutos de respiração nasal para baixar o ritmo depois do bloco principal.'],
    ['Soltar', 'Mobilidade leve de tornozelo, quadril e ombro sem forçar amplitude.'],
    ['Ajustar', profileSafetyNote()],
  ];
  renderShell(`
    <div class="content-inner stack">
      <section class="panel physical-training-panel">
        <div class="panel-header">
          <div>
            <h3>Prepare o corpo para jogar melhor</h3>
            <p class="panel-subtitle">Força, mobilidade e prevenção para sustentar o treino da posição sem complicar a rotina.</p>
          </div>
          <button class="btn-primary" type="button" data-page="treinos">Começar treino</button>
        </div>
        <div class="physical-dose-row">
          <span class="pill active">${ptText(dose.duration)}</span>
          <span class="pill">${ptText(dose.series)}</span>
          <span class="pill">${currentPosition?.name || 'Posição atual'}</span>
        </div>
        <div class="panel-body physical-summary-grid">
          ${physicalCategories.map(([title, detail]) => `
            <article>
              <span class="metric-label">${ptText(title)}</span>
              <p>${ptText(detail)}</p>
            </article>
          `).join('')}
        </div>
        <div class="panel-body physical-training-stack">
          ${physicalGroups.map((group) => `
            <section class="physical-category-block" aria-label="${ptText(group.category)}">
              <div class="physical-category-header">
                <div>
                  <span class="metric-label">${ptText(group.category)}</span>
                  <p>${ptText(group.description)}</p>
                </div>
                <strong>${group.items.length} ${group.items.length === 1 ? 'bloco' : 'blocos'}</strong>
              </div>
              <div class="physical-training-grid">
                ${group.items.map((exercise) => `
                  <article class="exercise-library-card physical-training-card">
                    <div class="exercise-card-top">
                      <span class="tag">${displayLabel(exercise.focus)}</span>
                      <span class="metric-label">${ptText(exercise.duration)}</span>
                    </div>
                    <h3>${ptText(exercise.title)}</h3>
                    <p class="exercise-card-objective">${ptText(exercise.objective)}</p>
                    ${exercisePracticeMarkup(exercise)}
                    ${exerciseMoreDetailsMarkup([
                      { label: 'Material', value: exercise.materials },
                      { label: 'Mobilidade antes', value: exercise.mobility },
                      { label: 'Variações', value: exercise.variations || [] },
                      { label: 'Descanso', value: exercise.rest },
                      { label: 'Métrica', value: exercise.metric },
                      { label: 'Por que ajuda', value: physicalBenefitForExercise(exercise) },
                    ])}
                    <div class="exercise-card-actions" aria-label="Ação do bloco físico">
                      <button class="btn-primary" type="button" data-page="treinos">Começar bloco</button>
                    </div>
                  </article>
                `).join('')}
              </div>
            </section>
          `).join('')}
        </div>
      </section>

      <details class="panel mobility-prep-panel">
        <summary>
          <span>Recuperação depois do treino</span>
          <small>3 passos simples</small>
        </summary>
        <div class="panel-body mobility-list">
          ${recoverySteps.map(([area, drill]) => `
            <article class="mobility-card">
              <div><strong>${ptText(area)}</strong><span>pós-treino</span></div>
              <p>${ptText(drill)}</p>
            </article>
          `).join('')}
        </div>
      </details>

      <details class="panel mobility-prep-panel">
        <summary>
          <span>Mobilidade rápida antes do treino</span>
          <small>${mobilityPrep.length} opções</small>
        </summary>
        <div class="panel-body mobility-list">
          ${mobilityPrep.map(([area, drill, dose, reason]) => `
            <article class="mobility-card">
              <div><strong>${area}</strong><span>${dose}</span></div>
              <p>${ptText(drill)}</p>
              <small>${ptText(reason)}</small>
            </article>
          `).join('')}
        </div>
      </details>
    </div>
  `);
}

function renderPositionGuidePage() {
  const guide = getSelectedPositionGuide();
  const positionExercises = getSelectedPosition()?.homeExercises || [];
  const positionName = positionContents.find((position) => position.id === guide.id)?.name || guide.id;
  const selectedExerciseCount = positionExercises.length + sharedServeDefenseFocus.exercises.length;

  renderShell(`
    <div class="content-inner stack">
      <section class="panel">
        <div class="panel-header">
          <div>
            <h3>Posições do vôlei</h3>
            <p class="panel-subtitle">Cada aba mostra a decisão principal, os indicadores e as evidências que fazem sentido para a função.</p>
          </div>
          <span class="pill active">${positionDecisionGuides.length} funções</span>
        </div>
        <div class="panel-body">
          <div class="position-tab-strip" role="tablist" aria-label="Escolher posição">
            ${positionDecisionGuides.map((item) => {
              const name = positionContents.find((position) => position.id === item.id)?.name || item.id;
              return `
                <button
                  type="button"
                  role="tab"
                  aria-selected="${item.id === guide.id}"
                  class="position-tab ${item.id === guide.id ? 'active' : ''}"
                  data-position-tab="${item.id}"
                >
                  <strong>${name}</strong>
                  <span>${item.shortName}</span>
                </button>
              `;
            }).join('')}
          </div>

          <div class="position-guide-grid">
            <article class="position-guide-main">
              <div class="position-guide-heading">
                <div>
                  <p class="metric-label">Função em quadra</p>
                  <h4>${positionName}</h4>
                </div>
                <span class="position-code">${guide.shortName}</span>
              </div>
              <p>${guide.role}</p>
              <div class="position-guide-split">
                <div>
                  <span class="metric-label">Base de quadra</span>
                  <strong>${guide.courtBase}</strong>
                </div>
                <div>
                  <span class="metric-label">Prioridade</span>
                  <strong>${guide.priority}</strong>
                </div>
              </div>
            </article>

            <aside class="position-decision-stack">
              <article class="decision-card good">
                <span class="metric-label">Melhor decisão</span>
                <p>${guide.primaryDecision}</p>
              </article>
              <article class="decision-card caution">
                <span class="metric-label">Evitar</span>
                <p>${guide.avoid}</p>
              </article>
            </aside>
          </div>
        </div>
      </section>

      <section class="position-guide-columns">
        <article class="panel">
          <div class="panel-header"><div><h3>Treino por estilo</h3><p class="panel-subtitle">A mesma posição precisa de técnica, leitura e físico.</p></div></div>
          <div class="panel-body position-training-cards">
            ${guide.trainingTabs.map(([label, focus, drill]) => `
              <article class="position-training-card">
                <span class="tag">${displayLabel(label)}</span>
                <h4>${focus}</h4>
                <p>${drill}</p>
              </article>
            `).join('')}
          </div>
        </article>

        <article class="panel">
          <div class="panel-header"><div><h3>Fundamentos e indicadores</h3><p class="panel-subtitle">O que medir primeiro nos registros manuais.</p></div></div>
          <div class="panel-body stack">
            <div class="position-chip-list">
              ${guide.keyFundamentals.map((fundamental) => `<span>${displayLabel(fundamental)}</span>`).join('')}
            </div>
            <div class="content-list compact">
              ${guide.indicators.map((indicator) => `<p>${indicator}</p>`).join('')}
            </div>
          </div>
        </article>
      </section>

      <section class="panel">
        <div class="panel-header">
          <div>
            <h3>Exercícios específicos em casa</h3>
            <p class="panel-subtitle">Blocos adaptados para treinar a função sem rede, sem equipe e com material simples.</p>
          </div>
          <span class="pill active">${exerciseCountLabel(positionExercises.length)} da posição</span>
        </div>
        <div class="panel-body position-home-exercise-grid">
          ${positionExercises.map((exercise) => `
            <article>
              <div class="exercise-card-top">
                <span class="tag">${displayLabel(exercise.fundamental)}</span>
                <span class="metric-label">${exercise.duration}</span>
              </div>
              <h4>${exercise.title}</h4>
              ${exercisePracticeMarkup(exercise)}
              ${exerciseMoreDetailsMarkup([
                { label: 'Objetivo', value: exercise.objective },
                { label: 'Material', value: exercise.materials },
                { label: 'Variações', value: exercise.variations || [] },
                { label: 'Métrica', value: exercise.metric },
              ])}
            </article>
          `).join('')}
        </div>
      </section>

      <section class="panel">
        <div class="panel-header">
          <div>
            <h3>Evidências para relatório</h3>
            <p class="panel-subtitle">Detalhes observáveis para transformar treino em conclusão útil.</p>
          </div>
          <button class="btn-primary" type="button" data-page="exercicios">${exerciseCountLabel(selectedExerciseCount)}</button>
        </div>
        <div class="panel-body position-evidence-grid">
          ${guide.evidence.map((item) => `<article><span class="tag">evidência</span><p>${item}</p></article>`).join('')}
        </div>
      </section>
    </div>
  `);

  document.querySelectorAll('[data-position-tab]').forEach((button) => {
    button.addEventListener('click', () => setPosition(button.dataset.positionTab, 'posicoes'));
  });
}

function renderReportsPage() {
  const currentPosition = getSelectedPosition();
  const positionExercises = [...(currentPosition?.homeExercises || []), ...sharedServeDefenseFocus.exercises];
  const reportFundamentals = currentPosition?.fundamentals || fundamentals.map((item) => item.name);
  const hasDraft = [reportNote, reportPositive, reportCorrection, reportEvidence, reportNext].some(Boolean);
  const reportExerciseOptions = positionExercises;
  const progressSteps = [
    ['Treinou', 'Escolha fundamento e exercício feito.'],
    ['Mediu', 'Registre uma evidência simples do treino.'],
    ['Evoluiu', 'Defina a correção e o próximo treino.'],
  ];
  renderShell(`
    <div class="stack">
      <section class="panel">
        <div class="panel-header">
          <div>
            <h3>Registre seu progresso</h3>
            <p class="panel-subtitle">Guarde o que treinou, o que melhorou e qual será o próximo passo.</p>
          </div>
          <span class="pill active">${currentPosition?.name || 'sua posição'}</span>
        </div>
        <div class="panel-body evidence-strip">
          ${progressSteps.map(([title, detail]) => `<div class="evidence-step"><strong>${ptText(title)}</strong><span>${ptText(detail)}</span></div>`).join('')}
        </div>
      </section>

      <div class="form-grid">
        <section class="panel">
          <div class="panel-header"><h3>Registro rápido</h3><button class="btn-primary" id="save-report">Salvar progresso</button></div>
          <div class="panel-body stack">
            <div class="exercise-meta-grid">
              <label>
                <span class="metric-label">Fundamento</span>
                <select id="report-fundamental">
                  ${reportFundamentals.map((name) => `<option value="${name}" ${reportFundamental === name ? 'selected' : ''}>${displayLabel(name)}</option>`).join('')}
                </select>
              </label>
              <label>
                <span class="metric-label">Exercício em casa</span>
                <select id="report-exercise">
                  ${reportExerciseOptions.map((exercise) => `<option value="${exercise.title}" ${reportExercise === exercise.title ? 'selected' : ''}>${exercise.title}</option>`).join('')}
                </select>
              </label>
            </div>
            <label><span class="metric-label">Evidência do treino</span><textarea id="report-evidence" placeholder="Ex.: 18 acertos no alvo em 30 tentativas; perdi controle nas bolas mais baixas.">${reportEvidence}</textarea></label>
            <div class="exercise-meta-grid">
              <label><span class="metric-label">O que melhorou</span><textarea id="report-positive" placeholder="Ex.: plataforma mais firme e menos bolas para o lado.">${reportPositive}</textarea></label>
              <label><span class="metric-label">Correção para focar</span><textarea id="report-correction" placeholder="Ex.: ajustar base antes do contato.">${reportCorrection}</textarea></label>
            </div>
            <label><span class="metric-label">Próximo treino</span><textarea id="report-next" placeholder="Ex.: repetir manchete na parede com alvo mais baixo e filmar 3 séries.">${reportNext}</textarea></label>
            <details class="report-extra-details">
              <summary>Observação extra</summary>
              <label><span class="metric-label">Resumo livre</span><textarea id="report-note" placeholder="Anote contexto, sensação ou detalhe que não coube nos campos acima.">${reportNote}</textarea></label>
            </details>
          </div>
        </section>
        <section class="panel">
          <div class="panel-header"><h3>Último registro</h3></div>
          <div class="panel-body stack">
            ${hasDraft ? `
              <article class="report-card">
                <h4>${ptText(displayLabel(reportFundamental))} - ${ptText(reportExercise)}</h4>
                <p>${reportEvidence || reportNote || 'Evidência ainda sem texto.'}</p>
                ${reportPositive ? `<p><strong>O que melhorou:</strong> ${reportPositive}</p>` : ''}
                <span class="badge">Salvo neste navegador</span>
              </article>
              <article class="note-box"><p><strong style="color:white">Próximo treino</strong></p><p>${reportNext || reportCorrection || 'Defina uma ação simples para comparar na próxima sessão.'}</p></article>
            ` : '<article class="report-card"><h4>Nenhum progresso salvo</h4><p>Salve um registro curto quando terminar um exercício em casa.</p></article>'}
          </div>
        </section>
      </div>
    </div>
  `);
  document.querySelector('#save-report').addEventListener('click', () => {
    reportNote = document.querySelector('#report-note').value;
    reportPositive = document.querySelector('#report-positive').value;
    reportCorrection = document.querySelector('#report-correction').value;
    reportFundamental = document.querySelector('#report-fundamental').value;
    reportExercise = document.querySelector('#report-exercise').value;
    reportEvidence = document.querySelector('#report-evidence').value;
    reportNext = document.querySelector('#report-next').value;
    localStorage.setItem('isa.reportNote', reportNote);
    localStorage.setItem('isa.reportPositive', reportPositive);
    localStorage.setItem('isa.reportCorrection', reportCorrection);
    localStorage.setItem('isa.reportFundamental', reportFundamental);
    localStorage.setItem('isa.reportExercise', reportExercise);
    localStorage.setItem('isa.reportEvidence', reportEvidence);
    localStorage.setItem('isa.reportNext', reportNext);
    render();
  });
}

function renderStylesPage() {
  const currentPosition = getSelectedPosition();
  const choiceGuide = [
    ['Leitura', 'Tático', currentPosition?.gameReading[0] || 'Marque decisão, zona e próxima ação.'],
    ['Corpo', 'Físico', currentPosition?.physicalFocus[0] || 'Use toalha, fita no chão e controle de aterrissagem.'],
    ['Mental', 'Técnico', currentPosition?.mentalFocus[0] || 'Escolha um fundamento e uma métrica simples.'],
  ];
  renderShell(`
    <div class="content-inner stack">
      <section class="panel style-hero-panel">
        <div class="panel-header">
          <div>
            <h3>Estilos de treino em casa</h3>
            <p class="panel-subtitle">Escolha o tipo de sessão pelo objetivo do dia e pela posição ${currentPosition?.name || 'selecionada'}.</p>
          </div>
          <button class="btn-primary" data-page="treinos">Montar plano</button>
        </div>
        <div class="panel-body style-choice-strip" aria-label="Como escolher o estilo de treino">
          ${choiceGuide.map(([context, style, detail]) => `
            <article class="style-choice-card">
              <span class="metric-label">${context}</span>
              <strong>${style}</strong>
              <p>${ptText(detail)}</p>
            </article>
          `).join('')}
        </div>
      </section>

      <section class="style-route-grid" aria-label="Roteiros por estilo de treino">
        ${styleGuides.map((guide) => `
          <article class="style-route-card">
            <div class="style-route-top">
              <span class="tag">${displayLabel(guide.name)}</span>
              <span class="metric-label">${ptText(guide.dose)}</span>
            </div>
            <h3>${ptText(guide.focus)}</h3>
            <p>${ptText(guide.activities)}</p>
            <div class="style-evidence-grid">
              <div><span class="metric-label">Evidência</span><strong>${ptText(guide.evidence)}</strong></div>
              <div><span class="metric-label">Cuidado</span><strong>${ptText(guide.caution)}</strong></div>
              <div><span class="metric-label">Exercício base</span><strong>${ptText(guide.exercise)}</strong></div>
              <div><span class="metric-label">Métrica</span><strong>${ptText(guide.metric)}</strong></div>
            </div>
          </article>
        `).join('')}
      </section>

      <section class="position-detail-grid" aria-label="Focos específicos da posição">
        <article class="panel">
          <div class="panel-header"><div><h3>Leitura de jogo</h3><p class="panel-subtitle">${currentPosition?.name || 'Posição atual'}</p></div></div>
          <div class="panel-body content-list">${(currentPosition?.gameReading || []).map((item) => `<p>${ptText(item)}</p>`).join('')}</div>
        </article>
        <article class="panel">
          <div class="panel-header"><div><h3>Foco físico</h3><p class="panel-subtitle">Preparação para treinar em casa</p></div></div>
          <div class="panel-body content-list">${(currentPosition?.physicalFocus || []).map((item) => `<p>${ptText(item)}</p>`).join('')}</div>
        </article>
        <article class="panel">
          <div class="panel-header"><div><h3>Foco mental</h3><p class="panel-subtitle">Critérios para decidir melhor</p></div></div>
          <div class="panel-body content-list">${(currentPosition?.mentalFocus || []).map((item) => `<p>${ptText(item)}</p>`).join('')}</div>
        </article>
      </section>
    </div>
  `);
}

function renderExerciseLibraryPage() {
  const currentPosition = getSelectedPosition();
  const positionExercises = [...(currentPosition?.homeExercises || []), ...sharedServeDefenseFocus.exercises];
  const fundamentalOptions = ['Todos', ...new Set(positionExercises.map((item) => item.fundamental))];
  const timeOptions = ['Todos', '5 minutos', '10 minutos', '15 minutos'];
  const difficultyOptions = ['Todos', 'iniciante', 'intermediário', 'avançado'];
  const materialOptions = ['Todos', ...new Set(positionExercises.flatMap((exercise) => exerciseMaterialTags(exercise)))];
  if (!fundamentalOptions.includes(selectedFundamental)) selectedFundamental = 'Todos';
  if (!timeOptions.includes(selectedExerciseTime)) selectedExerciseTime = 'Todos';
  if (!difficultyOptions.includes(selectedExerciseDifficulty)) selectedExerciseDifficulty = 'Todos';
  if (!materialOptions.includes(selectedExerciseMaterial)) selectedExerciseMaterial = 'Todos';
  const visible = positionExercises.filter(exerciseMatchesFilters);
  const emptyMessage = visible.length
    ? ''
    : '<article class="note-box exercise-empty-state"><p><strong style="color:white">Nenhum exercício encontrado</strong></p><p>Remova um filtro ou escolha outro material. A biblioteca evita mostrar tarefas repetidas quando elas não combinam com a seleção.</p><button class="btn-primary" type="button" data-clear-exercise-filters>Limpar filtros</button></article>';

  renderShell(`
    <div class="stack">
      <section class="panel">
        <div class="panel-header">
          <div>
            <h3>Exercícios em casa para ${currentPosition?.name || 'sua posição'}</h3>
            <p class="panel-subtitle">Escolha um fundamento, veja como executar e comece por uma ficha curta de técnica.</p>
          </div>
          <span class="pill active">${exerciseCountLabel(visible.length)}</span>
        </div>
        <div class="panel-body">
          <div class="exercise-filter-panel library-filters">
            ${renderExerciseFilterGroup('Fundamento', 'fundamental', fundamentalOptions, selectedFundamental)}
            ${renderExerciseFilterGroup('Tempo', 'time', timeOptions, selectedExerciseTime)}
          </div>
          <details class="exercise-filter-more">
            <summary>
              <span>Mais filtros</span>
              <small>Dificuldade e material</small>
            </summary>
            <div class="exercise-filter-panel">
              ${renderExerciseFilterGroup('Dificuldade', 'difficulty', difficultyOptions, selectedExerciseDifficulty)}
              ${renderExerciseFilterGroup('Material necessário', 'material', materialOptions, selectedExerciseMaterial)}
            </div>
          </details>
        </div>
      </section>

      <section class="exercise-library-grid">
        ${emptyMessage}
        ${visible.map((exercise) => {
          const optimization = exerciseOptimizationNote(exercise);
          return `
          <article class="exercise-library-card">
            <div class="exercise-card-top">
              <div class="exercise-tag-list">
                ${[exercise.fundamental, exerciseDifficulty(exercise)].filter(Boolean).map((tag) => `<span class="tag">${displayLabel(tag)}</span>`).join('')}
              </div>
              <span class="metric-label">${ptText(exercise.duration)}</span>
            </div>
            <h3>${ptText(exercise.title)}</h3>
            <p class="exercise-card-objective">${ptText(exercise.objective)}</p>
            ${exercisePracticeMarkup(exercise)}
            ${exerciseMoreDetailsMarkup([
              { label: 'Por que fazer', value: exerciseBenefitForPosition(exercise, currentPosition) },
              { label: 'Critério de melhora', value: optimization.criterion },
              { label: 'Material', value: exercise.materials },
              { label: 'Variações', value: exercise.variations || [] },
              { label: 'Métrica', value: exercise.metric },
            ])}
            <div class="exercise-card-actions" aria-label="Ações principais do exercício">
              <button class="btn-primary" type="button" data-page="treinos">Começar treino</button>
            </div>
          </article>
        `; }).join('')}
      </section>

      <details class="exercise-support-details">
        <summary>
          <span>Orientações rápidas</span>
          <small>Saque, defesa e cuidado de treino</small>
        </summary>
        <div class="exercise-support-grid">
          <article>
            <strong>Ajuste pelo seu perfil</strong>
            <p>${profileSafetyNote()}</p>
          </article>
        </div>
      </details>
    </div>
  `);

  document.querySelectorAll('[data-exercise-filter]').forEach((button) => {
    button.addEventListener('click', () => setExerciseFilter(button.dataset.exerciseFilter, button.dataset.exerciseValue));
  });
  document.querySelector('[data-clear-exercise-filters]')?.addEventListener('click', () => {
    resetExerciseFilters();
    render();
  });
}

function renderIndividualPage() {
  const currentPosition = getSelectedPosition();
  const recommendedCorrection = correctionPlaybook.find((item) => item.priority === 'Alta') || correctionPlaybook[0];
  const otherCorrections = correctionPlaybook.filter((item) => item !== recommendedCorrection);
  const emptyCorrections = correctionPlaybook.slice(0, 3);
  const decisionSteps = [
    ['Ver', 'Identifique o detalhe que mais atrapalhou o fundamento.'],
    ['Corrigir', 'Escolha uma meta pequena para o próximo treino.'],
    ['Repetir', 'Use um exercício simples e acompanhe a melhora.'],
  ];
  renderShell(`
    <div class="content-inner stack">
      <section class="panel correction-hero-panel">
        <div class="panel-header">
          <div>
            <h3>Receba correções práticas para melhorar seu jogo</h3>
            <p class="panel-subtitle">Veja uma meta recomendada, treine o exercício indicado e registre a evolução.</p>
          </div>
          <button class="btn-ghost" data-page="relatorios">Registrar progresso</button>
        </div>
        <div class="panel-body correction-focus-layout" aria-label="Correção recomendada">
          <article class="correction-recommended-card">
            <div class="correction-card-top">
              <span class="tag">Correção recomendada</span>
              <div class="correction-badges">${badge(recommendedCorrection.priority)}<span class="badge">${recommendedCorrection.status}</span></div>
            </div>
            <h3>${ptText(recommendedCorrection.correction)}</h3>
            <p>${ptText(recommendedCorrection.signal)}</p>
            <div class="correction-action-row">
              <button class="btn-primary" type="button" data-page="exercicios">Treinar esta correção</button>
              <button class="btn-ghost" type="button" data-page="relatorios">Registrar progresso</button>
            </div>
            <div class="correction-meta-grid">
              <div><span class="metric-label">Exercício indicado</span><strong>${ptText(recommendedCorrection.drill)}</strong></div>
              <div><span class="metric-label">Meta da semana</span><strong>${ptText(recommendedCorrection.metric)}</strong></div>
            </div>
            <p class="correction-next-action"><strong>Próximo treino:</strong> ${ptText(recommendedCorrection.next)}</p>
          </article>
          <aside class="correction-use-panel" aria-label="Como usar as correções">
            <div>
              <span class="metric-label">Como usar</span>
              <div class="correction-flow-compact">
                ${decisionSteps.map(([title, detail], index) => `
                  <article>
                    <span class="session-step-number">${index + 1}</span>
                    <div><h4>${title}</h4><p>${detail}</p></div>
                  </article>
                `).join('')}
              </div>
            </div>
            <div class="correction-position-summary">
              <span class="metric-label">Foco para ${currentPosition?.name || 'sua posição'}</span>
              <p>${ptText(currentPosition?.description || 'Escolha uma posição para receber metas ligadas ao seu jogo.')}</p>
              <div class="position-chip-list">${(currentPosition?.fundamentals || []).slice(0, 4).map((item) => `<span>${ptText(displayLabel(item))}</span>`).join('')}</div>
            </div>
          </aside>
        </div>
      </section>

      <section class="correction-board-section" aria-label="Outras correções sugeridas">
        <div class="correction-board-header">
          <div>
            <h3>Outras metas para evoluir</h3>
            <p>Escolha uma meta menor quando o foco principal já estiver controlado.</p>
          </div>
          <span class="pill active">${otherCorrections.length} metas</span>
        </div>
        <div class="correction-board-grid">
        ${otherCorrections.map((item) => `
          <article class="correction-card">
            <div class="correction-card-top">
              <span class="tag">${displayLabel(item.fundamental)}</span>
              <div class="correction-badges">${badge(item.priority)}<span class="badge">${item.status}</span></div>
            </div>
            <h3>${ptText(item.correction)}</h3>
            <p>${ptText(item.signal)}</p>
            <div class="correction-meta-grid">
              <div><span class="metric-label">Exercício indicado</span><strong>${ptText(item.drill)}</strong></div>
              <div><span class="metric-label">Meta da semana</span><strong>${ptText(item.metric)}</strong></div>
            </div>
            <p class="correction-next-action"><strong>Próximo treino:</strong> ${ptText(item.next)}</p>
            <details class="correction-detail">
              <summary>Ver origem da correção</summary>
              <p>Observado em: ${ptText(item.observed)}.</p>
            </details>
            <button class="btn-primary" type="button" data-page="exercicios">Treinar correção</button>
          </article>
        `).join('')}
        </div>
      </section>

      <details class="panel correction-history-panel">
        <summary>
          <span>Correções salvas</span>
          <small>Ainda vazio</small>
        </summary>
        <div class="panel-body empty-corrections-grid">
          ${emptyCorrections.map((item) => `
            <article class="note-box">
              <p><strong style="color:white">${ptText(displayLabel(item.fundamental))}</strong></p>
              <p>Modelo: ${ptText(item.correction)}</p>
            </article>
          `).join('')}
        </div>
      </details>
    </div>
  `);
}

function renderIndicatorsPage() {
  const currentPosition = getSelectedPosition();
  const positionFundamentals = currentPosition?.fundamentals || fundamentals.map((item) => item.name);
  const criteria = [
    ['Controle', 'A bola chega no alvo combinado?', 'Conte acertos e perdas por série.'],
    ['Técnica', 'O gesto manteve base, braço ou plataforma?', 'Compare um detalhe por treino.'],
    ['Consistência', 'A execução se repete sem perder qualidade?', 'Use a melhor sequência da sessão.'],
  ];
  renderShell(`
    <div class="content-inner stack">
      <section class="panel evolution-hero">
        <div class="panel-header">
          <div>
            <h3>Evolução por critério</h3>
            <p class="panel-subtitle">Acompanhe ${currentPosition?.name || 'sua posição'} pelo que dá para observar, medir e repetir.</p>
          </div>
          <button class="btn-primary" data-page="relatorios">Salvar novo registro</button>
        </div>
        <div class="panel-body evolution-criteria">
          ${criteria.map(([title, question, detail]) => `
            <article class="criterion-card">
              <span class="criterion-dot" aria-hidden="true"></span>
              <h4>${title}</h4>
              <p>${question}</p>
              <small>${detail}</small>
            </article>
          `).join('')}
        </div>
      </section>

      <section class="panel">
        <div class="panel-header">
          <div>
            <h3>Tabela de fundamentos da posição</h3>
            <p class="panel-subtitle">Notas começam zeradas até existirem registros manuais comparáveis.</p>
          </div>
        </div>
        <div class="panel-body fund-grid">${positionFundamentals.map((name, index) => `<article class="fund-card"><div class="fund-top"><h4>${displayLabel(name)}</h4><strong>0.0</strong></div><span class="metric-label">0 registros manuais</span><div class="bar"><span style="width:0%;background:${fundamentals[index % fundamentals.length]?.color || 'var(--teal)'}"></span></div><p class="fund-hint">Registre evidência para atualizar este fundamento.</p></article>`).join('')}</div>
      </section>

      <section class="panel">
        <div class="panel-header"><h3>Comparação por treino</h3></div>
        <div class="panel-body" style="overflow-x:auto"><table><thead><tr><th class="table-head">Treino</th><th class="table-head">Estilo</th><th class="table-head">Minutos</th><th class="table-head">Qualidade</th><th class="table-head">Carga</th></tr></thead><tbody>${sessions.length ? sessions.map((session) => `<tr><td><strong>${session.title}</strong></td><td>${displayLabel(session.style)}</td><td>${session.duration}</td><td class="score">${session.quality.toFixed(1)}</td><td>${badge(session.load)}</td></tr>`).join('') : '<tr><td colspan="5"><strong>Nenhum treino para comparar</strong><br><span class="muted">Os indicadores serão preenchidos apenas com seus dados.</span></td></tr>'}</tbody></table></div>
      </section>

      <section class="panel">
        <div class="panel-header"><h3>Mapa de referência em quadra</h3><span class="pill active">apoio visual</span></div>
        <div class="panel-body positioning-grid">
          <div class="court-positioning">
            <img src="public/assets/learning-volleyball-system.png" alt="Quadra usada como referência visual para posicionamento" />
            ${[
              ['Z1', 'Saque / defesa direita', 68, 67],
              ['Z2', 'Saida de rede', 62, 38],
              ['Z3', 'Meio de rede', 49, 34],
              ['Z4', 'Entrada de rede', 36, 39],
              ['Z5', 'Defesa esquerda', 32, 67],
              ['Z6', 'Fundo centro', 50, 70],
            ].map(([zone, label, left, top]) => `<span class="court-marker" role="img" aria-label="${zone}, ${label}" style="left:${left}%;top:${top}%"><strong>${zone}</strong><span>${label}</span></span>`).join('')}
          </div>
          <div class="positioning-notes">
            <article class="note-box"><p><strong style="color:white">Uso no treino</strong></p><p>Use as zonas como linguagem: onde começou, para onde mirou e qual movimento quer repetir.</p></article>
            <article class="note-box"><p><strong style="color:white">Dentro de casa</strong></p><p>Adapte a zona para parede, alvo no chão ou deslocamento curto. O critério vale mais que o tamanho do espaço.</p></article>
          </div>
        </div>
      </section>
    </div>
  `);
}

function renderGameReadingPage() {
  const currentPosition = getSelectedPosition();
  const scene = gameReadingScenes.find((item) => item.id === selectedReadingSceneId) || gameReadingScenes[0];
  const answered = Boolean(selectedReadingAnswer);
  const isCorrect = selectedReadingAnswer === scene.answer;
  const readingFocus = [
    ['Observe', 'Veja bola, levantador, atacante e espaço vazio antes da ação terminar.'],
    ['Decida', 'Escolha a resposta mais provável para a sua posição.'],
    ['Ajuste', 'Compare com a decisão esperada e leve a pista para o treino.'],
  ];

  renderShell(`
    <div class="content-inner stack">
      <div class="form-grid">
        <section class="panel">
          <div class="panel-header">
            <div>
              <h3>Treine sua tomada de decisão</h3>
              <p class="panel-subtitle">Leia a cena, escolha a melhor resposta e compare com os sinais da jogada.</p>
            </div>
            <div class="daily-training-actions">
              <span class="pill active">${scene.clip}</span>
              <span class="pill">${ptText(currentPosition?.name || 'Atleta')}</span>
            </div>
          </div>
          <div class="panel-body game-reading-layout">
            <div class="reading-question-card">
              <span class="metric-label">Pergunta</span>
              <h4>${ptText(scene.question)}</h4>
              <div class="reading-focus-mini" aria-label="Como responder a cena">
                ${readingFocus.map(([title], index) => `<span>${index + 1}. ${ptText(title)}</span>`).join('')}
              </div>
              <div class="reading-options">
                ${scene.options.map((option) => `
                  <button class="${selectedReadingAnswer === option ? 'active' : ''}" data-reading-answer="${option}">
                    ${ptText(option)}
                  </button>
                `).join('')}
              </div>
              <article class="note-box ${answered ? '' : 'muted-box'}">
                <p><strong style="color:white">${answered ? (isCorrect ? 'Boa decisão' : 'Revise os sinais') : 'Escolha uma resposta'}</strong></p>
                <p>${answered ? `Resposta esperada: ${ptText(scene.answer)}. ${ptText(scene.decision)}` : 'Depois de responder, compare sua decisão com os sinais da jogada.'}</p>
              </article>
            </div>
            <div class="simulated-video-frame game-scene-frame" aria-label="Cena de jogo para leitura e tomada de decisão">
              <figure class="reading-photo">
                <img src="${scene.image}" alt="${ptText(scene.imageAlt)}" loading="eager">
                <div class="reading-game-hud" aria-hidden="true">
                  <span>Cena de jogo</span>
                  <strong>Decisão</strong>
                </div>
                <figcaption>
                  <span>${ptText(scene.angle)}</span>
                  <strong>${ptText(scene.fundamental)}</strong>
                </figcaption>
              </figure>
              <div class="video-caption">
                <span>${scene.clip}</span>
                <strong>${ptText(scene.title)}</strong>
              </div>
            </div>
          </div>
        </section>

        <aside class="panel">
          <div class="panel-header"><h3>Cenas estilo jogo</h3><span class="pill active">${gameReadingScenes.length} cenas</span></div>
          <div class="panel-body stack">
            ${gameReadingScenes.map((item) => `
              <button class="reading-scene-button ${item.id === scene.id ? 'active' : ''}" data-reading-scene="${item.id}">
                <span>${item.clip}</span>
                <strong>${ptText(item.title)}</strong>
                <small>${ptText(item.angle)}</small>
              </button>
            `).join('')}
          </div>
        </aside>
      </div>

      <details class="panel reading-support-panel">
        <summary>
          <span>Sinais para observar</span>
          <small>${gameReadingPatterns.length} pistas gerais</small>
        </summary>
        <div class="reading-support-grid">
          <div class="panel-body pattern-grid">
            ${gameReadingPatterns.map(([title, detail]) => `
              <article class="pattern-card">
                <h4>${ptText(title)}</h4>
                <p>${ptText(detail)}</p>
              </article>
            `).join('')}
          </div>

          <aside class="scene-cue-panel">
            <h3>Pistas desta cena</h3>
          <div class="panel-body stack">
            ${scene.cues.map((cue) => `<div class="action-item"><p><strong style="color:white">${ptText(cue)}</strong><br>Sinal usado para decidir antes do ataque.</p><span class="tag">pista</span></div>`).join('')}
          </div>
          </aside>
        </div>
      </details>
    </div>
  `);

  document.querySelectorAll('[data-reading-scene]').forEach((button) => {
    button.addEventListener('click', () => {
      selectedReadingSceneId = button.dataset.readingScene;
      selectedReadingAnswer = '';
      localStorage.setItem('isa.selectedReadingSceneId', selectedReadingSceneId);
      localStorage.removeItem('isa.selectedReadingAnswer');
      renderGameReadingPage();
    });
  });

  document.querySelectorAll('[data-reading-answer]').forEach((button) => {
    button.addEventListener('click', () => {
      selectedReadingAnswer = button.dataset.readingAnswer;
      localStorage.setItem('isa.selectedReadingAnswer', selectedReadingAnswer);
      renderGameReadingPage();
    });
  });
}

const videoEvidenceStorageKey = 'isa.importedVideoEvidence';
const localVideoEvidenceStorageKey = 'isa.localVideoEvidence';
const manualVideoEvidenceStorageKey = 'isa.manualVideoEvidence';
const archivedVideoEvidenceStorageKey = 'isa.archivedVideoEvidence';
const videoValidationStorageKey = 'isa.videoValidationClips';
let pendingVideoEvidenceDeleteId = '';

function safeVideoText(value) {
  return String(value ?? '').replace(/[&<>"']/g, (char) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
  })[char]);
}

function safePtVideoText(value) {
  return safeVideoText(ptText(value));
}

function safePublicVideoText(value) {
  const publicText = ptText(value)
    .replace(/\bframes revisados\b/gi, 'momentos revisados')
    .replace(/\bframe-chave\b/gi, 'momento-chave')
    .replace(/\bframe pausado\b/gi, 'momento pausado')
    .replace(/\bframe\b/gi, 'momento')
    .replace(/\bMediaPipe local\b/gi, 'análise do vídeo')
    .replace(/\bMediaPipe\b/gi, 'análise do vídeo')
    .replace(/\bSports2D\b/gi, 'análise do vídeo')
    .replace(/\bevidência inicial\b/gi, 'observação inicial')
    .replace(/\bevidencia inicial\b/gi, 'observação inicial')
    .replace(/\bJSON\b/g, 'arquivo revisado')
    .replace(/\.mot|\.csv/gi, 'arquivo técnico')
    .replace(/\bpipeline\b/gi, 'fluxo interno');
  return safeVideoText(publicText);
}

function readVideoEvidenceList(key) {
  try {
    const parsed = JSON.parse(localStorage.getItem(key) || '[]');
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function readImportedVideoEvidence() {
  return readVideoEvidenceList(videoEvidenceStorageKey);
}

function readLocalVideoEvidence() {
  return readVideoEvidenceList(localVideoEvidenceStorageKey);
}

function readManualVideoEvidence() {
  return readVideoEvidenceList(manualVideoEvidenceStorageKey);
}

function readArchivedVideoEvidence() {
  return readVideoEvidenceList(archivedVideoEvidenceStorageKey);
}

function readVideoValidationClips() {
  return readVideoEvidenceList(videoValidationStorageKey);
}

function writeVideoEvidenceList(key, list) {
  localStorage.setItem(key, JSON.stringify(Array.isArray(list) ? list : []));
}

function activeVideoEvidenceStorageKeys() {
  return [localVideoEvidenceStorageKey, videoEvidenceStorageKey, manualVideoEvidenceStorageKey];
}

function findStoredVideoEvidence(id, keys = activeVideoEvidenceStorageKeys()) {
  for (const key of keys) {
    const list = readVideoEvidenceList(key);
    const item = list.find((entry) => entry.id === id);
    if (item) return { key, item, list };
  }
  return null;
}

function removeStoredVideoEvidence(id, keys = activeVideoEvidenceStorageKeys()) {
  const found = findStoredVideoEvidence(id, keys);
  if (!found) return null;
  writeVideoEvidenceList(found.key, found.list.filter((entry) => entry.id !== id));
  return found;
}

function removeVideoEvidenceSideEffects(id) {
  const manualReviewId = `manual-review-${id}`;
  const clipId = `clip-${id}`;
  const manualList = readManualVideoEvidence().filter((entry) => entry.id !== manualReviewId && entry.calibrationOf !== id);
  writeVideoEvidenceList(manualVideoEvidenceStorageKey, manualList);
  const validationList = readVideoValidationClips().filter((entry) => entry.id !== clipId);
  writeVideoEvidenceList(videoValidationStorageKey, validationList);
}

function archiveVideoEvidence(id) {
  const removed = removeStoredVideoEvidence(id);
  if (!removed) return null;
  const archived = readArchivedVideoEvidence().filter((entry) => entry.id !== id);
  const archivedItem = {
    ...removed.item,
    archivedAt: new Date().toISOString(),
    archiveSourceKey: removed.key,
  };
  writeVideoEvidenceList(archivedVideoEvidenceStorageKey, [archivedItem, ...archived]);
  return archivedItem;
}

function restoreArchivedVideoEvidence(id) {
  const removed = removeStoredVideoEvidence(id, [archivedVideoEvidenceStorageKey]);
  if (!removed) return null;
  const { archiveSourceKey, archivedAt, ...item } = removed.item;
  const targetKey = activeVideoEvidenceStorageKeys().includes(archiveSourceKey) ? archiveSourceKey : localVideoEvidenceStorageKey;
  const current = readVideoEvidenceList(targetKey).filter((entry) => entry.id !== id);
  writeVideoEvidenceList(targetKey, [item, ...current]);
  return item;
}

function deleteVideoEvidenceForever(id) {
  const removed = removeStoredVideoEvidence(id, [...activeVideoEvidenceStorageKeys(), archivedVideoEvidenceStorageKey]);
  removeVideoEvidenceSideEffects(id);
  return removed?.item || null;
}

function upsertValidationClipFromEvidence(item, status = 'IA rodada') {
  if (!item) return null;
  const clip = {
    id: `clip-${item.id}`,
    athlete: item.athlete || 'Isa',
    fundamental: item.fundamental || 'Saque',
    exerciseTitle: item.exerciseTitle || '',
    phase: videoEvidencePhase(item),
    marker: item.marker || 'Marcador tecnico',
    status,
    createdAt: new Date().toISOString(),
  };
  const existing = readVideoValidationClips().filter((entry) => entry.id !== clip.id);
  localStorage.setItem(videoValidationStorageKey, JSON.stringify([clip, ...existing]));
  return clip;
}

function phaseOptionsForFundamental(fundamental) {
  const found = videoMotionPhases.find((item) => item.fundamental === fundamental);
  return found ? found.phases.map(([name]) => name) : ['Preparacao', 'Contato', 'Finalizacao'];
}

function defaultPhaseForEvidence(fundamental, marker = '') {
  const normalizedMarker = String(marker || '').toLowerCase();
  const phases = phaseOptionsForFundamental(fundamental);
  if (normalizedMarker.includes('finaliza') || normalizedMarker.includes('aterriss') || normalizedMarker.includes('queda') || normalizedMarker.includes('recuper')) {
    return phases[2] || phases.at(-1) || 'Finalizacao';
  }
  if (normalizedMarker.includes('base') && ['Recepcao', 'Defesa'].includes(fundamental)) {
    return 'Preparacao';
  }
  if (normalizedMarker.includes('armacao')) return 'Preparacao';
  if (normalizedMarker.includes('alcance')) return 'Alcance';
  if (normalizedMarker.includes('contato') || normalizedMarker.includes('plataforma')) return 'Contato';
  return phases[1] || phases[0] || 'Contato';
}

function phaseSelectOptions(selectedFundamental = 'Saque', selectedPhase = '') {
  return phaseOptionsForFundamental(selectedFundamental)
    .map((phase) => `<option value="${safeVideoText(phase)}" ${phase === selectedPhase ? 'selected' : ''}>${safeVideoText(phase)}</option>`)
    .join('');
}

function normalizeImportedVideoEvidence(payload) {
  const evidence = Array.isArray(payload) ? payload : payload?.evidence;
  if (!Array.isArray(evidence)) throw new Error('JSON sem lista de evidencias.');

  return evidence.map((item, index) => {
    const fundamental = String(item.fundamental || payload?.clip?.fundamental || 'Saque');
    const marker = String(item.marker || 'Marcador tecnico');
    return {
      id: String(item.id || `video-evidence-${Date.now()}-${index}`),
      source: String(item.source || payload?.source || 'Manual'),
      fundamental,
      phase: String(item.phase || item.motionPhase || defaultPhaseForEvidence(fundamental, marker)),
      athlete: String(item.athlete || payload?.clip?.athlete || 'Atleta'),
      timeRange: String(item.timeRange || 'tempo nao informado'),
      marker,
      metric: String(item.metric || 'Criterio tecnico'),
      value: String(item.value || 'revisar no video'),
      confidence: Number.isFinite(Number(item.confidence)) ? Number(item.confidence) : 0,
      status: String(item.status || 'Revisar'),
      reportUse: String(item.reportUse || 'Usar como evidencia tecnica revisavel.'),
      nextAction: String(item.nextAction || 'Comparar com a observacao manual antes do proximo treino.'),
      exerciseId: item.exerciseId ? String(item.exerciseId) : '',
      exerciseTitle: item.exerciseTitle ? String(item.exerciseTitle) : '',
      exerciseMetric: item.exerciseMetric ? String(item.exerciseMetric) : '',
      verdict: item.verdict ? String(item.verdict) : '',
      checks: Array.isArray(item.checks) ? item.checks : [],
      metricTargets: Array.isArray(item.metricTargets) ? item.metricTargets : [],
      calibrationOf: item.calibrationOf ? String(item.calibrationOf) : '',
    };
  });
}

function videoEvidenceImportSummary(items) {
  const list = Array.isArray(items) ? items : [];
  const withTargets = list.filter((item) => item.metricTargets?.length).length;
  const withRoutes = list.filter((item) => item.metricTargets?.some((target) => target.recommendedSource?.name)).length;
  const aiItems = list.filter((item) => /mediapipe|sports2d|ia/i.test(String(item.source || ''))).length;
  const needsReview = list.filter((item) => ['Revisar', 'IA sugerida'].includes(String(item.status || ''))).length;
  return `${list.length} evidencias importadas, ${withTargets} com alvo tecnico, ${withRoutes} com fonte IA roteada, ${aiItems} de IA/pose e ${needsReview} para revisar antes do relatorio.`;
}

function asSports2dNumber(value, fallback = 0) {
  const numeric = Number(String(value ?? '').replace(',', '.'));
  return Number.isFinite(numeric) ? numeric : fallback;
}

function roundVideoConfidence(value) {
  return Math.round(Math.max(0, Math.min(1, value)) * 100) / 100;
}

function normalizeSports2dKey(value) {
  return String(value || '').toLowerCase().replace(/[^a-z0-9]/g, '');
}

function splitSports2dLine(line) {
  if (line.includes('\t')) return line.split('\t');
  if (line.includes(';')) return line.split(';');
  if (line.includes(',')) return line.split(',');
  return line.trim().split(/\s+/);
}

function parseSports2dTable(text) {
  const lines = String(text || '')
    .replace(/^\uFEFF/, '')
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);
  const endHeaderIndex = lines.findIndex((line) => line.toLowerCase() === 'endheader');
  const headerIndex = endHeaderIndex >= 0
    ? endHeaderIndex + 1
    : lines.findIndex((line) => splitSports2dLine(line).some((part) => normalizeSports2dKey(part) === 'time'));
  if (headerIndex < 0 || !lines[headerIndex]) {
    throw new Error('Nao encontrei cabecalho Sports2D com coluna time.');
  }

  const headers = splitSports2dLine(lines[headerIndex]).map((header) => header.trim());
  const rows = lines.slice(headerIndex + 1).map((line) => {
    const parts = splitSports2dLine(line);
    return headers.reduce((row, header, index) => {
      row[header] = parts[index];
      return row;
    }, {});
  }).filter((row) => Number.isFinite(asSports2dNumber(row.time, NaN)));
  if (!rows.length) throw new Error('O arquivo Sports2D nao trouxe linhas numericas.');
  return rows;
}

function sports2dColumnValue(row, aliases) {
  const found = Object.entries(row).find(([key]) => aliases.includes(normalizeSports2dKey(key)));
  return found ? asSports2dNumber(found[1], NaN) : NaN;
}

function sports2dTimeRange(time) {
  const start = Math.max(0, time - 0.3);
  const end = time + 0.3;
  return `${formatVideoEvidenceTime(start)} - ${formatVideoEvidenceTime(end)}`;
}

function formatVideoEvidenceTime(seconds) {
  const safeSeconds = Math.max(0, asSports2dNumber(seconds, 0));
  const minutes = Math.floor(safeSeconds / 60);
  const rest = safeSeconds - minutes * 60;
  return `${String(minutes).padStart(2, '0')}:${rest.toFixed(2).padStart(5, '0')}`;
}

function createSports2dEvidenceFromRows(rows, { athlete, fundamental, title }) {
  const lowerBody = ['Recepcao', 'Defesa'].includes(fundamental);
  const samples = rows.map((row) => {
    const time = asSports2dNumber(row.time);
    const arm = sports2dColumnValue(row, ['rightarm', 'rarm', 'armr', 'rightupperarm', 'upperarmr']);
    const elbow = sports2dColumnValue(row, ['rightelbow', 'relbow', 'elbowr', 'rightelbowangle']);
    const knee = sports2dColumnValue(row, ['rightknee', 'rknee', 'kneer', 'rightkneeangle', 'leftknee', 'lknee', 'kneel', 'leftkneeangle']);
    const armScore = (Number.isFinite(arm) ? arm : 0) + (Number.isFinite(elbow) ? elbow / 4 : 0);
    const lowerScore = (180 - (Number.isFinite(knee) ? knee : 180));
    return { row, time, arm, elbow, knee, score: lowerBody ? lowerScore : armScore };
  }).sort((a, b) => b.score - a.score);
  const best = samples[0];
  if (!best) throw new Error('Nao foi possivel escolher um frame Sports2D.');

  if (lowerBody) {
    if (!Number.isFinite(best.knee)) throw new Error('Nao encontrei coluna de joelho para recepcao/defesa.');
    const lowBase = best.knee < 155 ? 'sim' : 'revisar';
    const phase = defaultPhaseForEvidence(fundamental, fundamental === 'Recepcao' ? 'Base de recepcao' : 'Base defensiva');
    const metricTargets = videoMetricTargetsFor(fundamental, phase);
    const target = metricTargets[0];
    return {
      id: `sports2d-${fundamental.toLowerCase()}-base-${Date.now()}`,
      source: 'Sports2D',
      fundamental,
      phase,
      athlete,
      timeRange: sports2dTimeRange(best.time),
      marker: fundamental === 'Recepcao' ? 'Base de recepcao' : 'Base defensiva',
      metric: target?.metric || 'Flexao de joelho Sports2D',
      value: `${lowBase}, joelho ${Math.round(best.knee)} graus`,
      confidence: roundVideoConfidence(best.knee < 155 ? 0.78 : 0.58),
      status: 'Revisar',
      reportUse: target?.manualCheck || 'Conferir no frame se a base baixa aconteceu no momento correto do fundamento.',
      nextAction: target?.nextAction || 'Filmar novo clip com camera parada e comparar o angulo do joelho no mesmo marcador.',
      metricTargets,
      raw: { title, ...best.row },
    };
  }

  if (!Number.isFinite(best.arm) && !Number.isFinite(best.elbow)) {
    throw new Error('Nao encontrei colunas de braco/cotovelo para saque, ataque ou bloqueio.');
  }
  const highArm = Number.isFinite(best.arm) ? best.arm >= 65 : true;
  const extendedElbow = Number.isFinite(best.elbow) ? best.elbow >= 135 : true;
  const armText = Number.isFinite(best.arm) ? `braco ${Math.round(best.arm)} graus` : 'braco sem coluna';
  const elbowText = Number.isFinite(best.elbow) ? `cotovelo ${Math.round(best.elbow)} graus` : 'cotovelo sem coluna';
  const phase = defaultPhaseForEvidence(fundamental, fundamental === 'Bloqueio' ? 'Alcance do bloqueio' : fundamental === 'Ataque' ? 'Armacao do ataque' : 'Ponto de contato');
  const metricTargets = videoMetricTargetsFor(fundamental, phase);
  const target = metricTargets[0];

  return {
    id: `sports2d-${fundamental.toLowerCase()}-braco-${Date.now()}`,
    source: 'Sports2D',
    fundamental,
    phase,
    athlete,
    timeRange: sports2dTimeRange(best.time),
    marker: fundamental === 'Bloqueio' ? 'Alcance do bloqueio' : fundamental === 'Ataque' ? 'Armacao do ataque' : 'Ponto de contato',
    metric: target?.metric || 'Braco alto e cotovelo estendido Sports2D',
    value: `${highArm && extendedElbow ? 'sim' : 'revisar'}, ${armText}; ${elbowText}`,
    confidence: roundVideoConfidence((highArm ? 0.36 : 0.2) + (extendedElbow ? 0.36 : 0.2) + 0.08),
    status: 'Revisar',
    reportUse: target?.manualCheck || 'Conferir no frame se o braco alto corresponde ao contato, ataque ou alcance do fundamento.',
    nextAction: target?.nextAction || 'Repetir o clip mantendo camera lateral e comparar o mesmo angulo no proximo treino.',
    metricTargets,
    raw: { title, ...best.row },
  };
}

function normalizeSports2dEvidence(text, { athlete = 'Isa', fundamental = 'Saque', title = 'Sports2D importado' } = {}) {
  const rows = parseSports2dTable(text);
  return [createSports2dEvidenceFromRows(rows, { athlete, fundamental, title })];
}

function sports2dRunnerStatusLabel(status) {
  const labels = {
    'needs-videos': 'Faltam videos',
    'needs-video': 'Falta video',
    'needs-sports2d': 'Instalar Sports2D',
    'ready-to-run': 'Pronto para rodar',
    'ran-needs-angles': 'Rodou, falta angulo',
    'blocked-by-app-control': 'Bloqueado pelo Windows',
    'has-angles': 'Pronto para processar',
    ran: 'Rodou',
    failed: 'Falhou',
    checked: 'Checado',
  };
  return labels[status] || status || 'Checar';
}

function summarizeSports2DRunReport(payload) {
  if (payload?.schemaVersion !== 'isa.sports2d-run-report.v1') {
    throw new Error('Cole a saida de npm run video:sports2d:run no contrato isa.sports2d-run-report.v1.');
  }
  const items = Array.isArray(payload.items) ? payload.items : [];
  if (!items.length) throw new Error('Relatorio Sports2D sem clips para revisar.');

  return {
    status: String(payload.status || 'checked'),
    summary: `${items.length} clips, ${payload.missingVideos || 0} sem video, ${payload.hasAngles || 0} com angulos, ${payload.ranNeedsAngles || 0} rodaram sem arquivo final, ${payload.blockedByAppControl || 0} bloqueados pelo ambiente.`,
    sports2d: payload.sports2d?.available
      ? 'Sports2D encontrado no ambiente.'
      : payload.sports2d?.hint || 'Sports2D ainda nao foi encontrado no ambiente.',
    items: items.map((item) => ({
      id: String(item.id || 'clip'),
      label: `${item.fundamental || 'Fundamento'} - ${item.phase || 'Fase'}`,
      status: String(item.status || payload.status || 'checked'),
      metric: String(item.metricTargets?.[0]?.metric || ''),
      manualCheck: String(item.metricTargets?.[0]?.manualCheck || ''),
      sourceVideo: String(item.sourceVideo || ''),
      expectedAngles: String(item.expectedAngles || ''),
      nextAction: String(item.nextAction || payload.nextCommand || 'Revisar proxima etapa.'),
    })),
  };
}

function renderSports2DRunReportSummary(report) {
  const rows = report.items.map((item) => `
    <article class="sports2d-run-report-row">
      <div>
        <h4>${safeVideoText(item.label)}</h4>
        ${item.metric ? `<p><strong>Metrica:</strong> ${safeVideoText(item.metric)}</p>` : ''}
        <p>${safeVideoText(item.nextAction)}</p>
        ${item.manualCheck ? `<p class="muted">${safeVideoText(item.manualCheck)}</p>` : ''}
        <p class="muted">${safeVideoText(item.sourceVideo)} -> ${safeVideoText(item.expectedAngles)}</p>
      </div>
      <span class="badge">${safeVideoText(sports2dRunnerStatusLabel(item.status))}</span>
    </article>
  `).join('');
  return `
    <div class="sports2d-run-report-list">
      <article class="sports2d-run-report-row summary-row">
        <div>
          <h4>${safeVideoText(sports2dRunnerStatusLabel(report.status))}</h4>
          <p>${safeVideoText(report.summary)}</p>
          <p class="muted">${safeVideoText(report.sports2d)}</p>
        </div>
        <span class="badge">Runner</span>
      </article>
      ${rows}
    </div>
  `;
}

function showSports2DRunReport(payload, messageText, result) {
  const report = summarizeSports2DRunReport(payload);
  if (result) {
    result.hidden = false;
    result.innerHTML = renderSports2DRunReportSummary(report);
  }
  if (messageText) {
    messageText.textContent = `Runner Sports2D revisado: ${sports2dRunnerStatusLabel(report.status)}.`;
  }
  return report;
}

function requiresVideoReview(item) {
  const source = String(item.source || '').toLowerCase();
  return Boolean(item.posePreview) || source.includes('mediapipe') || source.includes('sports2d');
}

function updateStoredVideoEvidenceStatus(id, status) {
  const updateList = (key) => {
    const list = readVideoEvidenceList(key);
    let changed = false;
    const updated = list.map((item) => {
      if (item.id !== id) return item;
      changed = true;
      return { ...item, status, reviewedAt: new Date().toISOString() };
    });
    if (changed) localStorage.setItem(key, JSON.stringify(updated));
    return changed;
  };

  return updateList(localVideoEvidenceStorageKey) || updateList(videoEvidenceStorageKey);
}

function createManualCalibrationEvidence(item) {
  return {
    id: `manual-review-${item.id}`,
    source: 'Manual revisao',
    fundamental: item.fundamental,
    phase: item.phase || defaultPhaseForEvidence(item.fundamental, item.marker),
    athlete: item.athlete,
    timeRange: item.timeRange,
    marker: item.marker,
    metric: 'Conferencia manual do marcador',
    value: `${item.metric}: ${item.value}`,
    confidence: 1,
    status: 'Confirmada',
    reportUse: 'Checagem manual criada para calibrar a sugestao da IA antes de levar o criterio ao relatorio.',
    nextAction: 'Comparar o mesmo marcador no proximo clip e ajustar o criterio se a IA divergir da observacao tecnica.',
    metricTargets: item.metricTargets || [],
    calibrationOf: item.id,
    reviewedAt: new Date().toISOString(),
  };
}

function upsertManualCalibrationEvidence(item) {
  const manual = createManualCalibrationEvidence(item);
  const list = readManualVideoEvidence().filter((entry) => entry.calibrationOf !== item.id && entry.id !== manual.id);
  localStorage.setItem(manualVideoEvidenceStorageKey, JSON.stringify([manual, ...list]));
  return manual;
}

function isManualVideoEvidence(item) {
  return String(item.source || '').toLowerCase().includes('manual');
}

function videoEvidenceKeyword(value) {
  const text = String(value || '').toLowerCase();
  if (text.includes('sim')) return 'sim';
  if (text.includes('nao') || text.includes('não')) return 'nao';
  if (text.includes('revisar')) return 'revisar';
  return '';
}

function videoEvidencePhase(item) {
  return item.phase || defaultPhaseForEvidence(item.fundamental, item.marker);
}

function buildCalibrationReadiness(scopeLabel, pairs, aiCount) {
  const checkedPairs = pairs.filter(({ directManual }) => directManual);
  const alignedPairs = checkedPairs.filter(({ alignment }) => alignment === 'Alinhada');
  const rate = checkedPairs.length ? Math.round((alignedPairs.length / checkedPairs.length) * 100) : 0;
  let status = 'Sem dados';
  let next = 'Importar uma evidencia de IA e criar a primeira checagem manual.';
  if (checkedPairs.length > 0) {
    status = 'Em calibracao';
    next = 'Acumular pelo menos 3 checagens manuais nesse mesmo criterio.';
  }
  if (checkedPairs.length >= 3 && rate >= 70) {
    status = 'Promissor';
    next = 'Testar em video real novo antes de liberar recomendacao automatica.';
  }
  if (checkedPairs.length >= 5 && rate >= 80) {
    status = 'Pronto para piloto';
    next = 'Usar em piloto controlado com revisao final do treinador.';
  }
  return {
    label: scopeLabel,
    aiCount,
    checkedCount: checkedPairs.length,
    alignedCount: alignedPairs.length,
    rate,
    status,
    next,
  };
}

function videoEvidenceRecommendedSourceName(item) {
  return item?.metricTargets?.[0]?.recommendedSource?.name || item?.source || 'Fonte sem nome';
}

function buildSourceCalibrationReadiness(pairs) {
  const groups = new Map();
  pairs.forEach((pair) => {
    const source = videoEvidenceRecommendedSourceName(pair.ai);
    groups.set(source, [...(groups.get(source) || []), pair]);
  });
  return [...groups.entries()].map(([source, sourcePairs]) => ({
    source,
    ...buildCalibrationReadiness(source, sourcePairs, sourcePairs.length),
    averageConfidence: sourcePairs.length
      ? Math.round((sourcePairs.reduce((total, pair) => total + Number(pair.ai.confidence || 0), 0) / sourcePairs.length) * 100) / 100
      : 0,
  }));
}

function buildVideoCalibration(evidence) {
  const aiEvidence = evidence.filter(requiresVideoReview);
  const manualEvidence = evidence.filter((item) => isManualVideoEvidence(item) && !requiresVideoReview(item));
  const manualByAiId = new Map();

  manualEvidence.forEach((item) => {
    if (item.calibrationOf) manualByAiId.set(item.calibrationOf, item);
  });

  const pairs = aiEvidence.map((ai) => {
    const directManual = manualByAiId.get(ai.id);
    const relatedManual = directManual || manualEvidence.find((manual) => (
      manual.fundamental === ai.fundamental
      && videoEvidencePhase(manual) === videoEvidencePhase(ai)
      && !manual.calibrationOf
      && String(manual.metric || '').toLowerCase().includes('punho') === String(ai.metric || '').toLowerCase().includes('punho')
    ));
    const aiKeyword = videoEvidenceKeyword(ai.value);
    const manualKeyword = videoEvidenceKeyword(relatedManual?.value);
    let alignment = 'Sem checagem manual';
    if (relatedManual) {
      alignment = directManual || (aiKeyword && manualKeyword && aiKeyword === manualKeyword)
        ? 'Alinhada'
        : 'Comparar no frame';
    }
    return { ai, manual: relatedManual, directManual: Boolean(directManual), alignment };
  });
  const readiness = fundamentals.map(({ name }) => {
    const fundamentalPairs = pairs.filter(({ ai }) => ai.fundamental === name);
    return {
      fundamental: name,
      ...buildCalibrationReadiness(name, fundamentalPairs, fundamentalPairs.length),
    };
  });
  const phaseReadiness = videoMotionPhases.flatMap(({ fundamental, phases }) => (
    phases.map(([phase]) => {
      const phasePairs = pairs.filter(({ ai }) => ai.fundamental === fundamental && videoEvidencePhase(ai) === phase);
      return {
        fundamental,
        phase,
        ...buildCalibrationReadiness(`${fundamental} - ${phase}`, phasePairs, phasePairs.length),
      };
    })
  ));

  return {
    aiEvidence,
    manualEvidence,
    manualByAiId,
    pairs,
    readiness,
    phaseReadiness,
    sourceReadiness: buildSourceCalibrationReadiness(pairs),
    confirmedAi: aiEvidence.filter((item) => item.status === 'Confirmada').length,
    pendingAi: aiEvidence.filter((item) => item.status === 'Revisar').length,
    checkedManual: manualEvidence.filter((item) => item.calibrationOf).length,
  };
}

function buildVideoCalibrationDataset(evidence, calibration, validationClips = []) {
  return {
    schemaVersion: 'isa.video-calibration-dataset.v1',
    generatedAt: new Date().toISOString(),
    summary: {
      evidenceCount: evidence.length,
      aiEvidenceCount: calibration.aiEvidence.length,
      manualEvidenceCount: calibration.manualEvidence.length,
      pairedChecks: calibration.checkedManual,
      validationClipCount: validationClips.length,
    },
    readiness: calibration.readiness.map((item) => ({
      fundamental: item.fundamental,
      aiCount: item.aiCount,
      checkedCount: item.checkedCount,
      alignedCount: item.alignedCount,
      rate: item.rate,
      status: item.status,
    })),
    phaseReadiness: calibration.phaseReadiness.map((item) => ({
      fundamental: item.fundamental,
      phase: item.phase,
      aiCount: item.aiCount,
      checkedCount: item.checkedCount,
      alignedCount: item.alignedCount,
      rate: item.rate,
      status: item.status,
    })),
    sourceReadiness: calibration.sourceReadiness.map((item) => ({
      source: item.source,
      aiCount: item.aiCount,
      checkedCount: item.checkedCount,
      alignedCount: item.alignedCount,
      rate: item.rate,
      averageConfidence: item.averageConfidence,
      status: item.status,
    })),
    validationClips: validationClips.map((clip) => ({
      id: clip.id,
      athlete: clip.athlete,
      fundamental: clip.fundamental,
      phase: clip.phase || defaultPhaseForEvidence(clip.fundamental, clip.marker),
      marker: clip.marker,
      status: clip.status,
      createdAt: clip.createdAt,
    })),
    pairs: calibration.pairs.map(({ ai, manual, directManual, alignment }) => ({
      id: ai.id,
      fundamental: ai.fundamental,
      phase: videoEvidencePhase(ai),
      marker: ai.marker,
      alignment,
      paired: directManual,
      ai: {
        source: ai.source,
        athlete: ai.athlete,
        timeRange: ai.timeRange,
        metric: ai.metric,
        value: ai.value,
        confidence: ai.confidence,
        status: ai.status,
        recommendedSource: ai.metricTargets?.[0]?.recommendedSource || null,
        raw: ai.raw || undefined,
      },
      manual: manual ? {
        id: manual.id,
        source: manual.source,
        athlete: manual.athlete,
        timeRange: manual.timeRange,
        metric: manual.metric,
        value: manual.value,
        calibrationOf: manual.calibrationOf || '',
        reviewedAt: manual.reviewedAt || '',
      } : null,
    })),
  };
}

function slugVideoText(value) {
  return String(value || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '') || 'clip';
}

function videoMetricTargetsFor(fundamental, phase = '') {
  const exact = videoMovementMetricMap.filter((item) => item.fundamental === fundamental && item.phase === phase);
  const fallback = videoMovementMetricMap.filter((item) => item.fundamental === fundamental);
  return (exact.length ? exact : fallback).map((item) => ({
    fundamental: item.fundamental,
    phase: item.phase,
    signal: item.signal,
    metric: item.metric,
    joints: item.joints.split(',').map((joint) => joint.trim()).filter(Boolean),
    sources: item.sources.split(';').map((source) => source.trim()).filter(Boolean),
    manualCheck: item.manualCheck,
    nextAction: item.nextAction,
    recommendedSource: videoRecommendedSourceFor(item),
  }));
}

function videoSourceKey(value) {
  const text = String(value || '').toLowerCase();
  if (text.includes('sports2d')) return 'sports2d';
  if (text.includes('mediapipe')) return 'mediapipe';
  if (text.includes('vert tracker')) return 'vert-tracker';
  return '';
}

function videoRecommendedSourceFor(item, candidateName = 'Sports2D') {
  const sourceText = String(item.sources || '');
  const candidateKey = videoSourceKey(candidateName);
  const candidate = videoAiSourceRouteCatalog[candidateKey];
  if (candidate && sourceText.toLowerCase().includes(candidateKey)) return candidate;
  const fallbackKey = ['mediapipe', 'sports2d', 'vert-tracker'].find((key) => sourceText.toLowerCase().includes(key));
  return videoAiSourceRouteCatalog[fallbackKey] || {
    name: 'Fonte nao definida',
    integrationMode: 'missing-source',
    license: '',
    status: 'missing-source',
    cloneDecision: 'review',
    nextAction: 'Adicionar fonte compativel antes de rodar este marcador.',
  };
}

function buildVideoClipManifest(validationClips = [], candidateName = 'Sports2D') {
  const candidate = videoAiProjectCandidates.find((item) => item.name === candidateName) || videoAiProjectCandidates[0];
  const clips = validationClips.length ? validationClips : [{
    id: 'clip-saque-contato-001',
    athlete: 'Isa',
    fundamental: 'Saque',
    phase: 'Contato',
    marker: 'Contato alto no saque',
    status: 'Gravado',
    createdAt: new Date().toISOString(),
  }];

  const manifestClips = clips.map((clip) => {
    const phase = clip.phase || defaultPhaseForEvidence(clip.fundamental, clip.marker);
    const slug = slugVideoText(`${clip.athlete}-${clip.fundamental}-${phase}-${clip.id}`);
    return {
      id: clip.id,
      athlete: clip.athlete,
      fundamental: clip.fundamental,
      phase,
      marker: clip.marker,
      status: clip.status,
      sourceVideo: `videos/${slug}.mp4`,
      sports2dAngles: `exports/sports2d/${slug}.mot`,
      normalizedEvidence: `exports/evidence/${slug}.json`,
      metricTargets: videoMetricTargetsFor(clip.fundamental, phase),
      manualReview: {
        required: true,
        expectedCalibrationOf: '',
        note: 'Preencher calibrationOf depois que a evidencia de IA existir.',
      },
    };
  });
  const preflight = buildClipManifestPreflight(manifestClips);

  return {
    schemaVersion: 'isa.video-clip-manifest.v1',
    generatedAt: new Date().toISOString(),
    candidate: {
      name: candidate.name,
      license: candidate.license,
      priority: candidate.priority,
    },
    captureProtocol: {
      maxDurationSeconds: 12,
      camera: 'Camera parada, corpo inteiro visivel, um fundamento por clip.',
      reviewRule: 'Cada clip precisa de revisao manual antes de alimentar recomendacao automatica.',
    },
    preflight,
    status: preflight.every((item) => item.passed) ? 'Manifesto pronto para coleta' : 'Manifesto incompleto',
    clips: manifestClips,
    commands: [
      'npm run video:sports2d:worklist',
      'npm run video:sports2d:run',
      'npm run video:sports2d -- caminho/para/angles.mot',
      'npm run video:clips:process',
      'npm run video:evidence',
      'npm run video:calibration',
      'npm run video:pilot:evaluate',
    ],
  };
}

function buildClipManifestPreflight(clips) {
  return [
    {
      id: 'source-video-paths',
      label: 'Caminhos de video bruto',
      current: clips.filter((clip) => Boolean(clip.sourceVideo)).length,
      target: clips.length,
      passed: clips.every((clip) => Boolean(clip.sourceVideo)),
    },
    {
      id: 'sports2d-angle-paths',
      label: 'Caminhos de angulos Sports2D',
      current: clips.filter((clip) => Boolean(clip.sports2dAngles)).length,
      target: clips.length,
      passed: clips.every((clip) => Boolean(clip.sports2dAngles)),
    },
    {
      id: 'normalized-evidence-paths',
      label: 'Caminhos de evidencia normalizada',
      current: clips.filter((clip) => Boolean(clip.normalizedEvidence)).length,
      target: clips.length,
      passed: clips.every((clip) => Boolean(clip.normalizedEvidence)),
    },
    {
      id: 'metric-targets',
      label: 'Metricas tecnicas planejadas',
      current: clips.filter((clip) => clip.metricTargets?.length).length,
      target: clips.length,
      passed: clips.every((clip) => clip.metricTargets?.length),
    },
    {
      id: 'source-routes',
      label: 'Fonte IA escolhida por metrica',
      current: clips.filter((clip) => clip.metricTargets?.every((target) => target.recommendedSource?.name && target.recommendedSource.status !== 'missing-source')).length,
      target: clips.length,
      passed: clips.every((clip) => clip.metricTargets?.every((target) => target.recommendedSource?.name && target.recommendedSource.status !== 'missing-source')),
    },
    {
      id: 'manual-review-required',
      label: 'Revisao manual obrigatoria',
      current: clips.filter((clip) => clip.manualReview?.required).length,
      target: clips.length,
      passed: clips.every((clip) => clip.manualReview?.required),
    },
  ];
}

function buildClipPipelinePreview(manifest) {
  const clips = manifest.clips || [];
  return [
    {
      id: 'collect-video',
      label: 'Video bruto',
      detail: `${clips.length} caminho${clips.length === 1 ? '' : 's'} planejado${clips.length === 1 ? '' : 's'}`,
      status: 'Coletar arquivo',
    },
    {
      id: 'run-sports2d',
      label: 'Angulos Sports2D',
      detail: 'npm run video:sports2d:run diagnostica; use -- --execute quando o video real existir.',
      status: 'Runner',
    },
    {
      id: 'metric-target',
      label: 'Alvo tecnico',
      detail: 'Cada clip leva metricas, articulacoes e checagem manual do mapa de movimento.',
      status: 'Criterio',
    },
    {
      id: 'normalize-evidence',
      label: 'Evidencia normalizada',
      detail: 'npm run video:clips:process converte angulos em JSON revisavel.',
      status: 'Comando local',
    },
    {
      id: 'manual-review',
      label: 'Revisao do treinador',
      detail: 'Parear a sugestao da IA com checagem manual antes do relatorio.',
      status: 'Obrigatorio',
    },
  ];
}

function sports2dAnglePlanFor(fundamental, phase = '') {
  const key = `${fundamental} ${phase}`.toLowerCase();
  if (key.includes('recepcao') || key.includes('defesa') || key.includes('aterrissagem') || key.includes('base')) {
    return {
      focus: 'base baixa, quadril e joelho',
      angles: ['joelho direito', 'joelho esquerdo', 'quadril direito', 'quadril esquerdo'],
      status: 'base',
    };
  }
  if (key.includes('bloqueio')) {
    return {
      focus: 'alcance alto e extensao dos bracos',
      angles: ['ombro direito', 'ombro esquerdo', 'cotovelo direito', 'cotovelo esquerdo'],
      status: 'alcance',
    };
  }
  return {
    focus: 'braco alto, ombro e cotovelo no contato',
    angles: ['ombro direito', 'ombro esquerdo', 'cotovelo direito', 'cotovelo esquerdo'],
    status: 'contato',
  };
}

function buildSports2DWorklistPreview(manifest) {
  return (manifest.clips || []).map((clip) => {
    const plan = sports2dAnglePlanFor(clip.fundamental, clip.phase);
    return {
      id: clip.id,
      label: `${clip.fundamental} - ${clip.phase}`,
      focus: plan.focus,
      angles: plan.angles.join(', '),
      metric: clip.metricTargets?.[0]?.metric || 'Metrica tecnica nao definida',
      manualCheck: clip.metricTargets?.[0]?.manualCheck || 'Parear com checagem manual antes do relatorio.',
      output: clip.sports2dAngles,
      status: plan.status,
    };
  });
}

function buildPilotGates(target, acceptanceCriteria) {
  const safeTarget = target || {};
  return [
    {
      id: 'reviewed-clips',
      label: 'Clips reais revisados',
      current: safeTarget.reviewedClips || 0,
      target: acceptanceCriteria.minimumReviewedClips,
      passed: (safeTarget.reviewedClips || 0) >= acceptanceCriteria.minimumReviewedClips,
    },
    {
      id: 'paired-checks',
      label: 'Checagens manuais pareadas',
      current: safeTarget.pairedChecks || 0,
      target: acceptanceCriteria.minimumPairedChecks,
      passed: (safeTarget.pairedChecks || 0) >= acceptanceCriteria.minimumPairedChecks,
    },
    {
      id: 'alignment-rate',
      label: 'Alinhamento IA x manual',
      current: safeTarget.alignmentRate || 0,
      target: acceptanceCriteria.minimumAlignmentRate,
      unit: '%',
      passed: (safeTarget.alignmentRate || 0) >= acceptanceCriteria.minimumAlignmentRate,
    },
    {
      id: 'human-review',
      label: 'Revisao final do treinador',
      current: acceptanceCriteria.finalHumanReview ? 1 : 0,
      target: 1,
      passed: Boolean(acceptanceCriteria.finalHumanReview),
    },
  ];
}

function buildVideoPilotPackage(calibration, validationClips = [], candidateName = 'Sports2D') {
  const candidate = videoAiProjectCandidates.find((item) => item.name === candidateName) || videoAiProjectCandidates[0];
  const acceptanceCriteria = {
    minimumReviewedClips: 3,
    minimumPairedChecks: 5,
    minimumAlignmentRate: 80,
    finalHumanReview: true,
  };
  const phaseTargets = videoMotionPhases.flatMap((group) => group.phases.map(([phase, detail]) => {
    const clips = validationClips.filter((clip) => clip.fundamental === group.fundamental && (clip.phase || defaultPhaseForEvidence(clip.fundamental, clip.marker)) === phase);
    const readiness = calibration.phaseReadiness.find((item) => item.fundamental === group.fundamental && item.phase === phase);
    const reviewedClips = clips.filter((clip) => clip.status === 'Revisado com treinador').length;
    const aiRuns = clips.filter((clip) => clip.status === 'IA rodada').length;
    const pairedChecks = readiness?.checkedCount || 0;
    const alignmentRate = readiness?.rate || 0;
    const readyForPilot = reviewedClips >= acceptanceCriteria.minimumReviewedClips
      && pairedChecks >= acceptanceCriteria.minimumPairedChecks
      && alignmentRate >= acceptanceCriteria.minimumAlignmentRate;
    const status = readyForPilot
      ? 'Pronto para piloto'
      : clips.length || pairedChecks
        ? 'Preparar piloto'
        : 'Sem clips reais';

    return {
      fundamental: group.fundamental,
      phase,
      detail,
      signal: group.signal,
      metricTargets: videoMetricTargetsFor(group.fundamental, phase),
      clips: clips.length,
      reviewedClips,
      aiRuns,
      pairedChecks,
      alignmentRate,
      status,
      nextAction: readyForPilot
        ? 'Rodar piloto controlado e manter revisao final do treinador.'
        : 'Coletar clips reais, rodar IA e parear checagens manuais antes de automatizar.',
    };
  }));
  const recommendedFirstTest = [...phaseTargets].sort((a, b) => {
    const scoreA = (a.clips * 3) + (a.reviewedClips * 4) + (a.pairedChecks * 5) + (a.fundamental === 'Saque' && a.phase === 'Contato' ? 2 : 0);
    const scoreB = (b.clips * 3) + (b.reviewedClips * 4) + (b.pairedChecks * 5) + (b.fundamental === 'Saque' && b.phase === 'Contato' ? 2 : 0);
    return scoreB - scoreA;
  })[0];
  const gates = buildPilotGates(recommendedFirstTest, acceptanceCriteria);
  const sourceAcceptance = calibration.sourceReadiness.map((item) => {
    const passed = item.checkedCount >= acceptanceCriteria.minimumPairedChecks
      && item.rate >= acceptanceCriteria.minimumAlignmentRate
      && item.averageConfidence >= 0.7;
    return {
      source: item.source,
      aiCount: item.aiCount,
      pairedChecks: item.checkedCount,
      alignedChecks: item.alignedCount,
      alignmentRate: item.rate,
      averageConfidence: item.averageConfidence,
      status: passed ? 'Pronto para piloto controlado' : item.checkedCount ? 'Em calibracao' : 'Sem pares manuais',
      nextAction: passed
        ? 'Rodar piloto controlado com revisao final.'
        : 'Adicionar pares IA x manual dessa fonte antes de automatizar.',
    };
  });
  const gapPlan = sourceAcceptance.map((source) => {
    const sourcePairs = calibration.pairs.filter(({ ai }) => videoEvidenceRecommendedSourceName(ai) === source.source);
    const phaseCounts = new Map();
    sourcePairs.forEach(({ ai }) => {
      const key = `${ai.fundamental}|||${videoEvidencePhase(ai)}`;
      phaseCounts.set(key, (phaseCounts.get(key) || 0) + 1);
    });
    const [phaseKey] = [...phaseCounts.entries()].sort((a, b) => b[1] - a[1])[0] || [];
    const [fundamental, phase] = phaseKey ? phaseKey.split('|||') : [recommendedFirstTest?.fundamental || 'Saque', recommendedFirstTest?.phase || 'Contato'];
    const metricTarget = videoMetricTargetsFor(fundamental, phase)[0];
    const missingPairs = Math.max(0, acceptanceCriteria.minimumPairedChecks - source.pairedChecks);
    const startIndex = source.pairedChecks + 1;
    return {
      source: source.source,
      missingPairs,
      targetFundamental: fundamental,
      targetPhase: phase,
      plannedPairs: Array.from({ length: missingPairs }, (_, index) => {
        const pairNumber = startIndex + index;
        const slug = slugVideoText(`isa-${fundamental}-${phase}-${source.source}-pair-${pairNumber}`);
        return {
          id: `gap-${slug}`,
          source: source.source,
          athlete: 'Isa',
          fundamental,
          phase,
          marker: metricTarget?.signal || `${fundamental} - ${phase}`,
          metric: metricTarget?.metric || 'Metrica tecnica',
          sourceVideo: `videos/${slug}.mp4`,
          expectedAngles: source.source === 'Sports2D' ? `exports/sports2d/${slug}.mot` : '',
          normalizedEvidence: `exports/evidence/${slug}.json`,
          manualCheck: metricTarget?.manualCheck || 'Parear com checagem manual antes do relatorio.',
          status: 'Planejado',
        };
      }),
    };
  });

  return {
    schemaVersion: 'isa.video-ai-pilot-package.v1',
    generatedAt: new Date().toISOString(),
    candidate: {
      name: candidate.name,
      url: candidate.url,
      license: candidate.license,
      priority: candidate.priority,
    },
    objective: 'Validar se a analise externa de movimento gera evidencia tecnica confiavel para o volei.',
    acceptanceCriteria,
    gates,
    status: gates.every((gate) => gate.passed) ? 'Pronto para piloto' : 'Preparar piloto',
    recommendedFirstTest,
    sourceAcceptance,
    gapPlan,
    phaseTargets,
    validationClips: validationClips.map((clip) => ({
      id: clip.id,
      athlete: clip.athlete,
      fundamental: clip.fundamental,
      phase: clip.phase || defaultPhaseForEvidence(clip.fundamental, clip.marker),
      marker: clip.marker,
      status: clip.status,
      createdAt: clip.createdAt,
    })),
    commands: [
      'npm run video:candidates',
      'npm run video:sports2d',
      'npm run video:calibration',
      'npm run video:calibration:plan',
      'npm run video:calibration:manifest',
      'npm run video:calibration:worklist',
      'npm run video:calibration:run -- --execute',
      'npm run video:calibration:process -- --write',
    ],
    reviewRule: 'IA sugere evidencia. O treinador valida criterio, fase do movimento e contexto antes do relatorio.',
  };
}

function downloadJsonFile(filename, json) {
  const blob = new Blob([`${json.trim()}\n`], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 0);
}

function useVideoEvidenceInReport(item) {
  if (requiresVideoReview(item) && item.status !== 'Confirmada') {
    window.__isaLastVideoAnalysisMessage = 'Revise a análise antes de enviar para o relatório.';
    renderAiVideosPage();
    return;
  }

  reportFundamental = item.fundamental;
  reportExercise = `Vídeo - ${item.marker}`;
  reportNote = `${item.fundamental} - ${item.marker} (${item.timeRange}).`;
  reportEvidence = `${item.metric}: ${item.value}.`;
  reportCorrection = item.reportUse;
  reportNext = item.nextAction;
  localStorage.setItem('isa.reportNote', reportNote);
  localStorage.setItem('isa.reportCorrection', reportCorrection);
  localStorage.setItem('isa.reportFundamental', reportFundamental);
  localStorage.setItem('isa.reportExercise', reportExercise);
  localStorage.setItem('isa.reportEvidence', reportEvidence);
  localStorage.setItem('isa.reportNext', reportNext);
  setPage('relatorios');
}

function posePreviewFromLandmarks(landmarks, focusIndexes = [], frameImage = '') {
  const indexes = [11, 12, 13, 14, 15, 16, 23, 24, 25, 26, 27, 28];
  const points = indexes
    .map((index) => {
      const point = landmarks[index];
      if (!point) return null;
      return {
        index,
        x: Math.round(Math.max(0, Math.min(1, point.x)) * 1000) / 1000,
        y: Math.round(Math.max(0, Math.min(1, point.y)) * 1000) / 1000,
        focus: focusIndexes.includes(index),
      };
    })
    .filter(Boolean);

  return {
    width: 100,
    height: 100,
    frameImage,
    points,
    connections: [
      [11, 12], [11, 13], [13, 15], [12, 14], [14, 16],
      [11, 23], [12, 24], [23, 24], [23, 25], [25, 27], [24, 26], [26, 28],
    ],
  };
}

function renderPosePreview(item, source) {
  const preview = item.posePreview;
  if (!preview?.points?.length) return '<div class="pose-preview empty-preview"><span>Sem prévia</span></div>';

  const pointsByIndex = new Map(preview.points.map((point) => [point.index, point]));
  const frameImage = preview.frameImage ? `<img class="pose-frame-image" src="${safeVideoText(preview.frameImage)}" alt="" aria-hidden="true" />` : '';
  const lines = (preview.connections || [])
    .map(([from, to]) => {
      const a = pointsByIndex.get(from);
      const b = pointsByIndex.get(to);
      if (!a || !b) return '';
      return `<line x1="${a.x * 100}" y1="${a.y * 100}" x2="${b.x * 100}" y2="${b.y * 100}" />`;
    })
    .join('');
  const circles = preview.points
    .map((point) => `<circle class="${point.focus ? 'pose-focus' : ''}" cx="${point.x * 100}" cy="${point.y * 100}" r="${point.focus ? 4.2 : 2.8}" />`)
    .join('');

  return `
    <div class="pose-preview pose-preview-svg" aria-label="Preview simplificado da pose analisada">
      ${frameImage}
      <svg viewBox="0 0 100 100" role="img" aria-hidden="true">
        <rect x="0" y="0" width="100" height="100" rx="8" />
        ${lines}
        ${circles}
      </svg>
      <span>Momento analisado</span>
    </div>
  `;
}

function renderVideoCalibrationPanel(calibration) {
  const readinessRows = calibration.readiness
    .filter((item) => item.aiCount || item.checkedCount)
    .map((item) => `
      <article class="readiness-row">
        <div>
          <span class="tag">${safeVideoText(item.fundamental)}</span>
          <h4>${safeVideoText(item.status)}</h4>
          <p>${item.checkedCount} checagens, ${item.alignedCount} alinhadas, ${item.rate}% de acordo.</p>
          <p class="muted">${safeVideoText(item.next)}</p>
        </div>
        <span class="badge">${item.aiCount} IA</span>
      </article>
    `).join('');
  const phaseReadinessRows = calibration.phaseReadiness
    .filter((item) => item.aiCount || item.checkedCount)
    .map((item) => `
      <article class="readiness-row phase-readiness-row">
        <div>
          <span class="tag">${safeVideoText(item.fundamental)}</span>
          <h4>${safeVideoText(item.phase)} · ${safeVideoText(item.status)}</h4>
          <p>${item.checkedCount} checagens, ${item.alignedCount} alinhadas, ${item.rate}% de acordo.</p>
          <p class="muted">${safeVideoText(item.next)}</p>
        </div>
        <span class="badge">${item.aiCount} IA</span>
      </article>
    `).join('');
  const rows = calibration.pairs.length
    ? calibration.pairs.map(({ ai, manual, alignment }) => `
      <article class="calibration-row">
        <div>
          <span class="tag">${safeVideoText(ai.fundamental)} · ${safeVideoText(videoEvidencePhase(ai))}</span>
          <h4>${safeVideoText(ai.marker)}</h4>
          <p>IA: ${safeVideoText(ai.metric)} - ${safeVideoText(ai.value)}</p>
          <p class="muted">${manual ? `Manual: ${safeVideoText(manual.value)}` : 'Ainda sem marcacao manual para comparar esse marcador.'}</p>
        </div>
        <span class="badge">${safeVideoText(alignment)}</span>
      </article>
    `).join('')
    : '<article class="note-box"><p>Nenhuma evidencia de IA para calibrar ainda.</p></article>';

  return `
    <section class="panel">
      <div class="panel-header">
        <div><h3>Calibracao IA x manual</h3><p class="panel-subtitle">Compare a leitura automatica com a observacao tecnica antes de confiar no criterio.</p></div>
      </div>
      <div class="panel-body stack">
        <div class="calibration-scoreboard">
          <article><span>${calibration.aiEvidence.length}</span><p>sugestoes de IA</p></article>
          <article><span>${calibration.confirmedAi}</span><p>IA confirmada</p></article>
          <article><span>${calibration.pendingAi}</span><p>aguardando revisao</p></article>
          <article><span>${calibration.checkedManual}</span><p>checagens manuais</p></article>
        </div>
        <div class="readiness-list">
          ${readinessRows || '<article class="note-box"><p>Nenhum fundamento tem comparacao suficiente para medir prontidao.</p></article>'}
        </div>
        <div>
          <h4 class="section-kicker">Prontidao por fase</h4>
          <div class="readiness-list phase-readiness-list">
            ${phaseReadinessRows || '<article class="note-box"><p>Nenhuma fase tem evidencia de IA ou checagem pareada ainda.</p></article>'}
          </div>
        </div>
        <div class="calibration-list">${rows}</div>
        <div class="dataset-export-box">
          <div>
            <h4>Dataset de calibracao</h4>
            <p class="muted">Gera JSON local para testar ou adaptar pipelines externos com os pares IA x manual.</p>
          </div>
          <div class="video-button-row dataset-actions">
            <button class="btn-ghost" id="prepare-calibration-dataset">Preparar dataset</button>
            <button class="btn-ghost" id="download-calibration-dataset" disabled>Baixar JSON</button>
          </div>
          <textarea id="calibration-dataset-json" hidden readonly></textarea>
          <article class="note-box" id="calibration-dataset-message" hidden><p></p></article>
        </div>
      </div>
    </section>
  `;
}

function buildVideoValidationPlan(clips, calibration) {
  return fundamentals.map(({ name }) => {
    const records = clips.filter((clip) => clip.fundamental === name);
    const reviewed = records.filter((clip) => clip.status === 'Revisado com treinador');
    const aiRuns = records.filter((clip) => clip.status === 'IA rodada');
    const readiness = calibration.readiness.find((item) => item.fundamental === name);
    const pairedChecks = readiness?.checkedCount || 0;
    const targetClips = 3;
    const missingReviewed = Math.max(0, targetClips - reviewed.length);
    let status = 'Sem clips reais';
    let next = 'Gravar 3 clips curtos do mesmo fundamento antes de comparar IA.';

    if (records.length > 0) {
      status = 'Coletando clips';
      next = missingReviewed
        ? `Revisar mais ${missingReviewed} clips com o treinador.`
        : 'Rodar MediaPipe ou Sports2D nesses clips e parear as checagens.';
    }
    if (aiRuns.length > 0 && missingReviewed > 0) {
      status = 'IA aguardando revisao';
      next = `Criar checagem manual pareada para ${aiRuns.length} ${aiRuns.length === 1 ? 'clip analisado' : 'clips analisados'} antes de confiar no criterio.`;
    }
    if (reviewed.length >= targetClips) {
      status = 'Pronto para rodar IA';
      next = 'Gerar evidencia automatica e registrar checagem manual pareada.';
    }
    if (pairedChecks >= 3) {
      status = 'Comparacao promissora';
      next = 'Testar em novos clips antes de usar como recomendacao automatica.';
    }
    if (pairedChecks >= 5 && (readiness?.rate || 0) >= 80) {
      status = 'Pronto para piloto';
      next = 'Usar em piloto controlado com revisao final do treinador.';
    }

    return {
      fundamental: name,
      records,
      recordedCount: records.length,
      reviewedCount: reviewed.length,
      aiRunCount: aiRuns.length,
      pairedChecks,
      progress: Math.min(100, Math.round((reviewed.length / targetClips) * 100)),
      status,
      next,
    };
  });
}

function renderVideoValidationPanel(clips, calibration) {
  const plan = buildVideoValidationPlan(clips, calibration);
  const activeRows = plan
    .filter((item) => item.recordedCount || item.pairedChecks)
    .map((item) => `
      <article class="validation-row">
        <div>
          <span class="tag">${safeVideoText(item.fundamental)}</span>
          <h4>${safeVideoText(item.status)}</h4>
          <p>${item.reviewedCount}/3 clips revisados, ${item.aiRunCount} com IA rodada, ${item.pairedChecks} checagens pareadas.</p>
          <div class="validation-progress"><span style="width:${item.progress}%"></span></div>
          <p class="muted">${safeVideoText(item.next)}</p>
        </div>
        <span class="badge">${item.recordedCount} ${item.recordedCount === 1 ? 'clip' : 'clips'}</span>
      </article>
    `).join('');
  const recentRows = clips.slice(0, 5).map((clip) => `
    <div class="action-item">
      <p><strong style="color:white">${safeVideoText(clip.fundamental)} - ${safeVideoText(clip.marker)}</strong><br>${safeVideoText(clip.athlete)} · ${safeVideoText(clip.phase || defaultPhaseForEvidence(clip.fundamental, clip.marker))} · ${safeVideoText(clip.status)}</p>
      <span class="tag">${safeVideoText(clip.createdAt)}</span>
    </div>
  `).join('');

  return `
    <section class="panel">
      <div class="panel-header">
        <div><h3>Plano de validacao real</h3><p class="panel-subtitle">Controle quantos clips reais ainda faltam antes de confiar na IA por fundamento.</p></div>
        <span class="pill active">${clips.length} clips</span>
      </div>
      <div class="panel-body stack">
        <div class="validation-grid">
          ${activeRows || '<article class="note-box"><p>Nenhum clip real registrado. Comece com 3 clips curtos do mesmo fundamento, camera parada e um atleta principal.</p></article>'}
        </div>
        <div class="form-grid compact-form-grid">
          <div class="validation-form">
            <label><span class="metric-label">Fundamento</span><select id="validation-fundamental">${fundamentals.map((item) => `<option value="${item.name}">${item.name}</option>`).join('')}</select></label>
            <label><span class="metric-label">Fase do movimento</span><select id="validation-phase">${phaseSelectOptions('Saque', 'Contato')}</select></label>
            <label><span class="metric-label">Marcador do clip</span><input id="validation-marker" placeholder="Ex.: ponto de contato, plataforma, aterrissagem" /></label>
            <label><span class="metric-label">Status</span><select id="validation-status">
              <option>Gravado</option>
              <option>IA rodada</option>
              <option>Revisado com treinador</option>
            </select></label>
            <div class="video-button-row"><button class="btn-primary" id="add-validation-clip">Registrar clip</button><button class="btn-ghost" id="clear-validation-clips">Limpar plano</button></div>
          </div>
          <div class="validation-log">
            ${recentRows || '<article class="note-box"><p>Os ultimos clips registrados aparecem aqui para revisar a coleta.</p></article>'}
          </div>
        </div>
      </div>
    </section>
  `;
}

function renderVideoClipManifestPanel(validationClips) {
  const manifest = buildVideoClipManifest(validationClips);
  const readyClips = manifest.clips.filter((clip) => ['Gravado', 'IA rodada', 'Revisado com treinador'].includes(clip.status)).length;
  const worklistPreview = buildSports2DWorklistPreview(manifest);
  const worklistRows = worklistPreview.slice(0, 3).map((item) => `
    <article class="sports2d-worklist-row">
      <div>
        <h4>${safeVideoText(item.label)}</h4>
        <p>${safeVideoText(item.focus)}</p>
        <p><strong>Metrica:</strong> ${safeVideoText(item.metric)}</p>
        <p class="muted">${safeVideoText(item.angles)}</p>
        <p class="muted">${safeVideoText(item.manualCheck)}</p>
        <p class="muted">${safeVideoText(item.output)}</p>
      </div>
      <span class="badge">${safeVideoText(item.status)}</span>
    </article>
  `).join('');
  const pipelineRows = buildClipPipelinePreview(manifest).map((item) => `
    <article class="clip-pipeline-row">
      <div>
        <h4>${safeVideoText(item.label)}</h4>
        <p>${safeVideoText(item.detail)}</p>
      </div>
      <span class="badge">${safeVideoText(item.status)}</span>
    </article>
  `).join('');
  const preflightRows = manifest.preflight.map((item) => `
    <article class="manifest-preflight-row ${item.passed ? 'preflight-pass' : 'preflight-wait'}">
      <div>
        <h4>${safeVideoText(item.label)}</h4>
        <p>${safeVideoText(item.current)} de ${safeVideoText(item.target)} clips</p>
      </div>
      <span class="badge">${item.passed ? 'OK' : 'Falta'}</span>
    </article>
  `).join('');
  return `
    <section class="panel">
      <div class="panel-header">
        <div><h3>Manifesto de clips reais</h3><p class="panel-subtitle">Organiza os videos que serao usados no piloto Sports2D/MediaPipe.</p></div>
        <span class="pill active">${manifest.clips.length} clips</span>
      </div>
      <div class="panel-body stack">
        <div class="clip-manifest-summary">
          <article><span>${readyClips}</span><p>clips no manifesto</p></article>
          <article><span>${manifest.captureProtocol.maxDurationSeconds}s</span><p>duracao alvo</p></article>
          <article><span>${safeVideoText(manifest.candidate.name)}</span><p>base do piloto</p></article>
        </div>
        <div class="clip-manifest-list">
          ${manifest.clips.slice(0, 3).map((clip) => `
            <article class="clip-manifest-row">
              <div>
                <h4>${safeVideoText(clip.fundamental)} - ${safeVideoText(clip.phase)}</h4>
                <p>${safeVideoText(clip.athlete)} · ${safeVideoText(clip.marker)}</p>
                <p class="muted">Fonte IA: ${safeVideoText(clip.metricTargets?.[0]?.recommendedSource?.name || 'definir rota')}</p>
                <p class="muted">${safeVideoText(clip.sourceVideo)} -> ${safeVideoText(clip.sports2dAngles)}</p>
              </div>
              <span class="badge">${safeVideoText(clip.status)}</span>
            </article>
          `).join('')}
        </div>
        <div>
          <h4 class="section-kicker">Preflight do manifesto</h4>
          <div class="manifest-preflight-list">${preflightRows}</div>
        </div>
        <div class="clip-pipeline-box">
          <div>
            <h4>Pipeline local de evidencia</h4>
            <p class="muted">Depois que o .mot/.csv existir, o comando processa o manifesto inteiro e cria evidencias revisaveis.</p>
          </div>
          <code>npm run video:sports2d:worklist</code>
          <code>npm run video:sports2d:run</code>
          <code>npm run video:clips:process</code>
          <div class="sports2d-worklist-list">${worklistRows}</div>
          <div class="clip-pipeline-list">${pipelineRows}</div>
        </div>
        <div class="dataset-export-box">
          <div>
            <h4>Exportar manifesto</h4>
            <p class="muted">Gera JSON com caminhos esperados para video bruto, angulos Sports2D, evidencia normalizada e revisao manual.</p>
          </div>
          <div class="video-button-row dataset-actions">
            <button class="btn-ghost" id="prepare-clip-manifest">Preparar manifesto</button>
            <button class="btn-ghost" id="download-clip-manifest" disabled>Baixar manifesto</button>
          </div>
          <textarea id="clip-manifest-json" hidden readonly></textarea>
          <article class="note-box" id="clip-manifest-message" hidden><p></p></article>
        </div>
      </div>
    </section>
  `;
}

function renderVideoPilotPackagePanel(calibration, validationClips) {
  const pilotPackage = buildVideoPilotPackage(calibration, validationClips);
  const target = pilotPackage.recommendedFirstTest;
  const sourceRows = pilotPackage.sourceAcceptance.length
    ? pilotPackage.sourceAcceptance.map((item) => `
      <article class="pilot-gate-row ${item.status === 'Pronto para piloto controlado' ? 'gate-pass' : 'gate-wait'}">
        <div>
          <h4>${safeVideoText(item.source)}</h4>
          <p>${safeVideoText(item.pairedChecks)} pares, ${safeVideoText(item.alignmentRate)}% alinhamento, confianca ${safeVideoText(item.averageConfidence)}</p>
        </div>
        <span class="badge">${safeVideoText(item.status)}</span>
      </article>
    `).join('')
    : '<article class="note-box"><p>Nenhuma fonte tem pares IA x manual suficientes para avaliar aceite.</p></article>';
  const gapRows = pilotPackage.gapPlan
    .flatMap((source) => source.plannedPairs.slice(0, 5))
    .map((item) => `
      <article class="pilot-gate-row gate-wait">
        <div>
          <h4>${safeVideoText(item.fundamental)} - ${safeVideoText(item.phase)}</h4>
          <p>${safeVideoText(item.source)} · ${safeVideoText(item.metric)}</p>
          <p class="muted">${safeVideoText(item.sourceVideo)}${item.expectedAngles ? ` -> ${safeVideoText(item.expectedAngles)}` : ''}</p>
        </div>
        <span class="badge">${safeVideoText(item.status)}</span>
      </article>
    `).join('');
  const gateRows = pilotPackage.gates.map((gate) => `
    <article class="pilot-gate-row ${gate.passed ? 'gate-pass' : 'gate-wait'}">
      <div>
        <h4>${safeVideoText(gate.label)}</h4>
        <p>${safeVideoText(gate.current)}${safeVideoText(gate.unit || '')} de ${safeVideoText(gate.target)}${safeVideoText(gate.unit || '')}</p>
      </div>
      <span class="badge">${gate.passed ? 'OK' : 'Falta'}</span>
    </article>
  `).join('');
  return `
    <section class="panel">
      <div class="panel-header">
        <div><h3>Pacote piloto de IA</h3><p class="panel-subtitle">Prepara um experimento controlado antes de clonar ou adaptar mais codigo externo.</p></div>
        <span class="pill active">${safeVideoText(pilotPackage.candidate.name)}</span>
      </div>
      <div class="panel-body stack">
        <div class="pilot-package-grid">
          <article>
            <span>${safeVideoText(pilotPackage.candidate.priority)}</span>
            <p>Base escolhida</p>
            <strong>${safeVideoText(pilotPackage.candidate.name)}</strong>
          </article>
          <article>
            <span>${target?.reviewedClips || 0}/${pilotPackage.acceptanceCriteria.minimumReviewedClips}</span>
            <p>clips revisados</p>
            <strong>${safeVideoText(target?.fundamental || 'Saque')} - ${safeVideoText(target?.phase || 'Contato')}</strong>
          </article>
          <article>
            <span>${target?.pairedChecks || 0}/${pilotPackage.acceptanceCriteria.minimumPairedChecks}</span>
            <p>checagens pareadas</p>
            <strong>${safeVideoText(target?.status || 'Preparar piloto')}</strong>
          </article>
          <article>
            <span>${target?.alignmentRate || 0}%</span>
            <p>alinhamento manual</p>
            <strong>meta ${pilotPackage.acceptanceCriteria.minimumAlignmentRate}%</strong>
          </article>
        </div>
        <article class="note-box">
          <p><strong style="color:white">Proximo teste recomendado</strong></p>
          <p>${safeVideoText(target?.fundamental || 'Saque')} - ${safeVideoText(target?.phase || 'Contato')}: ${safeVideoText(target?.nextAction || 'Coletar clips reais antes de automatizar.')}</p>
        </article>
        <div>
          <h4 class="section-kicker">Gates do piloto</h4>
          <div class="pilot-gate-list">${gateRows}</div>
        </div>
        <div>
          <h4 class="section-kicker">Aceite por fonte IA</h4>
          <div class="pilot-gate-list">${sourceRows}</div>
        </div>
        <div>
          <h4 class="section-kicker">Proximos pares para coletar</h4>
          <div class="pilot-gate-list">${gapRows || '<article class="note-box"><p>Nenhum par pendente para a fonte avaliada.</p></article>'}</div>
        </div>
        <article class="note-box">
          <p>Transforme estes pares em execucao com <strong style="color:white">npm run video:calibration:worklist</strong>, rode com <strong style="color:white">npm run video:calibration:run -- --execute</strong> e normalize com <strong style="color:white">npm run video:calibration:process -- --write</strong>.</p>
        </article>
        <div class="dataset-export-box">
          <div>
            <h4>Exportar pacote piloto</h4>
            <p class="muted">Gera JSON com candidato, criterios de aceite, fases, clips e comandos para rodar a comparacao.</p>
          </div>
          <div class="video-button-row dataset-actions">
            <button class="btn-ghost" id="prepare-pilot-package">Preparar pacote</button>
            <button class="btn-ghost" id="download-pilot-package" disabled>Baixar pacote</button>
          </div>
          <textarea id="pilot-package-json" hidden readonly></textarea>
          <article class="note-box" id="pilot-package-message" hidden><p></p></article>
        </div>
      </div>
    </section>
  `;
}

function renderVideoMotionPhasePanel() {
  const rows = videoMotionPhases.map((item) => `
    <article class="motion-phase-card">
      <div class="motion-phase-head">
        <span class="tag">${safeVideoText(item.fundamental)}</span>
        <p>${safeVideoText(item.signal)}</p>
      </div>
      <div class="motion-phase-steps">
        ${item.phases.map(([title, detail], index) => `
          <div class="motion-phase-step">
            <span>${index + 1}</span>
            <div><h4>${safeVideoText(title)}</h4><p>${safeVideoText(detail)}</p></div>
          </div>
        `).join('')}
      </div>
      <p class="muted">${safeVideoText(item.sourceHint)}</p>
    </article>
  `).join('');

  return `
    <section class="panel">
      <div class="panel-header">
        <div><h3>Fases do movimento</h3><p class="panel-subtitle">Traduz os modelos de esporte para momentos que fazem sentido no volei.</p></div>
        <span class="pill active">${videoMotionPhases.length} fundamentos</span>
      </div>
      <div class="panel-body motion-phase-grid">${rows}</div>
    </section>
  `;
}

function renderVideoMovementMetricMap() {
  const rows = videoMovementMetricMap.map((item) => {
    const route = videoRecommendedSourceFor(item);
    return `
      <article class="movement-metric-card">
        <div class="movement-metric-head">
          <div>
            <h4>${safeVideoText(item.fundamental)} - ${safeVideoText(item.phase)}</h4>
            <p>${safeVideoText(item.signal)}</p>
          </div>
          <span class="tag">${safeVideoText(item.metric)}</span>
        </div>
        <div class="movement-metric-body">
          <p><strong>Articulacoes:</strong> ${safeVideoText(item.joints)}</p>
          <p><strong>Fonte escolhida:</strong> ${safeVideoText(route.name)} · ${safeVideoText(route.integrationMode)}</p>
          <p><strong>Alternativas:</strong> ${safeVideoText(item.sources)}</p>
          <p><strong>Checagem manual:</strong> ${safeVideoText(item.manualCheck)}</p>
          <p class="muted">Proxima acao: ${safeVideoText(item.nextAction)}</p>
        </div>
      </article>
    `;
  }).join('');

  return `
    <section class="panel">
      <div class="panel-header">
        <div><h3>Mapa de metricas de movimento</h3><p class="panel-subtitle">Liga fundamento, fase, articulacoes e fonte antes de automatizar correcao.</p></div>
        <span class="pill active">${videoMovementMetricMap.length} metricas</span>
      </div>
      <div class="panel-body movement-metric-grid">${rows}</div>
    </section>
  `;
}

function renderVideoAiProjectMatrix() {
  const rows = videoAiProjectCandidates.map((project) => `
    <article class="ai-project-card">
      <div class="ai-project-card-head">
        <div>
          <h4>${safeVideoText(project.name)}</h4>
          <p>${safeVideoText(project.url)}</p>
        </div>
        <span class="badge">${safeVideoText(project.priority)}</span>
      </div>
      <div class="video-evidence-meta">
        <span>${safeVideoText(project.license)}</span>
        <span>${safeVideoText(project.scope)}</span>
      </div>
      <p><strong>Uso no volei:</strong> ${safeVideoText(project.volleyballUse)}</p>
      <p class="muted">Proximo teste: ${safeVideoText(project.nextTest)}</p>
      <p class="muted">Cuidado: ${safeVideoText(project.caution)}</p>
    </article>
  `).join('');

  return `
    <section class="panel">
      <div class="panel-header">
        <div><h3>Matriz de adaptacao open source</h3><p class="panel-subtitle">Escolhe o que vira piloto agora e o que fica como referencia tecnica.</p></div>
        <span class="pill active">${videoAiProjectCandidates.length} bases</span>
      </div>
      <div class="panel-body ai-project-grid">${rows}</div>
    </section>
  `;
}

function videoEvidenceCard(item, calibration = null, options = {}) {
  const id = safeVideoText(item.id);
  const rawStatus = String(item.status || 'Revisar');
  const source = safePublicVideoText(item.source);
  const fundamental = safePublicVideoText(displayLabel(item.fundamental));
  const status = safePublicVideoText(rawStatus);
  const marker = safePublicVideoText(item.marker);
  const phase = safePublicVideoText(item.phase || defaultPhaseForEvidence(item.fundamental, item.marker));
  const metric = safePublicVideoText(item.metric);
  const value = safePublicVideoText(item.value);
  const athlete = safePublicVideoText(item.athlete);
  const timeRange = safeVideoText(item.timeRange);
  const reportUse = safePublicVideoText(item.reportUse);
  const nextAction = safePublicVideoText(item.nextAction);
  const exerciseTitle = safePublicVideoText(item.exerciseTitle || '');
  const exerciseMetric = safePublicVideoText(item.exerciseMetric || '');
  const verdict = safePublicVideoText(item.verdict || '');
  const checks = Array.isArray(item.checks) ? item.checks : [];
  const isArchived = Boolean(options.archived);
  const showLifecycleActions = Boolean(options.manageActions);
  const deleteIsPending = options.pendingDeleteId === item.id;
  const metricTarget = item.metricTargets?.[0];
  const metricTargetBlock = metricTarget ? `
    <div class="video-metric-target-note">
      <p><strong>Critério analisado:</strong> ${safePublicVideoText(metricTarget.signal || metricTarget.metric)}</p>
      <p>${safePublicVideoText(metricTarget.manualCheck || 'Revise o momento antes de usar no relatório.')}</p>
    </div>
  ` : '';
  const needsReview = requiresVideoReview(item);
  const canUseInReport = !needsReview || rawStatus === 'Confirmada';
  const hasManualCalibration = Boolean(calibration?.manualByAiId?.has(item.id));
  const reviewActions = needsReview ? `
    <div class="video-review-actions" aria-label="Revisão do resultado">
      <button class="btn-ghost" data-video-evidence-review="${id}" data-review-status="Confirmada" ${rawStatus === 'Confirmada' ? 'disabled' : ''}>Confirmar</button>
      <button class="btn-ghost danger-action" data-video-evidence-review="${id}" data-review-status="Descartada" ${rawStatus === 'Descartada' ? 'disabled' : ''}>Descartar</button>
      <button class="btn-ghost" data-video-evidence-calibrate="${id}" ${hasManualCalibration ? 'disabled' : ''}>${hasManualCalibration ? 'Revisão salva' : 'Revisar momento'}</button>
    </div>
  ` : '';
  const lifecycleActions = showLifecycleActions ? `
    <div class="video-lifecycle-actions" aria-label="${isArchived ? 'Acoes do resultado arquivado' : 'Organizacao do resultado'}">
      ${isArchived
        ? `<button class="btn-ghost" data-video-evidence-restore="${id}">Restaurar</button>`
        : `<button class="btn-ghost" data-video-evidence-archive="${id}">Arquivar</button>`}
      <button class="btn-ghost danger-action${deleteIsPending ? ' confirm-delete-action' : ''}" data-video-evidence-delete="${id}">${deleteIsPending ? 'Confirmar exclusão' : 'Excluir para sempre'}</button>
    </div>
  ` : '';
  return `
    <article class="video-evidence-card${isArchived ? ' archived-video-evidence-card' : ''}">
      ${renderPosePreview(item, source)}
      <div class="video-evidence-details">
        <div class="exercise-card-top"><span class="tag">${fundamental}</span><span class="badge">${isArchived ? 'Arquivado' : status}</span></div>
        <h4>${marker}</h4>
        ${exerciseTitle ? `<p class="video-exercise-ref"><strong>Exercício:</strong> ${exerciseTitle}</p>` : ''}
        ${verdict ? `<div class="video-verdict ${verdict.includes('Revisar') ? 'needs-review' : 'ok'}"><strong>Ponto de atenção</strong><span>${verdict}</span></div>` : ''}
        <p class="video-next-action"><strong>Próximo treino:</strong> ${nextAction}</p>
        <details class="video-result-details">
          <summary>Ver observação</summary>
          <p><strong>O que observar:</strong> ${metric}: ${value}</p>
          ${exerciseMetric ? `<p><strong>Critério do exercício:</strong> ${exerciseMetric}</p>` : ''}
          ${metricTargetBlock}
          ${checks.length ? `<div class="video-check-list">${checks.map((check) => `<span><strong>${safePublicVideoText(check.label)}:</strong> ${safePublicVideoText(check.value)}</span>`).join('')}</div>` : ''}
          <div class="video-evidence-meta"><span>${athlete}</span><span>${timeRange}</span><span>${phase}</span></div>
          <p>${reportUse}</p>
        </details>
        ${isArchived ? '' : reviewActions}
        ${isArchived ? '' : `<button class="btn-ghost" data-video-evidence-id="${id}" ${canUseInReport ? '' : 'disabled'}>${canUseInReport ? 'Levar para relatório' : 'Revise antes do relatório'}</button>`}
        ${lifecycleActions}
      </div>
    </article>
  `;
}

async function getPoseLandmarker() {
  if (!window.__isaPoseLandmarkerPromise) {
    window.__isaPoseLandmarkerPromise = (async () => {
    const vision = await import('https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.35/+esm');
    const fileset = await vision.FilesetResolver.forVisionTasks('https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.35/wasm');
      return vision.PoseLandmarker.createFromOptions(fileset, {
      baseOptions: {
        modelAssetPath: 'https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_lite/float16/latest/pose_landmarker_lite.task',
        delegate: 'GPU',
      },
      runningMode: 'VIDEO',
      numPoses: 1,
    });
    })();
  }
  return window.__isaPoseLandmarkerPromise;
}

async function verifyMediaPipePose(status, button) {
  button.disabled = true;
  status.textContent = 'Preparando análise de movimento...';
  try {
    await getPoseLandmarker();
    status.textContent = 'Análise pronta. Próximo passo: validar com um vídeo real do atleta.';
  } catch (error) {
    status.textContent = 'Não foi possível preparar a análise agora. Tente novamente mais tarde.';
  } finally {
    button.disabled = false;
  }
}

function waitForVideoEvent(video, eventName) {
  return new Promise((resolve, reject) => {
    const cleanup = () => {
      video.removeEventListener(eventName, onEvent);
      video.removeEventListener('error', onError);
    };
    const onEvent = () => {
      cleanup();
      resolve();
    };
    const onError = () => {
      cleanup();
      reject(new Error('Nao foi possivel ler o video selecionado.'));
    };
    video.addEventListener(eventName, onEvent, { once: true });
    video.addEventListener('error', onError, { once: true });
  });
}

function formatVideoTime(seconds) {
  const minutes = Math.floor(seconds / 60).toString().padStart(2, '0');
  const rest = Math.floor(seconds % 60).toString().padStart(2, '0');
  return `${minutes}:${rest}`;
}

function pointVisibility(point) {
  return Number.isFinite(point?.visibility) ? point.visibility : 0.65;
}

function landmarkAngle(a, b, c) {
  if (!a || !b || !c) return null;
  const ab = { x: a.x - b.x, y: a.y - b.y };
  const cb = { x: c.x - b.x, y: c.y - b.y };
  const denominator = Math.hypot(ab.x, ab.y) * Math.hypot(cb.x, cb.y);
  if (!denominator) return null;
  const cosine = Math.max(-1, Math.min(1, ((ab.x * cb.x) + (ab.y * cb.y)) / denominator));
  return Math.round((Math.acos(cosine) * 180) / Math.PI);
}

function captureVideoFrame(video) {
  const sourceWidth = video.videoWidth || 320;
  const sourceHeight = video.videoHeight || 180;
  const maxWidth = 260;
  const scale = Math.min(1, maxWidth / sourceWidth);
  const canvas = document.createElement('canvas');
  canvas.width = Math.max(1, Math.round(sourceWidth * scale));
  canvas.height = Math.max(1, Math.round(sourceHeight * scale));
  const context = canvas.getContext('2d');
  if (!context) return '';
  context.drawImage(video, 0, 0, canvas.width, canvas.height);
  return canvas.toDataURL('image/jpeg', 0.62);
}

function armCandidate(landmarks, side) {
  const shoulder = landmarks[side === 'direito' ? 12 : 11];
  const elbow = landmarks[side === 'direito' ? 14 : 13];
  const wrist = landmarks[side === 'direito' ? 16 : 15];
  if (!shoulder || !elbow || !wrist) return null;
  const margin = shoulder.y - wrist.y;
  const confidence = Math.min(pointVisibility(shoulder), pointVisibility(elbow), pointVisibility(wrist));
  return {
    side,
    margin,
    elbowAngle: landmarkAngle(shoulder, elbow, wrist),
    confidence,
    score: margin + (confidence * 0.2),
  };
}

function kneeCandidate(landmarks, side) {
  const hip = landmarks[side === 'direito' ? 24 : 23];
  const knee = landmarks[side === 'direito' ? 26 : 25];
  const ankle = landmarks[side === 'direito' ? 28 : 27];
  if (!hip || !knee || !ankle) return null;
  const kneeAngle = landmarkAngle(hip, knee, ankle);
  const confidence = Math.min(pointVisibility(hip), pointVisibility(knee), pointVisibility(ankle));
  return {
    side,
    kneeAngle,
    confidence,
    score: (180 - (kneeAngle || 180)) + (confidence * 20),
  };
}

function exerciseEvidenceFields(exercise, phase, verdict, detectedRatio) {
  if (!exercise) return {};
  return {
    exerciseId: exercise.id || '',
    exerciseTitle: exercise.title || '',
    exerciseMetric: exercise.metric || '',
    exerciseObjective: exercise.objective || '',
    exerciseSetup: exercise.setup || '',
    verdict,
    checks: [
      { label: 'Exercicio', value: exercise.title || 'Exercicio selecionado' },
      { label: 'Criterio do treino', value: exercise.metric || 'Criterio tecnico do fundamento' },
      { label: 'Momento do movimento', value: phase },
      { label: 'Movimento detectado', value: `${Math.round(detectedRatio * 100)}% dos frames revisados` },
    ],
  };
}

function createEvidenceFromPoseSamples(samples, athlete, fundamental, durationSeconds, exercise = null) {
  const validSamples = samples.filter((sample) => sample.landmarks?.length);
  if (!validSamples.length) {
    throw new Error('Não foi possível ler o movimento nesse clipe. Tente câmera parada, corpo inteiro e boa luz.');
  }

  const armSamples = validSamples.map((sample) => {
    const candidates = [armCandidate(sample.landmarks, 'direito'), armCandidate(sample.landmarks, 'esquerdo')].filter(Boolean);
    return { ...sample, arm: candidates.sort((a, b) => b.score - a.score)[0] };
  }).filter((sample) => sample.arm);
  const lowerSamples = validSamples.map((sample) => {
    const candidates = [kneeCandidate(sample.landmarks, 'direito'), kneeCandidate(sample.landmarks, 'esquerdo')].filter(Boolean);
    return { ...sample, knee: candidates.sort((a, b) => b.score - a.score)[0] };
  }).filter((sample) => sample.knee);

  const isLowerBodyFundamental = ['Recepcao', 'Defesa'].includes(fundamental);
  const best = isLowerBodyFundamental
    ? lowerSamples.sort((a, b) => b.knee.score - a.knee.score)[0]
    : armSamples.sort((a, b) => b.arm.score - a.arm.score)[0];
  if (!best) throw new Error('O clipe nao trouxe landmarks suficientes para esse fundamento.');

  const detectedRatio = validSamples.length / samples.length;
  if (isLowerBodyFundamental) {
    const angle = best.knee.kneeAngle || 0;
    const flexion = angle < 155 ? 'sim' : 'revisar';
    const lowerFocus = best.knee.side === 'direito' ? [24, 26, 28] : [23, 25, 27];
    const phase = defaultPhaseForEvidence(fundamental, fundamental === 'Recepcao' ? 'Base de recepcao' : 'Base defensiva');
    const metricTargets = videoMetricTargetsFor(fundamental, phase);
    const target = metricTargets[0];
    const verdict = angle < 155
      ? 'Dentro do criterio inicial: base baixa detectada no frame-chave.'
      : 'Revisar tecnica: a base parece alta ou pouco flexionada no frame-chave.';
    return [{
      id: `mediapipe-${fundamental.toLowerCase()}-${Date.now()}`,
      source: 'MediaPipe local',
      fundamental,
      phase,
      athlete,
      timeRange: `${formatVideoTime(Math.max(0, best.time - 0.4))} - ${formatVideoTime(Math.min(durationSeconds, best.time + 0.4))}`,
      marker: fundamental === 'Recepcao' ? 'Base de recepcao' : 'Base defensiva',
      metric: target?.metric || 'Flexao de joelho no momento mais baixo',
      value: `${flexion}, angulo estimado ${angle} graus no lado ${best.knee.side}`,
      confidence: Math.max(0.2, Math.min(0.95, (best.knee.confidence * 0.7) + (detectedRatio * 0.3))),
      status: 'Revisar',
      reportUse: target?.manualCheck || 'Confirmar no frame se a base estava baixa e estavel antes de registrar correcao.',
      nextAction: target?.nextAction || 'Repetir uma serie curta filmando de frente ou lateral e comparar o mesmo criterio.',
      metricTargets,
      ...exerciseEvidenceFields(exercise, phase, verdict, detectedRatio),
      posePreview: posePreviewFromLandmarks(best.landmarks, lowerFocus, best.frameImage || ''),
    }];
  }

  const marginPercent = Math.round(best.arm.margin * 100);
  const wristHigh = best.arm.margin > 0.02 ? 'sim' : 'revisar';
  const markerByFundamental = {
    Saque: 'Ponto de contato',
    Ataque: 'Armacao do ataque',
    Bloqueio: 'Alcance do bloqueio',
  };
  const armFocus = best.arm.side === 'direito' ? [12, 14, 16] : [11, 13, 15];
  const phase = defaultPhaseForEvidence(fundamental, markerByFundamental[fundamental] || 'Linha do braco');
  const metricTargets = videoMetricTargetsFor(fundamental, phase);
  const target = metricTargets[0];
  const elbowOk = !Number.isFinite(best.arm.elbowAngle) || best.arm.elbowAngle >= 120;
  const verdict = wristHigh === 'sim' && elbowOk
    ? 'Dentro do criterio inicial: braco alto no frame-chave.'
    : 'Revisar tecnica: altura do braco ou extensao do cotovelo precisa de confirmacao.';
  return [{
    id: `mediapipe-${fundamental.toLowerCase()}-${Date.now()}`,
    source: 'MediaPipe local',
    fundamental,
    phase,
    athlete,
    timeRange: `${formatVideoTime(Math.max(0, best.time - 0.4))} - ${formatVideoTime(Math.min(durationSeconds, best.time + 0.4))}`,
    marker: markerByFundamental[fundamental] || 'Linha do braco',
    metric: target?.metric || 'Punho acima do ombro',
    value: `${wristHigh}, margem estimada ${marginPercent}% da altura do video; cotovelo ${best.arm.elbowAngle || 'sem angulo'} graus no lado ${best.arm.side}`,
    confidence: Math.max(0.2, Math.min(0.95, (best.arm.confidence * 0.7) + (detectedRatio * 0.3))),
    status: 'Revisar',
    reportUse: target?.manualCheck || 'Confirmar se o contato ou alcance aconteceu alto o suficiente antes de registrar correcao.',
    nextAction: target?.nextAction || 'Repetir 3 series curtas mantendo camera parada e comparar a altura do punho no mesmo marcador.',
    metricTargets,
    ...exerciseEvidenceFields(exercise, phase, verdict, detectedRatio),
    posePreview: posePreviewFromLandmarks(best.landmarks, armFocus, best.frameImage || ''),
  }];
}

async function analyzeTrainingVideo({ file, athlete, fundamental, exercise, onProgress }) {
  const poseLandmarker = await getPoseLandmarker();
  const video = document.createElement('video');
  video.muted = true;
  video.playsInline = true;
  video.preload = 'auto';
  const objectUrl = URL.createObjectURL(file);
  video.src = objectUrl;

  try {
    await waitForVideoEvent(video, 'loadedmetadata');
    if (!Number.isFinite(video.duration) || video.duration <= 0) throw new Error('O video precisa ter duracao valida.');
    const durationSeconds = Math.min(video.duration, 12);
    const sampleCount = Math.min(10, Math.max(4, Math.ceil(durationSeconds)));
    const samples = [];

    for (let index = 0; index < sampleCount; index += 1) {
      const time = sampleCount === 1 ? 0 : (durationSeconds * index) / (sampleCount - 1);
      video.currentTime = Math.min(video.duration, time);
      await waitForVideoEvent(video, 'seeked');
      const result = poseLandmarker.detectForVideo(video, Math.round(time * 1000));
      samples.push({ time, landmarks: result.landmarks?.[0] || null, frameImage: captureVideoFrame(video) });
      onProgress?.((index + 1) / sampleCount);
    }

    return createEvidenceFromPoseSamples(samples, athlete, fundamental, durationSeconds, exercise);
  } finally {
    URL.revokeObjectURL(objectUrl);
  }
}

function loadVideoBlob(url) {
  if (window.fetch) {
    return window.fetch(url).then((response) => {
      if (!response.ok) throw new Error('Nao foi possivel carregar o video de demonstracao.');
      return response.blob();
    });
  }

  return new Promise((resolve, reject) => {
    const request = new XMLHttpRequest();
    request.open('GET', url);
    request.responseType = 'blob';
    request.onload = () => {
      if (request.status >= 200 && request.status < 300) resolve(request.response);
      else reject(new Error('Nao foi possivel carregar o video de demonstracao.'));
    };
    request.onerror = () => reject(new Error('Nao foi possivel carregar o video de demonstracao.'));
    request.send();
  });
}

async function runVideoAnalysis({ file, athlete, fundamental, exercise, status, button }) {
  button.disabled = true;
  status.textContent = 'Preparando analise local do clipe...';
  try {
    const generated = await analyzeTrainingVideo({
      file,
      athlete,
      fundamental,
      exercise,
      onProgress: (progress) => {
        status.textContent = `Analisando movimento no vídeo: ${Math.round(progress * 100)}%.`;
      },
    });
    if (!Array.isArray(generated) || !generated.length) {
      throw new Error('A analise terminou sem gerar evidencia revisavel.');
    }
    const currentLocalEvidence = readLocalVideoEvidence().filter((item) => !generated.some((entry) => entry.id === item.id));
    writeVideoEvidenceList(localVideoEvidenceStorageKey, [...generated, ...currentLocalEvidence]);
    if (!readLocalVideoEvidence().length) {
      throw new Error('A evidencia foi gerada, mas nao foi salva no navegador.');
    }
    const registeredClips = generated.map((item) => upsertValidationClipFromEvidence(item)).filter(Boolean).length;
    window.__isaLastVideoAnalysisMessage = `Análise do exercício "${generated[0].exerciseTitle || exercise?.title || fundamental}" gerada: ${generated[0].verdict || generated[0].marker}. ${registeredClips} clipe ficou salvo para revisão.`;
    renderAiVideosPage();
  } catch (error) {
    status.textContent = error instanceof Error ? error.message : 'Não foi possível analisar o vídeo.';
    button.disabled = false;
  }
}

async function runDemoVideoAnalysis(status, button) {
  button.disabled = true;
  status.textContent = 'Carregando demo Sports2D...';
  try {
    const blob = await loadVideoBlob('/reference/sports2d-demo.mp4');
    const file = new File([blob], 'sports2d-demo.mp4', { type: 'video/mp4' });
    await runVideoAnalysis({
      file,
      athlete: 'Demo Sports2D',
      fundamental: findVideoAnalysisExercise(document.querySelector('#mediapipe-exercise')?.value)?.fundamental || 'Saque',
      exercise: findVideoAnalysisExercise(document.querySelector('#mediapipe-exercise')?.value),
      status,
      button,
    });
  } catch (error) {
    status.textContent = error instanceof Error ? error.message : 'Nao foi possivel carregar o demo Sports2D.';
    button.disabled = false;
  }
}

function setVideoPreviewFromSample(sample, status) {
  const fileDisplay = document.querySelector('#video-file-display');
  const previewVideo = document.querySelector('#video-upload-preview');
  const previewHint = document.querySelector('#video-preview-hint');
  if (window.__isaVideoPreviewUrl) {
    URL.revokeObjectURL(window.__isaVideoPreviewUrl);
    window.__isaVideoPreviewUrl = '';
  }
  if (fileDisplay) fileDisplay.textContent = `Exemplo: ${sample.fileName}`;
  if (previewVideo) {
    previewVideo.src = sample.source;
    previewVideo.hidden = false;
  }
  if (previewHint) previewHint.textContent = `${ptText(sample.title)} carregado para revisar enquadramento antes da análise.`;
  if (status) status.textContent = `Exemplo "${ptText(sample.title)}" pronto. Assista aqui ou use Processar exemplo no card.`;
}

async function runSampleVideoAnalysis(sample, status, button) {
  const exercise = findExerciseForVideoSample(sample);
  if (exercise?.id) {
    selectedVideoExerciseId = exercise.id;
    localStorage.setItem('isa.selectedVideoExerciseId', selectedVideoExerciseId);
    const exerciseSelect = document.querySelector('#mediapipe-exercise');
    if (exerciseSelect) exerciseSelect.value = exercise.id;
  }
  setVideoPreviewFromSample(sample, status);
  button.disabled = true;
  try {
    const blob = await loadVideoBlob(sample.source);
    const file = new File([blob], sample.fileName, { type: blob.type || 'video/webm' });
    await runVideoAnalysis({
      file,
      athlete: 'Atleta exemplo',
      fundamental: exercise?.fundamental || sample.fundamental,
      exercise,
      status,
      button,
    });
  } catch (error) {
    status.textContent = error instanceof Error ? error.message : 'Nao foi possivel carregar o video de exemplo.';
    button.disabled = false;
  }
}

function renderVideosPage() {
  const currentPosition = getSelectedPosition();
  const markers = getPositionVideoMarkers(currentPosition);
  const timeline = [
    ['00:00', 'Preparar', 'Nomeie fundamento, objetivo e critério antes de assistir.'],
    ['00:04', 'Pausar', 'Congele o momento em que aparece contato, base ou deslocamento.'],
    ['00:08', 'Marcar', 'Anote tempo, evidência observada e próxima repetição.'],
  ];
  const activeEvidence = [
    ...readLocalVideoEvidence(),
    ...readImportedVideoEvidence(),
    ...readManualVideoEvidence(),
  ];
  const archivedEvidence = readArchivedVideoEvidence();
  const demoEvidence = {
    id: 'manual-saque-demo',
    source: 'Manual',
    fundamental: 'Saque',
    phase: 'Contato',
    athlete: 'Atleta exemplo',
    timeRange: '00:03 - 00:05',
    marker: 'Braço de contato',
    metric: 'Punho acima da linha do ombro',
    value: 'sim',
    confidence: 0.72,
    status: 'Revisar',
    reportUse: 'Usar como observação inicial e confirmar no momento pausado.',
    nextAction: 'Repetir com lançamento mais estável e registrar acertos.',
  };
  const evidence = [...activeEvidence, demoEvidence];
  const calibration = buildVideoCalibration(evidence);
  const validationClips = readVideoValidationClips();

  renderShell(`
    <div class="content-inner stack">
      <section class="video-evidence-hero">
        <img src="public/assets/video-evidence-station.webp" alt="" aria-hidden="true" />
        <div class="video-evidence-content">
          <p class="eyebrow">Vídeo, fundamento e evidência</p>
          <h2>Assista, marque o momento e transforme em evidência para ${currentPosition?.name || 'sua posição'}.</h2>
          <p>Para treino individual em casa, o vídeo serve como caderno visual: pausar, comparar critério da posição e decidir a próxima repetição.</p>
          <div class="hero-actions">
            <button class="btn-primary" data-page="relatorios">Levar para relatório</button>
            <button class="btn-ghost" data-page="exercicios">Ver exercícios relacionados</button>
          </div>
        </div>
      </section>

      <section class="panel">
        <div class="panel-header">
          <div><h3>Linha do tempo de revisão</h3><p class="panel-subtitle">Um jeito simples de transformar clipe curto em decisão de treino.</p></div>
          <span class="pill active">${timeline.length} passos</span>
        </div>
        <div class="panel-body manual-timeline">
          ${timeline.map(([time, title, detail]) => `
            <article class="timeline-marker">
              <span class="timeline-time">${time}</span>
              <div><h4>${title}</h4><p>${ptText(detail)}</p></div>
            </article>
          `).join('')}
        </div>
      </section>

      <div class="form-grid">
        <section class="panel">
          <div class="panel-header">
            <div><h3>Ficha de evidência manual</h3><p class="panel-subtitle">Campos que deixam o vídeo útil para o relatório.</p></div>
          </div>
          <div class="panel-body stack">
            <div class="video-pipeline-grid">
              ${[
                ['1', 'Tempo', 'Exemplo: 00:03 a 00:05.'],
                ['2', 'Critério', 'O que precisa aparecer para considerar bom?'],
                ['3', 'Próxima ação', 'Qual repetição ou ajuste vem depois?'],
              ].map(([number, title, detail]) => `<article class="video-step-card"><span>${number}</span><div><h4>${title}</h4><p>${detail}</p></div></article>`).join('')}
            </div>
            <article class="note-box"><p><strong style="color:white">Regra da fase atual</strong></p><p>Sem análise automática nesta etapa. O atleta observa o clipe, marca o critério e usa o relatório para evoluir.</p></article>
          </div>
        </section>
        <section class="panel">
          <div class="panel-header"><div><h3>O que marcar</h3><p class="panel-subtitle">Critérios técnicos, não efeitos visuais.</p></div></div>
          <div class="panel-body stack">
            ${markers.map(([name, marker]) => `
              <div class="action-item"><p><strong style="color:white">${displayLabel(name)}</strong><br>${ptText(marker)}</p><span class="tag">marcador</span></div>
            `).join('')}
          </div>
        </section>
      </div>

      <section class="panel">
        <div class="panel-header"><div><h3>Evidências para relatório</h3><p class="panel-subtitle">Cada card mantém fundamento, tempo e próxima ação.</p></div></div>
        <div class="panel-body video-evidence-grid">
          ${evidence.map(videoEvidenceCard).join('')}
        </div>
      </section>

      <div class="form-grid">
        <section class="panel">
          <div class="panel-header"><div><h3>Importar marcações revisadas</h3><p class="panel-subtitle">Opcional para quando uma ficha manual já estiver em JSON.</p></div></div>
          <div class="panel-body stack">
            <textarea id="video-evidence-json" placeholder="Cole aqui uma lista de evidências manuais revisadas."></textarea>
            <div class="video-button-row"><button class="btn-primary" id="import-video-evidence">Importar JSON</button><button class="btn-ghost" id="clear-video-evidence">Limpar evidências locais</button></div>
            <article class="note-box" id="video-import-message" hidden><p></p></article>
          </div>
        </section>
        <section class="panel">
          <div class="panel-header"><div><h3>Como gravar em casa</h3><p class="panel-subtitle">Pouco equipamento, critério bem definido.</p></div></div>
          <div class="panel-body stack">
            <div class="action-item"><p><strong style="color:white">Câmera parada</strong><br>Apoie o celular e grave uma repetição curta por fundamento.</p><span class="tag">base</span></div>
            <div class="action-item"><p><strong style="color:white">Um critério por clipe</strong><br>Escolha contato, plataforma, passada, base ou recuperação.</p><span class="tag">foco</span></div>
            <div class="action-item"><p><strong style="color:white">Revisão rápida</strong><br>Pare no momento-chave e leve só uma evidência para o relatório.</p><span class="tag">relatório</span></div>
          </div>
        </section>
      </div>
        </div>
    </div>
  `);
  document.querySelector('#import-video-evidence')?.addEventListener('click', () => {
    const message = document.querySelector('#video-import-message');
    const messageText = message.querySelector('p');
    try {
      const imported = normalizeImportedVideoEvidence(JSON.parse(document.querySelector('#video-evidence-json').value));
      localStorage.setItem(videoEvidenceStorageKey, JSON.stringify(imported));
      renderVideosPage();
    } catch (error) {
      message.hidden = false;
      messageText.textContent = error instanceof Error ? error.message : 'Não foi possível importar o JSON.';
    }
  });
  document.querySelector('#clear-video-evidence')?.addEventListener('click', () => {
    localStorage.removeItem(videoEvidenceStorageKey);
    renderVideosPage();
  });
  document.querySelectorAll('[data-video-evidence-id]').forEach((button) => {
    button.addEventListener('click', () => {
      const item = evidence.find((entry) => entry.id === button.dataset.videoEvidenceId);
      if (item) useVideoEvidenceInReport(item);
    });
  });
}
function renderAiVideosPage() {
  const currentPosition = getSelectedPosition();
  const analysisExercises = getVideoAnalysisExercises(currentPosition);
  const selectedExercise = findVideoAnalysisExercise(selectedVideoExerciseId, currentPosition);
  if (selectedExercise && selectedVideoExerciseId !== selectedExercise.id) {
    selectedVideoExerciseId = selectedExercise.id;
    localStorage.setItem('isa.selectedVideoExerciseId', selectedVideoExerciseId);
  }
  const exerciseOptions = analysisExercises.map((exercise) => `
    <option value="${safeVideoText(exercise.id)}" ${exercise.id === selectedVideoExerciseId ? 'selected' : ''}>
      ${safePtVideoText(exercise.title)} · ${safePtVideoText(displayLabel(exercise.fundamental))}
    </option>
  `).join('');
  const activeEvidence = [
    ...readLocalVideoEvidence(),
    ...readImportedVideoEvidence(),
    ...readManualVideoEvidence(),
  ];
  const archivedEvidence = readArchivedVideoEvidence();
  const demoEvidence = {
    id: 'manual-saque-demo',
    source: 'Manual',
    fundamental: 'Saque',
    phase: 'Contato',
    athlete: 'Atleta exemplo',
    timeRange: '00:03 - 00:05',
    marker: 'Braço de contato',
    metric: 'Punho acima da linha do ombro',
    value: 'sim',
    confidence: 0.72,
    status: 'Revisar',
    reportUse: 'Usar como observação inicial e confirmar no momento pausado.',
    nextAction: 'Repetir com lançamento mais estável e registrar acertos.',
  };
  const evidence = [...activeEvidence, demoEvidence];
  const calibration = buildVideoCalibration(evidence);
  const visibleEvidence = activeEvidence.length ? activeEvidence : [demoEvidence];
  const evidenceCards = visibleEvidence.map((item) => videoEvidenceCard(item, calibration, {
    manageActions: activeEvidence.includes(item),
    pendingDeleteId: pendingVideoEvidenceDeleteId,
  })).join('');
  const archivedCards = archivedEvidence.map((item) => videoEvidenceCard(item, calibration, {
    archived: true,
    manageActions: true,
    pendingDeleteId: pendingVideoEvidenceDeleteId,
  })).join('');
  const selectedExerciseSummary = selectedExercise ? `
    <article class="video-selected-exercise" id="video-exercise-summary">
      <div>
        <span class="tag">${safePtVideoText(displayLabel(selectedExercise.fundamental))}</span>
        <h3>${safePtVideoText(selectedExercise.title)}</h3>
        <p>${safePtVideoText(selectedExercise.objective)}</p>
      </div>
      <div class="video-exercise-criteria">
        <span><strong>Como executar:</strong> ${safePtVideoText(selectedExercise.setup)}</span>
        <span><strong>Critério:</strong> ${safePtVideoText(selectedExercise.metric)}</span>
        <span><strong>Dose:</strong> ${safePtVideoText(selectedExercise.duration)}</span>
      </div>
    </article>
  ` : '';
  renderShell(`
    <div class="content-inner video-focus-page">
      <section class="panel video-analysis-station">
        <div class="video-station-main">
          <div>
            <p class="eyebrow">Análise de exercício</p>
            <h2>Melhore seu movimento com vídeo</h2>
            <p class="station-subtitle">Envie um clipe curto do treino, revise os pontos de atenção e transforme a análise em uma correção prática.</p>
          </div>
          <form class="video-station-controls" id="video-analysis-form">
            <label class="video-exercise-select"><span class="metric-label">Exercício</span><select id="mediapipe-exercise">${exerciseOptions}</select></label>
            <label class="video-file-drop">
              <span class="metric-label">Vídeo do treino</span>
              <input id="mediapipe-video-file" type="file" accept="video/*" />
              <span class="video-upload-trigger" id="video-file-display">Adicionar vídeo curto</span>
            </label>
            <button class="btn-primary video-primary-action" id="run-mediapipe-analysis" type="submit">Analisar vídeo</button>
          </form>
          ${selectedExerciseSummary}
          <article class="video-upload-preview-box">
            <div>
              <strong>Preview do envio</strong>
              <p id="video-preview-hint">Selecione um vídeo para conferir se o movimento aparece com clareza.</p>
            </div>
            <video id="video-upload-preview" controls playsinline muted hidden></video>
          </article>
          <article class="video-status-box">
            <strong>Status</strong>
            <p id="video-ai-status">${safePtVideoText(window.__isaLastVideoAnalysisMessage || 'Aguardando vídeo curto do treino.')}</p>
          </article>
        </div>
        <aside class="video-station-side">
          <div class="video-score-strip">
            <article><span>${activeEvidence.length}</span><p>resultados</p></article>
            <article><span>${calibration.checkedManual}</span><p>revisados</p></article>
            <article><span>Premium</span><p>análise em vídeo</p></article>
          </div>
          <article class="note-box compact-note">
            <p><strong style="color:white">Como usar melhor</strong></p>
            <p>Grave poucos segundos, revise o ponto principal e leve apenas uma correção para o próximo treino.</p>
          </article>
        </aside>
      </section>

      <div class="video-quick-grid public-video-results">
        <section class="panel compact-video-panel">
          <div class="panel-header">
            <div><h3>Correções do vídeo</h3><p class="panel-subtitle">Veja o ponto de atenção e leve uma ação para o próximo treino.</p></div>
            <span class="pill active">${activeEvidence.length} ativos</span>
          </div>
          <div class="panel-body video-evidence-grid compact-evidence-grid">${evidenceCards}</div>
        </section>
        <details class="panel video-archive-folder">
          <summary>
            <span>Arquivados</span>
            <small>${archivedEvidence.length} resultados guardados</small>
          </summary>
          <div class="panel-body video-evidence-grid compact-evidence-grid">
            ${archivedCards || '<article class="note-box"><p>Nenhum resultado arquivado ainda. Use Arquivar em um resultado ativo para guardar sem apagar.</p></article>'}
          </div>
        </details>
      </div>

      <section class="panel video-next-step-panel">
        <div>
          <h3>Próximo passo</h3>
          <p>${calibration.checkedManual ? 'Escolha uma análise revisada e transforme em meta de treino.' : 'Depois de analisar, revise o resultado antes de levar para o relatório.'}</p>
        </div>
        <div class="video-button-row">
          <button class="btn-primary" data-page="relatorios">Levar para relatório</button>
          <button class="btn-ghost" data-page="exercicios">Exercícios relacionados</button>
        </div>
      </section>

    </div>
  `);
  const status = document.querySelector('#video-ai-status');
  const exerciseSelect = document.querySelector('#mediapipe-exercise');
  exerciseSelect?.addEventListener('change', () => {
    selectedVideoExerciseId = exerciseSelect.value;
    localStorage.setItem('isa.selectedVideoExerciseId', selectedVideoExerciseId);
    renderAiVideosPage();
  });
  const fileInput = document.querySelector('#mediapipe-video-file');
  const fileDisplay = document.querySelector('#video-file-display');
  const previewVideo = document.querySelector('#video-upload-preview');
  const previewHint = document.querySelector('#video-preview-hint');
  fileInput?.addEventListener('change', () => {
    const file = fileInput.files?.[0];
    if (fileDisplay) fileDisplay.textContent = file ? file.name : 'Adicionar vídeo';
    if (window.__isaVideoPreviewUrl) URL.revokeObjectURL(window.__isaVideoPreviewUrl);
    if (!file || !previewVideo) return;
    window.__isaVideoPreviewUrl = URL.createObjectURL(file);
    previewVideo.src = window.__isaVideoPreviewUrl;
    previewVideo.hidden = false;
    if (previewHint) previewHint.textContent = `${file.name} pronto para revisão visual antes da análise.`;
    if (status) status.textContent = 'Vídeo carregado. Confira se o corpo inteiro aparece antes de processar.';
  });
  const processVideoRequest = async (event) => {
    event.preventDefault();
    const file = document.querySelector('#mediapipe-video-file')?.files?.[0];
    const button = document.querySelector('#run-mediapipe-analysis');
    if (!file) {
      if (status) status.textContent = 'Escolha um arquivo de vídeo antes de rodar a análise.';
      return;
    }
    const exercise = findVideoAnalysisExercise(document.querySelector('#mediapipe-exercise')?.value);
    await runVideoAnalysis({
      file,
      athlete: 'Isa',
      fundamental: exercise?.fundamental || 'Saque',
      exercise,
      status,
      button,
    });
  };
  const processButton = document.querySelector('#run-mediapipe-analysis');
  const processForm = document.querySelector('#video-analysis-form');
  window.__isaProcessVideoClick = processVideoRequest;
  if (processButton) processButton.dataset.ready = 'true';
  processForm?.addEventListener('submit', processVideoRequest);
  document.querySelectorAll('[data-video-sample-preview]').forEach((button) => {
    button.addEventListener('click', () => {
      const sample = findVideoSampleClip(button.dataset.videoSamplePreview);
      if (sample) setVideoPreviewFromSample(sample, status);
    });
  });
  document.querySelectorAll('[data-video-sample-run]').forEach((button) => {
    button.addEventListener('click', () => {
      const sample = findVideoSampleClip(button.dataset.videoSampleRun);
      if (sample) runSampleVideoAnalysis(sample, status, button);
    });
  });
  document.querySelector('#verify-mediapipe')?.addEventListener('click', (event) => verifyMediaPipePose(status, event.currentTarget));
  const demoButton = document.querySelector('#run-mediapipe-demo');
  demoButton?.addEventListener('click', () => runDemoVideoAnalysis(status, demoButton));
  if (new URLSearchParams(window.location.search).get('qaDemo') === '1' && demoButton && !window.__isaVideoDemoStarted) {
    window.__isaVideoDemoStarted = true;
    setTimeout(() => runDemoVideoAnalysis(status, demoButton), 0);
  }
  document.querySelector('#import-video-evidence')?.addEventListener('click', () => {
    const message = document.querySelector('#video-import-message');
    const messageText = message.querySelector('p');
    try {
      const imported = normalizeImportedVideoEvidence(JSON.parse(document.querySelector('#video-evidence-json').value));
      localStorage.setItem(videoEvidenceStorageKey, JSON.stringify(imported));
      const registeredClips = imported.map((item) => upsertValidationClipFromEvidence(item)).filter(Boolean).length;
      window.__isaLastVideoAnalysisMessage = `${videoEvidenceImportSummary(imported)} ${registeredClips} clips entraram no plano de validacao.`;
      renderAiVideosPage();
    } catch (error) {
      message.hidden = false;
      messageText.textContent = error instanceof Error ? error.message : 'Nao foi possivel importar o JSON.';
    }
  });
  const saveSports2dEvidence = (items, messageText) => {
    const current = readImportedVideoEvidence().filter((item) => String(item.source || '').toLowerCase() !== 'sports2d');
    localStorage.setItem(videoEvidenceStorageKey, JSON.stringify([...items, ...current]));
    const registeredClips = items.map((item) => upsertValidationClipFromEvidence(item)).filter(Boolean).length;
    window.__isaLastVideoAnalysisMessage = `Evidencia Sports2D criada: ${items[0]?.marker || 'marcador tecnico'}. ${videoEvidenceImportSummary(items)} ${registeredClips} clips entraram no plano de validacao.`;
    renderAiVideosPage();
    if (messageText) messageText.textContent = window.__isaLastVideoAnalysisMessage;
  };
  document.querySelector('#import-sports2d-file')?.addEventListener('click', async () => {
    const message = document.querySelector('#video-import-message');
    const messageText = message.querySelector('p');
    const file = document.querySelector('#sports2d-angle-file')?.files?.[0];
    message.hidden = false;
    if (!file) {
      messageText.textContent = 'Escolha um arquivo .mot ou .csv do Sports2D antes de converter.';
      return;
    }
    try {
      const text = await file.text();
      const imported = normalizeSports2dEvidence(text, {
        athlete: 'Isa',
        fundamental: findVideoAnalysisExercise(document.querySelector('#mediapipe-exercise')?.value)?.fundamental || 'Saque',
        title: file.name,
      });
      saveSports2dEvidence(imported, messageText);
    } catch (error) {
      messageText.textContent = error instanceof Error ? error.message : 'Nao foi possivel converter o arquivo Sports2D.';
    }
  });
  document.querySelector('#import-sports2d-demo')?.addEventListener('click', async () => {
    const message = document.querySelector('#video-import-message');
    const messageText = message.querySelector('p');
    message.hidden = false;
    messageText.textContent = 'Carregando amostra Sports2D...';
    try {
      const response = await window.fetch('/reference/sample-sports2d-saque.mot');
      if (!response.ok) throw new Error('Nao foi possivel carregar a amostra Sports2D.');
      const imported = normalizeSports2dEvidence(await response.text(), {
        athlete: 'Atleta exemplo',
        fundamental: findVideoAnalysisExercise(document.querySelector('#mediapipe-exercise')?.value)?.fundamental || 'Saque',
        title: 'sample-sports2d-saque.mot',
      });
      saveSports2dEvidence(imported, messageText);
    } catch (error) {
      messageText.textContent = error instanceof Error ? error.message : 'Nao foi possivel converter a amostra Sports2D.';
    }
  });
  document.querySelector('#review-sports2d-run-report')?.addEventListener('click', () => {
    const message = document.querySelector('#video-import-message');
    const messageText = message.querySelector('p');
    const result = document.querySelector('#sports2d-run-report-result');
    message.hidden = false;
    try {
      showSports2DRunReport(JSON.parse(document.querySelector('#sports2d-run-report-json').value), messageText, result);
    } catch (error) {
      if (result) {
        result.hidden = true;
        result.innerHTML = '';
      }
      messageText.textContent = error instanceof Error ? error.message : 'Nao foi possivel revisar o relatorio Sports2D.';
    }
  });
  document.querySelector('#load-sports2d-run-demo')?.addEventListener('click', async () => {
    const message = document.querySelector('#video-import-message');
    const messageText = message.querySelector('p');
    const result = document.querySelector('#sports2d-run-report-result');
    const textarea = document.querySelector('#sports2d-run-report-json');
    message.hidden = false;
    messageText.textContent = 'Carregando relatorio demo do runner Sports2D...';
    try {
      const response = await window.fetch('/reference/sample-sports2d-run-report.json');
      if (!response.ok) throw new Error('Nao foi possivel carregar o relatorio demo do runner.');
      const payload = await response.json();
      if (textarea) textarea.value = JSON.stringify(payload, null, 2);
      showSports2DRunReport(payload, messageText, result);
    } catch (error) {
      if (result) {
        result.hidden = true;
        result.innerHTML = '';
      }
      messageText.textContent = error instanceof Error ? error.message : 'Nao foi possivel carregar o runner demo.';
    }
  });
  document.querySelector('#load-sports2d-blocked-demo')?.addEventListener('click', async () => {
    const message = document.querySelector('#video-import-message');
    const messageText = message.querySelector('p');
    const result = document.querySelector('#sports2d-run-report-result');
    const textarea = document.querySelector('#sports2d-run-report-json');
    message.hidden = false;
    messageText.textContent = 'Carregando relatorio de bloqueio Sports2D...';
    try {
      const response = await window.fetch('/reference/sample-sports2d-blocked-run-report.json');
      if (!response.ok) throw new Error('Nao foi possivel carregar o relatorio de bloqueio.');
      const payload = await response.json();
      if (textarea) textarea.value = JSON.stringify(payload, null, 2);
      showSports2DRunReport(payload, messageText, result);
    } catch (error) {
      if (result) {
        result.hidden = true;
        result.innerHTML = '';
      }
      messageText.textContent = error instanceof Error ? error.message : 'Nao foi possivel carregar o bloqueio demo.';
    }
  });
  document.querySelector('#clear-video-evidence')?.addEventListener('click', () => {
    localStorage.removeItem(videoEvidenceStorageKey);
    localStorage.removeItem(localVideoEvidenceStorageKey);
    localStorage.removeItem(manualVideoEvidenceStorageKey);
    renderAiVideosPage();
  });
  let preparedCalibrationDatasetJson = '';
  document.querySelector('#prepare-calibration-dataset')?.addEventListener('click', () => {
    const textarea = document.querySelector('#calibration-dataset-json');
    const message = document.querySelector('#calibration-dataset-message');
    const messageText = message?.querySelector('p');
    const downloadButton = document.querySelector('#download-calibration-dataset');
    const dataset = buildVideoCalibrationDataset(evidence, calibration, validationClips);
    preparedCalibrationDatasetJson = JSON.stringify(dataset, null, 2);
    window.__isaCalibrationDatasetJson = preparedCalibrationDatasetJson;
    if (textarea) {
      textarea.hidden = false;
      textarea.value = preparedCalibrationDatasetJson;
    }
    if (downloadButton) {
      downloadButton.disabled = false;
    }
    if (message && messageText) {
      message.hidden = false;
      messageText.textContent = `Dataset preparado com ${dataset.pairs.length} pares, ${dataset.summary.pairedChecks} checagens pareadas e ${dataset.summary.validationClipCount} clips no plano.`;
    }
  });
  document.querySelector('#download-calibration-dataset')?.addEventListener('click', () => {
    const json = preparedCalibrationDatasetJson || document.querySelector('#calibration-dataset-json')?.value || '';
    if (!json.trim()) return;
    const message = document.querySelector('#calibration-dataset-message');
    const messageText = message?.querySelector('p');
    const date = new Date().toISOString().slice(0, 10);
    downloadJsonFile(`isa-video-calibration-dataset-${date}.json`, json);
    if (message && messageText) {
      message.hidden = false;
      messageText.textContent = 'Download do dataset iniciado. Valide o JSON antes de usar em um pipeline externo.';
    }
  });
  let preparedClipManifestJson = '';
  document.querySelector('#prepare-clip-manifest')?.addEventListener('click', () => {
    const textarea = document.querySelector('#clip-manifest-json');
    const message = document.querySelector('#clip-manifest-message');
    const messageText = message?.querySelector('p');
    const downloadButton = document.querySelector('#download-clip-manifest');
    const manifest = buildVideoClipManifest(validationClips);
    preparedClipManifestJson = JSON.stringify(manifest, null, 2);
    if (textarea) {
      textarea.hidden = false;
      textarea.value = preparedClipManifestJson;
    }
    if (downloadButton) {
      downloadButton.disabled = false;
    }
    if (message && messageText) {
      message.hidden = false;
      messageText.textContent = `Manifesto ${manifest.schemaVersion} preparado com ${manifest.clips.length} clips para ${manifest.candidate.name}.`;
    }
  });
  document.querySelector('#download-clip-manifest')?.addEventListener('click', () => {
    const json = preparedClipManifestJson || document.querySelector('#clip-manifest-json')?.value || '';
    if (!json.trim()) return;
    const message = document.querySelector('#clip-manifest-message');
    const messageText = message?.querySelector('p');
    const date = new Date().toISOString().slice(0, 10);
    downloadJsonFile(`isa-video-clip-manifest-${date}.json`, json);
    if (message && messageText) {
      message.hidden = false;
      messageText.textContent = 'Download do manifesto iniciado. Use esses caminhos ao rodar Sports2D ou MediaPipe nos clips reais.';
    }
  });
  let preparedPilotPackageJson = '';
  document.querySelector('#prepare-pilot-package')?.addEventListener('click', () => {
    const textarea = document.querySelector('#pilot-package-json');
    const message = document.querySelector('#pilot-package-message');
    const messageText = message?.querySelector('p');
    const downloadButton = document.querySelector('#download-pilot-package');
    const pilotPackage = buildVideoPilotPackage(calibration, validationClips);
    preparedPilotPackageJson = JSON.stringify(pilotPackage, null, 2);
    if (textarea) {
      textarea.hidden = false;
      textarea.value = preparedPilotPackageJson;
    }
    if (downloadButton) {
      downloadButton.disabled = false;
    }
    if (message && messageText) {
      message.hidden = false;
      messageText.textContent = `Pacote ${pilotPackage.schemaVersion} preparado para ${pilotPackage.candidate.name}: ${pilotPackage.validationClips.length} clips e ${pilotPackage.phaseTargets.length} fases avaliadas.`;
    }
  });
  document.querySelector('#download-pilot-package')?.addEventListener('click', () => {
    const json = preparedPilotPackageJson || document.querySelector('#pilot-package-json')?.value || '';
    if (!json.trim()) return;
    const message = document.querySelector('#pilot-package-message');
    const messageText = message?.querySelector('p');
    const date = new Date().toISOString().slice(0, 10);
    downloadJsonFile(`isa-video-ai-pilot-package-${date}.json`, json);
    if (message && messageText) {
      message.hidden = false;
      messageText.textContent = 'Download do pacote piloto iniciado. Rode o piloto com videos reais e mantenha a revisao manual.';
    }
  });
  document.querySelector('#validation-fundamental')?.addEventListener('change', (event) => {
    const phaseSelect = document.querySelector('#validation-phase');
    if (phaseSelect) {
      const phases = phaseOptionsForFundamental(event.currentTarget.value);
      phaseSelect.innerHTML = phaseSelectOptions(event.currentTarget.value, phases[1] || phases[0] || '');
    }
  });
  document.querySelector('#add-validation-clip')?.addEventListener('click', () => {
    const athlete = 'Isa';
    const marker = document.querySelector('#validation-marker')?.value?.trim() || 'Marcador tecnico';
    const fundamental = document.querySelector('#validation-fundamental')?.value || 'Saque';
    const clip = {
      id: `validation-clip-${Date.now()}`,
      athlete,
      fundamental,
      phase: document.querySelector('#validation-phase')?.value || defaultPhaseForEvidence(fundamental, marker),
      marker,
      status: document.querySelector('#validation-status')?.value || 'Gravado',
      createdAt: new Date().toISOString().slice(0, 10),
    };
    localStorage.setItem(videoValidationStorageKey, JSON.stringify([clip, ...readVideoValidationClips()]));
    window.__isaLastVideoAnalysisMessage = `Clip registrado para ${clip.fundamental} na fase ${clip.phase}. Use esse plano para chegar a 3 revisoes reais antes de confiar na IA.`;
    renderAiVideosPage();
  });
  document.querySelector('#clear-validation-clips')?.addEventListener('click', () => {
    localStorage.removeItem(videoValidationStorageKey);
    window.__isaLastVideoAnalysisMessage = 'Plano de validacao real limpo.';
    renderAiVideosPage();
  });
  document.querySelectorAll('[data-video-evidence-review]').forEach((button) => {
    button.addEventListener('click', () => {
      const updated = updateStoredVideoEvidenceStatus(button.dataset.videoEvidenceReview, button.dataset.reviewStatus);
      window.__isaLastVideoAnalysisMessage = updated
        ? `Evidencia marcada como ${button.dataset.reviewStatus}.`
        : 'Nao foi possivel atualizar a evidencia selecionada.';
      renderAiVideosPage();
    });
  });
  document.querySelectorAll('[data-video-evidence-calibrate]').forEach((button) => {
    button.addEventListener('click', () => {
      const item = evidence.find((entry) => entry.id === button.dataset.videoEvidenceCalibrate);
      if (!item) {
        window.__isaLastVideoAnalysisMessage = 'Não foi possível encontrar esse resultado para revisão.';
        renderAiVideosPage();
        return;
      }
      const manual = upsertManualCalibrationEvidence(item);
      window.__isaLastVideoAnalysisMessage = `Revisão salva para ${manual.marker}. Compare com o vídeo antes do próximo relatório.`;
      renderAiVideosPage();
    });
  });
  document.querySelectorAll('[data-video-evidence-archive]').forEach((button) => {
    button.addEventListener('click', () => {
      const archived = archiveVideoEvidence(button.dataset.videoEvidenceArchive);
      pendingVideoEvidenceDeleteId = '';
      window.__isaLastVideoAnalysisMessage = archived
        ? `Resultado "${archived.exerciseTitle || archived.marker}" arquivado.`
        : 'Nao foi possivel arquivar o resultado selecionado.';
      renderAiVideosPage();
    });
  });
  document.querySelectorAll('[data-video-evidence-restore]').forEach((button) => {
    button.addEventListener('click', () => {
      const restored = restoreArchivedVideoEvidence(button.dataset.videoEvidenceRestore);
      pendingVideoEvidenceDeleteId = '';
      window.__isaLastVideoAnalysisMessage = restored
        ? `Resultado "${restored.exerciseTitle || restored.marker}" voltou para os ativos.`
        : 'Nao foi possivel restaurar o resultado selecionado.';
      renderAiVideosPage();
    });
  });
  document.querySelectorAll('[data-video-evidence-delete]').forEach((button) => {
    button.addEventListener('click', () => {
      const id = button.dataset.videoEvidenceDelete;
      if (pendingVideoEvidenceDeleteId !== id) {
        pendingVideoEvidenceDeleteId = id;
        window.__isaLastVideoAnalysisMessage = 'Clique em Confirmar exclusão para apagar este resultado para sempre.';
        renderAiVideosPage();
        return;
      }
      const deleted = deleteVideoEvidenceForever(id);
      pendingVideoEvidenceDeleteId = '';
      window.__isaLastVideoAnalysisMessage = deleted
        ? `Resultado "${deleted.exerciseTitle || deleted.marker}" excluido para sempre.`
        : 'Nao foi possivel excluir o resultado selecionado.';
      renderAiVideosPage();
    });
  });
  document.querySelectorAll('[data-video-evidence-id]').forEach((button) => {
    button.addEventListener('click', () => {
      if (button.disabled) return;
      const item = evidence.find((entry) => entry.id === button.dataset.videoEvidenceId);
      if (item) useVideoEvidenceInReport(item);
    });
  });
}
function render() {
  if (editingProfile) {
    renderProfileQuestionnairePage();
    return;
  }
  if (!athleteProfile.completed) {
    if (!getSelectedPosition()) renderPositionSelectionPage();
    else renderOnboardingPage();
    return;
  }
  if (!getSelectedPosition()) {
    renderPositionSelectionPage();
    return;
  }
  if (activePage === 'dashboard') renderDashboard();
  else if (activePage === 'treinos') renderTrainingPage();
  else if (activePage === 'posicoes') renderPositionGuidePage();
  else if (activePage === 'fisico-mobilidade') renderPhysicalMobilityPage();
  else if (activePage === 'relatorios') renderReportsPage();
  else if (activePage === 'exercicios') renderExerciseLibraryPage();
  else if (activePage === 'individual') renderIndividualPage();
  else if (activePage === 'leitura') renderGameReadingPage();
  else renderAiVideosPage();
}

render();






