---
title: "Hardening walkthrough — applying each audit fix"
type: tutorial
sources: ["[[security-audit-and-hardening-recommendations]]"]
tags: [api-security, xss, netlify]
created: 2026-04-18
updated: 2026-04-18
status: draft
reading_order: 3
---

# Hardening walkthrough — applying each audit fix

## Before you read this

You'll get the most out of this if you've:

- Looked at `404.html` and `netlify/functions/insult.mjs` so you have a sense of what the code does
- Read `[[security-audit-and-hardening-recommendations]]` or at least skimmed the list of findings — this report explains how each one was fixed, not why it was flagged
- Know what an HTTP response header is (name + value, sent by the server with every response)

You don't need to have applied any of these changes yourself. This is a read-along that explains what was done and why it works.

---

## What "hardening" means

A working app and a secure app aren't the same thing. When the HAP 404 project was first built, it worked — the page loaded, the roast appeared, the poses rotated. But an audit found several ways the app could be abused or broken: anyone on the internet could call the serverless function and use up the free Groq quota; inline scripts in the HTML would make a future XSS attack easier to pull off; missing security headers left the browser without useful guardrails.

"Hardening" is the process of fixing those gaps after the fact. Each fix in this walkthrough addresses one specific risk, and the changes are small — most are a line or two. What makes them interesting is the reasoning: why does this particular line, in this particular place, close this particular hole?

This walkthrough covers fixes H1, H2, M1, M2, M3, M4, L1, and L2 from the audit. C1 (rotating the Groq API key) was done separately and isn't covered here.

---

## H1 — Moving inline code out, adding a Content Security Policy

### The problem

The original `404.html` had all its styles in an inline `<style>` block and all its JavaScript in an inline `<script>` block. That's not inherently broken, but it makes a Content Security Policy (CSP) impossible to write without hacks.

CSP is a response header that tells the browser which resources the page is allowed to load. It's the browser's last line of defense against XSS — if an attacker somehow injects a `<script>` tag into the roast text, a strict CSP prevents it from executing. But a CSP that allows inline scripts (`'unsafe-inline'`) defeats most of the protection, because attackers can inject inline scripts too.

To write a useful CSP, the code had to move to external files first.

### What changed

Two new files were created:

- `css/404.css` — the contents of the inline `<style>` block, now a separate stylesheet
- `js/404.mjs` — the contents of the inline `<script>` block, now an ES module

The inline blocks in `404.html` were replaced with external references:

```html
<link rel="stylesheet" href="css/404.css" />
<script type="module" src="js/404.mjs"></script>
```

With the inline code gone, the CSP could be written without needing `'unsafe-inline'`:

```toml
Content-Security-Policy-Report-Only = "default-src 'self'; script-src 'self'; style-src 'self'; img-src 'self' https://res.cloudinary.com; connect-src 'self'; frame-ancestors 'none'; base-uri 'none'; form-action 'none'"
```

A few things worth noting in that value:

- **`'self'`** means "same scheme, host, and port as this page." It covers the new external CSS and JS files automatically.
- **`img-src 'self' https://res.cloudinary.com`** allows images from Cloudinary (where the HAP pose photos live) in addition to same-origin images.
- **`connect-src 'self'`** covers `fetch()` calls to `/.netlify/functions/insult` because that's the same origin as the page.
- **`frame-ancestors 'none'`** prevents other sites from embedding this page in an iframe — equivalent to the existing `X-Frame-Options: DENY` header, but honored by newer browsers.

### Why Report-Only first

The header was deployed as `Content-Security-Policy-Report-Only`, not `Content-Security-Policy`. In report-only mode, the browser checks every resource load against the policy and flags violations in DevTools → Issues — but it doesn't block anything. The site works exactly as before.

