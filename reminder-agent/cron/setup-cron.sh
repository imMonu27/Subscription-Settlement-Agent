#!/usr/bin/env bash
set -euo pipefail

echo 'Create this cron job with OpenClaw:'
echo 'openclaw cron add --name "monthly-bill-reminder-agent" --cron "0 10 1 * *" --tz "Asia/Calcutta" --session isolated --message "Reminder-agent scheduled run: Work only inside the workspace reminder-agent/ folder. Read reminder-agent/agent.md, then execute the monthly reminder workflow for the current month using the Node.js scripts in reminder-agent/scripts/. Send Telegram reminders for unpaid rows and update reminder-agent/data/paid_status.csv accordingly. Keep output concise." --announce'
