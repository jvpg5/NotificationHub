# Interação, estados, motion e acessibilidade

## Filtros

Uma linha só, acima de tudo, valendo para a página inteira. Filtro escondido em
menu lateral faz o usuário desconfiar do número que está vendo, porque ele não
sabe se tem algo filtrado.

- Rótulo acima do controle, 12px muted
- Estado atual sempre visível no gatilho, nunca só "Selecione"
- Botão de limpar sempre presente, mesmo sem filtro ativo, para a linha não pular
  de tamanho quando ele aparece
- Filtro que só vale para um card mora dentro daquele card
- Todos os gráficos e a tabela reagem ao mesmo filtro, ao mesmo tempo. Se um
  componente ignora o filtro, diga isso no card dele

Lei de Hick: cada opção a mais aumenta o tempo de decisão. Se você tem seis
filtros, provavelmente dois deles são visões diferentes e deveriam ser tabs.

## Estados

Toda tela que busca dado tem quatro estados, e os três últimos são os esquecidos:

1. **Carregando** — skeleton com a forma do conteúdo
2. **Vazio** — o que fazer, não só "sem dados"
3. **Erro** — o que aconteceu e o que tentar. "Não consegui ler a planilha, o
   arquivo pode estar aberto no Excel. Tente de novo em alguns segundos."
4. **Desatualizado** — quando o dado é de outro momento, diga qual. Badge discreto
   com a data, não um alerta gritando

Erro sem saída ("Erro inesperado") é o que faz o usuário abandonar a ferramenta e
voltar para a planilha.

## Motion

A regra é: **animação na entrada, não durante o uso**. Enquanto a pessoa lê o
gráfico, nada se mexe, porque movimento chama o olho e atrapalha a comparação.

Na abertura, o que funciona:

- Barras crescendo do zero, em cascata de 60 a 80ms entre uma e outra
- Rosca varrendo a partir do topo no sentido horário, cada fatia na sua vez
- Medidor preenchendo o arco
- Números contando de zero até o valor
- Legenda entrando com um leve deslocamento lateral

Duração total entre 700 e 1000ms. Easing `cubic-bezier(.22,1,.36,1)`, que sai
rápido e assenta devagar.

Ao trocar filtro, anime de novo, mas curto (300 a 400ms) e sem cascata. Ali a
animação é feedback de que o dado mudou, não apresentação. Cascata a cada clique
cansa rápido.

`prefers-reduced-motion: reduce` desliga tudo e mostra o estado final. Não é
detalhe de acessibilidade opcional: para quem tem sensibilidade vestibular,
animação em tela cheia causa mal-estar físico.

Hover: transição de 150ms em cor e sombra. Nada além disso.

## Tela cheia

Modo tela cheia esconde os filtros de página e mantém só os controles que vivem
dentro do próprio gráfico. Serve para reunião e para TV na parede. Saída visível e
`Esc` funcionando.

## Acessibilidade

- Contraste 4.5:1 em texto, 3:1 em marca de gráfico e borda de controle
- Foco de teclado visível em tudo: anel de 3px na cor primary com 18% de opacidade
- Ordem de tabulação seguindo a ordem visual
- Identidade nunca só pela cor: legenda, rótulo direto ou ícone junto
- Todo gráfico tem `role="img"` e um `aria-label` que diz o que ele mostra
- A tabela é a versão acessível do gráfico. Sempre exista um caminho até ela
- Alvo de clique com no mínimo 44px em toque, mesmo que o desenho seja menor: a
  área sensível pode ser maior que o pixel colorido

## Laws of UX que mais aparecem em painel

**Jakob.** O usuário passa a maior parte do tempo em outras ferramentas. Filtro no
topo, tabs onde todo mundo põe tab, seta para baixo no select. Originalidade em
convenção custa caro.

**Fitts.** Alvo pequeno e longe custa tempo. Botão de limpar filtro perto dos
filtros, não no rodapé.

**Hick.** Menos opções, decisão mais rápida. Filtro que quase ninguém usa pode ir
para "mais filtros".

**Miller.** A memória de trabalho segura pouca coisa. Três a quatro KPIs por
faixa, até 7 séries por gráfico.

**Proximidade.** O que está junto é lido como relacionado. Legenda perto do
gráfico, rótulo perto do controle. Espaçamento é agrupamento.

**Von Restorff.** O diferente é lembrado. Por isso a cor de destaque é uma só: se
tudo se destaca, nada se destaca.
