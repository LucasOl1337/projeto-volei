# React paralelo: estados vazios e acessibilidade

Quando um registro ainda nao existe, a tela precisa ter uma resposta propria em vez de depender do primeiro item da lista. Em relatorios, isso evita erro quando `reports` esta vazio e preserva o fluxo manual de registrar evidencia depois do treino.

Nos botoes das zonas da quadra, o texto visual curto como `Z1` ajuda quem enxerga o mapa, mas o `aria-label` completo entrega a mesma informacao para leitor de tela: zona, funcao da zona e contexto do mapa.
