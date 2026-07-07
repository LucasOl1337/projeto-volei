# 0025 - Revisao do runner na tela

No volei, um relatorio bom nao mostra so o placar. Ele mostra o que aconteceu e qual ajuste vem depois. O mesmo vale para o runner Sports2D.

## Conceito

Um JSON de terminal e uma evidencia tecnica para o sistema, mas nao e uma boa experiencia para o usuario. A tela precisa traduzir status de execucao em acao: falta video, falta instalar Sports2D, pronto para rodar, rodou mas falta copiar o arquivo de angulos, ou pronto para processar.

## Decisao

- A tela `Videos` aceita `isa.sports2d-run-report.v1`.
- O botao `Revisar runner` transforma o JSON em cards por clip.
- O app mostra a proxima acao de cada clip.
- Isso integra o pipeline externo ao produto sem prometer recomendacao automatica.

## Proximo treino do produto

Depois de rodar:

```bash
npm run video:sports2d:run
```

colar a saida na tela `Videos` para conferir o estado da coleta. Quando o status chegar a `has-angles`, rodar:

```bash
npm run video:clips:process -- --write
```
