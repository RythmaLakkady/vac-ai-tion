import { FUNCTION_URL } from './config';
import { db } from '@/firebase';
import { collection, query, where, getDocs, limit, orderBy } from 'firebase/firestore';

const memoryCache = new Map();

export const priceService = {
  async comparePrices(payload) {
    const cacheKey = JSON.stringify({
      dest: payload.destination,
      start: payload.dates?.start,
      end: payload.dates?.end,
      userId: payload.preferences?.userId
    });
    
    if (memoryCache.has(cacheKey)) {
      return memoryCache.get(cacheKey);
    }

    try {
      if (payload.preferences?.userId && payload.preferences.userId !== 'anon') {
        const q = query(
          collection(db, 'priceSearches'),
          where('userId', '==', payload.preferences.userId),
          where('destination', '==', payload.destination),
          limit(1)
        );
        const snap = await getDocs(q);
        if (!snap.empty) {
          const doc = snap.docs[0].data();
          if (doc.results && doc.results.length > 0) {
             memoryCache.set(cacheKey, doc);
             return doc;
          }
        }
      }
    } catch (e) {
      console.warn("Firestore cache check failed", e);
    }

    const res = await fetch(`${FUNCTION_URL}/compare`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    
    if (!res.ok) {
      if (res.status === 429) throw new Error("Rate limit exceeded.");
      throw new Error(`Server returned ${res.status}`);
    }
    
    const data = await res.json();
    memoryCache.set(cacheKey, data);
    return data;
  }
};
