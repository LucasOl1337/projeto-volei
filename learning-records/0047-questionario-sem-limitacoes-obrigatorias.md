# Questionario sem limitacoes obrigatorias

Data: 2026-07-01

No volei, uma limitacao de espaco ou dor leve pode mudar a dose do treino, mas ela nao precisa ser uma barreira no primeiro cadastro. Para o fluxo ficar mais direto, o questionario deve perguntar apenas o que muda imediatamente o plano: tempo, corpo, nivel, equipamentos, dores e objetivo.

Conceito de desenvolvimento: quando uma etapa sai de um formulario, tambem precisamos revisar os textos derivados daquele dado. Se o app deixa de perguntar "limitacoes", ele nao deve mostrar "nenhuma limitacao anotada" nos resumos, porque isso parece uma pendencia falsa para o atleta.

Decisao: manter o campo `limitations` silencioso no modelo por compatibilidade com perfis antigos, mas retirar sua mensagem dos cuidados do perfil.
