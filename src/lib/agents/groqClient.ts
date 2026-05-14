import Groq from 'groq-sdk';

let groqClient: Groq | null = null;

export function getGroqClient(): Groq {
    if (!groqClient) {
        const apiKey = process.env.GROQ_API_KEY;
        if (!apiKey) {
            throw new Error('GROQ_API_KEY environment variable is not set');
        }
        groqClient = new Groq({ apiKey });
    }
    return groqClient;
}

export async function callGroq(prompt: string, systemInstruction?: string): Promise<string> {
    const client = getGroqClient();
    const model = process.env.GROQ_MODEL || 'llama-3.3-70b-versatile';
    
    const messages: Groq.Chat.ChatCompletionMessageParam[] = [];
    
    if (systemInstruction) {
        messages.push({
            role: 'user',
            content: systemInstruction + '\n\n' + prompt,
        });
    } else {
        messages.push({
            role: 'user',
            content: prompt,
        });
    }

    const result = await client.chat.completions.create({
        model,
        messages: messages,
        temperature: 0.6,
        max_tokens: 8192,
        top_p: 0.95,
    });

    const content = result.choices[0]?.message?.content;
    if (!content) {
        throw new Error('No response from Groq API');
    }

    return content;
}
