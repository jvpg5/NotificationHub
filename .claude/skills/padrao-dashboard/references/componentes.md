# Componentes: qual usar em qual situação

Catálogo shadcn/ui aplicado a painel. O objetivo aqui é tirar a dúvida de "Select
ou Combobox?", "Switch ou Checkbox?" antes de você escrever o componente e
descobrir depois que era o outro.

## Card, a unidade de tudo

```
Card
├── CardHeader
│   ├── CardTitle        15px, Poppins 600
│   └── CardDescription  12,5px, muted-foreground, opcional
└── CardContent
```

`rounded-lg border bg-card shadow-sm`. Sem CardFooter em painel: rodapé de card
vira depósito de frase explicativa, e frase explicativa embaixo de gráfico quase
sempre repete o que o gráfico já mostrou.

Um card por ideia. Se você precisa de dois títulos dentro do mesmo card, são dois
cards.

## Card de KPI

Anatomia, de cima para baixo:

1. Rótulo em `card-description` (12,5px, muted). O rótulo vem **antes** do número,
   porque quem lê precisa saber do que é antes de processar o valor.
2. Número em 32px Poppins 600, com tabular-nums.
3. Badge de variação, quando existe comparação. `align-self: flex-start`, senão
   ele estica pela largura do card e vira uma faixa.
4. Ícone Lucide de 18px no canto superior direito, em muted com opacidade 0.65.
   Ele é orientação periférica, não protagonista. Escolha pelo significado:
   `package` para volume, `target` para meta, `flag` para o que falta,
   `trending-up` para crescimento, `pie-chart` para concentração.

Três a quatro KPIs por faixa. Cinco já viram parede de número e ninguém lê.

## Tabs

Para alternar entre visões do **mesmo escopo**: páginas do painel, produtos
diferentes, períodos. `TabsList` com fundo muted e padding 4, `TabsTrigger` ativo
com fundo branco e sombra xs.

Tabs não é filtro. Se as opções se combinam ("quero Vilhena **e** Cerejeiras"),
é filtro. Se são excludentes e são visões inteiras, é tab.

## Select, Combobox e Filtro

| Situação | Componente |
|---|---|
| Até 15 opções conhecidas, escolha única | Select |
| Mais de 15, ou o usuário sabe o nome e quer digitar | Combobox com busca |
| Escolha múltipla | Combobox com checkbox e contador no gatilho |
| Faixa de datas | DatePicker com presets (7 dias, mês, ano) |

Todo filtro tem rótulo acima em 12px muted. O gatilho mostra o valor escolhido,
nunca só "Selecione". Chevron do Lucide à direita, `pointer-events: none` para não
roubar o clique.

## Switch e Checkbox

**Switch** quando o efeito é imediato e o estado é do ambiente: ligar comparação,
mostrar percentual, entrar em tela cheia. Se muda a tela no ato, é Switch.

**Checkbox** quando é seleção dentro de um conjunto ou parte de um formulário que
só vale quando você confirma.

Um Switch que precisa de um botão "aplicar" depois está errado, deveria ser
Checkbox.

## Badge

| Variante | Uso |
|---|---|
| `outline` | rótulo neutro, contagem, data |
| `secondary` | estado sem carga (neutro, sem mudança) |
| tinta da marca a 10% de opacidade | delta positivo |
| tinta de erro a 10% | delta negativo |

Badge é para uma ou duas palavras, ou um número. Se precisou de frase, era texto.

## Table

Use quando o número exato importa e o leitor vai comparar linha a linha. Gráfico
mostra a forma, tabela mostra o valor.

- Cabeçalho: 12px, muted, 600, uma linha de borda embaixo, altura 40
- Célula: padding 10 por 16, borda embaixo
- `hover:bg-muted/50` na linha, porque a linha longa perde o olho
- Número à direita com tabular-nums, texto à esquerda
- Sempre uma linha de total com fundo muted
- Passou de 50 linhas: paginação ou virtualização, e uma busca

Delta dentro da tabela vai como Badge, não como texto colorido. Cor sozinha não
comunica para quem não distingue as cores.

## Alert

Só para o que **muda a leitura do dado**: dados de outra data, base incompleta,
número em revisão. Se o gráfico já mostra, não precisa de alerta.

Um alerta permanente no topo vira parte do papel de parede e ninguém mais lê.
Prefira um Badge discreto perto do que ele qualifica.

## Skeleton e estado vazio

**Skeleton** enquanto carrega, com a forma do que vai aparecer. Spinner no meio da
tela não diz nada sobre o que vem.

**Estado vazio** diz o que fazer, não só que não tem nada. "Nenhuma venda lançada
para este filtro. Tente ampliar o período ou limpar o local." Um botão de ação
junto quando existe uma ação óbvia.

Diferencie: vazio por filtro é diferente de vazio por falta de dado na origem. O
primeiro se resolve mexendo no filtro, o segundo não.

## Tooltip

Todo gráfico tem. Formato do shadcn charts:

```
┌──────────────────────┐
│ CEREJEIRAS           │  label, 600, foreground
│ ▍ Vendido    2.583   │  barra 3px na cor da série, nome muted, valor à direita
│ ▍ Meta       9.500   │
└──────────────────────┘
```

`rounded-lg border bg-popover px-2.5 py-1.5 text-xs shadow-xl`, largura mínima de
9rem para os valores não pularem entre uma barra e outra.

Nunca esconda informação essencial só no tooltip: em toque não existe hover, e em
impressão o tooltip não sai.

## Botão

Painel usa `outline` e `ghost` na maior parte. `default` (preenchido) fica
reservado para a ação principal da tela, e normalmente painel não tem ação
principal, tem consulta. Ícone Lucide de 14px à esquerda do texto, gap 6.
