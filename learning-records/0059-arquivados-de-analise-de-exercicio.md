# 0059 - Arquivados na analise de exercicio

No volei, nem toda evidencia precisa ficar na prancheta da sessao atual. Algumas servem como historico, outras devem sair de vez quando foram apenas teste.

Decisao: a aba `Videos` passou a se chamar `Analise de Exercicio`. Os resultados ativos agora podem ser arquivados ou excluidos para sempre. A pasta `Arquivados` guarda resultados fora da lista principal, com opcao de restaurar quando ainda forem uteis.

Conceito de desenvolvimento: arquivar e excluir sao estados diferentes. Arquivar move o dado para outro armazenamento e permite voltar. Excluir remove o dado local e tambem limpa vinculos operacionais ligados ao resultado.

A exclusao permanente usa confirmacao em dois cliques dentro da propria interface: primeiro `Excluir para sempre`, depois `Confirmar exclusao`. Isso evita um alerta solto do navegador e deixa a decisao visivel no mesmo card.

Proximo cuidado: quando houver contas de usuario ou banco de dados, a exclusao permanente deve pedir confirmacao clara e respeitar politica de privacidade dos videos reais.
