import { FUNCTION_URL } from './config';

export const tripService = {
  async generateTripJob(payload) {
    const res = await fetch(`${FUNCTION_URL}/create-job`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    
    if (!res.ok) {
      if (res.status === 429) throw new Error("Rate limit exceeded. Please wait a minute before trying again.");
      throw new Error(`Server returned ${res.status}`);
    }
    
    return await res.json();
  }
};
