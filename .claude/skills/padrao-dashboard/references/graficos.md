# Gráficos: forma, marca e antipadrões

## Escolher a forma

Comece pela pergunta, não pelo tipo de gráfico. O tipo é consequência.

**Comparar categorias.** Barra. Vertical até uns 7 itens com nome curto,
horizontal quando o rótulo é longo ou a lista é grande. Ordene por valor, a menos
que a ordem tenha significado próprio (meses, etapas de um funil, tamanhos P/M/G).
Barra sempre parte do zero: cortar a base multiplica visualmente a diferença.

**Realizado contra meta.** Barras agrupadas, uma cor para cada. Se forem muitas
categorias, bullet chart economiza espaço: a barra fina do realizado dentro de uma
faixa que representa a meta.

**Evolução no tempo.** Linha, 2px, sem marcador em série longa. Área só quando o
que importa é o volume acumulado, e nunca empilhada com mais de 3 séries, porque
as de cima ficam impossíveis de ler.

**Parte do todo.** Rosca até 6 fatias, e só quando a pergunta é mesmo "quanto cada
um pesa". Se a pergunta é "quem vendeu mais", barra responde melhor, porque o olho
compara comprimento com muito mais precisão que ângulo. Rosca com 12 fatias é
sempre um erro.

**Progresso de uma métrica.** Radial ou medidor, com o número no centro. Um por
tela, senão vira painel de avião.

**Um número.** Stat tile. Não invente gráfico para um valor só.

**Distribuição.** Histograma. Boxplot se o público entender, e normalmente não
entende, então prefira histograma com a média marcada.

**Correlação.** Dispersão, no máximo 3 séries, porque a partir daí os pontos se
confundem.

**Duas medidas de escalas diferentes.** Dois gráficos empilhados compartilhando o
eixo x, ou as duas indexadas a uma base comum (base 100). Nunca eixo duplo. Ele
permite ao autor escolher qual correlação o leitor vai ver, mexendo nas escalas, e
isso é manipulação mesmo quando não intencional.

**Geográfico.** Só use mapa se a posição no espaço importa para a decisão. "Vendas
por região" quase sempre é melhor em barra: o mapa dá mais destaque para o estado
grande e vazio do que para o pequeno e importante.

## Specs de marca

O padrão visual dos gráficos segue o shadcn charts, que é deliberadamente discreto
para o dado aparecer:

- **Barra**: raio 4 nas pontas. Espaço de 2px entre barras adjacentes e entre
  segmentos empilhados, para separar sem precisar de contorno
- **Linha**: 2px, sem preenchimento, marcador só quando há poucos pontos
- **Ponto**: mínimo 8px, com anel de 2px na cor da superfície quando pontos se
  sobrepõem
- **Grade**: só horizontal, tracejada `3 3`, na cor `--border`. Grade vertical em
  gráfico de barra é ruído puro
- **Eixo**: sem linha de eixo, sem tick. Só o rótulo, 11px em muted, com 8px de
  respiro
- **Máximo do eixo**: escolha um topo divisível pelo número de divisões, senão
  saem rótulos como 9.375 e 3.125, que ninguém lê
- **Rótulo direto**: até 10 barras, coloque o valor na ponta. Acima disso o rótulo
  vira sujeira e o tooltip resolve
- **Legenda**: obrigatória com 2 séries ou mais. Quadradinho de 10px com raio 2,
  texto em muted
- **Texto usa cor de texto.** Valor, rótulo e legenda ficam em foreground ou
  muted, nunca na cor da série. Quem carrega a identidade é o quadradinho ao lado

## Rosca, os detalhes que dão trabalho

Se você for desenhar a rosca à mão em SVG, o caminho mais simples é um `<circle>`
por fatia com `stroke-dasharray`, e não um `<path>` com arco. Motivos: o
`stroke-dasharray` é animável, o posicionamento sai com `stroke-dashoffset` sem
trigonometria, e a varredura de entrada fica natural.

O rótulo de percentual dentro da fatia só cabe acima de uns 7% do total. Abaixo
disso ele encavala com o vizinho: deixe só na legenda. E a cor do texto tem que
seguir a fatia: branco em fatia escura, quase preto em fatia clara. Um percentual
escuro sobre verde escuro some.

## Antipadrões

Se o gráfico se encaixa em algum destes, está errado:

- **Eixo duplo.** Já explicado acima, é o pior de todos
- **Barra que não começa no zero.** Exagera a diferença
- **3D em qualquer forma.** Distorce área e ângulo
- **Rosca com mais de 6 fatias**
- **Cor girando por posição.** Filtrou, repintou, leitor perdido
- **Arco-íris para magnitude.** Sequencial é um tom só
- **Valor em cima de cada ponto de uma série longa.** Vira mancha de texto
- **Legenda longe do gráfico**, obrigando a ir e voltar com o olho
- **Rótulo do eixo x na diagonal quando cabia horizontal.** Só incline quando
  realmente não couber, e aí -42 graus é o ângulo que se lê melhor
- **Truncar nome com reticências sem tooltip.** Se cortou, o tooltip precisa
  mostrar inteiro
- **Grade mais forte que o dado**

## Bibliotecas

Recharts com os wrappers do shadcn (`ChartContainer`, `ChartTooltip`,
`ChartLegend`) é o caminho padrão em React: já vem com os tokens `--chart-N` e o
tooltip no formato certo.

SVG na mão compensa quando o gráfico é simples (barra, rosca, medidor) e você quer
um arquivo autocontido, sem dependência. Custa mais código, mas o controle sobre
animação e rótulo é total.

Evite biblioteca de gráfico que traz o próprio tema: o painel volta a ter duas
identidades brigando.
