# Send Reminders Instruction

Use this instruction for cron-driven or manual reminder-agent runs.

## Goal

Send the monthly subscription split reminder to each unpaid person listed in `reminder-agent/data/paid_status.csv`, using data from `reminder-agent/data/subscription.csv`.

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
   - send the message to that person's `Telegram_User_ID`
   - set `Note` to `msg is sent`
5. Preserve `Last_Response` exactly as-is.
6. Write the updated CSV back to `reminder-agent/data/paid_status.csv`.

## Constraints

- Work only inside `reminder-agent/`
- Do not use PowerShell
- Do not depend on OS-specific shell behavior
- Prefer direct OpenClaw tools for messaging and file edits
- Be careful not to duplicate rows for the same month+friend unless missing
