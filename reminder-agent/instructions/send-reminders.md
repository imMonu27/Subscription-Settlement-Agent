# Send Reminders Instruction

Use this instruction for cron-driven or manual reminder-agent runs.

## Goal

Send the monthly subscription split reminder to each unpaid person listed in `reminder-agent/data/paid_status.csv`, using data from `reminder-agent/data/subscription.csv`.

## Exact delivery method

Send the Telegram DM directly from the current main-session runtime using the OpenClaw CLI message command:

- use `openclaw message send --channel telegram --target <Telegram_User_ID> --message "<reminder message>"`
- do not use `sessions_send` handoff to another session
- do not assume cron announce delivery will forward the reminder for you
- only mark a row as sent after the direct send command succeeds
- if Telegram is not configured/enabled, do not modify the row; report the exact blocker internally

## Steps

1. Read:
   - `reminder-agent/data/subscription.csv`
   - `reminder-agent/data/paid_status.csv`
2. Determine the current month as `YYYY-MM`.
3. If the current month has no rows in `paid_status.csv`, create one unpaid row per unique friend from `subscription.csv`.
4. For each unpaid row for the current month:
   - find all subscription rows for that friend
   - compute split share as `Total_Cost / Split_Count`, rounded to 2 decimals
   - build a message like:
     - `Hi <friend> - reminder for <month> subscription split: <service>: <share> USD (<total> / <split>); ... Status on file is unpaid. Please pay when you can.`
   - send it directly with `openclaw message send --channel telegram --target <Telegram_User_ID> --message "<reminder message>"`
   - only if that command succeeds, set `Note` to `msg is sent (YYYY-MM-DD)`
5. Preserve `Last_Response` exactly as-is.
6. Write the updated CSV back to `reminder-agent/data/paid_status.csv`.

## Constraints

- Work only inside `reminder-agent/`
- Do not use PowerShell for the reminder send path
- Do not depend on OS-specific shell behavior
- Prefer direct OpenClaw tools for messaging and file edits
- Be careful not to duplicate rows for the same month+friend unless missing
- Do not claim delivery based only on cron run success
