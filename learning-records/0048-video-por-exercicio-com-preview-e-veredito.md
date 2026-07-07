# Video por exercicio com preview e veredito

Data: 2026-07-01

No treino de volei, o video precisa ter contexto. Um mesmo movimento de braco pode significar saque, ataque ou bloqueio; por isso o atleta deve escolher o exercicio antes de enviar o video. O app passa a usar esse exercicio como criterio de leitura, nao apenas o fundamento solto.

Conceito de desenvolvimento: estado e metadados andam juntos. O estado guarda qual exercicio esta selecionado; os metadados desse exercicio acompanham a evidencia gerada para explicar o que a IA tentou verificar.

Decisao: a aba Videos agora prioriza o fluxo `exercicio -> video -> preview -> processamento -> evidencia revisavel`. O veredito continua sendo inicial e revisavel, porque MediaPipe ajuda a localizar movimento, mas a correcao final ainda precisa de criterio tecnico.
