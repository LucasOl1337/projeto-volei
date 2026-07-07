# 0024 - Runner Sports2D controlado

No treino, nao basta montar a fila de exercicios. O treinador tambem precisa saber se a bola, a quadra e o atleta estao prontas para executar. O runner faz essa checagem para a analise de video.

## Conceito

Um runner e um comando que executa uma lista de tarefas. No Projeto Isa, ele le a worklist Sports2D, verifica se o video existe, confere se o comando `sports2d` esta instalado e so roda a analise quando recebe `--execute`.

## Decisao

- Criamos `npm run video:sports2d:run`.
- Por padrao, ele diagnostica e nao executa IA.
- Para executar, use `npm run video:sports2d:run -- --execute`.
- O status `ran-needs-angles` diferencia "o comando rodou" de "o arquivo de angulos apareceu".
- A evidencia continua nascendo como `Revisar` depois do processamento.

## Proximo treino do produto

Quando houver um clip real no caminho `sourceVideo`, instalar Sports2D no ambiente Python, rodar:

```bash
npm run video:sports2d:run -- --execute
```

Depois conferir o `.mot/.csv` em `expectedAngles` e rodar:

```bash
npm run video:clips:process -- --write
```
