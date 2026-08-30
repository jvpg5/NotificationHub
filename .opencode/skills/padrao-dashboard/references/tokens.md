# Tokens: cor, tipografia, espaçamento

Base **zinc** do shadcn/ui, com a cor da marca entrando só como `--primary`.
A razão de a marca ficar confinada ao primary é que o painel precisa funcionar
para várias áreas: troca-se uma variável e a identidade muda, sem tocar em
componente nenhum.

## Bloco pronto para colar

```css
:root{
  /* superfícies e texto */
  --background:#FFFFFF;
  --foreground:#09090B;
  --card:#FFFFFF;
  --card-foreground:#09090B;
  --popover:#FFFFFF;
  --muted:#F4F4F5;            /* trilho de barra, fundo de tab, hover de linha */
  --muted-foreground:#71717A; /* descrição, eixo, legenda */
  --accent:#F4F4F5;
  --border:#E4E4E7;
  --input:#E4E4E7;
  --page:#FAFAFA;             /* fundo da página, um degrau abaixo do card */

  /* marca */
  --primary:#1E9E3E;          /* troque pela cor da área */
  --primary-foreground:#FAFAFA;
  --ring:var(--primary);

  /* séries de gráfico */
  --chart-1:#166534; --chart-2:#86EFAC; --chart-3:#22A54A;
  --chart-4:#4ADE80; --chart-5:#0B3B1C; --chart-6:#BBF7D0; --chart-7:#A3A62E;

  /* estado, separado das séries de propósito */
  --ok:#16A34A; --alerta:#D97706; --erro:#DC2626;

  --radius:8px;      /* card e tabs */
  --radius-md:6px;   /* botão, select, input, badge */

  --shadow-xs:0 1px 2px 0 rgb(9 9 11 / .04);
  --shadow-sm:0 1px 2px 0 rgb(9 9 11 / .05), 0 1px 3px 0 rgb(9 9 11 / .05);
  --shadow-xl:0 8px 10px -6px rgb(9 9 11 / .08), 0 20px 25px -5px rgb(9 9 11 / .10);
}
```

O fundo da página um degrau mais escuro que o card é o que faz o card existir sem
precisar de borda grossa nem sombra pesada. Se a borda estiver "feia", quase
sempre o problema é fundo branco no branco compensado com sombra demais.

## Cor de série

Três regras que resolvem 90% dos casos:

**A cor pertence à entidade, não à posição.** Cerejeiras é sempre `--chart-2`,
esteja em primeiro ou em quinto lugar. Se a cor seguir o ranking, filtrar repinta
tudo e o leitor perde a referência entre uma visão e outra.

**Sequencial é um tom só, do claro ao escuro.** Serve para magnitude contínua
(mapa de calor, choropleth). Arco-íris nunca.

**Divergente são dois tons opostos com cinza no meio.** Serve quando existe um
ponto neutro real (acima e abaixo da meta, ganho e perda). O meio precisa ler como
"nada", por isso é cinza e não uma terceira cor.

Cores de estado (ok, alerta, erro) ficam reservadas para estado. Se você usar
vermelho como "série 4", no dia em que algo der errado de verdade não sobra cor
para dizer isso. E estado nunca aparece só como cor: vem com ícone ou rótulo,
porque cerca de 8% dos homens não distingue verde de vermelho.

Até 7 séries a paleta acima aguenta com rótulo direto. Passou disso, agrupe o
resto em "Outros" ou quebre em múltiplos pequenos. Não gere um oitavo tom.

## Tipografia

```css
--font-titulo: "Poppins", ui-sans-serif, system-ui, sans-serif;
--font-corpo:  "Nunito", ui-sans-serif, system-ui, sans-serif;
```

**Poppins** em: h1 a h3, CardTitle, número de KPI, rótulo de eixo em destaque,
valor dentro do gráfico, cabeçalho de tabela.
**Nunito** em: corpo, CardDescription, legenda, célula de tabela, texto de
botão, texto de badge.

Escala em px, e fique nela:

| Uso | Tamanho | Peso |
|---|---|---|
| Número de KPI | 32 | 600 |
| Título de seção | 20 | 600 |
| CardTitle | 15 | 600 |
| Corpo | 14 | 400 |
| CardDescription, rótulo de filtro | 12,5 | 400 a 600 |
| Eixo, legenda, badge | 11 a 11,5 | 500 a 600 |

Detalhes que dão o acabamento:

- `font-variant-numeric: tabular-nums` em **todo** número que aparece em coluna,
  em tabela e em KPI que anima. Sem isso as casas dançam e a coluna parece torta.
- `letter-spacing: -0.03em` em número grande, `-0.01em` em título. Fontes
  geométricas como Poppins abrem demais em corpo grande.
- Número em tabela sempre alinhado à direita. Texto sempre à esquerda.
- `text-wrap: balance` em título de duas linhas.
- Texto corrido não passa de 65 caracteres por linha.

## Espaçamento

Tudo múltiplo de 4. Os valores que aparecem o tempo todo:

| Onde | Valor |
|---|---|
| Gap da grade de cards | 20 |
| Padding do card | 20 no topo, 24 nas laterais, 20 embaixo |
| Gap entre título e descrição | 4 |
| Gap interno do conteúdo do card | 12 |
| Altura de select, input e botão | 36 |
| Padding lateral da página | 32 (24 no mobile) |
| Largura máxima da página | 1640 |

## Grade

```css
.grid12{
  display:grid;
  grid-template-columns:repeat(12, minmax(0,1fr));
  gap:20px;
  align-items:start; /* sem isso, card curto estica e sobra vazio */
}
@media (max-width:1320px){ /* spans 3,4,6 viram 6; 9 vira 12 */ }
@media (max-width:760px){  /* tudo vira 12 */ }
```

O `minmax(0,1fr)` importa: sem ele, um filho com conteúdo largo (tabela, gráfico)
estoura a coluna em vez de rolar dentro dela.

Combinações que funcionam bem:

- 6 + 3 + 3 — gráfico principal, ranking, composição
- 3 + 9 — medidor e tabela
- 4 + 4 + 4 — três KPIs
- 12 — tabela longa ou gráfico de série temporal