This is a deliberate staged rollout. After watching for violations for 24–48 hours (and finding none that weren't caused by browser extensions), the header name was changed to `Content-Security-Policy` to start enforcing. Report-only is the safety net before you flip the switch.

---

## H2 — Making CORS fail closed in production, friction-free in development

### The problem

The original CORS configuration in `insult.mjs`:

```js
const ALLOWED_ORIGIN = process.env.SITE_URL || "*";
```

If `SITE_URL` wasn't set — and it wasn't, in the original deploy — this fell back to `"*"`, which means any website on the internet could call the function from a browser. That makes the function a free public Groq proxy: anyone could write a page that fetches from your function and burns your API quota.

The fix needed to close that hole in production while keeping local development easy. A naive fix — "just always require `SITE_URL`" — would mean every student who clones the repo has to manually set an environment variable before `netlify dev` works. That's friction that gets in the way of learning.

### What changed

The function now resolves `ALLOWED_ORIGIN` in two tiers:

```js
const isLocalDev = process.env.NETLIFY_DEV === "true";
const ALLOWED_ORIGIN = process.env.SITE_URL || (isLocalDev ? "http://localhost:8888" : undefined);

if (!ALLOWED_ORIGIN) {
  console.error(
    "SITE_URL is not set in production env. Insult function will return 500. " +
      "Set SITE_URL in the Netlify dashboard (Site configuration → Environment variables).",
  );
}
```

`NETLIFY_DEV` is injected by the Netlify CLI automatically whenever you run `netlify dev` on your local machine. A deployed function will never see it. So:

- **Local dev:** `NETLIFY_DEV` is `"true"` → `ALLOWED_ORIGIN` defaults to `http://localhost:8888` → no configuration needed after cloning
- **Production:** `NETLIFY_DEV` is not set → `ALLOWED_ORIGIN` comes from `SITE_URL` → if `SITE_URL` is missing, the function returns 500 and logs a clear error

That's the fail-closed design: missing configuration in production is a visible error, not a silent security bypass.

The early-return at the top of the handler makes the production misconfiguration visible as a 500 before the function tries to do anything else:

```js
if (!ALLOWED_ORIGIN) {
  return new Response(JSON.stringify({ error: "Server misconfigured." }), {
    status: 500,
    headers: { "Content-Type": "application/json" },
  });
}
```

### Why `NETLIFY_DEV` and not `NODE_ENV`

`NODE_ENV` is conventionally `"production"` in deployed Netlify Functions, but it's not guaranteed by the platform. `NETLIFY_DEV` is the Netlify-blessed signal for "running locally under the CLI" — it's explicitly injected by `netlify dev` and will never appear in a deployed function.

---

## M1 — Two more headers: HSTS and Permissions-Policy

### The problem

The site was already sending a few security headers (`X-Frame-Options`, `X-Content-Type-Options`, `Referrer-Policy`). Two more were missing.

### What changed

Two lines added to the `[headers.values]` block in `netlify.toml`:

```toml
Strict-Transport-Security = "max-age=63072000; includeSubDomains; preload"
Permissions-Policy = "camera=(), microphone=(), geolocation=(), interest-cohort=()"
```

**HSTS** (`Strict-Transport-Security`) tells browsers to always use HTTPS for this domain — never HTTP — for the next two years. This prevents protocol downgrade attacks where an attacker intercepts a non-HTTPS request before the redirect to HTTPS happens. The `preload` flag signals intent to submit to browser preload lists, which bake the HTTPS-only rule into the browser itself.

**Permissions-Policy** explicitly turns off browser APIs the site doesn't use: camera, microphone, geolocation, and the deprecated FLoC interest cohort. Without this header, a future XSS or compromised third-party script could prompt the user to grant those permissions. Disabling them upfront removes the attack surface.

---

## M2 — Tightening the rate limit

### The problem

The function's rate limit (10 requests per 60 seconds per IP) was generous. Ten roasts per minute from a single IP is well above what a normal user needs — the page loads one, and a patient user might click "Generate a new roast" a few times. At 10, a handful of IPs could cycle through the free Groq tier quickly.

### What changed

```js
export const config = {
  rateLimit: {
    windowSize: 60,
    windowLimit: 4,
    aggregateBy: ["ip", "domain"],
  },
};
```

`windowLimit` dropped from 10 to 4. Four requests per minute per IP matches the real use case: one on page load, three more if the user clicks the regenerate button. Anything beyond that gets a 429 response and the page falls back to a canned roast — the user experience degrades gracefully rather than failing hard.

`aggregateBy` now includes `"domain"` in addition to `"ip"`, which adds a global ceiling on top of the per-IP limit.

---

## M3 — Checking the request origin before calling Groq

### The problem

CORS headers tell the browser not to let other sites read the function's responses. But CORS is only enforced by browsers — curl, Postman, and server-side scripts don't check CORS at all. An explicit origin check in the function itself rejects non-browser requests (or browser requests from unexpected origins) before spending a Groq API call on them.

### What changed

Near the top of the handler, after the HTTP method check, a short block reads the `Origin` and `Referer` headers and rejects anything that doesn't match `ALLOWED_ORIGIN`:

```js
const origin = request.headers.get("origin");
const referer = request.headers.get("referer");

const sameOriginRequest =
  (origin && origin === ALLOWED_ORIGIN) || (referer && referer.startsWith(ALLOWED_ORIGIN));

if (!sameOriginRequest) {
  return new Response(JSON.stringify({ error: "Forbidden." }), {
    status: 403,
    headers: CORS_HEADERS,
  });
}
```

A real browser visiting the 404 page sends the `Origin` header automatically on every `fetch()` call. Direct curl requests (without an `-H "Origin: ..."` flag) don't — so they get a 403 before the Groq call ever happens.

This isn't a security boundary you'd rely on alone — a sufficiently determined attacker can spoof headers — but it stops casual abuse and drive-by quota drains.

---

## M4 — Documenting `SITE_URL` in `CLAUDE.md`

This was a documentation fix. The original `CLAUDE.md` listed `GROQ_API_KEY` and `GROQ_MODEL` under environment variables but omitted `SITE_URL`, which H2 made required for production.

`CLAUDE.md` was updated to include `SITE_URL` with a note that the function fails closed without it. The goal is that anyone looking at the project — human or AI — can see all required environment variables in one place and know what each one does.

---

## L1 — Removing a dead environment variable

`DOG_API_BASE_URL=https://dogapi.dog/api/v2` was in `.env.example` but not referenced anywhere in the codebase. It was there from an earlier version of the project that never shipped.

Dead config like this is a minor issue — it doesn't create a vulnerability — but it confuses future maintainers about what's actually wired up. It was removed from `.env.example`. If it was present in the Netlify dashboard, it was removed there too.

---

## L2 — Defensive parsing of the Groq response

### The problem

The original code accessed the Groq response payload like this:

```js
const insult = data.choices[0].message.content.trim();
```

If Groq's response was malformed — wrong shape, missing a field, empty choices array — this would throw a `TypeError`. The outer `try/catch` around the Groq call would catch it and fall back to a hardcoded insult. The user would never see an error.

The fallback worked, but for the wrong reason. "Accidentally correct" behavior is harder to maintain than intentional behavior: if the try/catch structure ever changed, the silent failure would become a visible one.

### What changed

Optional chaining makes the intent explicit:

```js
const insult = data?.choices?.[0]?.message?.content?.trim();

if (!insult) {
  console.warn("Groq response missing expected content shape.");
  return new Response(JSON.stringify({ insult: randomFallback(), source: "fallback" }), {
    status: 200,
    headers: CORS_HEADERS,
  });
}
```

Now the fallback is a deliberate code path, not a side effect of error handling. The `console.warn` makes it visible in the `netlify dev` terminal when debugging.

---

## What the app looks like after all of this

The functional behavior is identical to before hardening — the 404 page loads, displays a pose, and fetches a roast. What changed is the threat surface:

- The browser won't execute injected scripts (CSP enforcing)
- The function won't silently proxy Groq for the open internet (CORS + origin check)
- A misconfigured production deploy fails loudly instead of silently (fail-closed ALLOWED_ORIGIN)
- Non-browser callers are rejected before a Groq call is made (M3)
- The rate limit matches actual usage rather than being set high enough to rarely trigger (M2)
- The browser won't be tricked into HTTP or prompted for unnecessary permissions (HSTS, Permissions-Policy)

None of these changes are individually dramatic. That's how most security hardening works — not one big fix, but a stack of small ones that together make abuse significantly harder.

---

## Quick reference

| Fix | Where                                       | What it does                                 |
| --- | ------------------------------------------- | -------------------------------------------- |
| H1  | `netlify.toml`, `css/404.css`, `js/404.mjs` | Extracts inline code; adds CSP               |
| H2  | `netlify/functions/insult.mjs`              | Fail-closed CORS; dev-friendly local default |
| M1  | `netlify.toml`                              | Adds HSTS and Permissions-Policy             |
| M2  | `netlify/functions/insult.mjs`              | Tighter rate limit (10 → 4 per minute)       |
| M3  | `netlify/functions/insult.mjs`              | Origin/Referer check before Groq call        |
| M4  | `CLAUDE.md`                                 | Documents `SITE_URL` as required             |
| L1  | `.env.example`                              | Removes dead `DOG_API_BASE_URL`              |
| L2  | `netlify/functions/insult.mjs`              | Explicit Groq response shape guard           |
