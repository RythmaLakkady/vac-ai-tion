import { FUNCTION_URL } from './config';

export const priceService = {
  async comparePrices(payload) {
    const res = await fetch(`${FUNCTION_URL}/compare`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    
    if (!res.ok) {
      if (res.status === 429) throw new Error("Rate limit exceeded.");
      throw new Error(`Server returned ${res.status}`);
    }
    
    return await res.json();
  }
};
