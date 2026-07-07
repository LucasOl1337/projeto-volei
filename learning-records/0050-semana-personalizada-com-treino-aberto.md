# Semana personalizada com treino aberto

Data: 2026-07-01

No treino de volei, o dia da semana nao basta: o atleta precisa saber a ordem do que fazer, quantas series executar e qual criterio observar. A semana personalizada agora funciona como uma agenda clicavel.

Conceito de desenvolvimento: usamos estado de selecao. `selectedTrainingDay` guarda qual dia esta aberto; ao clicar em outro dia, o app re-renderiza o painel lateral com o treino daquele dia.

Decisao: cada dia da semana abre um treino detalhado com preparacao, exercicios principais e fechamento. As series usam a dose do perfil para manter o plano coerente com o tempo disponivel do atleta.
