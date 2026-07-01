# Icone do site como marca

No produto de volei, o icone funciona como a camisa do projeto: ele ajuda a reconhecer a identidade antes mesmo de ler os textos.

Decisao implementada:

- O mesmo asset gerado para favicon (`public/assets/site-icon-192.png`) passou a aparecer tambem na marca visual do app.
- O texto "Projeto Volei" continua visivel ao lado, porque a identidade nao pode substituir navegacao ou orientacao.
- A imagem usa `alt=""` dentro da marca, pois o nome do app ja esta escrito na interface e nao precisa ser repetido por leitores de tela.

Conceito pequeno de desenvolvimento: um asset pode ser reutilizado em varios contextos. O favicon aparece na aba do navegador; a marca aparece dentro do layout. Quando os dois usam o mesmo arquivo, a identidade fica consistente e a manutencao fica mais simples.
