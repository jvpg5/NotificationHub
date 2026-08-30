# Quando o dado vem de planilha

Leia isto antes de escrever o leitor de Excel. Todas as armadilhas aqui já
produziram número errado em painel de produção, e nenhuma delas dá erro na tela:
o painel mostra um valor plausível e ninguém desconfia.

## Quanto ler da planilha ao inspecionar

Para entender um arquivo e escrever o leitor dele, o que você precisa é do
**formato**, não do conteúdo:

- as dimensões (quantas linhas e quantas colunas, quais abas existem)
- os cabeçalhos
- o tipo de cada coluna

**Uma linha de exemplo** é aceitável quando o cabeçalho sozinho não deixa claro o
formato do valor, por exemplo para descobrir se a data vem como texto ou como
data, se o decimal usa vírgula, se o código tem zero à esquerda. Uma linha, não
dez.

**Não leia a planilha inteira para inspecionar.** Três motivos, e o primeiro é o
que mais importa:

1. **É dado real de gente e de negócio.** Nome de cliente, volume por praça,
   meta, faturamento. Nada disso precisa passar pelo contexto de um agente para
   que você escreva um parser. Ler menos é a postura correta por padrão, não uma
   otimização.
2. **Não melhora o resultado.** O parser é escrito contra a estrutura. Ver quinze
   mil linhas não ensina nada que a linha um mais o cabeçalho já não tenham dito.
3. **Custa contexto e atenção.** Planilha grande despejada no contexto empurra
   para fora justamente a informação que você precisa manter à mão.

Ler todas as linhas é trabalho da **importação em produção**, que roda em código,
grava no banco e não devolve o conteúdo para ninguém ler. Isso é diferente de
inspecionar o arquivo para entender o formato.

Se em algum momento você precisar mesmo do conteúdo completo, por exemplo para
conferir um total que não bate, faça isso **em código, sobre agregados**: some,
conte, compare e devolva só o resultado da conferência. O número que interessa é
"a soma bate" ou "faltam 60 unidades na coluna D", não o despejo das linhas.

Na prática:

```python
# dimensões, abas, cabeçalho e tipos, sem carregar o conteúdo
wb = openpyxl.load_workbook(caminho, read_only=True, data_only=True)
for ws in wb.worksheets:
    print(ws.title, ws.max_row, ws.max_column)
cab = [c.value for c in next(ws.iter_rows(min_row=1, max_row=1))]
amostra = [c.value for c in next(ws.iter_rows(min_row=2, max_row=2))]  # UMA linha
```

```python
# em pandas, o equivalente
pd.read_excel(caminho, nrows=1)   # cabeçalho + uma linha
df.dtypes                          # tipos
```

O `read_only=True` importa: sem ele o openpyxl carrega a planilha inteira na
memória mesmo que você só leia uma célula.

## Uma aba pode ter várias tabelas

Planilha feita por gente raramente é uma tabela retangular só. É comum a mesma aba
ter um bloco por região, um por mês, um resumo em cima e o detalhe embaixo, ou uma
tabela à esquerda e outra à direita. Quem lê com `pd.read_excel(caminho)` recebe
tudo isso como **uma** tabela: os cabeçalhos do segundo bloco viram linhas de
dado, as colunas que só existem num dos blocos viram `NaN`, e nada disso dá erro.
O painel mostra um número plausível e errado.

Então, antes de escrever o parser, **mapeie a estrutura e veja onde ela muda**.
Percorra as linhas olhando só a forma, não o conteúdo:

- **Linha totalmente vazia** é o separador mais comum. Uma linha em branco quase
  sempre marca fim de bloco; duas ou mais, fim de seção.
- **Coluna A com texto e o resto vazio** costuma ser título de bloco
  ("VILHENA", "1º TRIMESTRE"). Marca o começo de uma parte nova.
- **Cabeçalho repetido.** Se os mesmos nomes de coluna aparecem de novo lá
  embaixo, começou outro bloco com o mesmo formato.
- **Muda a quantidade de colunas preenchidas.** Um trecho que usa A:D e outro que
  usa A:H são duas tabelas, mesmo sem linha vazia entre elas.
- **Muda o tipo da coluna.** Coluna que vinha numérica e passa a vir texto no meio
  da aba costuma ser fronteira de bloco, não sujeira.
- **Célula mesclada, negrito ou fundo colorido** marcando faixa de título. Sinal
  fraco sozinho, bom quando confirma um dos anteriores.

Não confie num sinal só, e não assuma que a estrutura do topo vale para a aba
inteira. Varra até o fim: o caso que quebra é justamente o bloco extra que alguém
colou embaixo e ninguém avisou.

