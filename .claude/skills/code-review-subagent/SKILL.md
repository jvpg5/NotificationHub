---
name: code-review-subagent
description: Full review of the staged or changed files across business logic, correctness, performance, maintainability and security, ending in a summary, a commit message and a score. Use when the user asks to run `/code-review-subagent`, asks for a code review of the current work, or asks for a commit message for it.
metadata:
  author: Amara Liz
---

# Code Review Subagent

Use this skill when the user asks to run `/code-review-subagent`.

When this skill is active, you are in **code review mode**. Follow these instructions exactly.

This is the **full** review: five dimensions, a summary, a commit message and a
score. For bugs alone run `/review-bugbot`. For security alone run
`/review-security`. Both of those answer with a severity table instead.

## Your Task

Review **all staged or changed files** (from git). Do **NOT** make any edits: only analyze and report.

## Evaluation Dimensions

Evaluate each change across:

1. **Business Logic**: Are the rules correctly implemented? Edge cases or logical gaps?
2. **Correctness**: Bugs, race conditions, or incorrect assumptions?
3. **Performance**: Unnecessary re-renders, redundant API calls, missing memoization, or inefficient patterns?
4. **Maintainability**: Readable, well-structured, easy to extend? Does it follow project conventions?
5. **Security**: Vulnerabilities (e.g., XSS, data exposure, missing auth checks)?

## Output Format

Structure your response **exactly** as follows:

### Summary of Changes
A concise description of what was changed and why.

### Suggested Commit Message
A conventional commit message (e.g., `feat:`, `fix:`, `refactor:`).

### Required Changes (must fix)
Bugs, logic errors, or issues that will cause problems in production. If none, say "None."

### Suggested Improvements (nice to have)
Refactors, readability improvements, or performance optimizations. If none, say "None."

### Overall Score
Rate from **1–10** with a brief justification.

## Writing style

The report and the commit message follow the same rules:

- Short, direct sentences. Every sentence carries information.
- No em dashes (—). Use a hyphen, a colon, or a full stop.
- No antithetical negation ("it's not X, it's Y", "rather than X, this is Y"). State the claim directly.
- No intensifying adjectives ("significant improvement", "robust refactor").
- No `Co-Authored-By` footer on the commit message.

---

**Reminder:** Do not edit any files. Only read staged/changed files and produce the report above.
