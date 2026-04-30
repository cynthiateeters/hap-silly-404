import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

// Load the Netlify function handler dynamically so tests can set process.env per case
const loadHandler = async () => {
  const mod = await import("../netlify/functions/insult.mjs");
  return mod?.default ?? mod?.handler ?? mod;
};

describe("intent-classifier-prefilter (SDD/TDD)", () => {
  let originalFetch;

  beforeEach(() => {
    originalFetch = global.fetch;
    // Ensure consistent env for tests
    process.env.SITE_URL = "http://localhost:8888";
    process.env.GROQ_API_KEY = "test-key";
  });

  afterEach(() => {
    global.fetch = originalFetch;
    vi.resetAllMocks();
    delete process.env.GROQ_API_KEY;
    delete process.env.SITE_URL;
  });

  it("calls Groq and returns a roast for allowed prompt", async () => {
    // Mock fetch to simulate Groq response
    const mockResponse = {
      ok: true,
      json: async () => ({ choices: [{ message: { content: "Mock roast from Groq." } }] }),
    };

    global.fetch = vi.fn(async (url) => {
      // Ensure we called the Groq API endpoint
      if (url && url.toString().includes("api.groq.com")) return mockResponse;
      return { ok: false };
    });

    const handler = await loadHandler();

    const req = new Request("http://localhost/.netlify/functions/insult?q=please+give+me+a+roast", {
      method: "GET",
      headers: { origin: "http://localhost:8888" },
    });

    const res = await handler(req);
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.source).toBe("groq");
    expect(body.insult).toBe("Mock roast from Groq.");
    expect(global.fetch).toHaveBeenCalled();
  });

  it("rejects off-topic prompt and does not call Groq", async () => {
    // Spy on fetch to ensure it is NOT called
    global.fetch = vi.fn();

    const handler = await loadHandler();

    const req = new Request(
      "http://localhost/.netlify/functions/insult?q=write+python+reverse+linked+list",
      {
        method: "GET",
        headers: { origin: "http://localhost:8888" },
      },
    );

    const res = await handler(req);

    expect(res.status).toBe(403);
    expect(global.fetch).not.toHaveBeenCalled();
  });

  it("allows empty query and returns a roast (or fallback)", async () => {
    // Mock fetch to simulate Groq response when called
    const mockResponse = {
      ok: true,
      json: async () => ({ choices: [{ message: { content: "Mock roast from Groq." } }] }),
    };

    global.fetch = vi.fn(async (url) => {
      if (url && url.toString().includes("api.groq.com")) return mockResponse;
      return { ok: false };
    });

    const handler = await loadHandler();

    const req = new Request("http://localhost/.netlify/functions/insult", {
      method: "GET",
      headers: { origin: "http://localhost:8888" },
    });

    const res = await handler(req);
    expect(res.status).toBe(200);
  });
});
