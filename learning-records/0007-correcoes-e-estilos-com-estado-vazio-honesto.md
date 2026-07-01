# 0007 - Correcoes e estilos com estado vazio honesto

## Decisao de produto

As telas `Correcoes` e `Estilos` precisam ajudar a atleta a decidir o proximo treino, nao apenas mostrar listas. Como o app ainda nao tem historico real de correcoes salvas, a interface deve separar claramente modelos sugeridos de registros reais.

## Mudanca implementada

- `Correcoes` ganhou um fluxo curto: ver, escolher e medir.
- O playbook de correcoes mostra fundamento, prioridade, origem observada, exercicio, meta e proxima repeticao.
- O historico real foi renomeado para deixar claro que ainda nao ha correcoes salvas.
- `Estilos` passou a conectar cada estilo com dose, evidencia, cuidado, exercicio base e metrica.

## Mini-licao

Estado vazio nao e buraco na tela. E uma orientacao para o primeiro gesto: dizer o que ainda nao existe e apontar a proxima acao pequena. No volei, isso parece uma primeira correcao do treino: simples, observavel e repetivel.
