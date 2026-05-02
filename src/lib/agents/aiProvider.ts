import { callGemini } from './geminiClient';
import { callGroq } from './groqClient';

type AIProvider = 'gemini' | 'groq';

const DEFAULT_PROVIDER: AIProvider = (process.env.AI_PROVIDER as AIProvider) || 'groq';

export async function callAI(prompt: string, systemInstruction?: string, provider?: AIProvider): Promise<string> {
    const selectedProvider = provider || DEFAULT_PROVIDER;

    if (selectedProvider === 'groq') {
        return await callGroq(prompt, systemInstruction);
    } else {
        return await callGemini(prompt, systemInstruction);
    }
}

export function getDefaultProvider(): AIProvider {
    return DEFAULT_PROVIDER;
}
