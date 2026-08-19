import OpenAI from 'openai';

const systemPrompt = `You are a strict, highly accurate data generator. You MUST output a fully valid JSON object without any syntax errors. Double-check all closing brackets and braces. Do NOT include any markdown formatting, conversational text, or trailing commas.`;

let client;

function getClient() {
  if (!client) {
    const apiKey = import.meta.env.VITE_GROQ_API_KEY;
    if (!apiKey) {
      throw new Error(
        'Missing GROQ API key. Please set the VITE_GROQ_API_KEY environment variable.'
      );
    }
    client = new OpenAI({
      apiKey,
      baseURL: 'https://api.groq.com/openai/v1',
      dangerouslyAllowBrowser: true,
    });
  }
  return client;
}

export const chatSession = {
  async sendMessage(prompt) {
    const response = await client.chat.completions.create({
      model: 'openai/gpt-oss-20b',
      max_tokens: 3500,
      temperature: 0.2,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: prompt }
      ]
    });
    const text = response.choices[0].message.content;
    return { response: { text: () => text } };
  }
};
