# Account Switch Process

This process is for switching to another GPT/Codex account without losing project context.

## 1. Before You Switch Account
1. Run QA and verify no regression:
`npm run lint`
`npm run build`
2. Sync project tracker:
`npm run progress:sync`
3. Generate handoff snapshot:
`npm run handoff:prepare`
4. Commit and push your latest work:
`git add -A`
`git commit -m "chore: handoff snapshot before account switch"`
`git push`

## 2. Files New Account Must Read First
- `HANDOFF.md`
- `TODO0314.MD`
- `output/spreadsheet/startpray-progress-tracker.xlsx`
- `ACCOUNT_SWITCH_PROMPT.md`

## 3. New Account Startup Rule
Ask the new account to:
1. Read required files first.
2. Review `git status --short` and `git log -20 --oneline`.
3. Summarize current state.
4. Continue from the latest unfinished P0/P1 item.

## 4. Minimum QA Gate For Every Batch
- `npm run lint`
- `npm run build`
- Update tracker: `npm run progress:sync`
