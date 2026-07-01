# Plano de Trabalho

## Fase 1: Fundacao do produto

Objetivo: transformar a ideia em uma estrutura clara de produto.

- Definir as telas iniciais.
- Definir os campos de treino.
- Definir os campos de relatorio.
- Definir a lista inicial de estilos de treino.
- Escolher a tecnologia do aplicativo.
- Criar o primeiro prototipo navegavel.

## Fase 2: Interface e fluxo de anotacao

Objetivo: permitir que o usuario registre treinos e consulte informacoes sem depender de recursos avancados.

- Construir painel principal.
- Criar formulario de treino.
- Criar formulario de relatorio.
- Criar tela de estilos de treino.
- Criar tabelas iniciais.
- Testar o fluxo completo de criar, visualizar e editar registros.

## Fase 3: Dados e organizacao

Objetivo: estruturar os dados para que os relatorios e tabelas sejam confiaveis.

- Modelar entidades principais: treino, relatorio, estilo, atividade, fundamento e atleta.
- Definir armazenamento local ou banco de dados.
- Criar filtros por data, equipe, estilo e fundamento.
- Criar indicadores calculados.
- Preparar exportacao simples de relatorios, se necessario.

## Fase 4: Qualidade dos treinos

Objetivo: criar criterios para avaliar a qualidade de um treino antes da automacao por video.

- Definir indicadores de qualidade.
- Criar checklist de observacao.
- Criar notas ou classificacoes por fundamento.
- Relacionar pontos de atencao com proximas acoes.
- Criar visao de evolucao por periodo.

## Fase 5: Preparacao para analise de video

Objetivo: deixar o produto pronto para receber videos futuramente.

- Permitir anexar um video a um treino.
- Permitir marcacoes manuais no video.
- Definir eventos relevantes para detectar no futuro.
- Criar estrutura para comparar anotacoes manuais com analise automatica.
- Testar MediaPipe ou Sports2D em clips curtos antes de integrar modelos grandes.
- Usar projetos especificos de volei como referencia de arquitetura, sem copiar codigo antes de avaliar licenca e complexidade.

## Proximo passo recomendado

Escolher a tecnologia do primeiro prototipo e criar a interface navegavel com dados simulados. Uma boa primeira versao pode ter:

- Dashboard.
- Cadastro de treino.
- Relatorio de treino.
- Estilos de treino.
- Tabela de indicadores.
