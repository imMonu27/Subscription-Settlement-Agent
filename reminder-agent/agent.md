# Reminder Agent

Purpose: send monthly bill reminders, track replies, and keep reminder-related files isolated in one place.

## Cross-platform design

This reminder agent is designed to be cross-platform by making reminder sending **agent-native**.

That means:
- OpenClaw cron triggers an isolated agent run
- the agent reads and updates files directly
- the agent sends reminder messages using OpenClaw tool access
- no PowerShell dependency
- no shell-specific reminder-send path

## Files

- `data/subscription.csv`
- `data/paid_status.csv`
- `lib/reminder-lib.mjs`
- `scripts/capture-reply.mjs`
- `hooks/telegram-bill-reply-capture/`
- `cron/CRON.md`
- `instructions/send-reminders.md`

## Rules for scheduled runs

When a scheduled run executes:

1. Read `data/subscription.csv`
2. Read `data/paid_status.csv`
3. Determine the current month in `YYYY-MM`
4. Ensure each friend in `subscription.csv` has a row for the month in `paid_status.csv`
5. For each row with `Status = unpaid`:
   - calculate each service split
   - send a Telegram reminder
   - set `Note` to `msg is sent`
6. Preserve `Last_Response`
7. Write the updated `paid_status.csv`

## Notes

- Reply capture is handled by the Telegram message hook.
- Sending should be done by the OpenClaw agent runtime, not by a local OS script.
- This folder is intended to be portable across machines.
