import OpenAI from 'openai';

const apiKey = import.meta.env.VITE_GROQ_API_KEY;
const client = new OpenAI({ 
  apiKey, 
  baseURL: 'https://api.groq.com/openai/v1',
  dangerouslyAllowBrowser: true 
});

const systemPrompt = `You are a travel planning assistant that generates detailed travel itineraries in JSON format.`;

export const chatSession = {
  async sendMessage(prompt) {
    const response = await client.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      max_tokens: 5000,
      response_format: { type: "json_object" },
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: prompt }
      ]
    });
    const text = response.choices[0].message.content;
    return { response: { text: () => text } };
  }
};
