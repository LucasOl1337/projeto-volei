# 0019 - Matriz open source para video e IA

## Dominio do volei

Nem todo projeto de video esportivo resolve o mesmo problema. Para o Projeto Isa, o foco imediato e transformar movimento em evidencia tecnica revisavel.

No volei, isso significa separar:

- gesto individual: saque, recepcao, ataque, bloqueio e defesa;
- fase do gesto: preparacao, contato, alcance, aterrissagem ou recuperacao;
- evidencia: angulo, ponto do corpo, tempo do video e criterio da treinadora.

## Conceito de desenvolvimento

Uma matriz de decisao evita escolher uma biblioteca so porque ela parece interessante. Ela compara opcoes com criterios iguais.

Aqui usamos quatro criterios simples:

- licenca;
- aderencia ao volei;
- facilidade de integracao;
- valor para o MVP.

## Decisao implementada

- A tela `Videos` ganhou `Matriz de adaptacao open source`.
- O arquivo `reference/video-ai-project-candidates.json` registra os candidatos pesquisados.
- O comando `npm run video:candidates` ranqueia os candidatos.
- Sports2D e MediaPipe seguem como pilotos; volleystat, basquete com maquina de estados e Pose2Sim ficam como referencias.

## Proximo teste real

Usar 3 clips reais de saque e comparar:

1. evidencia manual da treinadora;
2. sugestao MediaPipe local;
3. saida Sports2D convertida;
4. dataset de calibracao exportado.
