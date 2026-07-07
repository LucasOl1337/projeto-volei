# Tela de video como estacao de analise

Data: 2026-07-01

## Conceito

Uma tela de produto deve ter uma acao principal clara. No modulo de video, essa acao e:

1. escolher um video;
2. escolher atleta e fundamento;
3. processar;
4. revisar a evidencia.

Todo o resto e ferramenta de apoio.

## O que mudou

- A tela `Videos` deixou de mostrar todos os paineis tecnicos de uma vez.
- A primeira dobra agora mostra a estacao de analise, resultado, revisao tecnica e proximo passo.
- Importacao JSON, Sports2D, runner, dataset, manifesto, pacote piloto e pesquisa ficam em `Ferramentas avancadas`.
- O botao principal virou `Processar video`.
- Corrigido o painel lateral que ficava sobrepondo o botao principal e impedia o clique.

## Ponte com o volei

No treino, o atleta nao precisa ver toda a periodizacao para fazer uma repeticao de saque. Ele precisa saber qual movimento executar, qual criterio observar e qual proxima acao registrar.

No app, a tela de video passa a seguir essa mesma logica.

## Decisao

Manter recursos avancados no produto, mas fora do caminho principal. A experiencia padrao deve ser curta e usavel; a complexidade fica disponivel para calibracao e desenvolvimento.
