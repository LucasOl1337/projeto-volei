# 0023 - Worklist Sports2D para volei

No treino, o treinador nao diz apenas "faça saque". Ele define fase, foco e criterio: contato alto, braco estendido, base equilibrada. A worklist faz isso para a IA.

## Conceito

Uma dependencia externa e como uma convidada no treino: ela precisa receber instrucoes claras. O Sports2D sabe medir pose e angulos, mas o Projeto Isa precisa dizer quais clips usar e quais angulos importam para cada fundamento.

## Decisao

- Criamos `npm run video:sports2d:worklist`.
- A worklist usa o manifesto de clips reais.
- Para saque, ataque e bloqueio, o foco inicial e ombro, cotovelo, braco e antebraco.
- Para recepcao, defesa, base e aterrissagem, o foco inicial e joelho, quadril, coxa e tronco.
- O repositorio Sports2D ainda nao foi clonado para dentro do app. Primeiro vamos validar comando, arquivos de saida e revisao manual com clips reais.

## Proximo treino do produto

1. Colocar o video real no caminho `sourceVideo` do manifesto.
2. Rodar o comando da worklist no ambiente Python com Sports2D instalado.
3. Salvar ou copiar o `.mot/.csv` para `expectedAngles`.
4. Rodar `npm run video:clips:process -- --write`.
5. Criar checagem manual pareada antes de usar no relatorio.
