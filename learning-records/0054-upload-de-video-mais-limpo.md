# 0054 - Upload de video mais limpo

Na aba `Videos`, a acao principal precisa parecer parte do treino: escolher um exercicio, colocar o video e processar. O botao nativo branco de arquivo quebrava o visual e chamava mais atencao que a propria analise.

Decisao: o input real de arquivo fica oculto e um controle visual `Adicionar video` abre o seletor. Quando um arquivo e escolhido, o nome aparece no mesmo controle.

Conceito de desenvolvimento: alguns controles do navegador tem aparencia propria. Podemos manter a funcao acessivel e trocar apenas a camada visual para combinar com o app.
