import { FUNCTION_URL } from './config';

export const tripService = {
  async generateTripJob(payload) {
    try {
      const res = await fetch(`${FUNCTION_URL}/create-job`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      
      if (!res.ok) {
        if (res.status === 429) {
          throw new Error("Rate limit exceeded. Please wait a minute before trying again.");
        }
        let errorMessage = `Server returned ${res.status}`;
        try {
          const errData = await res.json();
          if (errData?.error) errorMessage = errData.error;
        } catch {
          // Ignore json parse error
        }
        throw new Error(errorMessage);
      }
      
      return await res.json();
    } catch (err) {
      if (err.name === 'TypeError' && err.message?.toLowerCase().includes('fetch')) {
        throw new Error(`Unable to connect to backend service (${FUNCTION_URL}). Please verify your network connection.`);
      }
      throw err;
    }
  }
};
