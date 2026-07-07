# Abas de treino sem pulo de scroll

Data: 2026-07-01

Na semana personalizada, clicar em um dia deve abrir os exercicios daquele treino sem tirar o atleta do ponto onde ele esta lendo. No uso real, pular para o topo quebra a continuidade, como perder a sequencia de uma serie.

Conceito de desenvolvimento: nem toda interacao precisa re-renderizar a tela inteira. Para trocar uma aba, basta atualizar o estado visual dos botoes e substituir o painel do treino aberto.

Decisao: os dias da semana funcionam como abas. O clique atualiza apenas o painel `daily-training-panel`, mantendo o scroll atual e mostrando ordem, series, como fazer e criterio de cada exercicio.
