---
name: pr-description
description: >-
  Escreve a descrição de um pull request a partir do diff e do histórico da branch.
  Use quando pedirem descrição de PR, texto de PR, "monta a PR", "escreve o corpo
  da PR", ou quando for abrir um PR com gh. Vale também para atualizar a descrição
  de um PR que já existe depois de novos commits. Cobre o formato das seções, o
  nível de detalhe, quando cabe diagrama e o que nunca entra no texto.
metadata:
  author: Amara Liz
---

# Descrição de PR

Quem vai revisar não acompanhou a investigação. Não sabe por que aquele arquivo
mudou, não conhece os termos internos que apareceram no meio do debug, e na
maioria das vezes não conhece o módulo a fundo. O texto precisa ser
autoexplicativo sem virar um relatório.

O diff já mostra o que mudou linha a linha. A descrição serve para o que o diff
não conta: por que mudou, o que o leitor precisa saber antes de entender, e o que
já foi verificado.

## Antes de escrever

Levante o material primeiro. Não descreva o que você acha que a branch faz:

1. `git log main..HEAD --oneline` e `git diff main...HEAD --stat` para o escopo real.
2. O diff das partes que carregam decisão (não precisa ler arquivo gerado, lock,
   snapshot).
3. Se existir issue, card ou ticket, o número e o título.

Se a branch tem duas coisas independentes dentro, diga isso na estrutura (seções
numeradas), não misture num parágrafo só.

## As duas formas

Quase todo PR cai em uma das duas. Escolha pela pergunta que o revisor vai fazer.

### PR de feature: "o que passou a existir?"

```markdown
## TL;DR
{uma ou duas frases: o que a PR entrega, e o bug que corrige de quebra, se houver}

## Contexto
{só quando o revisor pode não conhecer o módulo}
{o que é o domínio em uma frase}

{glossário dos termos que aparecem no texto, um bullet cada}
{quando houver enum ou status, tabela: valor | label na UI | o que significa}

## O que foi feito

### 1. {parte independente} (`/rota/afetada`)
{o que passou a existir, em comportamento}
{diagrama, se o fluxo tiver mais de três saltos}
{bullets dos componentes/hooks novos e o papel de cada um}

### 2. {outra parte independente}

#### Bug corrigido: {nome curto}
{o que acontecia, por quê, e o que passou a acontecer}

### 3. Testes
| Arquivo | Cobre |
|---|---|

## Rotas
| Rota | Descrição | Status |
|---|---|---|
{Novo nesta PR / Alterado nesta PR}

## Test plan
- [ ] {passo que o revisor executa para validar}

## Observações / follow-ups
{o que ficou fora do escopo e alguém precisa saber}
```

### PR de correção: "o que estava quebrado?"

```markdown
## TL;DR
{a causa raiz em uma frase, mais quantos bugs foram junto}

## Fixes
1. **{sintoma que o usuário via}.** {causa real}. {como foi confirmada}.
   Fix: {arquivo novo ou alterado}, {o que ele faz}.
2. ...

## Arquitetura
{só quando alguma decisão não é óbvia pelo diff}
{por que assim e não do outro jeito}

## Testado
{o que foi verificado de fato, e como}
- {cenário}: {resultado}
{contagem de teste automatizado, typecheck, lint}

## Arquivos alterados
**Novos**
**Lógica**
**Testes**

## Fora do escopo
{o que continua valendo como problema e não foi resolvido aqui}
```

Misture quando a PR for mista: entrega uma feature e corrige bugs no caminho.
A espinha (TL;DR, corpo, verificação, fora do escopo) é a mesma.

## O que sempre existe

**TL;DR.** Primeira coisa, sempre. Uma ou duas frases. Quem só lê isso precisa
saber se a PR é dele para revisar e o que ela muda.

**Verificação.** `Testado` quando você já validou, com o que foi validado e como.
`Test plan` com checkbox quando quem valida é o revisor. Se você rodou parte e
sobrou parte, use os dois.

**Fora do escopo.** O que ficou de fora, e o que continua sendo problema. Isso
evita a pergunta "e aquele caso?" na revisão, e evita que alguém trate limitação
antiga como regressão desta PR.

## O que fica de fora

**Detalhe de `arquivo:linha` com explicação técnica.** Já está no diff, e repetir
no texto incha a descrição. Uma lista de arquivos agrupada por papel (Novos,
Lógica, Testes) continua valendo: serve de mapa de leitura para o revisor
escolher por onde começar.

**Termo interno sem tradução.** Se precisar citar `StrictMode`, `orval`,
`isPartial`, um enum ou o nome de um hook, explique em uma frase na primeira
aparição, ou traduza para comportamento. Palavra que só quem programou a feature
entende é o que faz o revisor parar de ler.

**Enfeite.** Sem adjetivo de reforço ("melhoria significativa", "refatoração
robusta"), sem conector desnecessário, sem parêntese que repete o que a frase já
disse. Cada frase carrega informação ou sai.

**Travessão (—).** Use hífen, dois-pontos ou ponto. Travessão em série é a marca
mais visível de texto gerado, e já foi apontado como problema.

**Negação antitética.** A fórmula "não é X, é Y", "não se trata de X, mas de Y",
"mais do que X, é Y". A metade negativa gasta uma frase inteira com algo que o
leitor nunca supôs, e o texto só começa a informar depois da vírgula. Escreva a
afirmação direto: em vez de "não é um refactor, é a correção do redirect",
escreva "corrige o redirect pós-login".

Vale também para o comentário sobre a própria palavra ("chamar isso de bug seria
generoso", "por falta de termo melhor"). Escolha o termo e siga.

**Rodapé de coautoria.** Não vai `Co-Authored-By` no commit nem crédito de
ferramenta na descrição.

**Narrativa da investigação.** "Primeiro achei que era X, depois descobri que Y."
O revisor quer a conclusão. O caminho até ela só entra quando explica uma decisão
de arquitetura que ficou estranha no diff.

## Diagrama

Mermaid só quando ele mostra o que o texto descreveria mal:

- `flowchart` para fluxo com mais de três saltos entre telas, componentes e API.
- `sequenceDiagram` para bug de ordem, corrida ou cache, onde o antes e o depois
  são a explicação inteira. Marcar as duas linhas com o que era e o que passou a
  ser resolve mais que dois parágrafos.

Um fluxo linear de dois passos não precisa de diagrama. Rótulo de nó também segue
a regra do texto: sem travessão, sem adjetivo.

## Antes de publicar

- [ ] O TL;DR sozinho já diz o que a PR faz
- [ ] Todo termo interno foi explicado na primeira aparição ou traduzido
- [ ] Nenhum trecho narra o que o diff já mostra
- [ ] Existe seção de verificação (testado, test plan ou os dois)
- [ ] O que ficou fora está dito
- [ ] Nenhum travessão, nenhum adjetivo de enfeite, nenhuma negação antitética
- [ ] Se a branch faz duas coisas, elas estão separadas na estrutura
