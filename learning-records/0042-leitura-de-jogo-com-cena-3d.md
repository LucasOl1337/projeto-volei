# Leitura de jogo com cena 3D

A aba Leitura de jogo passou a usar cenas em estilo jogo 3D com bonequinhos articulados.

Decisao de produto:

- O visual fica mais chamativo e personalizado para volei, mas a pergunta, as opcoes e as pistas continuam em UI real.
- A imagem mostra o lance; os botoes treinam a decisao.
- Os bonequinhos deixam a posicao dos atletas mais clara sem depender de video real nesta fase do MVP.

Conceito pequeno de desenvolvimento: separar conteudo visual de interacao. A imagem cria contexto, mas a resposta do atleta fica em componentes HTML, porque isso e mais acessivel, editavel e facil de validar.
