import { spawn } from 'child_process';

export async function callOpencode(prompt: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const cleanEnv = { ...process.env };
    delete cleanEnv.GROQ_API_KEY;
    delete cleanEnv.GROQ_MODEL;
    delete cleanEnv.GEMINI_API_KEY;
    delete cleanEnv.GOOGLE_GENERATIVE_AI_API_KEY;
    delete cleanEnv.OPENROUTER_API_KEY;
    delete cleanEnv.AI_PROVIDER;

    const child = spawn('opencode', [
      'run',
      '--agent', 'simplyui',
      '--format', 'json',
      '--dangerously-skip-permissions',
    ], {
      timeout: 180000,
      env: cleanEnv,
    });

    let stdout = '';
    let stderr = '';

    child.stdout.on('data', (data: Buffer) => {
      stdout += data.toString();
    });

    child.stderr.on('data', (data: Buffer) => {
      stderr += data.toString();
    });

    child.on('error', (err) => {
      reject(new Error(`opencode spawn failed: ${err.message}`));
    });

    child.on('close', (code) => {
      if (code !== 0 && !stdout) {
        reject(new Error(`opencode run exited with code ${code}: ${stderr}`));
        return;
      }
      try {
        const result = parseOpencodeEvents(stdout);
        if (result) {
          resolve(result);
        } else {
          const errMsg = extractError(stdout);
          if (errMsg) {
            reject(new Error(errMsg));
          } else {
            const preview = stdout.slice(0, 500).replace(/\n/g, '\\n');
            reject(new Error(`opencode returned no text response. stdout: ${preview}`));
          }
        }
      } catch (err) {
        reject(new Error(err instanceof Error ? err.message : 'opencode returned no text response'));
      }
    });

    child.stdin.write(prompt);
    child.stdin.end();
  });
}

function parseOpencodeEvents(output: string): string {
  const lines = output.trim().split('\n');
  const parts: string[] = [];
  let firstError: string | null = null;

  for (const line of lines) {
    let event: Record<string, unknown>;
    try {
      event = JSON.parse(line);
    } catch {
      continue;
    }

    if (event.type === 'text') {
      const text = (event.part as Record<string, unknown> | undefined)?.text || event.text || '';
      if (text) parts.push(String(text));
    } else if (event.type === 'error') {
      const errData = event.error as Record<string, unknown> | undefined;
      const msg = (errData?.data as Record<string, unknown> | undefined)?.message || errData?.message || 'opencode API error';
      if (!firstError) firstError = String(msg);
    }
  }

  if (firstError) throw new Error(firstError);
  return parts.join('');
}

function extractError(output: string): string | null {
  const lines = output.trim().split('\n');
  for (const line of lines) {
    try {
      const event = JSON.parse(line);
      if (event.type === 'error') {
        const errData = event.error as Record<string, unknown> | undefined;
        const dataObj = errData?.data as Record<string, unknown> | undefined;
        return String(dataObj?.message ?? errData?.message) || null;
      }
    } catch {
    }
  }
  return null;
}
