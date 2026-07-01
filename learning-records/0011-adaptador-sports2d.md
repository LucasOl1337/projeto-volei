# 0011 - Adaptador Sports2D

## Dominio do volei

No saque, um dado bruto como `Right_arm = 81` nao diz sozinho se o fundamento foi bom. Ele precisa virar criterio: braco alto, cotovelo estendido, tempo do contato e proxima acao.

## Conceito de desenvolvimento

Um adaptador transforma a saida de uma ferramenta externa no formato interno do app. Ele nao muda a regra do produto; ele so prepara a informacao para entrar no fluxo certo.

No Projeto Isa, Sports2D pode gerar angulos. O adaptador converte esses angulos para `isa.video-evidence.v1`, que a tela de Videos ja sabe importar, revisar e comparar com marcacao manual.

## Decisao implementada

- Criado `scripts/sports2d-to-video-evidence.mjs`.
- Criada a amostra `reference/sample-sports2d-saque.mot`.
- Criado o comando `npm run video:sports2d`.
- Criado o comando `npm run video:sports2d:write`.
- O app mostra Sports2D como `adaptador`, nao como dependencia pesada do MVP.
- A tela `Videos` tambem consegue converter `.mot/.csv` diretamente e testar a amostra Sports2D sem terminal.

## Proximo teste real

Rodar Sports2D em um clip curto de saque da Isa, importar a evidencia gerada e comparar com a checagem manual do mesmo frame.
