export type PageId = 'dashboard' | 'treinos' | 'fisico-mobilidade' | 'relatorios' | 'exercicios' | 'estilos' | 'individual' | 'indicadores' | 'videos';

export type TrainingStyle = 'Tecnico' | 'Tatico' | 'Fisico';

export interface TrainingSession {
  id: string;
  date: string;
  weekday: string;
  title: string;
  style: TrainingStyle;
  focus: string;
  duration: number;
  quality: number;
  load: 'Baixa' | 'Media' | 'Alta';
  notes: string;
}

export interface ExerciseCorrection {
  id: string;
  fundamental: string;
  exercise: string;
  correction: string;
  priority: 'Alta' | 'Media' | 'Baixa';
  target: string;
}

export interface Fundamental {
  name: string;
  score: number;
  delta: number;
  color: string;
}

export interface ReportItem {
  id: string;
  title: string;
  session: string;
  status: 'Concluido' | 'Rascunho';
  updatedAt: string;
  summary: string;
}

export interface ActionItem {
  id: string;
  title: string;
  date: string;
  status: 'Pendente' | 'Planejado' | 'Concluido';
}

export interface ExerciseLibraryItem {
  id: string;
  fundamental: string;
  title: string;
  objective: string;
  environment: string;
  materials: string;
  duration: string;
  setup: string;
  variations: string[];
  metric: string;
}

export interface PhysicalTrainingItem {
  id: string;
  focus: string;
  title: string;
  objective: string;
  athletes: string;
  materials: string;
  duration: string;
  setup: string;
  mobility: string;
  variations: string[];
  metric: string;
  rest: string;
  evidence: string;
}

export interface PositionGuide {
  id: string;
  name: string;
  shortName: string;
  role: string;
  courtBase: string;
  primaryDecision: string;
  priority: string;
  avoid: string;
  keyFundamentals: string[];
  indicators: string[];
  evidence: string[];
  trainingTabs: Array<{
    label: string;
    focus: string;
    drill: string;
  }>;
}

export const navigation = [
  { id: 'dashboard', label: 'Dashboard', hint: 'Indicadores principais' },
  { id: 'treinos', label: 'Treinos', hint: 'Sessoes e atividades' },
  { id: 'fisico-mobilidade', label: 'FISICO E MOBILIDADE', hint: 'Exercicios fisicos e mobilidade' },
  { id: 'relatorios', label: 'Relatorios', hint: 'Anotacoes e conclusoes' },
  { id: 'exercicios', label: 'Exercicios', hint: 'Biblioteca por fundamento' },
  { id: 'estilos', label: 'Estilos', hint: 'Tipos de treino' },
  { id: 'individual', label: 'Individual', hint: 'Exercicios e correcoes' },
  { id: 'indicadores', label: 'Indicadores', hint: 'Tabelas comparativas' },
  { id: 'videos', label: 'Videos', hint: 'Preparacao para analise' },
] satisfies Array<{ id: PageId; label: string; hint: string }>;

export const positionGuides: PositionGuide[] = [
  {
    id: 'central',
    name: 'Central',
    shortName: 'MB',
    role: 'Defende o centro da rede, fecha bloqueios nas pontas e ataca bolas rapidas quando o passe permite.',
    courtBase: 'Z3 na rede; costuma sair para o libero no fundo quando o sistema permite.',
    primaryDecision: 'Ler o levantador adversario cedo sem abandonar o atacante de meio.',
    priority: 'Tempo de bloqueio, deslocamento curto na rede e transicao rapida para ataque.',
    avoid: 'Saltar no chute do levantador antes de enxergar ombro, bola e atacante.',
    keyFundamentals: ['Bloqueio', 'Ataque rapido', 'Transicao', 'Saque tatico'],
    indicators: ['Toques de bloqueio que viram contra-ataque', 'Ataques de primeiro tempo apos passe bom', 'Fechamento correto com ponta ou oposto', 'Erros de rede ou invasao'],
    evidence: ['Maos passando a rede sem tocar na fita', 'Primeiro passo lateral curto e limpo', 'Aterrissagem equilibrada depois do bloqueio', 'Preparacao de bola rapida antes do levantamento'],
    trainingTabs: [
      { label: 'Tecnico', focus: 'Fechar maos e invadir espaco no bloqueio.', drill: 'Passo lateral curto na parede com parada de 2 segundos e maos acima da cabeca.' },
      { label: 'Tatico', focus: 'Escolher entre marcar meio ou ajudar na ponta.', drill: 'Assistir 6 bolas e pausar antes do levantamento para prever a direcao.' },
      { label: 'Fisico', focus: 'Saltos repetidos com queda estavel.', drill: '3 series de 4 saltos verticais, descanso longo e aterrissagem silenciosa.' },
    ],
  },
  {
    id: 'levantador',
    name: 'Levantador',
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
      { label: 'Tecnico', focus: 'Chegar embaixo da bola antes de levantar.', drill: 'Toque na parede alternando alvo alto e alvo medio, recuperando base a cada contato.' },
      { label: 'Tatico', focus: 'Escolher atacante conforme passe e bloqueio.', drill: 'Simular tres cenarios: passe A para central, passe B para ponta, passe C para bola alta segura.' },
      { label: 'Fisico', focus: 'Deslocamento curto e estabilidade de tronco.', drill: 'Shuffle ate uma marca, parada em base e toque de dedos controlado.' },
    ],
  },
  {
    id: 'oposto',
    name: 'Oposto',
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
      { label: 'Tecnico', focus: 'Controlar direcao do ataque na saida.', drill: 'Passada com toalha alternando finalizacao em diagonal e paralela imaginaria.' },
      { label: 'Tatico', focus: 'Decidir entre bater, explorar ou colocar.', drill: 'Pausar videos de ataque e nomear a melhor decisao antes do contato.' },
      { label: 'Fisico', focus: 'Potencia de salto com ombro protegido.', drill: 'Salto vertical com armacao de braco e mobilidade de ombro antes da serie.' },
    ],
  },
  {
    id: 'libero',
    name: 'Libero',
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
      { label: 'Tecnico', focus: 'Plataforma estavel e direcao do passe.', drill: 'Manchete na parede mirando uma fita, contando sequencias de controle.' },
      { label: 'Tatico', focus: 'Ler largada, diagonal e bola forte.', drill: 'Marcar em video o ombro do atacante e pausar antes do contato para prever a zona.' },
      { label: 'Fisico', focus: 'Base baixa com deslocamento curto.', drill: 'Tres marcas no chao, sequencia de direcoes e volta ao centro em 20 segundos.' },
    ],
  },
  {
    id: 'ponteiro',
    name: 'Ponteiro',
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
      { label: 'Tecnico', focus: 'Equilibrar recepcao e passada de ataque.', drill: 'Recepcao controlada na parede seguida de duas passadas marcadas no chao.' },
      { label: 'Tatico', focus: 'Resolver bola alta contra bloqueio formado.', drill: 'Analisar 5 ataques e classificar: ponto, erro, exploracao ou bola mantida.' },
      { label: 'Fisico', focus: 'Repetir salto e defesa sem perder postura.', drill: 'Passada curta, mini salto, queda estavel e deslocamento para base defensiva.' },
    ],
  },
];

