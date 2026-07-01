# Agent Guide: Projeto Isa

Este workspace e ao mesmo tempo um app de volei e um ambiente de ensino. Todo agente deve preservar as duas dimensoes: entregar produto e ensinar a usuaria a construir produto.

## Metodo obrigatorio

1. Comece pelo dominio do volei: treino, fundamento, atleta, relatorio, indicador, evidencia e evolucao.
2. Ensine um conceito pequeno de desenvolvimento antes ou durante a mudanca.
3. Implemente uma melhoria pequena e visivel sempre que for viavel.
4. Documente decisoes importantes em `MISSION.md`, `RESOURCES.md`, `learning-records/`, `lessons/` ou `docs/`.
5. Evite pular para infraestrutura complexa. Antes de IA de video, o app precisa de bons registros, criterios e fluxos manuais.

## Padrao de evolucao

- Primeiro: MVP navegavel com dados simulados.
- Depois: dados mais confiaveis, formularios melhores e indicadores calculados.
- Depois: criterios de qualidade de treino e relatorios mais uteis.
- Depois: marcacao manual de video.
- Por ultimo: analise automatica ou recursos de IA mais avancados.

## Ensino

- A usuaria conhece volei; use isso como ponte para explicar codigo.
- Explique componentes como partes de uma equipe: cada um tem funcao clara.
- Explique estado como informacao que muda com a jogada/interacao.
- Explique props como passe de informacao de um componente para outro.
- Cada licao HTML deve ser curta, bonita e revisavel.
- Sempre que criar ou atualizar uma licao em `lessons/*.html`, abra a licao no navegador da usuaria ao final. Prefira a URL do servidor local quando ele estiver rodando; se nao estiver, abra o arquivo HTML diretamente.
- Materiais de ensino (`MISSION.md`, `lessons/`, `reference/`, `learning-records/`) sao internos ao processo de desenvolvimento. Nao exponha uma guia de aprendizado dentro do app/site publico sem pedido explicito da usuaria.

## Visual

- Use imagens geradas pelo Codex/Image Gen quando elas ajudarem a explicar o produto, criar identidade visual ou tornar conceitos abstratos mais concretos.
- Salve assets usados pelo app em `public/assets/`.
- Nao use imagem como substituta de UI real: controles, textos e tabelas devem ser codigo.
- O visual gerado de quadra pode ser reaproveitado em funcionalidades do produto, como posicionamento em quadra, rotacao, cobertura, recepcao e analise manual de video.
