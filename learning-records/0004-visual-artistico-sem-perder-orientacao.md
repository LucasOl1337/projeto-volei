# Visual artistico sem perder orientacao

Data: 2026-07-01

## Decisao

O Projeto Isa passou a usar uma cena artistica de treino individual em casa como camada de identidade visual: alvo com fita na parede, linhas de quadra no chao, bola, toalha e cronometro.

A arte nao substitui a interface. Tabelas, formularios, indicadores, filtros e instrucoes continuam como HTML/CSS real, com paineis de contraste previsivel.

## Ponte com volei

No treino, um recurso visual bom funciona como uma marca no chao: orienta o atleta sem atrapalhar o movimento. No frontend, a imagem deve cumprir esse mesmo papel. Ela cria contexto, mas nao pode competir com o fundamento, a metrica, a evidencia ou a proxima acao.

## Regra para proximos ciclos

- Usar imagens geradas em `public/assets/` quando elas explicarem treino em casa, quadra, posicionamento ou video.
- Nao colocar arte detalhada atras de texto pequeno, tabela ou campo de formulario.
- Preferir paineis solidos para qualquer decisao de treino.
- Otimizar assets grandes para WebP/AVIF quando houver ferramenta local ou pipeline definido.
- Testar mobile antes de considerar a melhoria visual concluida.

## Asset usado

- `public/assets/home-training-court.png`: cena de treino em casa gerada com Image Gen, usada como atmosfera do app e referencia visual do dashboard.
