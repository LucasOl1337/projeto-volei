# 0036 - Verificacao GitHub das fontes de video IA

## Dominio do volei

Antes de usar IA no saque, ataque, bloqueio ou defesa, o Projeto Isa precisa saber se a fonte mede gesto individual, bola, quadra, salto ou jogo coletivo.

## Conceito de desenvolvimento

Uma fonte externa precisa de contrato tecnico antes de virar dependencia. No volei, isso parece escolher um exercicio pelo fundamento que ele treina. No codigo, isso significa conferir licenca, atividade e encaixe antes de clonar repositorio.

## Mudanca feita

- Criado `npm run video:sources:github`.
- O comando consulta a API publica do GitHub para as fontes registradas.
- A auditoria ganhou `githubRepo` e `githubLicense`.
- `OpenVolley ovml` entrou como referencia permissiva MIT para bola/jogo coletivo.
- `Volleyball Analytics` entrou como referencia GPL-2.0 para estudo, sem copiar codigo.
- A tela `Videos` mostra a verificacao GitHub como proxima acao antes de copiar ou adaptar codigo externo.

## Decisao

Sports2D e MediaPipe continuam como pilotos praticos para gesto individual. Fontes de volei coletivo ficam para depois, quando houver clips reais, criterios manuais e uma pergunta de produto sobre bola, quadra ou rally.

## Proximo passo

Rodar o piloto em clips reais curtos da Isa. Depois comparar MediaPipe, Sports2D e revisao manual antes de decidir qualquer clone ou adaptacao maior.
