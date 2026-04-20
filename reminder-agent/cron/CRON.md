# Cron Setup

This reminder agent should have a cron job for monthly reminders.

## Recommended schedule

- `0 10 1 * *`
- Meaning: run at 10:00 AM on day 1 of every month
- Timezone: `Asia/Calcutta`

## Correct architecture

Cron should trigger a reminder workflow that does all of the following:
- read `reminder-agent/instructions/send-reminders.md`
- operate only on files inside `reminder-agent/`
- send Telegram reminders through a real OpenClaw delivery path available in the runtime
- update `reminder-agent/data/paid_status.csv` only after confirmed send success

## Important note about delivery

Do not rely on cron `announce` delivery or an implicit Telegram channel for these reminders.

Why:
- cron job success only means the run completed
- cron delivery errors like `Channel is required` or `Delivering to Telegram requires target <chatId>` do not send the bill reminders
- the actual reminder path must be performed explicitly by the workflow using `sessions_send`

## Current failure mode that was observed

Earlier runs completed or partially completed while:
- updating `paid_status.csv`
- not actually delivering Telegram reminders
- failing with delivery/channel configuration errors

That means the workflow must treat `sessions_send` success as the real send confirmation.
