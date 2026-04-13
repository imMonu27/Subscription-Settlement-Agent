param(
    [string]$Schedule = '0 10 1 * *',
    [string]$Timezone = 'Asia/Calcutta',
    [switch]$WhatIf
)

$ErrorActionPreference = 'Stop'

$jobName = 'monthly-bill-reminder-agent'
$description = 'Monthly Telegram subscription reminder job for reminder-agent'
$message = 'Run PowerShell file reminder-agent/scripts/monthly-bill-reminder.ps1 from the workspace on this machine. Send monthly bill reminders and update reminder-agent/data/paid_status.csv accordingly.'

$cmd = @(
    'openclaw cron add',
    '--name', '"' + $jobName + '"',
    '--description', '"' + $description + '"',
    '--cron', '"' + $Schedule + '"',
    '--tz', '"' + $Timezone + '"',
    '--session', 'isolated',
    '--message', '"' + $message + '"',
    '--announce'
) -join ' '

if ($WhatIf) {
    Write-Output $cmd
    exit 0
}

Invoke-Expression $cmd
