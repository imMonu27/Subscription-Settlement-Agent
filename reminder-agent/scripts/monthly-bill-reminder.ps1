param(
    [switch]$WhatIf
)

$ErrorActionPreference = 'Stop'

$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$agentRoot = Split-Path -Parent $scriptDir
$paidPath = Join-Path $agentRoot 'data\paid_status.csv'
$subPath = Join-Path $agentRoot 'data\subscription.csv'

if (-not (Test-Path $paidPath)) { throw "Missing file: $paidPath" }
if (-not (Test-Path $subPath)) { throw "Missing file: $subPath" }

$month = Get-Date -Format 'yyyy-MM'
$paid = Import-Csv -Path $paidPath
$subs = Import-Csv -Path $subPath

if (-not $paid) { $paid = @() }
if (-not $subs) { throw 'subscription.csv is empty' }

$friends = $subs | Select-Object -ExpandProperty Friend -Unique
$existingMonthRows = @($paid | Where-Object { $_.Month -eq $month })

if ($existingMonthRows.Count -eq 0) {
    $newRows = foreach ($friend in $friends) {
        [pscustomobject]@{
            Month         = $month
            Friend        = $friend
            Status        = 'unpaid'
            Note          = ''
            Last_Response = ''
        }
    }
    $paid = @($paid + $newRows)
}

$monthRows = @($paid | Where-Object { $_.Month -eq $month })

foreach ($row in $monthRows) {
    if ($row.Status -ne 'unpaid') { continue }

    $personSubs = @($subs | Where-Object { $_.Friend -eq $row.Friend })
    if ($personSubs.Count -eq 0) { continue }

    $parts = foreach ($sub in $personSubs) {
        $total = [decimal]$sub.Total_Cost
        $split = [decimal]$sub.Split_Count
        if ($split -le 0) { continue }
        $share = [math]::Round(($total / $split), 2)
        "{0}: {1} USD ({2} ÷ {3})" -f $sub.Service, $share.ToString('0.00'), $sub.Total_Cost, $sub.Split_Count
    }

    if (-not $parts -or $parts.Count -eq 0) { continue }

    $telegramId = ($personSubs | Select-Object -First 1).Telegram_User_ID
    if (-not $telegramId) { continue }

    $friendName = $row.Friend
    $message = "Hi $friendName - reminder for $month subscription split: " + ($parts -join '; ') + ". Status on file is unpaid. Please pay when you can."

    if ($WhatIf) {
        Write-Output "[WhatIf] Would send to ${friendName} (${telegramId}): $message"
        $row.Note = 'whatif only'
        continue
    }

    & openclaw message send --channel telegram --target $telegramId --message $message | Out-Null
    $row.Note = 'msg is sent'
}

$normalized = foreach ($row in $paid) {
    [pscustomobject]@{
        Month = $row.Month
        Friend = $row.Friend
        Status = $row.Status
        Note = $row.Note
        Last_Response = if ($row.PSObject.Properties.Name -contains 'Last_Response') { $row.Last_Response } else { '' }
    }
}

$normalized | Export-Csv -Path $paidPath -NoTypeInformation
Write-Output "Processed bill reminders for $month"
