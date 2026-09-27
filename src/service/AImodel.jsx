import { FUNCTION_URL } from './config';

export const chatSession = {
  async sendMessage(prompt) {
    try {
      const response = await fetch(`${FUNCTION_URL}/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt }),
      });
      
      if (!response.ok) {
        throw new Error(`Server returned ${response.status}`);
      }

      const data = await response.json();
      return { response: { text: () => data.text } };
    } catch (error) {
      console.error("Chat Session Error:", error);
      throw error;
    }
  }
};
