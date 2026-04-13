import { appendFileSync, existsSync, readFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { spawn } from 'node:child_process';

const resolveAgentRoot = (event: any) => {
  const workspaceDir = String(event?.context?.workspaceDir ?? '').trim();
  if (workspaceDir) return join(workspaceDir, 'reminder-agent');

  return resolve(__dirname, '..', '..');
};

const handler = async (event: any) => {
  const agentRoot = resolveAgentRoot(event);
  const debugPath = join(agentRoot, 'data', 'reply-hook-debug.log');

  try {
    if (event?.type !== 'message' || event?.action !== 'received') return;

    const ctx = event?.context ?? {};
    const channelId = String(ctx.channelId ?? '');
    if (channelId !== 'telegram') return;

    const meta = ctx.metadata ?? {};
    const senderId = String(meta.senderId ?? ctx.senderId ?? ctx.from ?? '').trim();
    const content = String(ctx.bodyForAgent ?? ctx.content ?? ctx.body ?? meta.text ?? '').trim();
    const conversationId = String(ctx.conversationId ?? '');
    const isGroup = Boolean(ctx.isGroup ?? false);

    appendFileSync(
      debugPath,
      JSON.stringify({
        ts: new Date().toISOString(),
        channelId,
        senderId,
        conversationId,
        isGroup,
        content,
        metaSenderId: meta.senderId ?? null,
        from: ctx.from ?? null,
        senderIdCtx: ctx.senderId ?? null,
      }) + '\n'
    );

    if (!senderId || !content) return;
    if (isGroup) return;
    if (conversationId && senderId) {
      const convoOk = conversationId === senderId || conversationId === `telegram:${senderId}`;
      if (!convoOk) return;
    }

    const subPath = join(agentRoot, 'data', 'subscription.csv');
    const scriptPath = join(agentRoot, 'scripts', 'capture-reply.mjs');

    if (!existsSync(subPath) || !existsSync(scriptPath)) return;

    const csv = readFileSync(subPath, 'utf8');
    const lines = csv.split(/\r?\n/).filter(Boolean);
    if (lines.length < 2) return;

    const known = new Set<string>();
    for (const line of lines.slice(1)) {
      const parts = line.split(',');
      const id = String(parts[4] ?? '').trim();
      if (id) known.add(id);
    }

    if (!known.has(senderId)) return;

    appendFileSync(
      debugPath,
      JSON.stringify({
        ts: new Date().toISOString(),
        action: 'spawn',
        senderId,
        scriptPath,
        content,
      }) + '\n'
    );

    const child = spawn('node', [
      scriptPath,
      '--telegram-user-id', senderId,
      '--reply-text', content,
    ], {
      detached: false,
      windowsHide: true,
      cwd: agentRoot,
    });

    let stdout = '';
    let stderr = '';
    child.stdout?.on('data', (buf) => {
      stdout += String(buf);
    });
    child.stderr?.on('data', (buf) => {
      stderr += String(buf);
    });
    child.on('error', (err) => {
      appendFileSync(
        debugPath,
        JSON.stringify({
          ts: new Date().toISOString(),
          action: 'spawn-error',
          error: err instanceof Error ? err.message : String(err),
        }) + '\n'
      );
    });
    child.on('close', (code) => {
      appendFileSync(
        debugPath,
        JSON.stringify({
          ts: new Date().toISOString(),
          action: 'spawn-close',
          code,
          stdout: stdout.trim(),
          stderr: stderr.trim(),
        }) + '\n'
      );
    });
  } catch (err) {
    try {
      appendFileSync(
        debugPath,
        JSON.stringify({
          ts: new Date().toISOString(),
          error: err instanceof Error ? err.message : String(err),
        }) + '\n'
      );
    } catch {}
    console.error('[telegram-bill-reply-capture] Failed:', err instanceof Error ? err.message : String(err));
  }
};

export default handler;
