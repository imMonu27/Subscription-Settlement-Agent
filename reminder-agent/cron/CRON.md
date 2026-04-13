# Cron Setup

This reminder agent should have a cron job for monthly reminders.

## Recommended schedule

- `0 10 1 * *`
- Meaning: run at 10:00 AM on day 1 of every month
- Timezone: `Asia/Calcutta`

## Cross-platform design

Cron should trigger an **isolated agent run**, not a shell script.

That isolated run should:
- read `reminder-agent/instructions/send-reminders.md`
- follow the workflow using files in `reminder-agent/data/`
- send reminders through OpenClaw tooling
- update `reminder-agent/data/paid_status.csv`

## Why this is the preferred architecture

This avoids dependence on:
- PowerShell
- bash/zsh differences
- local CLI wrapper behavior
- OS-specific process execution quirks

## Current cron job

The existing cron job should conceptually do this:
- run an isolated reminder-agent turn
- operate only in `reminder-agent/`
- send monthly reminders and update state
