# 0060 - Concluir treino com registro local

## Dominio de volei

Concluir treino transforma a ficha do dia em evidencia de evolucao. O registro guarda quando foi feito, qual posicao treinou, tipo do treino, duracao e exercicios executados. Isso cria uma base simples antes de qualquer relatorio mais elaborado.

## Conceito de desenvolvimento

`localStorage` funciona como uma prancheta local do navegador. Ao clicar em `Concluir treino`, o app salva um objeto com os dados principais e redesenha a tela usando esse estado salvo.

## Decisoes

- Evitar duplicidade usando data, posicao, dia da ficha e tipo do treino como chave.
- Trocar o botao para `Treino concluido` quando o treino do dia ja foi salvo.
- Mostrar historico simples na pagina de plano de treino.
- Usar os registros concluidos para atualizar o resumo e os indicadores locais.
- Permitir excluir um registro marcado errado sem apagar os outros treinos.
- Mostrar `Excluir treino` ao lado de `Concluir treino`, ativo apenas quando a ficha aberta ja estiver concluida.
- Preservar a posicao de leitura ao concluir ou excluir treino para nao puxar a pessoa para o topo da pagina.
