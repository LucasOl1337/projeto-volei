# Development Rules

## Hierarquia visual antes de volume

No Projeto Isa, uma tela boa funciona como uma ficha de treino de volei: o atleta enxerga primeiro a prioridade da sessao, depois os criterios de execucao, depois os detalhes e registros. Nao basta colocar todos os dados na tela.

Referencia consultada: `C:\Projetos\nexarq\AGENTS.md`, `C:\Projetos\nexarq\docs\design.md` e `C:\Projetos\nexarq\prototype\DESIGN_SYSTEM.md`. Do Nexarq, trazemos o cuidado com tokens, hairlines, sombras raras, microcopy curta e uma lista clara do que evitar. Nao trazemos a estetica greige/arquitetura, porque o dominio aqui e treino de volei.

Regras praticas:

- Evitar tabelas improvisadas quando os itens nao sao comparaveis linha a linha.
- Evitar cards gigantes com o mesmo peso visual para informacoes de importancia diferente.
- Agrupar por funcao: prioridade tecnica, criterios de apoio, evidencia e proxima acao.
- Manter alinhamento previsivel: grids com colunas claras, listas internas com ritmo consistente e cabecalhos pequenos.
- Nao remover recursos para "limpar" a tela; primeiro reorganizar a informacao.
- Preferir bordas finas, sombras discretas e estados de destaque com funcao clara.
- Evitar efeito visual chamativo que nao responda a uma pergunta de treino.

## Ponte com o dominio do volei

Um fundamento, um indicador e uma evidencia nao devem competir visualmente. Fundamento orienta o treino; indicador mede evolucao; evidencia prova o que aconteceu. A interface deve respeitar essa ordem.

## Criterio de revisao

Antes de aceitar uma pagina nova ou redesenhada, verificar:

- Qual e a decisao principal que a tela ajuda a tomar?
- O elemento mais importante esta mais facil de encontrar que os detalhes?
- Os blocos seguem o mesmo alinhamento e o mesmo ritmo?
- Alguma lista virou "tabela fake" sem ganho real de comparacao?
- A tela parece ferramenta de treino ou colecao de caixas geradas?
- O destaque visual indica uma prioridade real do treino ou apenas decora a pagina?
