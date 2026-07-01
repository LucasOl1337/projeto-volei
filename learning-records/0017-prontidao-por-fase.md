# 0017 - Prontidao por fase do movimento

## Dominio do volei

Um fundamento pode ter fases com niveis diferentes de confianca. A IA pode acertar bem o contato alto do saque e ainda errar a finalizacao.

Por isso, a prontidao precisa separar fundamento e fase do movimento.

## Conceito de desenvolvimento

Segmentar uma metrica reduz mistura de dados. Em vez de uma media grande esconder problemas, cada fase mostra seu proprio historico.

No app, isso significa calcular a calibracao para pares como `Saque - Contato`, `Ataque - Aterrissagem` e `Recepcao - Preparacao`.

## Decisao implementada

- `Calibracao IA x manual` continua mostrando a prontidao geral por fundamento.
- O mesmo painel agora mostra `Prontidao por fase`.
- Comparacoes relacionadas so cruzam evidencias da mesma fase.
- Checagens pareadas continuam obrigatorias para contar na prontidao.

## Proximo teste real

Fazer 3 checagens manuais pareadas de `Saque - Contato` antes de testar outra fase do saque.
