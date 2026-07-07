# 0053 - Campo Atleta oculto em Videos

No treino individual, a tela ja sabe que o registro e da Isa. Pedir `Atleta` de novo antes de analisar o video cria ruido antes da acao principal.

Decisao: a aba `Videos` nao mostra mais campo `Atleta` no formulario principal nem no registro avancado de clips. O valor interno continua como `Isa` para manter evidencias, manifestos e relatorios consistentes.

Conceito de desenvolvimento: quando uma informacao ja vem do contexto da pagina, ela pode virar valor interno em vez de input visivel. Isso deixa a interface mais direta sem quebrar os dados.
