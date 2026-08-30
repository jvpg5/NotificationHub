---
name: review-security
description: Reviews the branch diff for security issues and reports them as a severity table, without editing anything. Use when the user asks to run `/review-security`, or asks whether the current changes introduce a vulnerability.
metadata:
  author: Amara Liz
---
# Review Security

Use this skill when the user asks to run `/review-security`.

Review the diff yourself. Do not launch a subagent, and do not edit any files.

This skill looks for **security issues only**. For bugs run `/review-bugbot`.
For a full report with a commit message run `/code-review-subagent`.

## Which diff to review

Default to **branch changes**: everything that differs from the merge-base with
the base branch, including committed, staged, and unstaged work.

```bash
git remote show origin | sed -n 's/.*HEAD branch: //p'   # descobre a base real
git diff $(git merge-base HEAD <base>)                    # committed + staged + unstaged
```

Infer the base branch instead of assuming `main`. Only compare against a specific
base when the user names one, or when you know the branch was cut from another.

If the user asks for uncommitted, working tree, dirty, or not-yet-committed
changes, use `git diff HEAD` instead.

## Reviewing a specific PR or branch

When the user points at a PR link, PR number, or branch name, check that target
out before reviewing:

- Resolve the reference to the PR head branch or the named branch.
- If it is already the current branch, continue.
- Otherwise try to switch to it.
- If Git refuses because local files would be overwritten or conflicts need
  resolving, explain the blocker and ask whether to stash first. Only stash after
  the user confirms, then retry.

## What to look for

**Entrada e injeção.** SQL, comando de shell, path traversal, deserialização de
dado não confiável, template renderizado com entrada do usuário.

**Autenticação e autorização.** Rota nova sem guard, checagem de permissão do
lado do cliente apenas, IDOR (id vindo da requisição sem validar dono do recurso),
token comparado sem tempo constante.

**Exposição de dado.** Segredo comitado, senha ou token em log, campo sensível
serializado na resposta, mensagem de erro que vaza estrutura interna.

**Sessão e transporte.** Cookie sem `HttpOnly`, `Secure` ou `SameSite`, expiração
que não bate com o token, CORS liberado demais.

**XSS.** HTML montado por concatenação, `dangerouslySetInnerHTML`, sanitização
ausente na renderização de conteúdo vindo do usuário.

**Recurso.** Ausência de limite de tamanho, de paginação ou de rate limit em rota
que aceita entrada arbitrária.

**Dependência.** Pacote novo com permissão ampla, versão fixada em algo conhecido
como vulnerável.

Report what the diff actually introduces. A limitation that already existed and
was not touched here goes in a closing note, not in the table.

## Output

If the diff is empty, say so in one sentence and stop.

If nothing turned up: `Security review found no issues`.

Otherwise a compact markdown table, one row per finding, sorted by severity,
highest first, with exactly these columns:

| Severity | Location | Finding |
|---|---|---|
| High | `src/users/users.controller.ts:88` | `findOne` uses the id from the request without checking that it belongs to the caller |

Put the file and line together as `file:line`.

Close with the one-line status: `Security review found 2 findings`.

## Do not

Do not fix anything. Do not rerun the review. Both only happen if the user asks
for that next step.
