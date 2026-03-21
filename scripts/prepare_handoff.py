#!/usr/bin/env python3
from __future__ import annotations

import argparse
import datetime as dt
import subprocess
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
HANDOFF_PATH = ROOT / "HANDOFF.md"


def run_git(args: list[str]) -> str:
    try:
        result = subprocess.run(
            ["git", *args],
            cwd=ROOT,
            check=True,
            capture_output=True,
            text=True,
        )
        return result.stdout.strip()
    except subprocess.CalledProcessError:
        return ""


def bullet_list(lines: list[str], empty_text: str) -> str:
    cleaned = [line for line in lines if line.strip()]
    if not cleaned:
        return f"- {empty_text}"
    return "\n".join(f"- `{line}`" for line in cleaned)


def main() -> None:
    parser = argparse.ArgumentParser(description="Generate HANDOFF.md snapshot for account switching")
    parser.add_argument(
        "--next",
        dest="next_actions",
        action="append",
        default=[],
        help="Next action item (can pass multiple times)",
    )
    parser.add_argument(
        "--notes",
        default="",
        help="Optional one-line handoff note",
    )
    args = parser.parse_args()

    now = dt.datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    branch = run_git(["rev-parse", "--abbrev-ref", "HEAD"]) or "unknown"
    commit = run_git(["rev-parse", "--short", "HEAD"]) or "unknown"
    status_lines = run_git(["status", "--short"]).splitlines()
    recent_logs = run_git(
        ["log", "-10", "--pretty=format:%h | %ad | %s", "--date=short"]
    ).splitlines()

    if args.next_actions:
        next_actions_md = "\n".join(f"- {item}" for item in args.next_actions)
    else:
        next_actions_md = (
            "- Continue P0 UX fixes from `TODO0314.MD`\n"
            "- Run QA (`npm run lint` + `npm run build`) before push\n"
            "- Sync tracker (`npm run progress:sync`) after each batch"
        )

    notes_md = args.notes.strip() or "No additional notes."

    content = f"""# HANDOFF

Last updated: {now}
Branch: `{branch}`
Current commit: `{commit}`

## Snapshot
{notes_md}

## Must Read First
- `TODO0314.MD`
- `output/spreadsheet/startpray-progress-tracker.xlsx`
- `ACCOUNT_SWITCH_PROCESS.md`
- `ACCOUNT_SWITCH_PROMPT.md`

## Working Tree (`git status --short`)
{bullet_list(status_lines, "Working tree clean")}

## Recent Commits (`git log -10`)
{bullet_list(recent_logs, "No commits available")}

## Next Actions
{next_actions_md}
"""

    HANDOFF_PATH.write_text(content, encoding="utf-8")
    print(f"Generated: {HANDOFF_PATH}")


if __name__ == "__main__":
    main()
