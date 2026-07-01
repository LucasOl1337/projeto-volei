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

const navItems = [
  ['dashboard', '01', 'Visao geral', 'Treino individual em casa'],
  ['treinos', '02', 'Plano de treino', 'Sessoes e atividades'],
  ['posicoes', '03', 'Posicoes', 'Decisoes por funcao'],
  ['fisico-mobilidade', '04', 'Fisico e Mobilidade', 'Exercicios fisicos e mobilidade'],
  ['exercicios', '05', 'Exercicios em casa', 'Biblioteca por posicao'],
  ['relatorios', '06', 'Relatorio', 'Anotacoes e conclusoes'],
  ['indicadores', '07', 'Evolucao', 'Tabelas comparativas'],
  ['videos', '08', 'Videos', 'Preparacao para analise'],
  ['individual', '09', 'Correcoes', 'Exercicios e correcoes'],
  ['leitura', '10', 'Leitura de jogo', 'Padroes e decisoes'],
];

const sessions = [];

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
    manualCheck: 'Checar se a atleta cai pronta para a proxima defesa, sem joelho colapsar.',
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
    manualCheck: 'Confirmar se a decisao do alvo foi chamada antes do toque.',
    nextAction: 'Conectar a metrica com leitura de jogo, nao apenas gesto de braco.',
  },
];

