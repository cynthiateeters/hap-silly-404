/*
 * insult.mjs — Netlify serverless function (v2) that returns a 404 roast.
 *
 * Endpoint: GET /.netlify/functions/insult
 * Returns:  { insult: string, source: "groq" | "fallback" }
 *
 * The function calls the Groq API (a free LLM provider) for a witty
 * one-liner about the user's missing page. If anything goes wrong —
 * missing key, rate limit, network failure, malformed response — it
 * returns one of FALLBACK_INSULTS so the user always sees something.
 * This "always return something useful" pattern is called graceful
 * degradation, and it's the single most important rule for code that
 * depends on a third-party API.
 *
 * Netlify Functions v2 uses standard Web APIs: the handler receives a
 * Request object and must return a Response (or a Promise of one).
 * No callbacks, no res.send() — this is the same Request/Response API
 * the browser's fetch() uses.
 */

/**
 * Pre-written insults used when the Groq API path fails for any reason.
 * Always at least 8 entries so they don't repeat too noticeably.
 * @type {string[]}
 */
const FALLBACK_INSULTS = [
  "Wow. You managed to find a page that doesn't exist. That's almost impressive.",
  "404. Even HAP's map couldn't find this one, and HAP has a very good map.",
  "You typed something. The server looked. Nothing. You're welcome.",
  "This page has been gone longer than your browser history. Take the hint.",
  "Congratulations! You've discovered the void. The void is not impressed.",
  "HAP checked twice. Still not here. HAP is very thorough.",
  "The page you wanted called in sick. It did not leave a note.",
  "Error 404: page not found. Error 100%: this is your fault.",
];

/**
 * Netlify Functions v2 configuration.
 *
 * rateLimit: at most `windowLimit` requests per `windowSize` seconds,
 * counted per IP and globally per domain. Returns 429 when exceeded.
 * Aggregating by both `ip` and `domain` prevents a single user from
 * draining the budget AND prevents many users together from doing so.
 */
export const config = {
  rateLimit: {
    windowSize: 60,
    windowLimit: 4,
    aggregateBy: ["ip", "domain"],
  },
};

/*
 * getConfig() reads environment variables at call time, not at module load.
 *
 * Why this matters: module-level constants are evaluated once when Node
 * first imports the file. That makes them impossible to test — you can't
 * change process.env between tests and re-run the same module. By reading
 * env vars inside a function, each call sees the current environment.
 *
 * allowedOrigin — the only origin the function will serve.
 *
 * Production: must be set explicitly in Netlify dashboard env (SITE_URL).
 * Local dev:  defaults to http://localhost:8888 when running under `ntl dev`,
 *             so a fresh clone works without any local configuration.
 *
 * If you run `ntl dev` on a non-default port, set SITE_URL in your shell
 * (e.g. `SITE_URL=http://localhost:9000 ntl dev`).
 *
 * The two-tier design (env var preferred, dev default fallback) is a
 * common pattern: production stays strict (fail closed if misconfigured)
 * while local dev "just works" with no extra setup.
 *
 * CORS headers tell the browser which origins may read this response.
 * Setting Access-Control-Allow-Origin to a single value (not "*") means
 * only that one origin can fetch from this function via a browser.
 *
 * The spread operator `...` here conditionally adds the ACAO header only
 * when allowedOrigin is defined. Spreading {} is a no-op, so this is a
 * common idiom for "include this property only if X is truthy."
 *
 * @returns {{ allowedOrigin: string|undefined, corsHeaders: Record<string,string> }}
 */
function getConfig() {
  const isLocalDev = process.env.NETLIFY_DEV === "true";
  const allowedOrigin = process.env.SITE_URL || (isLocalDev ? "http://localhost:8888" : undefined);

  const corsHeaders = {
    "Content-Type": "application/json",
    "Cache-Control": "no-store",
    ...(allowedOrigin ? { "Access-Control-Allow-Origin": allowedOrigin } : {}),
  };

  return { allowedOrigin, corsHeaders };
}

