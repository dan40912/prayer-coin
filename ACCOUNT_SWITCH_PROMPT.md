# Prompt For New Account Handoff

Copy and paste this into the new account:

```md
你現在是這個專案的新接手工程師，請先不要直接改程式。

請先依序完成以下步驟：
1. 讀取 `HANDOFF.md`
2. 讀取 `TODO0314.MD`
3. 讀取 `output/spreadsheet/startpray-progress-tracker.xlsx`
4. 執行並整理：
   - `git status --short`
   - `git log -20 --oneline`
5. 用中文回報：
   - 目前已完成項目
   - 目前未完成且最高優先 (P0) 的 3 項
   - 你接下來要先做的第一批修復清單

接著直接開始實作，不要只給建議。每完成一批請做 QA：
- `npm run lint`
- `npm run build`

每批結束後更新追蹤表：
- `npm run progress:sync`
```
