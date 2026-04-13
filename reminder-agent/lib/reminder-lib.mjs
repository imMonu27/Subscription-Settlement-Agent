import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
export const agentRoot = path.resolve(__dirname, '..');
export const dataDir = path.join(agentRoot, 'data');
export const subscriptionPath = path.join(dataDir, 'subscription.csv');
export const paidStatusPath = path.join(dataDir, 'paid_status.csv');

export function currentMonth() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  return `${year}-${month}`;
}

function parseCsvLine(line) {
  const out = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i += 1) {
    const ch = line[i];

    if (ch === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i += 1;
      } else {
        inQuotes = !inQuotes;
      }
      continue;
    }

    if (ch === ',' && !inQuotes) {
      out.push(current);
      current = '';
      continue;
    }

    current += ch;
  }

  out.push(current);
  return out;
}

function escapeCsv(value) {
  const text = String(value ?? '');
  if (text.includes(',') || text.includes('"') || text.includes('\n') || text.includes('\r')) {
    return `"${text.replace(/"/g, '""')}"`;
  }
  return text;
}

export function readCsv(filePath) {
  if (!fs.existsSync(filePath)) {
    throw new Error(`Missing file: ${filePath}`);
  }

  const raw = fs.readFileSync(filePath, 'utf8').replace(/^\uFEFF/, '');
  const lines = raw.split(/\r?\n/).filter((line) => line.length > 0);
  if (lines.length === 0) return [];

  const headers = parseCsvLine(lines[0]);
  return lines.slice(1).map((line) => {
    const values = parseCsvLine(line);
    const row = {};
    headers.forEach((header, index) => {
      row[header] = values[index] ?? '';
    });
    return row;
  });
}

export function writeCsv(filePath, rows, headers) {
  const lines = [];
  lines.push(headers.map(escapeCsv).join(','));
  for (const row of rows) {
    lines.push(headers.map((header) => escapeCsv(row[header] ?? '')).join(','));
  }
  fs.writeFileSync(filePath, `${lines.join('\n')}\n`, 'utf8');
}

export function normalizePaidRows(rows) {
  return rows.map((row) => ({
    Month: row.Month ?? '',
    Friend: row.Friend ?? '',
    Status: row.Status ?? '',
    Note: row.Note ?? '',
    Last_Response: row.Last_Response ?? '',
  }));
}

export function calculateShareParts(personSubs) {
  const parts = [];
  for (const sub of personSubs) {
    const total = Number(sub.Total_Cost);
    const split = Number(sub.Split_Count);
    if (!Number.isFinite(total) || !Number.isFinite(split) || split <= 0) continue;
    const share = Math.round((total / split) * 100) / 100;
    parts.push(`${sub.Service}: ${share.toFixed(2)} USD (${sub.Total_Cost} / ${sub.Split_Count})`);
  }
  return parts;
}

export function buildReminderMessage(friendName, month, parts) {
  return `Hi ${friendName} - reminder for ${month} subscription split: ${parts.join('; ')}. Status on file is unpaid. Please pay when you can.`;
}