/**
 * Serverless function entry point. Netlify calls this for every request
 * to /.netlify/functions/insult.
 *
 * @param {Request} request - Standard Web API Request object.
 * @returns {Promise<Response>} JSON response with insult and source.
 */
export default async function handler(request) {
  const { allowedOrigin, corsHeaders } = getConfig();

  /* Method allowlist: only GET is meaningful here. Returning 405 for
   * everything else (POST, PUT, DELETE, ...) makes intent explicit and
   * stops accidental writes from random clients. */
  if (request.method !== "GET") {
    return new Response(JSON.stringify({ error: "Method not allowed. Use GET." }), {
      status: 405,
      headers: corsHeaders,
    });
  }

  /* Production-misconfig guard: if SITE_URL is missing in production,
   * we'd be accidentally letting any origin call us. Refuse with a 500
   * rather than silently falling open. */
  if (!allowedOrigin) {
    console.error(
      "SITE_URL is not set in production env. Insult function will return 500. " +
        "Set SITE_URL in the Netlify dashboard (Site configuration → Environment variables).",
    );
    return new Response(JSON.stringify({ error: "Server misconfigured." }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }

  /* Origin check — defense in depth on top of CORS.
   *
   * CORS only restricts BROWSERS. Tools like curl, Postman, or any
   * server-side script ignore CORS entirely. By checking the Origin
   * and Referer request headers ourselves, we reject non-browser
   * callers (and browsers loading the page from other sites) BEFORE
   * we spend a Groq API call on them. */
  const origin = request.headers.get("origin");
  const referer = request.headers.get("referer");

  const sameOriginRequest =
    (origin && origin === allowedOrigin) || (referer && referer.startsWith(allowedOrigin));

  if (!sameOriginRequest) {
    return new Response(JSON.stringify({ error: "Forbidden." }), {
      status: 403,
      headers: corsHeaders,
    });
  }

  /* Intent prefilter: lightweight deterministic classifier to reject
   * obviously off-topic requests (e.g., programming help) before we
   * spend quota calling the Groq API. This keeps tests deterministic
   * and avoids network calls for disallowed intents. The classifier
   * is intentionally simple: it looks for a small allowlist of keywords
   * that indicate the user is asking for a roast / 404 message.
   *
   * It is evaluated using the URL `q` parameter (if present). If no
   * query text is present we conservatively allow the request so the
   * page continues to work.
   */
  if (!isAllowedIntent(request)) {
    return new Response(JSON.stringify({ error: "Forbidden." }), {
      status: 403,
      headers: corsHeaders,
    });
  }

  /* Read the API key from environment variables (set in the Netlify
   * dashboard). NEVER hard-code an API key in source. NEVER log its
   * value. If a key ever leaks, rotate it immediately. */
  const apiKey = process.env.GROQ_API_KEY;

  /* No API key — return a fallback rather than an error. This keeps the
   * page working during local dev or before keys are wired up. */
  if (!apiKey) {
    return new Response(JSON.stringify({ insult: randomFallback(), source: "fallback" }), {
      status: 200,
      headers: corsHeaders,
    });
  }

  /* Vary the prompt angle so consecutive roasts feel different. */
  const ANGLES = [
    "blame their typing skills",
    "sympathize with the missing page",
    "narrate it like a nature documentary",
    "deliver it as breaking news",
    "write it as a fortune cookie",
    "say it like a disappointed librarian",
    "frame it as a sports commentary",
    "present it as a weather forecast",
    "deliver it like a flight attendant announcement",
    "say it like a detective solving the case",
    "phrase it as a restaurant review",
    "deliver it as a voicemail from the page that left",
  ];

  const angle = ANGLES[Math.floor(Math.random() * ANGLES.length)];

  try {
    const model = process.env.GROQ_MODEL || "llama-3.3-70b-versatile";

    /* Groq exposes an OpenAI-compatible chat-completion endpoint, so the
     * request body shape (model + messages array) matches what you would
     * send to OpenAI's API. The Authorization header carries our API key
     * as a "Bearer token" — a standard auth scheme. */
    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model,
        messages: [
          /* The "system" message sets the assistant's behavior — its
           * tone, topic, and what to avoid. The "user" message is the
           * actual request. Keeping the system prompt strict reduces
           * the chance of off-topic or unsafe output. */
          {
            role: "system",
            content:
              "You write short, witty one-liners for a fun 404 error page. Keep it clean, lighthearted, and family-friendly. No profanity, slurs, insults about identity, or mean-spirited content. Poke fun at the situation, never the person.",
          },
          {
            role: "user",
            content: `Write a one-liner roast for someone who just hit a 404 page. Angle: ${angle}. Under 25 words. No hashtags, no emojis. Dry wit only.`,
          },
        ],
        /* max_tokens caps both the cost of the call AND the size of any
         * unexpected output (e.g. a prompt-injection payload trying to
         * dump a long string back at us). */
        max_tokens: 60,
        /* temperature controls randomness: 0 is deterministic, 1 is
         * creative. 0.8 gives varied output without going off the rails. */
        temperature: 0.8,
      }),
    });

    /* Anything other than 2xx — usually 401 (bad key), 429 (rate limited),
     * or 5xx (Groq itself is down). Fall back to a canned insult rather
     * than surfacing an error to the user. */
    if (!response.ok) {
      console.warn(`Groq API returned ${response.status}`);
      return new Response(JSON.stringify({ insult: randomFallback(), source: "fallback" }), {
        status: 200,
        headers: corsHeaders,
      });
    }

    const data = await response.json();

    /* Optional chaining `?.` returns undefined instead of throwing if any
     * step in the chain is missing. This protects us if Groq ever changes
     * its response shape — we degrade gracefully rather than crashing. */
    const insult = data?.choices?.[0]?.message?.content?.trim();

    if (!insult) {
      console.warn("Groq response missing expected content shape.");
      return new Response(JSON.stringify({ insult: randomFallback(), source: "fallback" }), {
        status: 200,
        headers: corsHeaders,
      });
    }

    return new Response(JSON.stringify({ insult, source: "groq" }), {
      status: 200,
      headers: corsHeaders,
    });
  } catch {
    /* Network-level failure (DNS, TCP, TLS) — fetch itself rejected.
     * Same fallback path as the !response.ok branch above. */
    return new Response(JSON.stringify({ insult: randomFallback(), source: "fallback" }), {
      status: 200,
      headers: corsHeaders,
    });
  }
}

