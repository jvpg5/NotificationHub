---
name: review-bugbot
description: Hunts for bugs in the branch diff and reports them as a severity table, without editing anything. Use when the user asks to run `/review-bugbot`, or asks to check the current changes for bugs before opening a PR.
metadata:
  author: Amara Liz
---
# Review Bugbot

Use this skill when the user asks to run `/review-bugbot`.

Review the diff yourself. Do not launch a subagent, and do not edit any files.

This skill looks for **bugs only**. For security issues run `/review-security`.
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

- Logic that does not match the stated intent
- Off-by-one, wrong operator, inverted condition
- Unhandled null, undefined, or empty collection
- Missing await, unhandled rejection, swallowed error
- Race conditions and ordering assumptions
- State mutated where a copy was expected
- Wrong or missing dependency array, stale closure
- Resource left open, listener never removed
- Edge case the new code introduces and does not cover

Report what you can point at in the diff. Skip style, naming, and preference.

## Output

If the diff is empty, say so in one sentence and stop.

If nothing turned up: `Bugbot found no bugs`.

Otherwise a compact markdown table, one row per finding, sorted by severity,
highest first, with exactly these columns:

| Severity | Location | Finding |
|---|---|---|
| High | `src/auth/login.ts:42` | `validateSession` reads `token.exp` before the null check on `token` |

Put the file and line together as `file:line`.

Close with the one-line status: `Bugbot found 2 findings`.

## Do not

Do not fix anything. Do not rerun the review. Both only happen if the user asks
for that next step.
