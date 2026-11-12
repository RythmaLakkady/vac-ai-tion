import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { resolveFunctionUrl } from '@/service/config';
import { tripService } from '@/service/tripService';
import { priceService } from '@/service/priceService';
import { chatSession } from '@/service/AImodel';

describe('resolveFunctionUrl', () => {
  it('defaults to production Render backend when no env overrides are present', () => {
    const url = resolveFunctionUrl({});
    expect(url).toBe('https://vac-ai-tion.onrender.com');
  });

  it('uses VITE_FUNCTION_URL if explicitly provided', () => {
    const url = resolveFunctionUrl({ VITE_FUNCTION_URL: 'https://custom-api.example.com/' });
    expect(url).toBe('https://custom-api.example.com');
  });

  it('ignores localhost VITE_PRICE_FUNCTION_URL and falls back to Render backend', () => {
    const url = resolveFunctionUrl({ VITE_PRICE_FUNCTION_URL: 'http://127.0.0.1:8080' });
    expect(url).toBe('https://vac-ai-tion.onrender.com');
  });

  it('uses deployed VITE_PRICE_FUNCTION_URL if provided', () => {
    const url = resolveFunctionUrl({ VITE_PRICE_FUNCTION_URL: 'https://price-api.example.com' });
    expect(url).toBe('https://price-api.example.com');
  });

  it('honors VITE_USE_LOCAL_EMULATOR flag if explicitly requested', () => {
    const url = resolveFunctionUrl({ VITE_USE_LOCAL_EMULATOR: 'true' });
    expect(url).toBe('http://127.0.0.1:5001/wandergen---ai-travel-planner/us-central1/api');
  });
});

const originalFetch = globalThis.fetch;

describe('tripService error handling', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  afterEach(() => {
    globalThis.fetch = originalFetch;
  });

  it('re-throws user-friendly message when fetch fails with TypeError', async () => {
    globalThis.fetch = vi.fn().mockRejectedValue(new TypeError('Failed to fetch'));

    await expect(tripService.generateTripJob({ destination: 'Tokyo', days: 3 }))
      .rejects.toThrow(/Unable to connect to backend service/);
  });

  it('throws rate limit message when status is 429', async () => {
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 429,
      json: async () => ({ error: 'Too many requests' }),
    });

    await expect(tripService.generateTripJob({ destination: 'Tokyo', days: 3 }))
      .rejects.toThrow(/Rate limit exceeded/);
  });

  it('returns parsed job payload on 200 response', async () => {
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({ jobId: 'job-123', cached: false }),
    });

    const result = await tripService.generateTripJob({ destination: 'Tokyo', days: 3 });
    expect(result).toEqual({ jobId: 'job-123', cached: false });
  });
});

describe('priceService error handling', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('re-throws user-friendly message when price fetch fails with network error', async () => {
    globalThis.fetch = vi.fn().mockRejectedValue(new TypeError('Failed to fetch'));

    await expect(priceService.comparePrices({ destination: 'Kyoto', dates: { start: '2026-06-01' } }))
      .rejects.toThrow(/Unable to reach pricing service/);
  });
});

describe('chatSession error handling', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('re-throws user-friendly message when chat fetch fails with network error', async () => {
    globalThis.fetch = vi.fn().mockRejectedValue(new TypeError('Failed to fetch'));

    await expect(chatSession.sendMessage('Suggest a place'))
      .rejects.toThrow(/Unable to reach AI chat service/);
  });

  it('returns formatted text response on success', async () => {
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({ text: 'Kyoto is stunning.' }),
    });

    const result = await chatSession.sendMessage('Tell me about Kyoto');
    expect(result.response.text()).toBe('Kyoto is stunning.');
  });
});