/**
 * Pick a random fallback insult.
 *
 * Same `Math.floor(Math.random() * length)` idiom used in 404.mjs — see
 * the comment on pickPose() there for an explanation of why each piece
 * is needed.
 *
 * @returns {string}
 */
function randomFallback() {
  return FALLBACK_INSULTS[Math.floor(Math.random() * FALLBACK_INSULTS.length)];
}

/**
 * Lightweight deterministic intent prefilter.
 * Returns true when the request looks like a 404/roast request and false
 * for clearly off-topic prompts (e.g., programming help, math, etc.).
 *
 * The function intentionally keeps the logic simple and test-friendly.
 * It checks the `q` query parameter for allowlist keywords. If no query
 * is present, the request is allowed so the page still works when JavaScript
 * hits the endpoint without a query string.
 *
 * @param {Request} request
 * @returns {boolean}
 */
function isAllowedIntent(request) {
  try {
    const url = new URL(request.url);
    const q = (url.searchParams.get("q") || "").toLowerCase().replace(/\+/g, " ").trim();

    if (!q) return true; // no query; allow

    // Allowlist tokens. Build simple word-boundary regexes to avoid
    // accidental substring matches (e.g. 'programming' matching 'ram').
    const allowTokens = [
      "roast",
      "404",
      "page not found",
      "insult",
      "missing page",
      "give me a roast",
      "roast me",
    ];

    for (const t of allowTokens) {
      // Escape regex special chars in token, then test with word boundaries
      const escaped = t.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      const re = new RegExp(`\\b${escaped}\\b`, "i");
      if (re.test(q)) return true;
    }

    return false;
  } catch {
    // On any parsing error, be permissive so we don't block legitimate requests
    return true;
  }
}