const videoAiProjectCandidates = [
  {
    name: 'Sports2D',
    url: 'github.com/davidpagnon/Sports2D',
    license: 'BSD-3-Clause',
    priority: 'Pilotar agora',
    scope: 'Angulos 2D, trajetorias e cinematica de uma atleta.',
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
    activities: 'Simulacao de posicao, comandos em voz alta e revisao manual de video',
    dose: '2 blocos de leitura',
    evidence: 'decisao escolhida e zona de referencia',
    caution: 'Adapte quadra para parede, alvo ou marca no chao.',
    exercise: 'Base defensiva e reacao curta',
    metric: 'decisao chamada antes do movimento',
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
  title: 'Saque e defesa para todos',
  description: 'Toda posicao precisa pressionar com alvo, defender com criterio e controlar erro antes de buscar forca maxima.',
  items: [
    'Estrategia de alvo: escolher zona vulneravel antes de executar.',
    'Pressao: manter intencao mesmo em repeticoes curtas dentro de casa.',
    'Zonas vulneraveis: simular corredor, fundo centro e bola curta com marcas no chao.',
    'Controle de erro: contar perdas por serie e ajustar a proxima repeticao.',
  ],
  exercises: [
    {
      id: 'universal-saque-alvo',
      fundamental: 'Saque',
      title: 'Mapa de alvo do saque na parede',
      objective: 'Treinar escolha de alvo, pressao e controle do erro sem precisar de quadra.',
      environment: 'Individual em casa',
      materials: 'Parede livre, fita adesiva e bola leve ou bola de meia.',
      duration: '8 a 10 min',
      setup: 'Marque tres alvos na parede. Antes de cada repeticao diga o alvo em voz alta e execute com controle, anotando acerto, erro curto ou erro longo.',
      variations: ['Alternar alvo a cada repeticao', 'Fazer 5 bolas seguidas no mesmo alvo', 'Reduzir forca quando errar duas vezes seguidas'],
      metric: 'Acertos por alvo e erros evitaveis por serie.',
    },
    {
      id: 'universal-defesa-zonas',
      fundamental: 'Defesa',
      title: 'Defesa curta por zonas no chao',
      objective: 'Criar leitura de zonas vulneraveis e resposta defensiva curta em pouco espaco.',
      environment: 'Individual em casa',
      materials: 'Fita no chao, cronometro e bola de meia.',
      duration: '6 a 9 min',
      setup: 'Marque tres zonas pequenas no chao. Chame uma zona em voz alta, desloque em base baixa, toque a marca e volte ao centro.',
      variations: ['Usar ordem aleatoria', 'Adicionar controle da bola de meia ao voltar', 'Fazer series de 20 segundos'],
      metric: 'Repeticoes com base baixa, decisao rapida e retorno equilibrado.',
    },
  ],
};

const positionContents = [
  {
    id: 'levantador',
    name: 'Levantador',
    description: 'Treino para organizar o jogo: ler bloqueio, escolher a jogada, manter ritmo e comunicar a decisao com clareza.',
    fundamentals: ['Leitura do bloqueio', 'Escolha de jogada', 'Ritmo do toque', 'Comunicacao', 'Engano corporal'],
    homeExercises: [
      {
        id: 'levantador-toque-alvo',
        fundamental: 'Levantamento',
        title: 'Toque de dedos com chamada de jogada',
        objective: 'Unir precisao do toque com decisao antes do contato.',
        environment: 'Individual em casa',
        materials: 'Parede, fita para alvo e bola leve.',
        duration: '8 a 12 min',
        setup: 'Marque dois alvos na parede. Diga "entrada" ou "saida" antes de tocar e envie a bola para o alvo correspondente.',
        variations: ['Alternar alvo alto e medio', 'Agachar levemente entre toques', 'Fazer uma finta corporal antes do toque'],
        metric: 'Acertos no alvo depois da chamada correta.',
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
        variations: ['Sem bola', 'Com bola leve', 'Com chamada de jogada em voz alta'],
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
        setup: 'Marque um alvo a esquerda e outro a direita. Antes da bola chegar, chame "frente" ou "costas" e envie para o alvo correspondente com toque alto.',
        variations: ['Chamar a direcao em voz alta', 'Alternar passe A, B e C imaginario', 'Fazer uma recuperacao de base antes do toque'],
        metric: 'Bolas que chegam no alvo certo depois da chamada.',
      },
      {
        id: 'levantador-bola-ruim-segura',
        fundamental: 'Decisao',
        title: 'Bola ruim para escolha segura',
        objective: 'Aprender a simplificar a jogada quando o passe tira a levantadora da zona ideal.',
        environment: 'Individual em casa',
        materials: 'Fita no chao, bola leve e parede opcional.',
        duration: '6 a 8 min',
        setup: 'Marque uma zona ideal e duas zonas ruins. Saia de cada zona, enquadre o corpo e escolha: bola alta na ponta, bola alta na saida ou bola de seguranca.',
        variations: ['Sem bola para treinar pes', 'Com toque de dedos', 'Com manchete de emergencia'],
        metric: 'Decisoes seguras feitas sem cair para tras ou girar o corpo tarde demais.',
      },
    ],
    gameReading: ['Identificar se o bloqueio esta atrasado, aberto ou adiantado.', 'Escolher jogada pela qualidade do passe e pelo tempo das atacantes imaginadas.', 'Usar voz curta para comunicar ritmo e proxima acao.'],
    physicalFocus: ['Mobilidade de punho e ombro', 'Base baixa com deslocamento curto', 'Estabilidade de core para tocar equilibrado'],
    mentalFocus: ['Decidir antes do contato', 'Comunicar sem hesitar', 'Aceitar uma escolha simples quando a bola esta dificil'],
    weeklyPlan: [
      ['Segunda', 'Toque e ritmo', 'Toque de dedos com chamada de jogada.'],
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
    name: 'Libero',
    description: 'Treino para sustentar a linha de passe: ler ataque, defender no lugar certo, receber com plataforma firme e liderar a organizacao.',
    fundamentals: ['Leitura de ataque', 'Posicionamento defensivo', 'Recepcao', 'Lideranca da linha de passe', 'Controle de plataforma'],
    homeExercises: [
      {
        id: 'libero-manchete-alvo',
        fundamental: 'Recepcao',
        title: 'Manchete com alvo e chamada de zona',
        objective: 'Treinar plataforma e direcao como se estivesse organizando a linha de passe.',
        environment: 'Individual em casa',
        materials: 'Parede, fita para alvo e bola leve.',
        duration: '8 a 12 min',
        setup: 'Marque um alvo na parede. Antes da manchete diga "minha", "curta" ou "fundo" e controle a bola para o alvo.',
        variations: ['Base parada', 'Um passo lateral antes do contato', 'Alternar alvo baixo e medio'],
        metric: 'Sequencia maxima com plataforma estavel e alvo correto.',
      },
      {
        id: 'libero-defesa-postura',
        fundamental: 'Defesa',
        title: 'Base baixa com leitura de ataque',
        objective: 'Manter postura defensiva e reagir sem levantar o tronco antes da hora.',
        environment: 'Individual em casa',
        materials: 'Fita no chao, cronometro e bola de meia.',
        duration: '6 a 10 min',
        setup: 'Marque tres pontos. Chame uma direcao, toque o ponto em base baixa e recupere o centro.',
        variations: ['Com comando em voz alta', 'Com bola de meia para controlar no retorno', 'Series de 15 segundos com descanso curto'],
        metric: 'Repeticoes sem perder base baixa.',
      },
      {
        id: 'libero-lideranca-passe',
        fundamental: 'Comunicacao',
        title: 'Comando da linha de passe',
        objective: 'Treinar lideranca verbal e leitura antes da bola chegar.',
        environment: 'Individual em casa',
        materials: 'Celular para gravar audio ou video.',
        duration: '5 a 7 min',
        setup: 'Simule dez recepcoes. Antes de cada uma, fale zona, prioridade e ajuste: "eu pego curta", "fecha corredor", "bola alta".',
        variations: ['Gravar e ouvir clareza da voz', 'Fazer com deslocamento curto', 'Adicionar respiracao antes do comando'],
        metric: 'Comandos curtos, audiveis e ligados a uma decisao.',
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
        setup: 'Marque curta, meio e fundo. Chame uma zona, de o primeiro passo em base baixa e finalize com plataforma apontada para o alvo.',
        variations: ['Com comando aleatorio', 'Com bola de meia no final', 'Gravar de lado para ver se o tronco sobe cedo'],
        metric: 'Primeiro passo correto antes de levantar o tronco.',
      },
    ],
    gameReading: ['Ler ombro e passada do atacante.', 'Ajustar um passo antes do contato, nao depois.', 'Organizar mentalmente quem cobre curta, fundo e corredor.'],
    physicalFocus: ['Quadril e tornozelo para base baixa', 'Core anti-rotacao', 'Deslocamento lateral curto'],
    mentalFocus: ['Coragem para chamar a bola', 'Calma depois de erro de recepcao', 'Atencao ao sinal do atacante'],
    weeklyPlan: [
      ['Segunda', 'Recepcao', 'Manchete com alvo e chamada de zona.'],
      ['Terca', 'Defesa', 'Base baixa e reacao curta por zonas.'],
      ['Quarta', 'Fisico', 'Mobilidade de quadril, core e tornozelo.'],
      ['Quinta', 'Leitura', 'Simular ataque forte, largada e bola no corpo.'],
      ['Sexta', 'Saque e defesa', 'Mapa de alvo e controle de erro.'],
      ['Sabado', 'Lideranca', 'Gravar comandos curtos da linha de passe.'],
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
        setup: 'Marque centro, esquerda e direita. Chame uma direcao, desloque, suba maos e aterrisse equilibrado.',
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
        setup: 'Associe cada marca a uma jogada: meio, ponta e saida. Chame a jogada e faca o primeiro passo defensivo ou de bloqueio.',
        variations: ['Aumentar velocidade aos poucos', 'Falar a pista antes do passo', 'Voltar ao centro sempre equilibrado'],
        metric: 'Decisao chamada antes do deslocamento.',
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
        variations: ['Sem salto', 'Com mini salto', 'Com chamada "meio" antes da armacao'],
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
        setup: 'Pause o video antes do levantamento, fale a pista observada e pise na marca meio, ponta ou saida antes de simular o bloqueio.',
        variations: ['Assistir em velocidade normal', 'Pausar no passe', 'Registrar acertos de previsao em papel'],
        metric: 'Previsoes corretas antes da bola sair da mao da levantadora.',
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
    gameReading: ['Ler ombro e maos do levantador.', 'Separar bola rapida de bola alta pela chegada do passe.', 'Voltar do bloqueio pronta para transicao curta.'],
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
        setup: 'Antes da passada diga a opcao: diagonal, paralela ou curta. Finalize o movimento com a toalha apontando para a marca.',
        variations: ['Sem salto', 'Mini salto controlado', 'Escolha aleatoria antes da passada'],
        metric: 'Decisoes chamadas antes do ultimo apoio.',
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
        variations: ['Cobertura curta', 'Cobertura profunda', 'Chamar a zona antes de voltar'],
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
        variations: ['Chamar a escolha antes do ultimo apoio', 'Sem salto', 'Mini salto com queda equilibrada'],
        metric: 'Escolhas declaradas antes do contato e queda sem invadir a marca.',
      },
      {
        id: 'ponteiro-recepcao-linha',
        fundamental: 'Recepcao',
        title: 'Linha de recepcao e ajuste lateral',
        objective: 'Treinar responsabilidade de passe antes de pensar no ataque.',
        environment: 'Individual em casa',
        materials: 'Parede, fita para alvo e duas marcas laterais no chao.',
        duration: '8 a 12 min',
        setup: 'Faca manchete na parede, ajuste um passo para a marca lateral chamada e volte para o centro antes da proxima bola.',
        variations: ['Direita-esquerda alternado', 'Chamar "minha" antes do contato', 'Reduzir forca e aumentar precisao'],
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
        variations: ['Sem salto', 'Mini salto', 'Chamar "alta", "longe" ou "apertada" antes da passada'],
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
        variations: ['Alternar bordas', 'Dizer a escolha antes do gesto', 'Reduzir velocidade para melhorar precisao'],
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
        setup: 'Use uma marca para ponteiro, uma para pipe e uma para centro. Chame a jogada e ajuste maos na parede sem tocar forte.',
        variations: ['Sem salto', 'Mini salto', 'Voltar ao centro depois de cada leitura'],
        metric: 'Decisao correta e maos alinhadas antes da simulacao de bloqueio.',
      },
      {
        id: 'oposto-saida-diagonal-paralela',
        fundamental: 'Ataque',
        title: 'Saida: diagonal ou paralela',
        objective: 'Criar decisao ofensiva de oposta antes do contato, sem bater forte em casa.',
        environment: 'Individual em casa',
        materials: 'Toalha pequena, fita no chao e duas marcas na parede.',
        duration: '8 a 10 min',
        setup: 'Monte uma passada curta de saida. Antes do ultimo apoio chame diagonal ou paralela e finalize com a toalha na direcao da marca.',
        variations: ['Sem salto', 'Mini salto', 'Adicionar escolha "explorar" quando a marca estiver bloqueada'],
        metric: 'Decisoes chamadas antes do ultimo apoio e braco finalizando alto.',
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
        variations: ['Com comando aleatorio', 'Com bola de meia no final', 'Cronometrar 15 segundos de repeticoes limpas'],
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
    primaryDecision: 'Ler o levantador adversario cedo sem abandonar a atacante de meio.',
    priority: 'Tempo de bloqueio, deslocamento curto na rede e transicao rapida para ataque.',
    avoid: 'Saltar no chute da levantadora antes de enxergar ombro, bola e atacante.',
    keyFundamentals: ['Bloqueio', 'Ataque rapido', 'Transicao', 'Saque tatico'],
    indicators: ['Toques de bloqueio que viram contra-ataque', 'Ataques de primeiro tempo apos passe bom', 'Fechamento correto com ponta ou oposta', 'Erros de rede ou invasao'],
    evidence: ['Maos passando a rede sem tocar na fita', 'Primeiro passo lateral curto e limpo', 'Aterrissagem equilibrada depois do bloqueio', 'Chamada de bola rapida antes do levantamento'],
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
    priority: 'Precisao de bola alta, velocidade de decisao e comunicacao antes do contato.',
    avoid: 'Forcar uma bola rapida quando o passe tirou a equipe do sistema.',
    keyFundamentals: ['Levantamento', 'Defesa', 'Bloqueio na Z2', 'Saque'],
    indicators: ['Bolas atacaveis por tipo de passe', 'Distribuicao entre ponta, central e oposta', 'Ataques com bloqueio simples', 'Erros de dois toques ou conducao'],
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
    role: 'Ataca pela saida, oferece bola de seguranca e bloqueia muitas bolas da ponteira adversaria.',
    courtBase: 'Z2 na rede e opcoes de ataque do fundo conforme sistema da equipe.',
    primaryDecision: 'Ser agressiva na bola boa e inteligente na bola quebrada.',
    priority: 'Ataque de saida, bloqueio contra ponteira e virada de bola sob pressao.',
    avoid: 'Bater forte em toda bola sem observar bloqueio, cobertura e espaco livre.',
    keyFundamentals: ['Ataque', 'Bloqueio', 'Defesa direita', 'Cobertura'],
    indicators: ['Eficiencia de ataque na saida', 'Bloqueios ou amortecimentos contra ponteira', 'Erros nao forcados em bola alta', 'Pontos em rally longo'],
    evidence: ['Passada ajustada para bola um pouco fora da antena', 'Mao atacando diagonal ou paralela com intencao', 'Fechamento de bloqueio com a central', 'Recuperacao depois de cobrir largada'],
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
    indicators: ['Passe positivo para zona de levantamento', 'Defesas que mantem rally vivo', 'Bolas cobertas apos bloqueio', 'Erros de comunicacao no fundo'],
    evidence: ['Plataforma formando angulo antes do contato', 'Base baixa antes do ataque adversario', 'Chamada clara: minha, sua, fora', 'Levantamento de emergencia alto para a ponta'],
    trainingTabs: [
      ['Tecnico', 'Plataforma estavel e direcao do passe.', 'Manchete na parede mirando uma fita, contando sequencias de controle.'],
      ['Tatico', 'Ler largada, diagonal e bola forte.', 'Marcar em video o ombro da atacante e pausar antes do contato para prever a zona.'],
      ['Fisico', 'Base baixa com deslocamento curto.', 'Tres marcas no chao, comando de direcao e volta ao centro em 20 segundos.'],
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
    ['intermediario', 'Intermediario'],
    ['avancado', 'Avancado'],
  ],
  equipment: [
    ['bola', 'Bola'],
    ['parede', 'Parede livre'],
    ['fita', 'Fita no chao'],
    ['toalha', 'Toalha'],
    ['elastico', 'Elastico'],
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
    ['defesa', 'Defesa e recepcao'],
    ['ataque', 'Ataque com controle'],
    ['fisico', 'Forca e mobilidade'],
    ['leitura', 'Leitura de jogo'],
  ],
  time: [
    ['15', 'Ate 15 min'],
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
    next: 'Usar comando em voz alta e voltar ao centro a cada toque.',
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
    setup: 'Marque tres pontos no chao. Saia da base defensiva, toque o ponto chamado por voce mesmo e volte ao centro mantendo postura baixa.',
    variations: ['Usar comandos em voz alta', 'Adicionar bola de meia para controlar apos o deslocamento', 'Fazer series de 20 segundos'],
    metric: 'Repeticoes com postura baixa e tempo sem perder equilibrio.',
  },
];

const physicalTrainingLibrary = [
  {
    id: 'fis-potencia-salto',
    focus: 'Potencia de salto',
    title: 'Saltos verticais com aterrissagem travada',
    objective: 'Melhorar impulsao para ataque e bloqueio mantendo joelho, quadril e tronco alinhados na queda.',
    athletes: '1 a 6 atletas',
    materials: 'Fita no chao, cone baixo ou caixa baixa opcional.',
    duration: '10 a 12 min',
    setup: 'Marque uma zona de queda. Execute 3 a 5 saltos por serie, buscando subir rapido e aterrissar silencioso por 2 segundos.',
    mobility: 'Antes: tornozelo joelho-na-parede, agachamento profundo assistido e balanco de bracos.',
    variations: ['Salto sem contramovimento', 'Salto com aproximacao curta de ataque', 'Salto lateral baixo antes do salto vertical'],
    metric: 'Altura percebida, aterrissagens estaveis e queda silenciosa em cada repeticao.',
    rest: '90 a 150 s entre series; pare antes da altura cair muito.',
    evidence: 'Pliometria melhora salto vertical em atletas de volei; o descanso precisa preservar potencia, nao cansar por cansar.',
  },
  {
    id: 'fis-aterrissagem-desaceleracao',
    focus: 'Aterrissagem e desaceleracao',
    title: 'Queda controlada e freio lateral',
    objective: 'Reduzir perda de eixo depois de bloqueio, ataque ou defesa curta.',
    athletes: '1 a 8 atletas',
    materials: 'Fita no chao, cones e espaco de 3 a 5 metros.',
    duration: '8 a 10 min',
    setup: 'Faca um deslocamento lateral curto, freie dentro da marca e segure a base por 2 segundos antes de voltar.',
    mobility: 'Antes: mobilidade de tornozelo, 90/90 de quadril e rotacao toracica em base baixa.',
    variations: ['Freio bilateral', 'Freio em uma perna com baixa altura', 'Comando visual para mudar direita/esquerda'],
    metric: 'Numero de freios sem joelho cair para dentro e sem perder equilibrio.',
    rest: '45 a 75 s entre series curtas.',
    evidence: 'Aquecimentos com core, equilibrio e controle de tronco podem reduzir severidade e carga de lesoes por sobreuso.',
  },
  {
    id: 'fis-forca-unilateral',
    focus: 'Forca unilateral',
    title: 'Agachamento dividido para base de ataque',
    objective: 'Construir perna forte para passada, bloqueio, defesa baixa e recuperacao entre saltos.',
    athletes: '1 a 6 atletas',
    materials: 'Peso corporal, mochila ou halter quando houver tecnica segura.',
    duration: '12 a 16 min',
    setup: 'Fique em passada, desca controlando o joelho da frente e suba empurrando o chao sem perder alinhamento.',
    mobility: 'Antes: flexor de quadril dinamico, tornozelo e ponte de gluteo curta.',
    variations: ['Sem carga', 'Com mochila no peito', 'Pe traseiro elevado somente quando houver controle'],
    metric: 'Repeticoes por lado com joelho alinhado, tronco estavel e mesma amplitude.',
    rest: '90 a 150 s entre series; use mais descanso quando a carga subir.',
    evidence: 'Diretrizes de resistencia indicam forca com cargas mais altas e 2 a 3 series; em casa, peso corporal e elasticos tambem servem.',
  },
  {
    id: 'fis-agilidade-curta',
    focus: 'Agilidade curta',
    title: 'Shuffle, freio e volta ao centro',
    objective: 'Melhorar deslocamento curto para defesa, cobertura e ajuste antes da bola chegar.',
    athletes: '1 a 10 atletas',
    materials: 'Tres marcas no chao e cronometro.',
    duration: '8 a 12 min',
    setup: 'Marque centro, direita e esquerda. Saia do centro, toque a marca chamada, freie e volte mantendo base baixa.',
    mobility: 'Antes: deslocamento lateral leve, abertura de quadril e ativacao de panturrilha.',
    variations: ['Com comando de voz', 'Com comando visual', 'Com bola leve apos o freio'],
    metric: 'Repeticoes limpas em 15 a 20 s sem subir demais a postura.',
    rest: '60 a 90 s entre tiros para manter velocidade real.',
    evidence: 'Preparacao fisica de volei costuma combinar agilidade intensa com movimentos parecidos com o ritmo do jogo.',
  },
  {
    id: 'fis-core-ombro',
    focus: 'Core e ombro',
    title: 'Prancha lateral com rotacao e ombro ativo',
    objective: 'Dar estabilidade para saque, ataque, defesa baixa e aterrissagem sem perder linha do tronco.',
    athletes: '1 a 8 atletas',
    materials: 'Colchonete e elastico leve opcional.',
    duration: '8 a 10 min',
    setup: 'Segure prancha lateral curta, rode o tronco com controle e mantenha ombro longe da orelha.',
    mobility: 'Antes: rotacao toracica, wall slide e rotacao externa leve com elastico.',
    variations: ['Joelho apoiado', 'Prancha lateral completa', 'Rotacao externa com elastico apos a prancha'],
    metric: 'Tempo com tronco alinhado e ombro estavel, sem compensar lombar.',
    rest: '30 a 60 s entre lados ou series.',
    evidence: 'Programas de aquecimento de volei incluem core, membros inferiores e ombro; estudos do VolleyVeilig apontam reducao de lesoes agudas e de membro superior.',
  },
];

const mobilityPrep = [
  ['Tornozelo', 'Joelho na parede + saltitos leves', '2 x 30 s por lado', 'Ajuda aterrissagem, defesa baixa e deslocamento sem compensar no joelho.'],
  ['Quadril', '90/90 dinamico + avanco com rotacao', '2 x 5 repeticoes por lado', 'Prepara base baixa, passada de ataque e mudanca de direcao.'],
  ['Tronco', 'Rotacao toracica em quatro apoios', '2 x 6 repeticoes por lado', 'Ajuda saque e ataque a girar sem jogar toda carga no ombro.'],
  ['Ombro', 'Wall slide + rotacao externa com elastico', '2 x 8 repeticoes', 'Prepara membros superiores para saque, ataque, bloqueio e defesa alta.'],
];

const gameReadingPatterns = [
  ['Levantador', 'Onde ele esta, se chega equilibrado e se pode jogar de segunda.'],
  ['Trajetoria da bola', 'Altura, velocidade e distancia da rede indicam tempo de ataque.'],
  ['Postura do atacante', 'Ombro, passada e braco armado mostram direcao provavel.'],
  ['Cobertura', 'Quem protege a bola curta depois do bloqueio ou ataque.'],
  ['Bloqueio adversario', 'Maos fechadas, atraso ou espaco entre bloqueadoras.'],
  ['Espaco vazio', 'Zona descoberta para defender, largar ou contra-atacar.'],
];

const gameReadingScenes = [
  {
    id: 'leitura-levantador-frente',
    clip: 'Cena 01',
    title: 'Levantador chega de frente para a ponta',
    image: '/assets/game-reading-setter-front.png',
    imageAlt: 'Levantadora equilibrada perto da rede preparando bola para atacante de entrada.',
    angle: 'camera lateral perto da rede',
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
    image: '/assets/game-reading-pass-off-net.png',
    imageAlt: 'Rally visto em plano aberto com bola alta e equipe reorganizando a defesa.',
    angle: 'visao alta de fundo',
    fundamental: 'passe fora do sistema',
    question: 'Para onde voce defenderia primeiro?',
    answer: 'Bola alta na ponta',
    options: ['Bola rapida no meio', 'Bola alta na ponta', 'Bola de segunda'],
    cues: ['levantador fora da rede', 'central sem tempo de ataque', 'ponta esperando bola alta'],
    decision: 'Defesa ganha tempo, abre base e observa direcao do ombro da atacante.',
    court: ['Bola longe da rede', 'Meio atrasado', 'Ponta com mais tempo'],
  },
  {
    id: 'leitura-bloqueio-aberto',
    clip: 'Cena 03',
    title: 'Bloqueio adversario deixa corredor',
    image: '/assets/game-reading-open-line.png',
    imageAlt: 'Ataque de entrada contra bloqueio com defensora lendo o corredor de paralela.',
    angle: 'visao da defesa para a rede',
    fundamental: 'bloqueio e cobertura',
    question: 'Qual espaco vazio deve ser protegido?',
    answer: 'Corredor paralela',
    options: ['Fundo centro', 'Corredor paralela', 'Bola curta no meio'],
    cues: ['bloqueio nao fecha a antena', 'defesa adversaria afundada', 'atacante com braco alto'],
    decision: 'Defensora da paralela ajusta meio passo e cobertura acompanha rebote.',
    court: ['Bloqueio aberto', 'Paralela vazia', 'Cobertura perto da rede'],
  },
];

const storageVersion = 'position-personalization-v1';
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
let activePage = navItems.some(([id]) => id === requestedPage)
  ? requestedPage
  : localStorage.getItem('isa.activePage') || 'dashboard';
if (!navItems.some(([id]) => id === activePage)) {
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
let selectedSessionId = localStorage.getItem('isa.selectedSessionId') || '';
let reportNote = localStorage.getItem('isa.reportNote') || '';
let reportPositive = localStorage.getItem('isa.reportPositive') || '';
let reportCorrection = localStorage.getItem('isa.reportCorrection') || '';
let reportFundamental = localStorage.getItem('isa.reportFundamental') || 'Recepcao';
let reportExercise = localStorage.getItem('isa.reportExercise') || exerciseLibrary[1]?.title || '';
let reportEvidence = localStorage.getItem('isa.reportEvidence') || '';
let reportNext = localStorage.getItem('isa.reportNext') || '';
let selectedReadingSceneId = localStorage.getItem('isa.selectedReadingSceneId') || gameReadingScenes[0]?.id || '';
let selectedReadingAnswer = localStorage.getItem('isa.selectedReadingAnswer') || '';
let editingProfile = false;
let profileQuestionStep = Number(localStorage.getItem('isa.profileStep') || '0');
let profileDraft = null;

const profileQuestionSteps = ['position', 'body', 'level', 'equipment', 'pains', 'objective', 'time'];

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

function getPositionVideoMarkers(position = getSelectedPosition()) {
  if (!position) {
    return [
      ['Saque', 'Lancamento, braco alto, contato e equilibrio final'],
      ['Recepcao', 'Base baixa, plataforma, angulo dos bracos e direcao'],
      ['Ataque', 'Ritmo da passada, armacao do braco, contato e aterrissagem'],
      ['Bloqueio', 'Passo lateral, fechamento das maos e queda equilibrada'],
      ['Defesa', 'Postura baixa, leitura, deslocamento curto e recuperacao'],
    ];
  }
  return position.fundamentals.map((fundamental, index) => [
    fundamental,
    position.gameReading[index % position.gameReading.length] || 'Marque o momento chave e a proxima correcao.',
  ]);
}

function getPositionPhysicalTraining(position = getSelectedPosition()) {
  const idsByPosition = {
    levantador: ['fis-core-ombro', 'fis-agilidade-curta', 'fis-forca-unilateral'],
    libero: ['fis-agilidade-curta', 'fis-aterrissagem-desaceleracao', 'fis-core-ombro'],
    central: ['fis-potencia-salto', 'fis-aterrissagem-desaceleracao', 'fis-agilidade-curta'],
    ponteiro: ['fis-core-ombro', 'fis-aterrissagem-desaceleracao', 'fis-agilidade-curta'],
    oposto: ['fis-potencia-salto', 'fis-core-ombro', 'fis-aterrissagem-desaceleracao'],
  };
  const ids = idsByPosition[position?.id] || physicalTrainingLibrary.map((item) => item.id);
  return physicalTrainingLibrary.filter((item) => ids.includes(item.id));
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
    : 'nao informado';
  return [
    ['Nivel', labelForOption('levels', athleteProfile.level)],
    ['Objetivo', labelForOption('objectives', athleteProfile.objective)],
    ['Tempo', labelForOption('time', athleteProfile.time)],
    ['Equipamentos', equipment],
    ['Dores', pains],
  ];
}

function profileTrainingDose() {
  const minutes = Number(athleteProfile.time || 25);
  if (minutes <= 15) return { duration: '15 min', series: '2 blocos curtos', note: 'Use um exercicio principal e um ajuste tecnico.' };
  if (minutes <= 25) return { duration: '25 min', series: '3 blocos curtos', note: 'Use tecnica, leitura e um bloco fisico leve.' };
  if (minutes <= 40) return { duration: '35 min', series: '4 blocos', note: 'Inclua aquecimento, fundamento principal, saque/defesa e registro.' };
  return { duration: '45 min', series: '4 a 5 blocos', note: 'Aumente volume sem perder qualidade e registre sinais de fadiga.' };
}

function profileSafetyNote() {
  const pains = athleteProfile.pains || [];
  const painText = pains.includes('sem-dor') || pains.length === 0
    ? 'Sem dor marcada: avance volume apenas se a tecnica continuar limpa.'
    : `Dores marcadas: ${pains.map((item) => labelForOption('pains', item)).join(', ')}. Reduza impacto e pare se a dor aumentar.`;
  const limitationText = athleteProfile.limitations?.trim()
    ? `Limitacao anotada: ${athleteProfile.limitations.trim()}`
    : 'Nenhuma limitacao anotada no perfil.';
  return `${painText} ${limitationText}`;
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

function setPosition(positionId, nextPage = 'dashboard') {
  if (!positionContents.some((position) => position.id === positionId)) return;
  selectedPositionId = positionId;
  selectedFundamental = 'Todos';
  activePage = nextPage;
  localStorage.setItem('isa.selectedPosition', positionId);
  localStorage.setItem('isa.selectedFundamental', selectedFundamental);
  localStorage.setItem('isa.activePage', activePage);
  render();
}

function saveAthleteProfile(profile) {
  athleteProfile = {
    ...defaultAthleteProfile(),
    ...profile,
    completed: true,
    updatedAt: new Date().toISOString(),
  };
  localStorage.setItem('isa.profile', JSON.stringify(athleteProfile));
  editingProfile = false;
  profileDraft = null;
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
  if (step === 'position') {
    return {
      number: '01',
      title: 'Posicao de referencia',
      detail: 'Use como ponto de partida. Depois voce confirma a posicao nos cards principais.',
      body: `<div class="profile-choice-grid position-choice-grid">${choiceButtons('position', positionContents.map((position) => [position.id, position.name]), profile.position)}</div>`,
    };
  }
  if (step === 'body') {
    return {
      number: '02',
      title: 'Idade e altura',
      detail: 'Esses dados ajudam a calibrar volume, impacto e cuidado fisico.',
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
      number: '03',
      title: 'Nivel atual',
      detail: 'O nivel define a dificuldade inicial dos exercicios e a tolerancia de volume.',
      body: `<div class="profile-choice-grid">${choiceButtons('level', profileQuestionOptions.levels, profile.level)}</div>`,
    };
  }
  if (step === 'equipment') {
    return {
      number: '04',
      title: 'Equipamentos em casa',
      detail: 'Marque tudo que voce consegue usar sem sair de casa.',
      body: `<div class="profile-choice-grid">${choiceButtons('equipment', profileQuestionOptions.equipment, profile.equipment, true)}</div>`,
    };
  }
  if (step === 'pains') {
    return {
      number: '05',
      title: 'Dores ou regioes para cuidado',
      detail: 'O plano reduz impacto quando existe dor marcada.',
      body: `<div class="profile-choice-grid">${choiceButtons('pains', profileQuestionOptions.pains, profile.pains, true)}</div>`,
    };
  }
  if (step === 'objective') {
    return {
      number: '06',
      title: 'Objetivo principal',
      detail: 'Escolha uma prioridade para o primeiro ciclo de treino.',
      body: `<div class="profile-choice-grid">${choiceButtons('objective', profileQuestionOptions.objectives, profile.objective)}</div>`,
    };
  }
  if (step === 'time') {
    return {
      number: '07',
      title: 'Tempo disponivel',
      detail: 'A dose do plano muda conforme o tempo real que voce tem por treino.',
      body: `<div class="profile-choice-grid">${choiceButtons('time', profileQuestionOptions.time, profile.time)}</div>`,
    };
  }
  return {
    number: '07',
    title: 'Tempo disponivel',
    detail: 'A dose do plano muda conforme o tempo real que voce tem por treino.',
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
  if (step === 'position') profile.position = activeSingle('position', profile.position || 'levantador');
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

function renderProfileQuestionnairePage() {
  const profile = getProfileDraft();
  const currentCard = currentProfileStepData(profile);
  const isFirstStep = profileQuestionStep === 0;
  const isLastStep = profileQuestionStep === profileQuestionSteps.length - 1;
  const isAutoAdvanceStep = ['position', 'level', 'objective'].includes(profileQuestionSteps[profileQuestionStep]);
  const progress = ((profileQuestionStep + 1) / profileQuestionSteps.length) * 100;
  app.innerHTML = `
    <div class="position-select-screen profile-screen">
      <main class="profile-shell profile-fullscreen-shell">
        <form class="profile-form panel" id="profile-form">
          <div class="panel-header profile-fullscreen-header">
            <div>
              <div class="brand position-select-brand profile-inline-brand">
                <div class="brand-mark" aria-hidden="true"><img src="/assets/site-icon-192.png" alt="" /></div>
                <div>
                  <h1>Projeto Vôlei</h1>
                  <p>Perfil de treino</p>
                </div>
              </div>
              <p class="eyebrow">Questionario inicial</p>
              <h3>Receba um plano feito para o seu jogo.</h3>
              <p class="panel-subtitle">Treinos, fundamentos e estrategias personalizados para voce evoluir em casa com foco na sua funcao em quadra.</p>
            </div>
            <span class="pill active">${profileQuestionStep + 1} de ${profileQuestionSteps.length}</span>
          </div>
          <div class="panel-body profile-form-body">
            <div class="profile-step-track" aria-label="Progresso do questionario"><span style="width:${progress}%"></span></div>
            <article class="profile-question-card active-step-card">
              <div class="profile-question-head">
                <span class="position-card-index">${currentCard.number}</span>
                <div><h4>${currentCard.title}</h4><p>${currentCard.detail}</p></div>
              </div>
              ${currentCard.body}
            </article>

            <div class="profile-actions">
              <button class="btn-ghost" type="button" data-profile-prev ${isFirstStep ? 'disabled' : ''}>Voltar</button>
              ${isAutoAdvanceStep ? '' : `<button class="btn-primary" type="submit">${isLastStep ? (selectedPositionId ? 'Salvar perfil' : 'Salvar e escolher posicao') : 'Proximo'}</button>`}
              ${selectedPositionId ? '<button class="btn-ghost" type="button" data-cancel-profile>Cancelar</button>' : ''}
            </div>
          </div>
        </form>
      </main>
    </div>
  `;

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
        window.setTimeout(() => moveProfileStep(1), 120);
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

  document.querySelector('[data-cancel-profile]')?.addEventListener('click', () => {
    editingProfile = false;
    profileDraft = null;
    profileQuestionStep = 0;
    localStorage.removeItem('isa.profileStep');
    render();
  });
  document.querySelector('[data-profile-prev]')?.addEventListener('click', () => moveProfileStep(-1));

  document.querySelector('#profile-form').addEventListener('submit', (event) => {
    event.preventDefault();
    persistCurrentProfileCard();
    if (isLastStep) saveAthleteProfile(profileDraft);
    else moveProfileStep(1);
  });
}

function renderPositionSelectionPage() {
  const suggestedPosition = athleteProfile.position || 'levantador';
  app.innerHTML = `
    <div class="position-select-screen">
      <main class="position-select-shell">
        <section class="position-select-intro">
          <div class="brand position-select-brand">
            <div class="brand-mark" aria-hidden="true"><img src="/assets/site-icon-192.png" alt="" /></div>
            <div>
              <h1>Projeto Vôlei</h1>
              <p>Treino individual em casa</p>
            </div>
          </div>
          <p class="eyebrow">Personalizacao por posicao</p>
          <h2>Escolha sua funcao para montar o treino certo.</h2>
          <p>
            O app vai mostrar apenas fundamentos, exercicios, leituras e plano semanal ligados a sua posicao.
            Todos os indicadores continuam zerados ate voce registrar treinos reais.
          </p>
          <article class="position-common-card">
            <span class="tag">${sharedServeDefenseFocus.title}</span>
            <p>${sharedServeDefenseFocus.description}</p>
          </article>
          <article class="position-common-card profile-summary-card">
            <span class="tag">Perfil salvo</span>
            <div class="profile-mini-grid">
              ${profileSummaryItems().slice(0, 3).map(([label, value]) => `<span><strong>${label}</strong>${value}</span>`).join('')}
            </div>
            <button class="btn-ghost" type="button" data-edit-profile>Editar questionario</button>
          </article>
        </section>
        <section class="position-card-grid" aria-label="Escolher posicao de volei">
          ${positionContents.map((position) => `
            <button class="position-card ${position.id === suggestedPosition ? 'suggested' : ''}" type="button" data-position-id="${position.id}" style="${positionThemeVars(position.id)}">
              <span class="position-card-index">${String(positionContents.indexOf(position) + 1).padStart(2, '0')}</span>
              <span class="position-card-icon" aria-hidden="true"><img src="/assets/positions/${position.id}-icon.png" alt="" /></span>
              <strong>${position.name}</strong>
              <span>${position.description}</span>
              <small>${position.id === suggestedPosition ? 'referencia do questionario | ' : ''}${position.fundamentals.slice(0, 3).join(' | ')}</small>
            </button>
          `).join('')}
        </section>
      </main>
    </div>
  `;

  document.querySelectorAll('[data-position-id]').forEach((button) => {
    button.addEventListener('click', () => setPosition(button.dataset.positionId));
  });
  document.querySelectorAll('[data-edit-profile]').forEach((button) => {
    button.addEventListener('click', openProfileEditor);
  });
}

function renderShell(content) {
  const current = navItems.find(([id]) => id === activePage) || navItems[0];
  const currentPosition = getSelectedPosition();
  app.innerHTML = `
    <div class="app" style="${positionThemeVars(currentPosition?.id)}">
      <aside class="sidebar">
        <div class="brand">
          <div class="brand-mark" aria-hidden="true"><img src="/assets/site-icon-192.png" alt="" /></div>
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
            <p>Foco atual: exercicios individuais com material simples e criterios claros.</p>
          </div>
          <div class="top-actions">
            <span class="pill active">${currentPosition?.name || 'Sem posicao'}</span>
            <span class="pill">${labelForOption('time', athleteProfile.time)}</span>
            <span class="pill">Dados locais</span>
            <button class="pill position-switch" type="button" data-edit-profile>Editar perfil</button>
            <button class="pill position-switch" type="button" data-change-position>Trocar posicao</button>
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
  const physicalSessions = sessions.filter((session) => session.style === 'Fisico');
  const technicalSessions = sessions.filter((session) => session.style === 'Tecnico');
  const physicalScore = physicalSessions.length
    ? physicalSessions.reduce((sum, session) => sum + session.quality, 0) / physicalSessions.length
    : 0;
  const technicalScore = technicalSessions.length
    ? technicalSessions.reduce((sum, session) => sum + session.quality, 0) / technicalSessions.length
    : 0;
  const fundamentalScore = fundamentals.length
    ? fundamentals.reduce((sum, item) => sum + item.score, 0) / fundamentals.length
    : 0;
  const totalSessions = sessions.length;
  const totalFundamentals = fundamentals.length;
  const bestFundamental = fundamentals.reduce((best, item) => (item.score > best.score ? item : best), fundamentals[0]);
  const statusSummary = totalSessions
    ? 'Treinos registrados e prontos para comparar evolucao.'
    : 'Ainda sem treinos registrados nesta base local.';

  const indicators = [
    {
      label: 'Fisico',
      value: physicalScore,
      detail: `${physicalSessions.length} treinos fisicos registrados`,
      color: 'var(--green)',
    },
    {
      label: 'Tecnico',
      value: technicalScore,
      detail: `${technicalSessions.length} treinos tecnicos registrados`,
      color: 'var(--teal)',
    },
    {
      label: 'Fundamento',
      value: fundamentalScore,
      detail: 'media geral dos fundamentos',
      color: 'var(--amber)',
    },
  ];
  const progressRows = [
    ['Treinos registrados', totalSessions, 'sessoes salvas no app'],
    ['Fundamentos monitorados', currentPosition?.fundamentals.length || totalFundamentals, currentPosition?.fundamentals.join(', ') || 'saque, recepcao, levantamento, ataque, bloqueio e defesa'],
    ['Melhor fundamento', bestFundamental?.name || 'Sem dado', `${(bestFundamental?.score || 0).toFixed(1)} de 10`],
    ['Status atual', totalSessions ? 'Em acompanhamento' : 'Sem registro', statusSummary],
  ];

  renderShell(`
    <div class="content-inner stack">
      <section class="hero">
        <img src="/assets/home-training-court.webp" alt="" aria-hidden="true" />
        <div class="hero-content">
          <div>
            <p class="eyebrow">Status da atleta</p>
            <h2>Seu plano individual como ${currentPosition?.name || 'atleta'}.</h2>
            <p class="hero-copy">
              ${currentPosition?.description || 'Esta tela mostra apenas como estao os registros, indicadores e fundamentos da pessoa que esta usando o app.'}
            </p>
            <div class="training-cycle status-cycle" aria-label="Resumo do progresso atual">
              <div class="cycle-item"><strong>${totalSessions}</strong><span>treinos registrados</span></div>
              <div class="cycle-item"><strong>${labelForOption('levels', athleteProfile.level)}</strong><span>nivel informado</span></div>
              <div class="cycle-item"><strong>${dose.duration}</strong><span>dose por treino</span></div>
              <div class="cycle-item"><strong>${fundamentalScore.toFixed(1)}</strong><span>media dos fundamentos</span></div>
            </div>
          </div>
          <div class="progress-snapshot">
            <p class="metric-label">Resumo local</p>
            <strong>${totalSessions ? 'Com dados' : 'Sem dados'}</strong>
            <span>${statusSummary}</span>
            <div class="indicator-track"><span style="width:${Math.min(100, totalSessions * 20)}%"></span></div>
          </div>
        </div>
      </section>

      <div class="dashboard-grid">
        <div class="stack">
          <section class="dashboard-indicators">
            ${indicators.map((indicator) => `
              <article class="dashboard-indicator-card" style="--indicator-color:${indicator.color}">
                <div class="dashboard-indicator-top">
                  <p class="metric-label">${indicator.label}</p>
                  <span class="indicator-status">0-10</span>
                </div>
                <strong>${indicator.value.toFixed(1)}</strong>
                <div class="indicator-track">
                  <span style="width:${indicator.value * 10}%"></span>
                </div>
                <p>${indicator.detail}</p>
              </article>
            `).join('')}
          </section>

          <section class="panel">
            <div class="panel-header">
              <div>
                <h3>Foco da posicao</h3>
                <p class="panel-subtitle">Conteudo filtrado pela funcao escolhida na entrada do app.</p>
              </div>
            </div>
            <div class="panel-body progress-row-list">
              ${progressRows.map(([label, value, detail]) => `
                <article class="progress-row">
                  <div>
                    <h4>${label}</h4>
                    <p>${detail}</p>
                  </div>
                  <strong>${value}</strong>
                </article>
              `).join('')}
            </div>
          </section>

          <section class="panel">
            <div class="panel-header">
              <div>
                <h3>Ajustes do perfil</h3>
                <p class="panel-subtitle">Esses dados mudam dose, cuidados e prioridade do plano.</p>
              </div>
              <button class="btn-ghost" data-edit-profile>Editar perfil</button>
            </div>
            <div class="panel-body profile-mini-grid">
              ${profileSummaryItems().map(([label, value]) => `<span><strong>${label}</strong>${value}</span>`).join('')}
              <span><strong>Cuidados</strong>${profileSafetyNote()}</span>
            </div>
          </section>

          <section class="panel">
            <div class="panel-header">
              <div>
                <h3>Plano semanal sugerido</h3>
                <p class="panel-subtitle">Semana inicial para treinar sozinha em casa, com dados ainda zerados.</p>
              </div>
              <button class="btn-ghost" data-page="treinos">Ver plano completo</button>
            </div>
            <div class="panel-body weekly-plan-grid">
              ${(currentPosition?.weeklyPlan || []).slice(0, 4).map(([day, focus, task]) => `
                <article class="weekly-plan-card">
                  <div class="weekly-plan-top"><h4>${focus}</h4><time>${day}</time></div>
                  <strong>${task}</strong>
                </article>
              `).join('')}
            </div>
          </section>
        </div>

        <aside class="panel home-court-card">
          <div class="panel-header">
            <div>
              <h3>Fundamentos da posicao</h3>
              <p class="panel-subtitle">Prioridades para ${currentPosition?.name || 'esta posicao'}.</p>
            </div>
          </div>
          <div class="home-court-visual" aria-hidden="true">
            <span class="target-wall"></span>
            <span class="court-target"></span>
            <span class="court-player"></span>
          </div>
          <div class="panel-body stack">
            ${(currentPosition?.fundamentals || []).map((fundamental) => `
              <div class="fundamental-status-row">
                <span>${fundamental}</span>
                <div class="indicator-track"><span style="width:0%"></span></div>
                <strong>0.0</strong>
              </div>
            `).join('')}
          </div>
        </aside>
      </div>
    </div>
  `);
}

function renderTrainingPage() {
  const currentPosition = getSelectedPosition();
  const dose = profileTrainingDose();
  const objectiveLabel = labelForOption('objectives', athleteProfile.objective);
  const personalizationCriteria = [
    ['Objetivo', objectiveLabel],
    ['Estagio', 'Iniciante, medio ou avancado mudam volume, ritmo e criterio.'],
    ['Posicao', `${currentPosition?.name || 'Posicao'} define fundamentos, leitura e exercicios principais.`],
  ];
  const weeklyPlan = (currentPosition?.weeklyPlan || []).map(([day, focus, task]) => [
    day,
    focus,
    focus === 'Fisico' ? 'Fisico' : focus === 'Revisao' ? 'Revisao' : focus === 'Recuperacao' ? 'Recuperacao' : 'Tecnico',
    task,
    focus === 'Recuperacao' ? '15 min' : focus === 'Revisao' ? '20 min' : dose.duration,
  ]);
  const weekSummary = [
    ['Posicao', currentPosition?.name || 'Nao escolhida'],
    ['Objetivo', objectiveLabel],
    ['Fisico', '1 dia'],
    ['Dados', '0 registros'],
  ];
  renderShell(`
    <div class="content-inner stack">
      <section class="panel">
        <div class="panel-header">
          <div>
            <h3>Plano personalizado de treino</h3>
            <p class="panel-subtitle">Semana sugerida para ${currentPosition?.name || 'a posicao escolhida'}, com exercicios individuais e em casa.</p>
          </div>
          <span class="pill active">${currentPosition?.name || 'posicao'}</span>
        </div>
        <div class="panel-body session-plan-grid">
          ${personalizationCriteria.map(([title, detail], index) => `
            <article class="session-step-card">
              <span class="session-step-number">${index + 1}</span>
              <div>
                <h4>${title}</h4>
                <p>${detail}</p>
              </div>
            </article>
          `).join('')}
        </div>
      </section>

      <div class="form-grid">
        <section class="panel">
          <div class="panel-header">
            <div>
              <h3>Semana personalizada</h3>
              <p class="panel-subtitle">Modelo de organizacao: cada dia tem um foco principal para a atleta acompanhar sem confusao.</p>
            </div>
          </div>
          <div class="panel-body">
            <div class="weekly-plan-grid">
              ${weeklyPlan.map(([day, focus, type, detail, duration]) => `
                <article class="weekly-plan-card">
                  <div class="weekly-plan-top">
                    <span class="tag">${type}</span>
                    <time>${duration}</time>
                  </div>
                  <h4>${day}</h4>
                  <strong>${focus}</strong>
                  <p>${detail}</p>
                </article>
              `).join('')}
            </div>
          </div>
        </section>

        <aside class="panel">
          <div class="panel-header"><h3>Resumo da semana</h3><span class="pill active">organizacao</span></div>
          <div class="panel-body stack">
            <div class="dose-grid" aria-label="Dose simples do treino">
              ${weekSummary.map(([label, value]) => `<div class="dose-box"><span class="metric-label">${label}</span><strong>${value}</strong></div>`).join('')}
            </div>
            <article class="note-box">
              <p><strong style="color:white">Dose do perfil</strong></p>
              <p>${dose.series}: ${dose.note}</p>
            </article>
            <article class="note-box">
              <p><strong style="color:white">Cuidados</strong></p>
              <p>${profileSafetyNote()}</p>
            </article>
          </div>
        </aside>
      </div>
    </div>
  `);
}

function renderPhysicalMobilityPage() {
  const currentPosition = getSelectedPosition();
  const dose = profileTrainingDose();
  const physicalBlocks = getPositionPhysicalTraining(currentPosition);
  renderShell(`
    <div class="content-inner stack">
      <section class="panel physical-training-panel">
        <div class="panel-header">
          <div>
            <h3>Fisico e Mobilidade para ${currentPosition?.name || 'sua posicao'}</h3>
            <p class="panel-subtitle">Blocos ajustados pelo perfil: ${dose.duration} por treino, com cuidado para dores e limitacoes informadas.</p>
          </div>
          <span class="pill active">${dose.series}</span>
        </div>
        <div class="panel-body position-profile-grid">
          ${(currentPosition?.physicalFocus || []).map((item) => `
            <article><span class="metric-label">Foco fisico da posicao</span><div class="content-list compact"><p>${item}</p></div></article>
          `).join('')}
          <article><span class="metric-label">Cuidado do perfil</span><div class="content-list compact"><p>${profileSafetyNote()}</p></div></article>
        </div>
        <div class="panel-body physical-training-grid">
          ${physicalBlocks.map((exercise) => `
            <article class="exercise-library-card physical-training-card">
              <div class="exercise-card-top">
                <span class="tag">${exercise.focus}</span>
                <span class="metric-label">${exercise.duration}</span>
              </div>
              <h3>${exercise.title}</h3>
              <p class="exercise-objective">${exercise.objective}</p>
              <div class="exercise-meta-grid">
                <div><span class="metric-label">Formato</span><strong>Individual em casa</strong></div>
                <div><span class="metric-label">Material</span><strong>${exercise.materials}</strong></div>
              </div>
              <div class="exercise-detail">
                <span class="metric-label">Como fazer em casa</span>
                <p>${exercise.setup}</p>
              </div>
              <div class="exercise-detail">
                <span class="metric-label">Mobilidade antes</span>
                <p>${exercise.mobility}</p>
              </div>
              <div class="physical-card-split">
                <div class="exercise-detail">
                  <span class="metric-label">Variacoes</span>
                  <ul>${exercise.variations.map((variation) => `<li>${variation}</li>`).join('')}</ul>
                </div>
                <div class="exercise-rest">
                  <span class="metric-label">Descanso</span>
                  <p>${exercise.rest}</p>
                </div>
              </div>
              <div class="exercise-metric">
                <span class="metric-label">Metrica</span>
                <p>${exercise.metric}</p>
              </div>
              <p class="exercise-evidence">${exercise.evidence}</p>
            </article>
          `).join('')}
        </div>
      </section>

      <section class="panel">
        <div class="panel-header">
          <div>
            <h3>Mobilidade antes do treino</h3>
            <p class="panel-subtitle">Preparacao curta para executar antes do bloco fisico ou antes de treino tecnico mais intenso.</p>
          </div>
        </div>
        <div class="panel-body mobility-list">
          ${mobilityPrep.map(([area, drill, dose, reason]) => `
            <article class="mobility-card">
              <div><strong>${area}</strong><span>${dose}</span></div>
              <p>${drill}</p>
              <small>${reason}</small>
            </article>
          `).join('')}
        </div>
      </section>
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
            <h3>Posicoes do volei</h3>
            <p class="panel-subtitle">Cada aba mostra a decisao principal, os indicadores e as evidencias que fazem sentido para a funcao.</p>
          </div>
          <span class="pill active">${positionDecisionGuides.length} funcoes</span>
        </div>
        <div class="panel-body">
          <div class="position-tab-strip" role="tablist" aria-label="Escolher posicao">
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
                  <p class="metric-label">Funcao em quadra</p>
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
                <span class="metric-label">Melhor decisao</span>
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
          <div class="panel-header"><div><h3>Treino por estilo</h3><p class="panel-subtitle">A mesma posicao precisa de tecnica, leitura e fisico.</p></div></div>
          <div class="panel-body position-training-cards">
            ${guide.trainingTabs.map(([label, focus, drill]) => `
              <article class="position-training-card">
                <span class="tag">${label}</span>
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
              ${guide.keyFundamentals.map((fundamental) => `<span>${fundamental}</span>`).join('')}
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
            <h3>Exercicios especificos em casa</h3>
            <p class="panel-subtitle">Blocos adaptados para treinar a funcao sem rede, sem equipe e com material simples.</p>
          </div>
          <span class="pill active">${positionExercises.length} da posicao</span>
        </div>
        <div class="panel-body position-home-exercise-grid">
          ${positionExercises.map((exercise) => `
            <article>
              <div class="exercise-card-top">
                <span class="tag">${exercise.fundamental}</span>
                <span class="metric-label">${exercise.duration}</span>
              </div>
              <h4>${exercise.title}</h4>
              <p>${exercise.objective}</p>
              <div class="exercise-detail">
                <span class="metric-label">Como fazer em casa</span>
                <p>${exercise.setup}</p>
              </div>
              <div class="exercise-metric">
                <span class="metric-label">Metrica</span>
                <p>${exercise.metric}</p>
              </div>
            </article>
          `).join('')}
        </div>
      </section>

      <section class="panel">
        <div class="panel-header">
          <div>
            <h3>Evidencias para relatorio</h3>
            <p class="panel-subtitle">Detalhes observaveis para transformar treino em conclusao util.</p>
          </div>
          <button class="btn-primary" type="button" data-page="exercicios">${selectedExerciseCount} exercicios</button>
        </div>
        <div class="panel-body position-evidence-grid">
          ${guide.evidence.map((item) => `<article><span class="tag">evidencia</span><p>${item}</p></article>`).join('')}
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
  renderShell(`
    <div class="stack">
      <section class="panel">
        <div class="panel-header">
          <div>
            <h3>Ciclo de evidencia para ${currentPosition?.name || 'sua posicao'}</h3>
            <p class="panel-subtitle">Feche o treino individual com fundamento, criterio e proxima correcao.</p>
          </div>
          <span class="pill active">manual</span>
        </div>
        <div class="panel-body evidence-strip">
          <div class="evidence-step"><strong>Treino</strong><span>O que foi feito e por quanto tempo.</span></div>
          <div class="evidence-step"><strong>Evidencia</strong><span>O que voce mediu ou observou.</span></div>
          <div class="evidence-step"><strong>Correcao</strong><span>Uma prioridade tecnica clara.</span></div>
          <div class="evidence-step"><strong>Evolucao</strong><span>Proxima acao comparavel.</span></div>
        </div>
      </section>

      <div class="form-grid">
        <section class="panel">
          <div class="panel-header"><h3>Relatorio individual</h3><button class="btn-primary" id="save-report">Salvar evidencia</button></div>
          <div class="panel-body stack">
            <div class="exercise-meta-grid">
              <label>
                <span class="metric-label">Fundamento</span>
                <select id="report-fundamental">
                  ${reportFundamentals.map((name) => `<option value="${name}" ${reportFundamental === name ? 'selected' : ''}>${name}</option>`).join('')}
                </select>
              </label>
              <label>
                <span class="metric-label">Exercicio em casa</span>
                <select id="report-exercise">
                  ${reportExerciseOptions.map((exercise) => `<option value="${exercise.title}" ${reportExercise === exercise.title ? 'selected' : ''}>${exercise.title}</option>`).join('')}
                </select>
              </label>
            </div>
            <label><span class="metric-label">Resumo do treino</span><textarea id="report-note">${reportNote}</textarea></label>
            <label><span class="metric-label">Evidencia medida</span><textarea id="report-evidence" placeholder="Ex.: 18 acertos no alvo em 30 tentativas; perdi controle nas bolas mais baixas.">${reportEvidence}</textarea></label>
            <div class="exercise-meta-grid">
              <label><span class="metric-label">Pontos positivos</span><textarea id="report-positive">${reportPositive}</textarea></label>
              <label><span class="metric-label">Correcao principal</span><textarea id="report-correction">${reportCorrection}</textarea></label>
            </div>
            <label><span class="metric-label">Proximo treino</span><textarea id="report-next" placeholder="Ex.: repetir manchete na parede com alvo mais baixo e filmar 3 series.">${reportNext}</textarea></label>
          </div>
        </section>
        <section class="panel">
          <div class="panel-header"><h3>Rascunho salvo</h3></div>
          <div class="panel-body stack">
            ${hasDraft ? `
              <article class="report-card">
                <h4>${reportFundamental} - ${reportExercise}</h4>
                <p>${reportEvidence || reportNote || 'Evidencia ainda sem texto.'}</p>
                <span class="badge">Rascunho local</span>
              </article>
              <article class="note-box"><p><strong style="color:white">Proxima correcao</strong></p><p>${reportCorrection || 'Defina uma correcao principal para o proximo treino.'}</p></article>
            ` : '<article class="report-card"><h4>Nenhum relatorio</h4><p>Crie seu primeiro registro quando terminar um exercicio em casa.</p></article>'}
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
    ['Leitura', 'Tatico', currentPosition?.gameReading[0] || 'Marque decisao, zona e proxima acao.'],
    ['Corpo', 'Fisico', currentPosition?.physicalFocus[0] || 'Use toalha, fita no chao e controle de aterrissagem.'],
    ['Mental', 'Tecnico', currentPosition?.mentalFocus[0] || 'Escolha um fundamento e uma metrica simples.'],
  ];
  renderShell(`
    <div class="content-inner stack">
      <section class="panel style-hero-panel">
        <div class="panel-header">
          <div>
            <h3>Estilos de treino em casa</h3>
            <p class="panel-subtitle">Escolha o tipo de sessao pelo objetivo do dia e pela posicao ${currentPosition?.name || 'selecionada'}.</p>
          </div>
          <button class="btn-primary" data-page="treinos">Montar plano</button>
        </div>
        <div class="panel-body style-choice-strip" aria-label="Como escolher o estilo de treino">
          ${choiceGuide.map(([context, style, detail]) => `
            <article class="style-choice-card">
              <span class="metric-label">${context}</span>
              <strong>${style}</strong>
              <p>${detail}</p>
            </article>
          `).join('')}
        </div>
      </section>

      <section class="style-route-grid" aria-label="Roteiros por estilo de treino">
        ${styleGuides.map((guide) => `
          <article class="style-route-card">
            <div class="style-route-top">
              <span class="tag">${guide.name}</span>
              <span class="metric-label">${guide.dose}</span>
            </div>
            <h3>${guide.focus}</h3>
            <p>${guide.activities}</p>
            <div class="style-evidence-grid">
              <div><span class="metric-label">Evidencia</span><strong>${guide.evidence}</strong></div>
              <div><span class="metric-label">Cuidado</span><strong>${guide.caution}</strong></div>
              <div><span class="metric-label">Exercicio base</span><strong>${guide.exercise}</strong></div>
              <div><span class="metric-label">Metrica</span><strong>${guide.metric}</strong></div>
            </div>
          </article>
        `).join('')}
      </section>

      <section class="position-detail-grid" aria-label="Focos especificos da posicao">
        <article class="panel">
          <div class="panel-header"><div><h3>Leitura de jogo</h3><p class="panel-subtitle">${currentPosition?.name || 'Posicao atual'}</p></div></div>
          <div class="panel-body content-list">${(currentPosition?.gameReading || []).map((item) => `<p>${item}</p>`).join('')}</div>
        </article>
        <article class="panel">
          <div class="panel-header"><div><h3>Foco fisico</h3><p class="panel-subtitle">Preparacao para treinar em casa</p></div></div>
          <div class="panel-body content-list">${(currentPosition?.physicalFocus || []).map((item) => `<p>${item}</p>`).join('')}</div>
        </article>
        <article class="panel">
          <div class="panel-header"><div><h3>Foco mental</h3><p class="panel-subtitle">Criterios para decidir melhor</p></div></div>
          <div class="panel-body content-list">${(currentPosition?.mentalFocus || []).map((item) => `<p>${item}</p>`).join('')}</div>
        </article>
      </section>
    </div>
  `);
}

function renderExerciseLibraryPage() {
  const currentPosition = getSelectedPosition();
  const positionExercises = [...(currentPosition?.homeExercises || []), ...sharedServeDefenseFocus.exercises];
  const options = ['Todos', ...new Set(positionExercises.map((item) => item.fundamental))];
  if (!options.includes(selectedFundamental)) selectedFundamental = 'Todos';
  const visible = selectedFundamental === 'Todos'
    ? positionExercises
    : positionExercises.filter((exercise) => exercise.fundamental === selectedFundamental);

  renderShell(`
    <div class="stack">
      <section class="panel">
        <div class="panel-header">
          <div>
            <h3>Exercicios em casa para ${currentPosition?.name || 'sua posicao'}</h3>
            <p class="panel-subtitle">Apenas exercicios individuais, possiveis dentro de casa, filtrados pela posicao escolhida.</p>
          </div>
          <span class="pill active">${visible.length} exercicios</span>
        </div>
        <div class="panel-body">
          <div class="filters library-filters" role="group" aria-label="Filtrar exercicios por fundamento">
            ${options.map((fundamental) => `<button data-fundamental="${fundamental}" class="${selectedFundamental === fundamental ? 'active' : ''}" aria-pressed="${selectedFundamental === fundamental}">${fundamental}</button>`).join('')}
          </div>
          <article class="note-box position-common-note">
            <p><strong style="color:white">${sharedServeDefenseFocus.title}</strong></p>
            <p>${sharedServeDefenseFocus.description}</p>
          </article>
          <article class="note-box position-common-note">
            <p><strong style="color:white">Ajuste pelo seu perfil</strong></p>
            <p>${profileSafetyNote()}</p>
          </article>
        </div>
      </section>

      <section class="exercise-library-grid">
        ${visible.map((exercise) => `
          <article class="exercise-library-card">
            <div class="exercise-card-top">
              <span class="tag">${exercise.fundamental}</span>
              <span class="metric-label">${exercise.duration}</span>
            </div>
            <h3>${exercise.title}</h3>
            <p class="exercise-objective">${exercise.objective}</p>
            <div class="exercise-meta-grid">
              <div><span class="metric-label">Ambiente</span><strong>${exercise.environment}</strong></div>
              <div><span class="metric-label">Material</span><strong>${exercise.materials}</strong></div>
            </div>
            <div class="exercise-detail">
              <span class="metric-label">Como fazer em casa</span>
              <p>${exercise.setup}</p>
            </div>
            <div class="exercise-detail">
              <span class="metric-label">Variacoes</span>
              <ul>${exercise.variations.map((variation) => `<li>${variation}</li>`).join('')}</ul>
            </div>
            <div class="exercise-metric">
              <span class="metric-label">Metrica</span>
              <p>${exercise.metric}</p>
            </div>
          </article>
        `).join('')}
      </section>
    </div>
  `);

  document.querySelectorAll('[data-fundamental]').forEach((button) => {
    button.addEventListener('click', () => setFundamental(button.dataset.fundamental));
  });
}

function renderIndividualPage() {
  const currentPosition = getSelectedPosition();
  const emptyCorrections = correctionPlaybook.slice(0, 3);
  const decisionSteps = [
    ['Ver', 'Qual detalhe tecnico apareceu no treino ou video?'],
    ['Escolher', 'Corrija uma coisa por vez, com prioridade clara.'],
    ['Medir', 'Defina uma metrica que caiba em casa.'],
  ];
  renderShell(`
    <div class="content-inner stack">
      <section class="panel">
        <div class="panel-header">
          <div>
            <h3>Correcoes individuais para ${currentPosition?.name || 'sua posicao'}</h3>
            <p class="panel-subtitle">Transforme erro observado em uma prioridade pequena, treinavel e mensuravel.</p>
          </div>
          <button class="btn-primary" data-page="relatorios">Registrar evidencia</button>
        </div>
        <div class="panel-body correction-flow" aria-label="Fluxo para escolher uma correcao">
          ${decisionSteps.map(([title, detail], index) => `
            <article class="correction-flow-step">
              <span class="session-step-number">${index + 1}</span>
              <div><h4>${title}</h4><p>${detail}</p></div>
            </article>
          `).join('')}
        </div>
      </section>

      <section class="position-profile-panel panel">
        <div class="panel-header">
          <div>
            <h3>Ficha da posicao</h3>
            <p class="panel-subtitle">${currentPosition?.description || ''}</p>
          </div>
          <span class="pill active">dados zerados</span>
        </div>
        <div class="panel-body position-profile-grid">
          <article>
            <span class="metric-label">Fundamentos principais</span>
            <div class="content-list compact">${(currentPosition?.fundamentals || []).map((item) => `<p>${item}</p>`).join('')}</div>
          </article>
          <article>
            <span class="metric-label">Leitura de jogo</span>
            <div class="content-list compact">${(currentPosition?.gameReading || []).map((item) => `<p>${item}</p>`).join('')}</div>
          </article>
          <article>
            <span class="metric-label">Foco fisico</span>
            <div class="content-list compact">${(currentPosition?.physicalFocus || []).map((item) => `<p>${item}</p>`).join('')}</div>
          </article>
          <article>
            <span class="metric-label">Foco mental</span>
            <div class="content-list compact">${(currentPosition?.mentalFocus || []).map((item) => `<p>${item}</p>`).join('')}</div>
          </article>
        </div>
      </section>

      <section class="correction-board-grid" aria-label="Playbook de correcoes sugeridas">
        ${correctionPlaybook.map((item) => `
          <article class="correction-card">
            <div class="correction-card-top">
              <span class="tag">${item.fundamental}</span>
              <div class="correction-badges">${badge(item.priority)}<span class="badge">${item.status}</span></div>
            </div>
            <h3>${item.correction}</h3>
            <p>${item.signal}</p>
            <div class="correction-meta-grid">
              <div><span class="metric-label">Observado em</span><strong>${item.observed}</strong></div>
              <div><span class="metric-label">Exercicio</span><strong>${item.drill}</strong></div>
              <div><span class="metric-label">Meta</span><strong>${item.metric}</strong></div>
              <div><span class="metric-label">Proxima repeticao</span><strong>${item.next}</strong></div>
            </div>
          </article>
        `).join('')}
      </section>

      <section class="panel">
        <div class="panel-header">
          <div>
            <h3>Historico real</h3>
            <p class="panel-subtitle">Ainda nao ha correcoes salvas. Os cards acima sao modelos para orientar o primeiro registro.</p>
          </div>
          <button class="btn-ghost" data-page="exercicios">Abrir exercicios</button>
        </div>
        <div class="panel-body empty-corrections-grid">
          ${emptyCorrections.map((item) => `
            <article class="note-box">
              <p><strong style="color:white">${item.fundamental}</strong></p>
              <p>Modelo: ${item.correction}</p>
            </article>
          `).join('')}
        </div>
      </section>
    </div>
  `);
}

function renderIndicatorsPage() {
  const currentPosition = getSelectedPosition();
  const positionFundamentals = currentPosition?.fundamentals || fundamentals.map((item) => item.name);
  const criteria = [
    ['Controle', 'A bola chega no alvo combinado?', 'Conte acertos e perdas por serie.'],
    ['Tecnica', 'O gesto manteve base, braco ou plataforma?', 'Compare um detalhe por treino.'],
    ['Consistencia', 'A execucao se repete sem perder qualidade?', 'Use a melhor sequencia da sessao.'],
  ];
  renderShell(`
    <div class="content-inner stack">
      <section class="panel evolution-hero">
        <div class="panel-header">
          <div>
            <h3>Evolucao por criterio</h3>
            <p class="panel-subtitle">Acompanhe ${currentPosition?.name || 'sua posicao'} pelo que da para observar, medir e repetir.</p>
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
            <h3>Tabela de fundamentos da posicao</h3>
            <p class="panel-subtitle">Notas comecam zeradas ate existirem registros manuais comparaveis.</p>
          </div>
        </div>
        <div class="panel-body fund-grid">${positionFundamentals.map((name, index) => `<article class="fund-card"><div class="fund-top"><h4>${name}</h4><strong>0.0</strong></div><span class="metric-label">0 registros manuais</span><div class="bar"><span style="width:0%;background:${fundamentals[index % fundamentals.length]?.color || 'var(--teal)'}"></span></div><p class="fund-hint">Registre evidencia para atualizar este fundamento.</p></article>`).join('')}</div>
      </section>

      <section class="panel">
        <div class="panel-header"><h3>Comparacao por treino</h3></div>
        <div class="panel-body" style="overflow-x:auto"><table><thead><tr><th class="table-head">Treino</th><th class="table-head">Estilo</th><th class="table-head">Minutos</th><th class="table-head">Qualidade</th><th class="table-head">Carga</th></tr></thead><tbody>${sessions.length ? sessions.map((session) => `<tr><td><strong>${session.title}</strong></td><td>${session.style}</td><td>${session.duration}</td><td class="score">${session.quality.toFixed(1)}</td><td>${badge(session.load)}</td></tr>`).join('') : '<tr><td colspan="5"><strong>Nenhum treino para comparar</strong><br><span class="muted">Os indicadores serao preenchidos apenas com seus dados.</span></td></tr>'}</tbody></table></div>
      </section>

      <section class="panel">
        <div class="panel-header"><h3>Mapa de referencia em quadra</h3><span class="pill active">apoio visual</span></div>
        <div class="panel-body positioning-grid">
          <div class="court-positioning">
            <img src="/assets/learning-volleyball-system.png" alt="Quadra usada como referencia visual para posicionamento" />
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
            <article class="note-box"><p><strong style="color:white">Uso no treino</strong></p><p>Use as zonas como linguagem: onde comecou, para onde mirou e qual movimento quer repetir.</p></article>
            <article class="note-box"><p><strong style="color:white">Dentro de casa</strong></p><p>Adapte a zona para parede, alvo no chao ou deslocamento curto. O criterio vale mais que o tamanho do espaco.</p></article>
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

  renderShell(`
    <div class="content-inner stack">
      <section class="panel game-reading-hero">
        <div class="game-reading-copy">
          <h3>Leitura de jogo para ${currentPosition?.name || 'sua posicao'}</h3>
          <p>${currentPosition?.gameReading?.[0] || 'Treinos para reconhecer padroes antes da bola chegar.'}</p>
        </div>
        <div class="game-reading-score">
          <span class="metric-label">Foco</span>
          <strong>${currentPosition?.fundamentals?.[0] || 'leitura'}</strong>
          <p>${currentPosition?.gameReading?.[1] || 'Hoje usamos cenas de exemplo. Depois entram videos curtos com perguntas.'}</p>
        </div>
      </section>

      <section class="position-detail-grid" aria-label="Leituras especificas da posicao">
        ${(currentPosition?.gameReading || []).map((item) => `
          <article class="panel">
            <div class="panel-header"><div><h3>Pista da posicao</h3><p class="panel-subtitle">${currentPosition?.name || 'Posicao'}</p></div></div>
            <div class="panel-body content-list"><p>${item}</p></div>
          </article>
        `).join('')}
      </section>

      <div class="form-grid">
        <section class="panel">
          <div class="panel-header">
            <div>
              <h3>Cena de decisao</h3>
              <p class="panel-subtitle">Assista ao contexto, leia os sinais e escolha a resposta.</p>
            </div>
            <span class="pill active">${scene.clip}</span>
          </div>
          <div class="panel-body game-reading-layout">
            <div class="simulated-video-frame realistic-scene-frame" aria-label="Clip realista de leitura de jogo">
              <figure class="reading-photo">
                <img src="${scene.image}" alt="${scene.imageAlt}" loading="eager">
                <figcaption>
                  <span>${scene.angle}</span>
                  <strong>${scene.fundamental}</strong>
                </figcaption>
              </figure>
              <div class="video-caption">
                <span>${scene.clip}</span>
                <strong>${scene.title}</strong>
              </div>
            </div>
            <div class="reading-question-card">
              <span class="metric-label">Pergunta</span>
              <h4>${scene.question}</h4>
              <div class="reading-options">
                ${scene.options.map((option) => `
                  <button class="${selectedReadingAnswer === option ? 'active' : ''}" data-reading-answer="${option}">
                    ${option}
                  </button>
                `).join('')}
              </div>
              <article class="note-box ${answered ? '' : 'muted-box'}">
                <p><strong style="color:white">${answered ? (isCorrect ? 'Boa leitura' : 'Revisar leitura') : 'Escolha uma resposta'}</strong></p>
                <p>${answered ? `Resposta esperada: ${scene.answer}. ${scene.decision}` : 'A resposta aparece aqui para comparar decisao e sinais da jogada.'}</p>
              </article>
            </div>
          </div>
        </section>

        <aside class="panel">
          <div class="panel-header"><h3>Cenas realistas</h3><span class="pill active">${gameReadingScenes.length} cenas</span></div>
          <div class="panel-body stack">
            ${gameReadingScenes.map((item) => `
              <button class="reading-scene-button ${item.id === scene.id ? 'active' : ''}" data-reading-scene="${item.id}">
                <span>${item.clip}</span>
                <strong>${item.title}</strong>
                <small>${item.angle}</small>
              </button>
            `).join('')}
          </div>
        </aside>
      </div>

      <div class="form-grid">
        <section class="panel">
          <div class="panel-header"><div><h3>Sinais para observar</h3><p class="panel-subtitle">O treino e aprender a ver pistas antes da acao terminar.</p></div></div>
          <div class="panel-body pattern-grid">
            ${gameReadingPatterns.map(([title, detail]) => `
              <article class="pattern-card">
                <h4>${title}</h4>
                <p>${detail}</p>
              </article>
            `).join('')}
          </div>
        </section>

        <aside class="panel">
          <div class="panel-header"><h3>Pistas desta cena</h3></div>
          <div class="panel-body stack">
            ${scene.cues.map((cue) => `<div class="action-item"><p><strong style="color:white">${cue}</strong><br>Sinal usado para decidir antes do ataque.</p><span class="tag">pista</span></div>`).join('')}
          </div>
        </aside>
      </div>
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
const videoValidationStorageKey = 'isa.videoValidationClips';

function safeVideoText(value) {
  return String(value ?? '').replace(/[&<>"']/g, (char) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
  })[char]);
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

function readVideoValidationClips() {
  return readVideoEvidenceList(videoValidationStorageKey);
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
    next = 'Usar em piloto controlado com revisao final da treinadora.';
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
      label: 'Revisao da treinadora',
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
      label: 'Revisao final da treinadora',
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
    const reviewedClips = clips.filter((clip) => clip.status === 'Revisado com treinadora').length;
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
        ? 'Rodar piloto controlado e manter revisao final da treinadora.'
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
    reviewRule: 'IA sugere evidencia. A treinadora valida criterio, fase do movimento e contexto antes do relatorio.',
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
    window.__isaLastVideoAnalysisMessage = 'Confirme a evidencia de IA antes de enviar para o relatorio.';
    renderAiVideosPage();
    return;
  }

  reportFundamental = item.fundamental;
  reportExercise = `Video - ${item.marker}`;
  reportNote = `${item.fundamental} - ${item.marker} (${item.timeRange}).`;
  reportEvidence = `${item.metric}: ${item.value}; confianca ${Math.round(item.confidence * 100)}%; fonte ${item.source}.`;
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
  if (!preview?.points?.length) return `<div class="pose-preview empty-preview"><span>${source}</span></div>`;

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
      <span>${source}</span>
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
    const reviewed = records.filter((clip) => clip.status === 'Revisado com treinadora');
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
        ? `Revisar mais ${missingReviewed} clips com a treinadora.`
        : 'Rodar MediaPipe ou Sports2D nesses clips e parear as checagens.';
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
      next = 'Usar em piloto controlado com revisao final da treinadora.';
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
          ${activeRows || '<article class="note-box"><p>Nenhum clip real registrado. Comece com 3 clips curtos do mesmo fundamento, camera parada e uma atleta principal.</p></article>'}
        </div>
        <div class="form-grid compact-form-grid">
          <div class="validation-form">
            <label><span class="metric-label">Atleta</span><input id="validation-athlete" value="Isa" /></label>
            <label><span class="metric-label">Fundamento</span><select id="validation-fundamental">${fundamentals.map((item) => `<option value="${item.name}">${item.name}</option>`).join('')}</select></label>
            <label><span class="metric-label">Fase do movimento</span><select id="validation-phase">${phaseSelectOptions('Saque', 'Contato')}</select></label>
            <label><span class="metric-label">Marcador do clip</span><input id="validation-marker" placeholder="Ex.: ponto de contato, plataforma, aterrissagem" /></label>
            <label><span class="metric-label">Status</span><select id="validation-status">
              <option>Gravado</option>
              <option>IA rodada</option>
              <option>Revisado com treinadora</option>
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
  const readyClips = manifest.clips.filter((clip) => ['Gravado', 'IA rodada', 'Revisado com treinadora'].includes(clip.status)).length;
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

function videoEvidenceCard(item, calibration = null) {
  const id = safeVideoText(item.id);
  const rawStatus = String(item.status || 'Revisar');
  const source = safeVideoText(item.source);
  const fundamental = safeVideoText(item.fundamental);
  const status = safeVideoText(rawStatus);
  const marker = safeVideoText(item.marker);
  const phase = safeVideoText(item.phase || defaultPhaseForEvidence(item.fundamental, item.marker));
  const metric = safeVideoText(item.metric);
  const value = safeVideoText(item.value);
  const athlete = safeVideoText(item.athlete);
  const timeRange = safeVideoText(item.timeRange);
  const reportUse = safeVideoText(item.reportUse);
  const nextAction = safeVideoText(item.nextAction);
  const metricTarget = item.metricTargets?.[0];
  const recommendedSource = metricTarget?.recommendedSource;
  const metricTargetBlock = metricTarget ? `
    <div class="video-metric-target-note">
      <p><strong>Alvo tecnico:</strong> ${safeVideoText(metricTarget.signal || metricTarget.metric)}</p>
      ${recommendedSource?.name ? `<p><strong>Fonte IA:</strong> ${safeVideoText(recommendedSource.name)} · ${safeVideoText(recommendedSource.status || recommendedSource.integrationMode || 'revisar')}</p>` : ''}
      <p>${safeVideoText(metricTarget.manualCheck || 'Parear com checagem manual antes do relatorio.')}</p>
    </div>
  ` : '';
  const needsReview = requiresVideoReview(item);
  const canUseInReport = !needsReview || rawStatus === 'Confirmada';
  const hasManualCalibration = Boolean(calibration?.manualByAiId?.has(item.id));
  const reviewActions = needsReview ? `
    <div class="video-review-actions" aria-label="Validacao da evidencia">
      <button class="btn-ghost" data-video-evidence-review="${id}" data-review-status="Confirmada" ${rawStatus === 'Confirmada' ? 'disabled' : ''}>Confirmar</button>
      <button class="btn-ghost danger-action" data-video-evidence-review="${id}" data-review-status="Descartada" ${rawStatus === 'Descartada' ? 'disabled' : ''}>Descartar</button>
      <button class="btn-ghost" data-video-evidence-calibrate="${id}" ${hasManualCalibration ? 'disabled' : ''}>${hasManualCalibration ? 'Checagem manual salva' : 'Registrar checagem manual'}</button>
    </div>
  ` : '';
  return `
    <article class="video-evidence-card">
      ${renderPosePreview(item, source)}
      <div class="video-evidence-details">
        <div class="exercise-card-top"><span class="tag">${fundamental}</span><span class="badge">${status}</span></div>
        <h4>${marker}</h4>
        <p>${metric}: ${value}</p>
        ${metricTargetBlock}
        <div class="video-evidence-meta"><span>${athlete}</span><span>${timeRange}</span><span>${phase}</span><span>${Math.round(item.confidence * 100)}% confianca</span></div>
        <p class="muted">${reportUse}</p>
        <p class="muted">Proxima acao: ${nextAction}</p>
        ${reviewActions}
        <button class="btn-ghost" data-video-evidence-id="${id}" ${canUseInReport ? '' : 'disabled'}>${canUseInReport ? 'Usar no relatorio' : 'Confirme para relatorio'}</button>
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
  status.textContent = 'Carregando MediaPipe Pose Landmarker...';
  try {
    await getPoseLandmarker();
    status.textContent = 'MediaPipe carregado. Proximo passo: validar a pose frame a frame com um video real da atleta.';
  } catch (error) {
    status.textContent = error instanceof Error ? error.message : 'Nao foi possivel carregar o MediaPipe.';
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

function createEvidenceFromPoseSamples(samples, athlete, fundamental, durationSeconds) {
  const validSamples = samples.filter((sample) => sample.landmarks?.length);
  if (!validSamples.length) {
    throw new Error('MediaPipe nao encontrou uma pose confiavel nesse clipe. Tente camera parada, corpo inteiro e boa luz.');
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
    posePreview: posePreviewFromLandmarks(best.landmarks, armFocus, best.frameImage || ''),
  }];
}

async function analyzeTrainingVideo({ file, athlete, fundamental, onProgress }) {
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

    return createEvidenceFromPoseSamples(samples, athlete, fundamental, durationSeconds);
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

async function runVideoAnalysis({ file, athlete, fundamental, status, button }) {
  button.disabled = true;
  status.textContent = 'Preparando analise local do clipe...';
  try {
    const generated = await analyzeTrainingVideo({
      file,
      athlete,
      fundamental,
      onProgress: (progress) => {
        status.textContent = `Analisando pose no video: ${Math.round(progress * 100)}%.`;
      },
    });
    if (!Array.isArray(generated) || !generated.length) {
      throw new Error('A analise terminou sem gerar evidencia revisavel.');
    }
    localStorage.setItem(localVideoEvidenceStorageKey, JSON.stringify(generated));
    if (!readLocalVideoEvidence().length) {
      throw new Error('A evidencia foi gerada, mas nao foi salva no navegador.');
    }
    window.__isaLastVideoAnalysisMessage = `Evidencia MediaPipe gerada: ${generated[0].marker}. Revise antes de usar no relatorio.`;
    renderAiVideosPage();
  } catch (error) {
    status.textContent = error instanceof Error ? error.message : 'Nao foi possivel analisar o video com MediaPipe.';
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
      fundamental: document.querySelector('#mediapipe-fundamental')?.value || 'Saque',
      status,
      button,
    });
  } catch (error) {
    status.textContent = error instanceof Error ? error.message : 'Nao foi possivel carregar o demo Sports2D.';
    button.disabled = false;
  }
}

function renderVideosPage() {
  const currentPosition = getSelectedPosition();
  const markers = getPositionVideoMarkers(currentPosition);
  const timeline = [
    ['00:00', 'Preparar', 'Nomeie fundamento, objetivo e criterio antes de assistir.'],
    ['00:04', 'Pausar', 'Congele o momento em que aparece contato, base ou deslocamento.'],
    ['00:08', 'Marcar', 'Anote tempo, evidencia observada e proxima repeticao.'],
  ];
  const evidence = [
    ...readLocalVideoEvidence(),
    ...readImportedVideoEvidence(),
    ...readManualVideoEvidence(),
    {
      id: 'manual-saque-demo',
      source: 'Manual',
      fundamental: 'Saque',
      phase: 'Contato',
      athlete: 'Atleta exemplo',
      timeRange: '00:03 - 00:05',
      marker: 'Braco de contato',
      metric: 'Punho acima da linha do ombro',
      value: 'sim',
      confidence: 0.72,
      status: 'Revisar',
      reportUse: 'Usar como evidencia inicial e confirmar no frame pausado.',
      nextAction: 'Repetir com lancamento mais estavel e registrar acertos.',
    },
  ];
  const calibration = buildVideoCalibration(evidence);
  const validationClips = readVideoValidationClips();

  renderShell(`
    <div class="content-inner stack">
      <section class="video-evidence-hero">
        <img src="/assets/video-evidence-station.webp" alt="" aria-hidden="true" />
        <div class="video-evidence-content">
          <p class="eyebrow">Video, fundamento e evidencia</p>
          <h2>Assista, marque o momento e transforme em evidencia para ${currentPosition?.name || 'sua posicao'}.</h2>
          <p>Para treino individual em casa, o video serve como caderno visual: pausar, comparar criterio da posicao e decidir a proxima repeticao.</p>
          <div class="hero-actions">
            <button class="btn-primary" data-page="relatorios">Levar para relatorio</button>
            <button class="btn-ghost" data-page="exercicios">Ver exercicios relacionados</button>
          </div>
        </div>
      </section>

      <section class="panel">
        <div class="panel-header">
          <div><h3>Linha do tempo de revisao</h3><p class="panel-subtitle">Um jeito simples de transformar clip curto em decisao de treino.</p></div>
          <span class="pill active">${timeline.length} passos</span>
        </div>
        <div class="panel-body manual-timeline">
          ${timeline.map(([time, title, detail]) => `
            <article class="timeline-marker">
              <span class="timeline-time">${time}</span>
              <div><h4>${title}</h4><p>${detail}</p></div>
            </article>
          `).join('')}
        </div>
      </section>

      <div class="form-grid">
        <section class="panel">
          <div class="panel-header">
            <div><h3>Ficha de evidencia manual</h3><p class="panel-subtitle">Campos que deixam o video util para o relatorio.</p></div>
          </div>
          <div class="panel-body stack">
            <div class="video-pipeline-grid">
              ${[
                ['1', 'Tempo', 'Exemplo: 00:03 a 00:05.'],
                ['2', 'Criterio', 'O que precisa aparecer para considerar bom?'],
                ['3', 'Proxima acao', 'Qual repeticao ou ajuste vem depois?'],
              ].map(([number, title, detail]) => `<article class="video-step-card"><span>${number}</span><div><h4>${title}</h4><p>${detail}</p></div></article>`).join('')}
            </div>
            <article class="note-box"><p><strong style="color:white">Regra da fase atual</strong></p><p>Sem analise automatica nesta etapa. A atleta observa o clip, marca o criterio e usa o relatorio para evoluir.</p></article>
          </div>
        </section>
        <section class="panel">
          <div class="panel-header"><div><h3>O que marcar</h3><p class="panel-subtitle">Criterios tecnicos, nao efeitos visuais.</p></div></div>
          <div class="panel-body stack">
            ${markers.map(([name, marker]) => `
              <div class="action-item"><p><strong style="color:white">${name}</strong><br>${marker}</p><span class="tag">marcador</span></div>
            `).join('')}
          </div>
        </section>
      </div>

      <section class="panel">
        <div class="panel-header"><div><h3>Evidencias para relatorio</h3><p class="panel-subtitle">Cada card mantem fundamento, tempo e proxima acao.</p></div></div>
        <div class="panel-body video-evidence-grid">
          ${evidence.map(videoEvidenceCard).join('')}
        </div>
      </section>

      <div class="form-grid">
        <section class="panel">
          <div class="panel-header"><div><h3>Importar marcacoes revisadas</h3><p class="panel-subtitle">Opcional para quando uma ficha manual ja estiver em JSON.</p></div></div>
          <div class="panel-body stack">
            <textarea id="video-evidence-json" placeholder="Cole aqui uma lista de evidencias manuais revisadas."></textarea>
            <div class="video-button-row"><button class="btn-primary" id="import-video-evidence">Importar JSON</button><button class="btn-ghost" id="clear-video-evidence">Limpar evidencias locais</button></div>
            <article class="note-box" id="video-import-message" hidden><p></p></article>
          </div>
        </section>
        <section class="panel">
          <div class="panel-header"><div><h3>Como gravar em casa</h3><p class="panel-subtitle">Pouco equipamento, criterio bem definido.</p></div></div>
          <div class="panel-body stack">
            <div class="action-item"><p><strong style="color:white">Camera parada</strong><br>Apoie o celular e grave uma repeticao curta por fundamento.</p><span class="tag">base</span></div>
            <div class="action-item"><p><strong style="color:white">Um criterio por clip</strong><br>Escolha contato, plataforma, passada, base ou recuperacao.</p><span class="tag">foco</span></div>
            <div class="action-item"><p><strong style="color:white">Revisao rapida</strong><br>Pare no momento chave e leve so uma evidencia para o relatorio.</p><span class="tag">relatorio</span></div>
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
      messageText.textContent = error instanceof Error ? error.message : 'Nao foi possivel importar o JSON.';
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
  const markers = getPositionVideoMarkers(currentPosition);
  const analysisFundamentals = getPositionExerciseFundamentals(currentPosition);
  const evidence = [
    ...readLocalVideoEvidence(),
    ...readImportedVideoEvidence(),
    ...readManualVideoEvidence(),
    {
      id: 'manual-saque-demo',
      source: 'Manual',
      fundamental: 'Saque',
      phase: 'Contato',
      athlete: 'Atleta exemplo',
      timeRange: '00:03 - 00:05',
      marker: 'Braco de contato',
      metric: 'Punho acima da linha do ombro',
      value: 'sim',
      confidence: 0.72,
      status: 'Revisar',
      reportUse: 'Usar como evidencia inicial e confirmar no frame pausado.',
      nextAction: 'Repetir com lancamento mais estavel e registrar acertos.',
    },
  ];
  const calibration = buildVideoCalibration(evidence);
  const validationClips = readVideoValidationClips();

  renderShell(`
    <div class="content-inner stack">
      <section class="video-evidence-hero">
        <img src="/assets/video-evidence-station.webp" alt="" aria-hidden="true" />
        <div class="video-evidence-content">
          <p class="eyebrow">Video, movimento e evidencia</p>
          <h2>IA como assistente de revisao tecnica para ${currentPosition?.name || 'sua posicao'}.</h2>
          <p>O modelo sugere pontos do corpo e o app transforma isso em evidencia. A decisao final continua sendo tecnica: fundamento da posicao, marcador, confianca e proxima acao.</p>
          <div class="hero-actions">
            <button class="btn-primary" data-page="relatorios">Levar para relatorio</button>
            <button class="btn-ghost" data-page="exercicios">Ver exercicios relacionados</button>
          </div>
        </div>
      </section>

      <section class="panel">
        <div class="panel-header">
          <div><h3>Pipeline de analise</h3><p class="panel-subtitle">Primeiro evidencias confiaveis, depois automacoes maiores.</p></div>
          <span class="pill active">${evidence.length} evidencias</span>
        </div>
        <div class="panel-body video-pipeline-grid">
          ${[
            ['1', 'Video bruto', `Gravar ${analysisFundamentals.join(', ')} em angulo simples.`],
            ['2', 'Pontos do corpo', 'MediaPipe estima ombro, cotovelo, punho, quadril, joelho e tornozelo.'],
            ['3', 'Evidencia revisavel', 'Transformar achado em marcador, confianca e proxima acao.'],
          ].map(([number, title, detail]) => `<article class="video-step-card"><span>${number}</span><div><h4>${title}</h4><p>${detail}</p></div></article>`).join('')}
        </div>
      </section>

      <div class="form-grid">
        <section class="panel">
          <div class="panel-header"><div><h3>Analise local com MediaPipe</h3><p class="panel-subtitle">Valida o modelo no navegador antes de automatizar criterios.</p></div></div>
          <div class="panel-body stack">
            <div class="video-control-grid">
              <label><span class="metric-label">Video do treino</span><input id="mediapipe-video-file" type="file" accept="video/*" /></label>
              <label><span class="metric-label">Atleta</span><input id="mediapipe-athlete" value="Isa" /></label>
              <label><span class="metric-label">Fundamento</span><select id="mediapipe-fundamental">${analysisFundamentals.map((name) => `<option value="${name}">${name}</option>`).join('')}</select></label>
              <button class="btn-primary" id="run-mediapipe-analysis">Analisar pose</button>
            </div>
            <div class="video-button-row"><button class="btn-ghost" id="verify-mediapipe">Verificar MediaPipe</button><button class="btn-ghost" id="run-mediapipe-demo">Testar demo Sports2D</button></div>
            <article class="note-box"><p><strong style="color:white">Status</strong></p><p id="video-ai-status">${safeVideoText(window.__isaLastVideoAnalysisMessage || 'Selecione um video curto para testar pose local no navegador.')}</p></article>
          </div>
        </section>
        <section class="panel">
          <div class="panel-header"><div><h3>Marcadores tecnicos</h3><p class="panel-subtitle">Criterios que guiam IA e revisao manual.</p></div></div>
          <div class="panel-body stack">
            ${markers.map(([name, marker]) => `<div class="action-item"><p><strong style="color:white">${name}</strong><br>${marker}</p><span class="tag">marcador</span></div>`).join('')}
          </div>
        </section>
      </div>

      ${renderVideoMotionPhasePanel()}

      ${renderVideoMovementMetricMap()}

      ${renderVideoAiProjectMatrix()}

      <section class="panel">
        <div class="panel-header"><div><h3>Evidencias para relatorio</h3><p class="panel-subtitle">Cada card mantem origem, confianca e proxima acao.</p></div></div>
        <div class="panel-body video-evidence-grid">${evidence.map((item) => videoEvidenceCard(item, calibration)).join('')}</div>
      </section>

      ${renderVideoCalibrationPanel(calibration)}

      ${renderVideoValidationPanel(validationClips, calibration)}

      ${renderVideoClipManifestPanel(validationClips)}

      ${renderVideoPilotPackagePanel(calibration, validationClips)}

      <div class="form-grid">
        <section class="panel">
          <div class="panel-header"><div><h3>Importar evidencias normalizadas</h3><p class="panel-subtitle">Aceita a saida do contrato isa.video-evidence.v1.</p></div></div>
          <div class="panel-body stack">
            <textarea id="video-evidence-json" placeholder="Cole aqui a saida de npm run video:evidence ou de um normalizador equivalente."></textarea>
            <div class="video-button-row"><button class="btn-primary" id="import-video-evidence">Importar JSON</button><button class="btn-ghost" id="clear-video-evidence">Limpar evidencias importadas</button></div>
            <div class="sports2d-import-box">
              <label><span class="metric-label">Arquivo Sports2D .mot/.csv</span><input id="sports2d-angle-file" type="file" accept=".mot,.csv,.txt,text/plain,text/csv" /></label>
              <div class="video-button-row"><button class="btn-ghost" id="import-sports2d-file">Converter Sports2D</button><button class="btn-ghost" id="import-sports2d-demo">Testar amostra Sports2D</button></div>
            </div>
            <div class="sports2d-runner-box">
              <label><span class="metric-label">Relatorio do runner Sports2D</span><textarea id="sports2d-run-report-json" placeholder="Cole aqui a saida de npm run video:calibration:run ou npm run video:sports2d:run."></textarea></label>
              <div class="video-button-row"><button class="btn-ghost" id="review-sports2d-run-report">Revisar runner</button><button class="btn-ghost" id="load-sports2d-run-demo">Testar runner demo</button><button class="btn-ghost" id="load-sports2d-blocked-demo">Testar bloqueio</button></div>
              <div id="sports2d-run-report-result" hidden></div>
            </div>
            <article class="note-box" id="video-import-message" hidden><p></p></article>
          </div>
        </section>
        <section class="panel">
          <div class="panel-header"><div><h3>Projetos avaliados</h3><p class="panel-subtitle">Base tecnica para adaptar ao volei.</p></div></div>
          <div class="panel-body stack">
            <div class="action-item"><p><strong style="color:white">MediaPipe Pose</strong><br>Base leve para 33 pontos do corpo no navegador.</p><span class="tag">agora</span></div>
            <div class="action-item"><p><strong style="color:white">Sports2D</strong><br>Adaptador local converte .mot/.csv de angulos em evidencia: npm run video:sports2d.</p><span class="tag">adaptador</span></div>
            <div class="action-item"><p><strong style="color:white">Validador de evidencia</strong><br>Confere contrato, campos obrigatorios, revisao e alvos tecnicos antes do relatorio.</p><span class="tag">npm run video:evidence:validate</span></div>
            <div class="action-item"><p><strong style="color:white">volleystat e Pose2Sim</strong><br>Referencias para bola, quadra, tracking e cinematica 3D em etapas futuras.</p><span class="tag">referencia</span></div>
            <div class="action-item"><p><strong style="color:white">Mapa de fontes</strong><br>Decisao atual: usar Sports2D por CLI, MediaPipe no navegador e nao clonar repositorio pesado antes dos clips reais.</p><span class="tag">npm run video:sources</span></div>
            <div class="action-item"><p><strong style="color:white">Verificacao GitHub</strong><br>Confere licenca, atividade e estado dos repositorios antes de copiar ou adaptar codigo externo.</p><span class="tag">npm run video:sources:github</span></div>
            <div class="action-item"><p><strong style="color:white">Preflight IA</strong><br>Confere Python, Sports2D e MediaPipe; se faltar Sports2D, prepara ambiente local com npm run video:env:setup.</p><span class="tag">npm run video:env</span></div>
          </div>
        </section>
      </div>
    </div>
  `);
  const status = document.querySelector('#video-ai-status');
  document.querySelector('#run-mediapipe-analysis')?.addEventListener('click', async (event) => {
    const file = document.querySelector('#mediapipe-video-file')?.files?.[0];
    const button = event.currentTarget;
    if (!file) {
      status.textContent = 'Escolha um arquivo de video antes de rodar a analise.';
      return;
    }
    await runVideoAnalysis({
      file,
      athlete: document.querySelector('#mediapipe-athlete')?.value?.trim() || 'Isa',
      fundamental: document.querySelector('#mediapipe-fundamental')?.value || 'Saque',
      status,
      button,
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
      window.__isaLastVideoAnalysisMessage = videoEvidenceImportSummary(imported);
      renderAiVideosPage();
    } catch (error) {
      message.hidden = false;
      messageText.textContent = error instanceof Error ? error.message : 'Nao foi possivel importar o JSON.';
    }
  });
  const saveSports2dEvidence = (items, messageText) => {
    const current = readImportedVideoEvidence().filter((item) => String(item.source || '').toLowerCase() !== 'sports2d');
    localStorage.setItem(videoEvidenceStorageKey, JSON.stringify([...items, ...current]));
    window.__isaLastVideoAnalysisMessage = `Evidencia Sports2D criada: ${items[0]?.marker || 'marcador tecnico'}. ${videoEvidenceImportSummary(items)}`;
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
        athlete: document.querySelector('#mediapipe-athlete')?.value?.trim() || 'Isa',
        fundamental: document.querySelector('#mediapipe-fundamental')?.value || 'Saque',
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
        fundamental: 'Saque',
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
    const athlete = document.querySelector('#validation-athlete')?.value?.trim() || 'Isa';
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
        window.__isaLastVideoAnalysisMessage = 'Nao foi possivel encontrar a evidencia de IA para calibrar.';
        renderAiVideosPage();
        return;
      }
      const manual = upsertManualCalibrationEvidence(item);
      window.__isaLastVideoAnalysisMessage = `Checagem manual criada para ${manual.marker}. Compare IA e observacao tecnica antes do proximo relatorio.`;
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
  if (!athleteProfile.completed || editingProfile) {
    renderProfileQuestionnairePage();
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
  else if (activePage === 'indicadores') renderIndicatorsPage();
  else if (activePage === 'leitura') renderGameReadingPage();
  else renderAiVideosPage();
}

render();






