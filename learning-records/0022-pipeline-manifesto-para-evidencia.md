# 0022 - Pipeline do manifesto para evidencia

No volei, um fundamento melhora quando cada etapa tem criterio: gravar o clip, observar a fase certa, comparar e ajustar. O pipeline de video segue a mesma regra.

## Conceito

Um pipeline e uma sequencia de passos com entrada e saida claras. No Projeto Isa, o manifesto aponta onde cada arquivo deve estar. O processador le esse manifesto, procura os angulos Sports2D e transforma o que existir em evidencia revisavel.

## Decisao

- Criamos `npm run video:clips:process`.
- O comando retorna `needs-inputs` quando faltam arquivos reais.
- Quando houver `.mot/.csv`, ele pode converter para JSON de evidencia.
- Com `-- --write`, ele grava a evidencia normalizada no caminho planejado.
- A tela `Videos` mostra o pipeline local para orientar a coleta sem expor uma aula interna.

## Proximo treino do produto

Gravar ou copiar um clip real de `Saque - Contato`, gerar o arquivo Sports2D no caminho do manifesto e rodar:

```bash
npm run video:clips:process -- --write
```

Depois disso, a evidencia ainda precisa de revisao manual pareada antes de entrar no relatorio.
