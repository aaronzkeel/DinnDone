# Multi-Agent Workflow (Worktrees + Rebase + Squash)

This project uses a simple, low-conflict workflow for multiple agents working in parallel.

## Goals
- Keep work isolated by branch/worktree.
- Resolve conflicts before merging, in the IDE.
- Land each PR as a single commit for easy rollback.

## Standard Workflow
1) Create a new branch + worktree per agent.
2) Rebase frequently on `main` to stay current.
3) Merge with **squash** when done.

## Worktree Setup (per agent)
- Branch name: `agent/<name>-<topic>`
- Worktree path: `../DinnDone-wt-<topic>`

Example:
```bash
git worktree add -b agent/aria-ui ../DinnDone-wt-ui
```

## Keeping In Sync (every 30-60 minutes or before big changes)
```bash
git fetch origin
git rebase origin/main
```

If conflicts happen:
- Resolve in the IDE.
- Continue with:
```bash
git rebase --continue
```

## Finishing a Branch (squash merge)
From the main worktree:
```bash
git checkout main
git fetch origin
git pull
git merge --squash agent/aria-ui
git commit -m "Your PR title here"
```

## Conflict Prevention Rules
- Each agent owns a set of files whenever possible.
- If two agents touch the same file, call it out early.
- Rebase before asking for review or merging.

## Rollback / Regressions
- Because merges are squashed, rollback is one command:
```bash
git revert <merge-commit-sha>
```

## Secrets policy (non-negotiable)
- Do NOT read, open, quote, summarize, or reference `.env.local` or any `.env*` files.
- If you need config values, ask the user to paste only the specific non-secret value or use `.env.example`.
- If a task requires secrets, stop and ask for a safer workflow (environment variables or external secrets file).
