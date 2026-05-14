import { callAI } from './aiProvider';

interface OpenRouterMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

interface OpenRouterChoice {
  message: { content: string };
}

interface OpenRouterResponse {
  choices: OpenRouterChoice[];
}

const OPENROUTER_URL = 'https://openrouter.ai/api/v1/chat/completions';

const MODEL_PRESETS = {
  'minimax-m1': 'minimax/minimax-m1-regular',
  'minimax-m1-mini': 'minimax/minimax-m1-mini',
  'minimax-m1-max': 'minimax/m1-max',
  'llama': 'meta-llama/llama-3.3-70b-instruct',
  'deepseek': 'deepseek/deepseek-chat',
  'qwen': 'qwen/qwen-2.5-72b-instruct',
} as const;

type ModelKey = keyof typeof MODEL_PRESETS;

let lastProvider: string | null = null;

export function getLastProvider(): string | null {
  return lastProvider;
}

export async function callOpenRouter(
  prompt: string,
  systemInstruction?: string,
  modelKey: ModelKey = 'minimax-m1'
): Promise<string> {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    console.warn('[OpenRouter] No API key found, falling back to default AI provider');
    lastProvider = 'fallback';
    return callAI(prompt, systemInstruction);
  }

  const model = MODEL_PRESETS[modelKey] || MODEL_PRESETS['minimax-m1'];
  lastProvider = `openrouter/${modelKey}`;

  const messages: OpenRouterMessage[] = [];

  if (systemInstruction) {
    messages.push({ role: 'system', content: systemInstruction });
  }

  messages.push({ role: 'user', content: prompt });

  try {
    const response = await fetch(OPENROUTER_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
        'HTTP-Referer': process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3002',
        'X-Title': 'SimplyUI',
      },
      body: JSON.stringify({
        model,
        messages,
        temperature: 0.7,
        max_tokens: 4096,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`OpenRouter API error (${response.status}): ${errorText}`);
    }

    const data: OpenRouterResponse = await response.json();
    const content = data.choices?.[0]?.message?.content;

    if (!content) {
      throw new Error('No response from OpenRouter');
    }

    return content;
  } catch (error) {
    console.error('[OpenRouter] Error:', error);
    console.warn('[OpenRouter] Falling back to default AI provider');
    lastProvider = 'fallback';
    return callAI(prompt, systemInstruction);
  }
}

export async function callMinimax(
  prompt: string,
  systemInstruction?: string,
  modelVariant: 'm1' | 'm1-mini' | 'm1-max' = 'm1'
): Promise<string> {
  const modelKey: ModelKey = modelVariant === 'm1-mini' ? 'minimax-m1-mini' 
    : modelVariant === 'm1-max' ? 'minimax-m1-max' 
    : 'minimax-m1';
  return callOpenRouter(prompt, systemInstruction, modelKey);
}
