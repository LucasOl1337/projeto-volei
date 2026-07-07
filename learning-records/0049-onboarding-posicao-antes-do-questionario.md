# Onboarding com posicao antes do questionario

Data: 2026-07-01

No volei, a funcao em quadra vem antes da dose do treino. Levantador, libero, central, ponteiro e oposto precisam de criterios diferentes; por isso a primeira tela deve pedir a posicao antes de abrir qualquer pergunta de perfil.

Conceito de desenvolvimento: este fluxo e uma maquina de estados simples. Antes de existir `selectedPosition`, o app mostra apenas a escolha de posicao. Depois que `selectedPosition` existe, o app mostra o questionario inicial. Cada tela tem uma responsabilidade clara.

Decisao: separar o onboarding em duas etapas visuais: `posicao -> questionario`. A segunda etapa mostra um resumo da posicao escolhida e permite trocar posicao sem misturar os cards com as perguntas.
