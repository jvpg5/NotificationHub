---
name: padrao-dashboard
description: >-
  Padrão de UI/UX, componentes shadcn/ui, escolha de gráfico, tipografia, cores,
  espaçamento e interação para os dashboards internos da empresa. Use sempre que a
  tarefa envolver dashboard, painel, relatório visual, indicador, KPI, gráfico,
  tabela de dados, tela de análise, ou substituir e replicar algo que hoje está no
  Power BI. Vale também quando o pedido não usa a palavra dashboard, por exemplo
  mostrar as vendas por região, uma tela com os números do mês, comparar realizado
  e meta, visualizar a planilha. Consulte antes de escrever a primeira linha de
  layout ou de gráfico, porque decidir a forma depois de codar dá retrabalho.
metadata:
  author: Amara Liz
---

# Padrão de dashboard

Este é o padrão visual e de comportamento dos painéis internos. A ideia não é
engessar: é evitar que cada tela reinvente espaçamento, cor de série e nome de
componente, porque quando isso acontece o usuário precisa reaprender a ler cada
página.

O stack assumido é **React + Tailwind + shadcn/ui + ícones Lucide**. Se o projeto
for outro (Python/Streamlit, HTML puro), as regras de forma, cor, tipografia e
interação continuam valendo, só muda a implementação.

## A ordem que evita retrabalho

Decidir na ordem errada é o que gera a maior parte do conserto depois:

1. **Qual pergunta a tela responde?** Uma frase. Se não couber em uma frase, são
   duas telas.
2. **Qual a forma certa para cada resposta?** Gráfico, tabela ou número solto.
   Veja `references/graficos.md`.
3. **Qual componente carrega essa forma?** Veja `references/componentes.md`.
4. **Só então layout, e por último cor.** Cor escolhida primeiro quase sempre
   vira decoração e atrapalha a leitura.

## Fundamentos que valem para toda tela

**Resumo antes do detalhe.** A primeira faixa da tela responde a pergunta
principal em números grandes. Quem só tem dez segundos precisa sair sabendo o
essencial sem rolar. O detalhe vem depois, e a tabela por último.

**Espaçamento sempre múltiplo de 4.** Gap de grade 20, padding de card 20 no topo
e 24 nas laterais, gap interno 12, altura de controle 36. Isso não é preciosismo:
quando o ritmo é irregular o olho percebe como "desalinhado" sem saber dizer por
quê.

**Grade de 12 colunas com `align-items: start`.** Sem o `start`, todos os cards da
linha esticam até a altura do mais alto e sobra um vazio enorme embaixo dos
menores. Larguras típicas: gráfico principal 6, gráfico de apoio 3, tabela 9,
medidor 3. Colapsa para 6 abaixo de 1320px e para 12 abaixo de 760px.

**Tipografia em duas famílias.** Poppins carrega título, número grande e rótulo.
Nunito carrega corpo, descrição, legenda e tabela. Escala em px: 32 (KPI), 24, 20,
15 (título de card), 14 (corpo), 12,5 (descrição), 11 (eixo e legenda).
Todo número que aparece em coluna leva `font-variant-numeric: tabular-nums`, senão
as casas dançam entre as linhas. Números grandes pedem `letter-spacing: -0.03em`,
títulos `-0.01em`.

