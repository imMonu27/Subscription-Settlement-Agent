param(
    [Parameter(Mandatory = $true)][string]$TelegramUserId,
    [Parameter(Mandatory = $true)][string]$ReplyText,
    [string]$Month = (Get-Date -Format 'yyyy-MM')
)

$ErrorActionPreference = 'Stop'

$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$agentRoot = Split-Path -Parent $scriptDir
$paidPath = Join-Path $agentRoot 'data\paid_status.csv'
$subPath = Join-Path $agentRoot 'data\subscription.csv'

if (-not (Test-Path $paidPath)) { throw "Missing file: $paidPath" }
if (-not (Test-Path $subPath)) { throw "Missing file: $subPath" }

$paid = @(Import-Csv -Path $paidPath)
$subs = @(Import-Csv -Path $subPath)

if (-not $subs -or $subs.Count -eq 0) { throw 'subscription.csv is empty' }

$match = $subs | Where-Object { $_.Telegram_User_ID -eq $TelegramUserId } | Select-Object -First 1
if (-not $match) { throw "No friend found for Telegram user ID: $TelegramUserId" }

$friend = $match.Friend

$rows = @($paid | Where-Object { $_.Month -eq $Month -and $_.Friend -eq $friend })
if ($rows.Count -eq 0) {
    $newRow = [pscustomobject]@{
        Month = $Month
        Friend = $friend
        Status = 'unpaid'
        Note = ''
        Last_Response = $ReplyText
    }
    $paid = @($paid + $newRow)
}
else {
    foreach ($row in $rows) {
        if (-not ($row.PSObject.Properties.Name -contains 'Last_Response')) {
            $row | Add-Member -NotePropertyName 'Last_Response' -NotePropertyValue $ReplyText -Force
        }
        else {
            $row.Last_Response = $ReplyText
        }
    }
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
Write-Output "Saved reply for $friend in $Month"
