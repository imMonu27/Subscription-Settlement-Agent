import {
  currentMonth,
  readCsv,
  writeCsv,
  normalizePaidRows,
  subscriptionPath,
  paidStatusPath,
} from '../lib/reminder-lib.mjs';

const args = process.argv.slice(2);

function getArg(name) {
  const index = args.findIndex((item) => item === name);
  if (index === -1) return undefined;
  return args[index + 1];
}

const telegramUserId = getArg('--telegram-user-id');
const replyText = getArg('--reply-text');
const month = getArg('--month') ?? currentMonth();

if (!telegramUserId) {
  throw new Error('Missing required arg: --telegram-user-id');
}

if (!replyText) {
  throw new Error('Missing required arg: --reply-text');
}

const paid = readCsv(paidStatusPath);
const subs = readCsv(subscriptionPath);

if (!subs.length) {
  throw new Error('subscription.csv is empty');
}

const match = subs.find((row) => String(row.Telegram_User_ID).trim() === String(telegramUserId).trim());
if (!match) {
  throw new Error(`No friend found for Telegram user ID: ${telegramUserId}`);
}

const friend = match.Friend;
const rows = paid.filter((row) => row.Month === month && row.Friend === friend);

if (rows.length === 0) {
  paid.push({
    Month: month,
    Friend: friend,
    Status: 'unpaid',
    Note: '',
    Last_Response: replyText,
  });
} else {
  for (const row of rows) {
    row.Last_Response = replyText;
  }
}

const normalized = normalizePaidRows(paid);
writeCsv(paidStatusPath, normalized, ['Month', 'Friend', 'Status', 'Note', 'Last_Response']);
console.log(`Saved reply for ${friend} in ${month}`);