**Um card sem título é um card órfão.** Todo card tem CardTitle, e CardDescription
quando o título sozinho não diz o recorte ("Sete locais lançados na aba
AGROCERES"). Se a descrição só repete o que o gráfico mostra, corte: legenda que
narra o óbvio é o que faz uma tela parecer gerada automaticamente.

**Escreva do lado do usuário.** Nomeie pelo que a pessoa reconhece, não pela
estrutura do sistema. "Última atualização", não "timestamp de carga". Um botão
diz exatamente o que vai acontecer.

**Escolha os neutros, não herde.** Cinza médio puro parece descuido. Use a escala
zinc do shadcn e deixe a cor da marca só como `--primary`. Os tokens completos
estão em `references/tokens.md`.

## Escolha do gráfico, versão curta

A pergunta escolhe a forma:

| A pergunta é | Use |
|---|---|
| Quanto cada categoria fez? | Barra. Horizontal se o rótulo é longo ou passa de 7 itens |
| Bateu a meta? | Barras agrupadas (realizado e meta) ou bullet |
| Como evoluiu no tempo? | Linha. Área só quando o volume acumulado importa |
| Quanto cada parte pesa no todo? | Rosca, até 6 fatias. Acima disso, barra |
| Quanto falta para uma métrica? | Radial ou medidor |
| Qual é o número? | Stat tile, não gráfico |
| Duas medidas de escalas diferentes | Dois gráficos ou índice na mesma base. **Nunca eixo duplo** |

Eixo duplo é o erro mais comum e o mais caro: ele deixa o autor escolher qual
correlação o leitor vai enxergar, e isso não é honesto. As specs de marca, cor de
série, eixo, grade e rótulo estão em `references/graficos.md`.

## Interação, versão curta

Filtros numa linha só, acima de tudo, valendo para a página inteira, com um botão
de limpar sempre visível. Tooltip em todo gráfico. Motion só na entrada. Sempre
existe um caminho para ver os números crus em tabela. O detalhamento está em
`references/interacao.md`.

## Antes de dar por pronto

Rode esta lista. Ela é curta de propósito, são os erros que mais reaparecem:

- [ ] A tela responde a uma pergunta e o resumo dela está na primeira faixa
- [ ] Nenhum eixo duplo
- [ ] Barra começa no zero
- [ ] Cor segue a entidade, não a posição no ranking (filtrar não pode repintar
      quem sobrou)
- [ ] Duas séries ou mais têm legenda, e a identidade não depende só da cor
- [ ] Todo número em coluna está com tabular-nums e alinhado à direita
- [ ] Existe estado de carregando e estado de vazio, e o vazio diz o que fazer
- [ ] Foco de teclado visível em todo controle
- [ ] Contraste: 4.5:1 em texto, 3:1 em marca de gráfico e borda de controle
- [ ] `prefers-reduced-motion` desliga a animação
- [ ] Nada estoura na horizontal: tabela e gráfico largo rolam dentro do próprio
      container, o body nunca

## Arquivos de apoio

Leia sob demanda, não tudo de uma vez:

- `references/tokens.md` — paleta, tokens CSS prontos, tipografia, espaçamento,
  sombras e raio. Comece por aqui ao montar um projeto novo.
- `references/componentes.md` — catálogo shadcn/ui: qual componente para qual
  situação, anatomia do card de KPI, quando Select e quando Combobox, quando
  Switch e quando Checkbox.
- `references/graficos.md` — escolha da forma em detalhe, specs de marca, cores
  de série, eixo, grade, rótulo, tooltip e os antipadrões.
- `references/interacao.md` — filtros, estados de carga e vazio, motion,
  tela cheia, acessibilidade e as Laws of UX aplicadas.
- `references/planilhas.md` — leia quando o dado vier de Excel. São armadilhas
  que já custaram números errados em painel: várias tabelas na mesma aba, fórmula
  em cache, layout posicional, arquivo travado, total que não bate. Traz também a
  regra de quanto ler do arquivo ao inspecionar, resumida logo abaixo.

## Ao inspecionar uma planilha, leia o formato e não o conteúdo

Para entender um arquivo e escrever o leitor dele, o necessário é o **tamanho**
(linhas, colunas, abas), os **cabeçalhos** e o **tipo de cada coluna**. Uma linha
de exemplo é aceitável quando o cabeçalho não deixa claro o formato do valor
(data como texto, decimal com vírgula, código com zero à esquerda). Uma linha,
não dez.

Não leia a planilha inteira para inspecionar. É dado real de cliente e de
faturamento, não precisa passar pelo contexto de um agente para que alguém
escreva um parser, e ver quinze mil linhas não ensina nada que o cabeçalho mais a
primeira linha já não tenham dito.

Ler tudo é trabalho da importação em produção, que roda em código e grava no
banco. Se precisar mesmo do conteúdo completo para conferir algo, faça em código
sobre agregados e devolva só o resultado: "a soma bate" ou "faltam 60 unidades na
coluna D", nunca o despejo das linhas. O `references/planilhas.md` tem o como
fazer.
