# 0040 - Plano de coleta para calibracao IA

## Dominio do volei

Depois de um primeiro par IA x manual, o proximo passo nao e confiar na IA. E repetir o mesmo criterio em clips comparaveis. Para o saque, isso significa gravar mais contatos controlados e revisar se o ponto alto do braco realmente aparece no frame certo.

## Conceito de desenvolvimento

Gap analysis transforma "ainda falta dado" em uma lista concreta de proximas acoes. O app agora calcula quantos pares faltam e gera caminhos padronizados para video, angulos e evidencia.

## Mudanca feita

- Criado `npm run video:calibration:plan`.
- O comando gera `isa.video-calibration-gap-plan.v1`.
- O pacote piloto da tela ganhou `Proximos pares para coletar`.
- O pacote piloto exportado passou a listar `npm run video:calibration:plan` nos comandos.

## Estado da amostra

Sports2D tem 1 par em `Saque - Contato`. Para chegar na regra minima de 5 pares, o plano gera mais 4 pares:

- `videos/isa-saque-contato-sports2d-pair-2.mp4`
- `videos/isa-saque-contato-sports2d-pair-3.mp4`
- `videos/isa-saque-contato-sports2d-pair-4.mp4`
- `videos/isa-saque-contato-sports2d-pair-5.mp4`

Cada clip tambem tem caminho esperado de `.mot` e JSON de evidencia normalizada.

## Proximo passo

Gravar ou copiar os clips reais nesses caminhos, rodar Sports2D em ambiente permitido e criar checagem manual pareada para cada evidencia.
