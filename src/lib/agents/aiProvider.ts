import { callGemini } from './geminiClient';
import { callGroq } from './groqClient';
import { callOpenRouter, callMinimax, getLastProvider } from './openrouterClient';
import { callOpencode } from './opencodeClient';

type AIProvider = 'gemini' | 'groq' | 'openrouter' | 'minimax' | 'opencode';

const DEFAULT_PROVIDER: AIProvider = (process.env.AI_PROVIDER as AIProvider) || 'groq';

export async function callAI(prompt: string, systemInstruction?: string, provider?: AIProvider): Promise<string> {
    const selectedProvider = provider || DEFAULT_PROVIDER;

    switch (selectedProvider) {
        case 'groq':
            return await callGroq(prompt, systemInstruction);
        case 'gemini':
            return await callGemini(prompt, systemInstruction);
        case 'openrouter':
            return await callOpenRouter(prompt, systemInstruction);
        case 'minimax':
            return await callMinimax(prompt, systemInstruction);
        case 'opencode':
            return await callOpenCodeWithSystem(prompt, systemInstruction);
        default:
            return await callGroq(prompt, systemInstruction);
    }
}

async function callOpenCodeWithSystem(prompt: string, systemInstruction?: string): Promise<string> {
    const fullPrompt = systemInstruction
        ? `${systemInstruction}\n\n${prompt}`
        : prompt;
    return await callOpencode(fullPrompt);
}

export function getDefaultProvider(): AIProvider {
    return DEFAULT_PROVIDER;
}

export { getLastProvider };
