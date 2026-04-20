# 📦 Subscription Settlement Agent

An **AI-powered automation agent** built using OpenClaw that automatically calculates shared subscription costs and sends payment reminders via messaging platforms like Telegram or WhatsApp.

This project demonstrates how to build a **local-first agentic system** that reads structured data, applies business logic, and performs real-world actions autonomously.

---

## 🚀 Features

- 📊 Reads subscription data from CSV
- 🧠 Calculates per-person split automatically
- 📅 Runs on schedule (monthly cron job)
- 💬 Sends payment reminders via messaging apps
- 🧾 Tracks payments using local memory (`paid_status.txt`)
- 📁 Maintains logs (`sent_log.txt`, `error_log.txt`)
- 🔐 Fully local — no external SaaS required

---

## 🧠 How It Works

1. Agent reads `subscriptions.csv`
2. Groups entries by user
3. Calculates:

   total owed = Total_Cost / Split_Count

4. Skips:
   - Paid users
   - Zero balances
5. Sends message via Telegram/WhatsApp
6. Logs activity for tracking

---

## 📂 Project Structure
Subscription-Settlement-Agent/
│
├── subscriptions.csv # Input data
├── paid_status.txt # Paid users tracker
├── sent_log.txt # Message logs
├── error_log.txt # Error logs
└── README.md

---

## ⚙️ Prerequisites

Make sure you have the following installed:

### 1. Node.js (Required)

Version: **Node 22+ or 24 recommended**
node -v

---

### 2. OpenClaw CLI

Install globally:
npm install -g openclaw

Verify installation:
openclaw --version

---

### 3. Messaging Channel (Telegram Recommended)

- Create bot using Telegram → BotFather  
- Copy **Bot Token**

---

### 4. (Optional but Recommended)

- Docker (for sandboxing)
- WSL2 (for Windows stability)

---

## 🛠️ Setup & Run (Step-by-Step)

### 1️⃣ Clone Repository
git clone https://github.com/imMonu27/Subscription-Settlement-Agent.git

cd Subscription-Settlement-Agent

---

### 2️⃣ Start OpenClaw
openclaw gateway start

Check status:
openclaw gateway status

---

### 3️⃣ Configure Telegram

Update your `openclaw.json`:
"channels": {
"telegram": {
"enabled": true,
"botToken": "YOUR_BOT_TOKEN"
}
}

---

### 4️⃣ run create cron job command 

Go to path : reminder-agent\cron\setup-cron.sh

and run the command it will create cron job that you can see in dashboard 

---

### 5️⃣ Create Required Files
touch paid_status.csv
touch sent_log.txt
touch error_log.txt