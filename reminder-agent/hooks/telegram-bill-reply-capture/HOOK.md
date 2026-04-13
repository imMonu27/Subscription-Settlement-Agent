---
name: telegram-bill-reply-capture
description: "Capture inbound Telegram direct-message replies into reminder-agent/data/paid_status.csv"
metadata: { "openclaw": { "emoji": "💬", "events": ["message:received"] } }
---

# Telegram Bill Reply Capture

Captures inbound Telegram DM replies from known bill participants and stores the latest reply text in `reminder-agent/data/paid_status.csv` via `scripts/capture-reply.ps1`.
