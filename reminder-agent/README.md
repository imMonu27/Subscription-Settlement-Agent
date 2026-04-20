# Reminder Agent

This folder contains all files related to the bill reminder agent.

## Structure

- `data/` - CSV state and debug log
- `lib/` - shared CSV/data helpers
- `scripts/` - Node.js script for reply capture only
- `hooks/` - hook code for inbound Telegram reply capture
- `instructions/` - agent-native reminder workflow instructions
- `cron/` - cron setup notes and commands

## Cross-platform architecture

This reminder agent is now designed so that the **sending workflow is agent-native**:

- OpenClaw cron schedules a reminder workflow
- the workflow reads/writes the files in `reminder-agent/data/`
- the workflow sends Telegram DMs directly through OpenClaw from the running session
- reply capture remains a small Node hook/script

This avoids platform-specific dependencies like PowerShell or shell-specific CLI invocation.

## Files used at runtime

- `data/subscription.csv`
- `data/paid_status.csv`
- `instructions/send-reminders.md`
- `hooks/telegram-bill-reply-capture/handler.ts`
- `scripts/capture-reply.mjs`

## Manual testing

You can manually execute the reminder workflow by instructing an isolated agent run to follow:

- `reminder-agent/instructions/send-reminders.md`

The important part of the test is verifying that the run performs a real Telegram send for each unpaid friend and only then updates `paid_status.csv`.

You can test reply capture with:

```bash
node ./reminder-agent/scripts/capture-reply.mjs --telegram-user-id 123456 --reply-text "paid tomorrow"
```