O mapeamento sai barato, porque também é formato e não conteúdo:

```python
ws = openpyxl.load_workbook(caminho, read_only=True, data_only=True)['Plan1']
for i, row in enumerate(ws.iter_rows(values_only=True), start=1):
    preenchidas = [j for j, v in enumerate(row) if v not in (None, '')]
    if not preenchidas:
        print(i, 'VAZIA')                      # candidata a separador
    elif preenchidas == [0]:
        print(i, 'TITULO?', row[0])            # só a coluna A tem algo
    else:
        print(i, 'cols', preenchidas[0], '..', preenchidas[-1])
```

Isso devolve o mapa da aba (onde começa e termina cada bloco) sem despejar o
conteúdo. Com o mapa na mão, leia cada bloco como uma tabela própria — em pandas,
`skiprows` e `nrows` por bloco, ou `usecols` quando as tabelas estão lado a lado.

E registre quantos blocos você esperava encontrar. Se na próxima importação
vierem 6 em vez de 7, é melhor falhar dizendo isso do que importar 6 calado.

## Fórmula não é calculada por quem lê de fora

`openpyxl`, `pandas` e a maioria dos leitores não recalculam fórmula. Eles leem o
**valor em cache** que o Excel gravou no último salvamento. Consequências:

- Arquivo gerado por script, sem passar pelo Excel, vem com célula de fórmula
  vazia
- Arquivo salvo com cálculo manual desligado vem com valor velho
- `data_only=True` devolve `None` quando não há cache

Se o número é crítico, **recalcule a partir das células de origem** em vez de ler
o total pronto. Custa algumas linhas e protege contra o item seguinte.

## Fórmula faltando em uma célula só

Uma linha de total com `=SOMA()` em nove colunas e a décima vazia é invisível: a
coluna mostra zero, e zero é um número perfeitamente aceitável.

O jeito de pegar isso é somar as células de origem e comparar com o total escrito.
Divergiu, a fórmula está quebrada ou o intervalo está errado. Vale rodar essa
verificação toda importação e registrar quando não bate, porque isso não se
resolve sozinho.

Sinal complementar: quando a planilha soma nos dois sentidos (uma coluna de TOTAL
por linha e uma linha de total por coluna), os dois totais têm que fechar. Se o
canto inferior direito não bate por dois caminhos, tem fórmula faltando.

## Layout posicional quebra quando inserem linha

Planilha preenchida por gente cresce. Alguém insere um cliente no meio e todos os
números de linha abaixo mudam. Um parser com linha fixa passa a ler a região
errada, e continua funcionando, só que com o dado trocado.

Ache as âncoras pelo conteúdo:

- O bloco começa na linha onde a coluna A tem o nome da região
- A linha de total é a primeira depois do último item que tem soma e não tem nome
- O cabeçalho se identifica pelos nomes de coluna, não pela posição

E valide o que encontrou: número esperado de blocos, nomes conhecidos, contagem de
colunas. Se o formato mudou, falhe alto com uma mensagem que diz o que mudou, em
vez de importar silenciosamente algo errado.

## O arquivo pode estar em uso

Com a planilha aberta, o Excel cria um arquivo de trava chamado `~$nome.xlsx` na
mesma pasta. E o salvamento não é atômico: ler no meio dele estoura ou traz
conteúdo parcial.

Na prática: ignore arquivos que começam com `~$`, tente ler de novo duas ou três
vezes com um intervalo curto, e trate o erro como "temporariamente indisponível",
não como falha de importação.

Outro ponto: enquanto ninguém salva, o arquivo em disco não muda. "Tempo real" com
Excel é sempre "logo depois de salvar".

## Texto que parece número

`"VILHENA  "` com dois espaços no fim não é igual a `"VILHENA"`. Cruzamento por
texto falha em silêncio e devolve vazio, que na tela vira zero.

Normalize na entrada, sempre: `trim`, colapsar espaços internos, decidir se
compara com ou sem acento e maiúscula. E prefira cruzar por um código estável a
cruzar por nome digitado à mão.

Vale também para número: célula formatada como texto, separador decimal trocado,
espaço não separável vindo de copiar e colar.

## Antes de confiar na importação

- [ ] Total recalculado das origens bate com o total escrito na planilha
- [ ] Quantidade de blocos e nomes conferem com o esperado
- [ ] Nenhuma chave de cruzamento ficou sem par
- [ ] Nenhuma coluna numérica veio como texto
- [ ] Registrei a data de modificação do arquivo, para o painel poder mostrar de
      quando é o dado

Esse último fecha o ciclo com o resto do padrão: se o painel sabe de quando é o
dado, ele consegue avisar em vez de mentir com um número velho.
