# 0056 - Videos abertos para testar a aba Videos

No treino, uma evidencia precisa ter origem clara. Um clip aleatorio sem fonte pode ate funcionar tecnicamente, mas nao e bom material de produto.

Decisao: a aba `Videos` ganhou uma biblioteca pequena de exemplos com videos abertos em `public/assets/videos/`. Cada item registra fundamento, foco de teste, duracao aproximada, licenca e fonte.

Conceito de desenvolvimento: asset e um recurso usado pela interface. O componente nao guarda o video dentro dele; ele guarda o caminho e os metadados, como uma ficha tecnica do exercicio.

Arquivos adicionados:

- `public/assets/videos/sample-saque-baixo.webm`
- `public/assets/videos/sample-jogo-quadra.webm`
- `public/assets/videos/sample-ace-paris.webm`
- `public/assets/videos/SOURCES.md`

Proximo cuidado: quando entrar video real da Isa, manter a mesma regra de ficha tecnica: fundamento, fase, criterio observado e revisao manual antes de usar no relatorio.
