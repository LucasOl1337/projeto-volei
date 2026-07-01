# 0013 - Prontidao por fundamento

## Dominio do volei

Um fundamento precisa de repeticao comparavel. Uma leitura boa de saque nao garante uma leitura boa de recepcao, defesa ou ataque.

Por isso, a IA deve ser calibrada por fundamento. O app precisa saber quantas vezes a sugestao automatica bateu com a revisao manual antes de tratar aquele criterio como confiavel.

## Conceito de desenvolvimento

Uma metrica de prontidao resume historico. Ela nao substitui os dados originais; ela ajuda a decidir o proximo passo.

No Projeto Isa, cada par IA x manual alimenta um painel por fundamento:

- quantas sugestoes de IA existem;
- quantas ganharam checagem manual;
- quantas ficaram alinhadas;
- qual e o proximo passo de validacao.

Para a prontidao, o par precisa ser direto: a revisao manual guarda `calibrationOf` com o `id` da evidencia de IA. Uma evidencia parecida pode aparecer como comparacao, mas nao conta para liberar piloto.

## Decisao implementada

- `Calibracao IA x manual` agora calcula prontidao por fundamento.
- Menos de 3 checagens fica como `Em calibracao`.
- 3 ou mais checagens com 70% de alinhamento vira `Promissor`.
- 5 ou mais checagens com 80% de alinhamento vira `Pronto para piloto`.

## Proximo teste real

Coletar pelo menos 3 clips reais por fundamento antes de confiar em recomendacoes automaticas.
