# 0012 - Importacao Sports2D na tela

## Dominio do volei

Quando o treinador recebe um dado externo de movimento, ele ainda precisa virar uma observacao tecnica: fundamento, marcador, tempo, criterio e proxima acao.

No saque, por exemplo, `Right_arm` e `Right_elbow` so ajudam quando viram uma pergunta de treino: o braco estava alto e o cotovelo estava estendido no momento certo?

## Conceito de desenvolvimento

Levar um adaptador para a interface reduz atrito. Antes, o arquivo Sports2D precisava passar por um comando. Agora, a tela pode ler o arquivo, converter e criar o card de evidencia.

Isso mantem a mesma regra do produto: automatizacao sugere; revisao tecnica decide.

## Decisao implementada

- A tela `Videos` aceita arquivo `.mot/.csv` de Sports2D.
- O botao `Converter Sports2D` cria evidencia com `source: Sports2D`.
- O botao `Testar amostra Sports2D` usa `reference/sample-sports2d-saque.mot`.
- Sports2D passou a exigir revisao como MediaPipe: a evidencia nasce como `Revisar` e o relatorio fica bloqueado ate confirmacao.

## Proximo teste real

Exportar um `.mot` de um video real da Isa, importar pela tela e comparar o card gerado com a marcacao manual no mesmo frame.
