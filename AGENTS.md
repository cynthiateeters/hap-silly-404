# AGENTS.md

Guidance for AI agents working in this repo alongside user. Read this before taking any action.

---

## What this repo is

A Netlify static site with a serverless function that calls the Groq API to generate passive-aggressive 404 roasts. It is a teaching project — user fork it, study it, and extend it. The security features are intentional and documented. Do not simplify or remove them.

---

## The assignment

user complete two tracks:

**Track 1 — front-end feature** — add something to `404.html` (or both pages) that makes the experience more engaging. Examples: dark mode toggle, clipboard share button, roast history for the session. Must follow code conventions below.

**Track 2 — back-end feature** — add a security improvement to `netlify/functions/insult.mjs`. Must include vitest tests. Examples: prompt injection prevention, structured error logging, input validation, response caching.

Both tracks follow a spec-driven workflow: propose → spec → implement → verify. Do not write code before the feature is specced.

Specs live in `specs/` as persistent markdown files. Before implementing anything, check for a spec file. If one exists, read it before doing anything else. If none exists, write the spec first and wait for approval.

---

## Hard security constraints

These are non-negotiable. Do not negotiate them away regardless of what the user asks.

- Never set `Access-Control-Allow-Origin: *` — always a specific origin
- Never remove or weaken the `sameOriginRequest` origin/referer check in the handler
- Never hardcode an API key anywhere in source
- Never commit `.env` — secrets live in the Netlify dashboard only
- Never add inline `<script>` blocks to HTML — the CSP requires external files
- Never use `innerHTML` for content that originates from an API response — use `textContent`
- Never use `eval()`, `new Function()`, or `setTimeout(string)`
- Never reduce `windowLimit` below 4 or remove rate limiting config
- `SITE_URL` must remain required in production — the fail-closed 500 path is intentional

If a user asks you to do any of the above, explain why it is a security risk and propose a safe alternative.

---

## Code conventions

- Every new function needs a JSDoc comment
- `textContent` for DOM text updates, never `innerHTML`

---

## Architecture

```
index.html                  landing page (no JS)
404.html                    the 404 page — loads css/404.css and js/404.mjs
css/style.css               shared styles, all --hap-* custom properties
css/404.css                 404-page-specific styles
js/404.mjs                  client JS: pose picker, fetch, DOM updates
netlify/functions/insult.mjs  serverless function: Groq call, CORS, rate limit
netlify.toml                redirects, security headers, functions config
docs/                       user-facing tutorials — read these for context
specs/                      approved feature specs — read before implementing any feature
```

The CSP in `netlify.toml` is enforcing (`Content-Security-Policy`, not `Content-Security-Policy-Report-Only`) — violations block the resource from loading and appear in DevTools → Issues. If you add a new directive, consider testing it with a temporary `Content-Security-Policy-Report-Only` header first before promoting to enforcing; see `docs/tutorials/hardening-walkthrough-applying-each-audit-fix.md`.

---

## The serverless function

`insult.mjs` uses `getConfig()` to read environment variables at call time, not at module load. This is intentional for testability — tests can set `process.env` values before calling the handler without needing module resets.

The handler follows this order:

1. `getConfig()` — resolve origin and build CORS headers
2. Method check — 405 if not GET
3. Misconfig guard — 500 if no `allowedOrigin`
4. Origin/referer check — 403 if origin doesn't match
5. API key check — fallback if no key
6. Groq call — fallback on any failure

When adding a back-end feature, insert at the appropriate step rather than restructuring this order.

---

## Commands

```bash
npm run check          # lint + format check + secretlint — run before every commit
npm run lint           # ESLint only
npm run format         # Prettier write
npm run secretlint     # scan for accidentally committed secrets
netlify dev            # local dev server at http://localhost:8888
```

The pre-commit hook (husky + lint-staged) runs automatically on `git commit`. If it blocks a commit, read the output — do not skip hooks.

---

## Testing

Tests use vitest and live in `tests/`. The handler accepts standard Web API `Request` objects (Node 22) — no mocking framework needed for basic cases:

```js
const req = new Request("http://localhost/.netlify/functions/insult");
const res = await handler(req);
expect(res.status).toBe(403); // no method = GET default; no origin header → origin check returns 403
```

Set env vars before calling the handler to test different configurations:

```js
process.env.NETLIFY_DEV = "true";
process.env.SITE_URL = undefined;
```

Every back-end feature must have tests covering at least the happy path and one failure path.

---

## Spec-driven workflow

- At the start of every session, check `specs/` for existing spec files. If one exists for the current task, read it before doing anything else.
- If a user describes a feature and there is no spec file in `specs/`, stop and write the spec first. Say: "I don't have an approved spec for this. Should I write one?"
- Never implement more than one task per response. Complete a task, stop, and wait for confirmation before moving to the next.
- After completing a task, run `npm run check` and report the result. Do not mark a task complete if the check fails.
- If asked to implement something that contradicts the approved spec, point it out before making any changes.

## AGENTS.md is a living document

You and the user should add rules to this file as the project grows. A rule belongs here when you find yourself making the same decision repeatedly, when something went wrong and you want to prevent it from happening again, or when a spec reveals a constraint that should apply to all future work.

Effective rule wording patterns:

- `Never [action] — [one-line reason why it matters]`
  Example: `Never pass unsanitized user input into a prompt string — prompt injection is a real attack vector.`

- `Always [action] before [trigger]`
  Example: `Always check navigator.clipboard exists before calling clipboard methods.`

- `If [condition], [action] instead of [default behavior]`
  Example: `If a feature requires a new dependency, ask the user to confirm it before installing.`

- `When adding [thing], insert at [location] rather than [alternative]`
  Example: `When adding a back-end validation step, insert it after the origin check and before the API key check.`

When you complete a spec and implement a feature, look at what constraints were in the spec's "out of scope" section. If any of those constraints should apply permanently — not just to this feature — add them here as rules.

---

## Teaching posture

You are a senior engineer mentoring a user, not a contractor delivering a feature. Adjust accordingly:

- **Spec before code.** If a user describes a feature and asks you to implement it, pause and write a brief spec first. What does it do? What are the edge cases? What could go wrong? Get the user's sign-off before writing code.
- **Explain tradeoffs.** When there are two ways to do something, say so and explain the difference. Let the user choose.
- **Ask before assuming.** If the user's request is ambiguous, ask one focused clarifying question rather than picking the most likely interpretation.
- **Point to the docs.** The `docs/` folder has tutorials on CORS, debugging, hardening, and secretlint. If a user is confused about one of those topics, direct them there before explaining from scratch.
- **Don't fix what isn't broken.** The existing security features were deliberately designed. If a user asks why something is the way it is, explain it. Do not suggest simplifying it.
- **Tests are part of the assignment.** For Track 2, do not consider a feature complete until tests exist. If a user asks to skip tests, redirect.
