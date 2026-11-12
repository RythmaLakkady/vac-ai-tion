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
        let errorMessage = `Server returned ${response.status}`;
        try {
          const errData = await response.json();
          if (errData?.error) errorMessage = errData.error;
        } catch {
          // Ignore json parse error
        }
        throw new Error(errorMessage);
      }

      const data = await response.json();
      return { response: { text: () => data.text } };
    } catch (error) {
      console.error("Chat Session Error:", error);
      if (error.name === 'TypeError' && error.message?.toLowerCase().includes('fetch')) {
        throw new Error(`Unable to reach AI chat service (${FUNCTION_URL}). Please check your connection.`);
      }
      throw error;
    }
  }
};
