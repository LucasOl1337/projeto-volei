# Fluxo executavel da calibracao

Data: 2026-07-01

## Conceito

Um comando de produto deve parecer com uma sessao de treino. Primeiro vem o plano, depois a execucao, depois a revisao.

Antes, os gaps de calibracao viravam um manifesto, mas ainda exigiam passos manuais para conectar esse manifesto ao Sports2D. Agora existem comandos diretos para a sequencia completa.

## O que mudou

- `npm run video:calibration:worklist` monta a worklist Sports2D a partir dos gaps atuais.
- `npm run video:calibration:run -- --execute` tenta executar os clips planejados.
- `npm run video:calibration:process -- --write` normaliza os arquivos de angulos gerados.
- A tela `Videos` mostra essa sequencia no pacote piloto.

## Ponte com o volei

Para `Saque - Contato`, isso organiza as repeticoes que faltam para testar se a IA encontra o contato alto e o braco organizado. Ainda nao e uma nota automatica: depois da execucao, cada evidencia precisa ser pareada com revisao manual.

## Decisao

Manter Sports2D como ferramenta externa por enquanto. O produto fica responsavel por planejar, registrar, normalizar e revisar evidencias; clonar codigo externo so deve acontecer quando os clips reais provarem que isso melhora o resultado.