export const sessions: TrainingSession[] = [];

export const fundamentals: Fundamental[] = [
  { name: 'Saque', score: 0, delta: 0, color: '#45d7c8' },
  { name: 'Recepcao', score: 0, delta: 0, color: '#ffb238' },
  { name: 'Levantamento', score: 0, delta: 0, color: '#76dc6e' },
  { name: 'Ataque', score: 0, delta: 0, color: '#ff6a57' },
  { name: 'Bloqueio', score: 0, delta: 0, color: '#86a8ff' },
  { name: 'Defesa', score: 0, delta: 0, color: '#b5c8c6' },
];

export const exerciseCorrections: ExerciseCorrection[] = [];

export const reports: ReportItem[] = [];

export const actions: ActionItem[] = [];

export const exerciseLibrary: ExerciseLibraryItem[] = [
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

export const physicalTrainingLibrary: PhysicalTrainingItem[] = [
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
    variations: ['Freio bilateral', 'Freio em uma perna com baixa altura', 'Sinal visual para mudar direita/esquerda'],
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
    setup: 'Marque centro, direita e esquerda. Saia do centro, toque a marca da sequencia, freie e volte mantendo base baixa.',
    mobility: 'Antes: deslocamento lateral leve, abertura de quadril e ativacao de panturrilha.',
    variations: ['Com sequencia escrita', 'Com sinal visual', 'Com bola leve apos o freio'],
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

export const mobilityPrep = [
  {
    area: 'Tornozelo',
    drill: 'Joelho na parede + saltitos leves',
    dose: '2 x 30 s por lado',
    reason: 'Ajuda aterrissagem, defesa baixa e deslocamento sem compensar no joelho.',
  },
  {
    area: 'Quadril',
    drill: '90/90 dinamico + avanco com rotacao',
    dose: '2 x 5 repeticoes por lado',
    reason: 'Prepara base baixa, passada de ataque e mudanca de direcao.',
  },
  {
    area: 'Tronco',
    drill: 'Rotacao toracica em quatro apoios',
    dose: '2 x 6 repeticoes por lado',
    reason: 'Ajuda saque e ataque a girar sem jogar toda carga no ombro.',
  },
  {
    area: 'Ombro',
    drill: 'Wall slide + rotacao externa com elastico',
    dose: '2 x 8 repeticoes',
    reason: 'Prepara membros superiores para saque, ataque, bloqueio e defesa alta.',
  },
];

export const styleGuides = [
  { name: 'Tecnico', focus: 'Precisao dos fundamentos em exercicios solo', activities: 'Parede, bola leve, toalha, alvo com fita e repeticoes curtas' },
  { name: 'Tatico', focus: 'Leitura individual e tomada de decisao em casa', activities: 'Simulacao de posicao, marcas visuais no chao, alvos na parede e revisao manual de video' },
  { name: 'Fisico', focus: 'Forca, potencia, mobilidade e prevencao em pouco espaco', activities: 'Core, estabilidade, agachamento, deslocamento curto, aterrissagem controlada e preparacao de ombro' },
];
