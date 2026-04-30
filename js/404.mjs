/*
 * 404.mjs — Client-side script for the custom 404 page.
 *
 * Loaded by 404.html via <script type="module" src="js/404.mjs">.
 * Module scripts (type="module") are deferred by default, so this code
 * runs after the HTML has been fully parsed. That's why the calls at
 * the bottom of the file can use querySelector immediately without
 * waiting for DOMContentLoaded.
 *
 * What this file does:
 *   1. Picks a random HAP pose and shows the image + caption.
 *   2. Fetches a roast from /.netlify/functions/insult and shows it.
 *   3. Wires up the "Generate a new roast" button to repeat both.
 */

/**
 * Shape of one HAP pose entry.
 * @typedef {Object} HapPose
 * @property {string} id      Cloudinary public ID under canvas/hap/ (no extension).
 * @property {string} alt     Alt text for the image — required for screen readers.
 * @property {string} caption Caption shown below the image.
 */

/**
 * Available HAP poses. The 404 page picks one at random per page load and
 * per click of the "Generate a new roast" button.
 *
 * To add a new pose: upload the image to Cloudinary at canvas/hap/<id>,
 * then add an entry here. Keep alt text descriptive — it's read aloud
 * by screen readers and shown if the image fails to load.
 *
 * @type {HapPose[]}
 */
const HAP_POSES = [
  {
    id: "hap-confused-map",
    alt: "HAP robot with backpack looking confused while reading treasure map with compass",
    caption: "HAP tried to find your page. HAP has a map. The map did not help.",
  },
  {
    id: "hap-broke-things",
    alt: "HAP robot looking sad holding tangled wires, speech bubble says oops",
    caption: "This is fine. Everything is fine. The page is gone. Fine.",
  },
  {
    id: "hap-brain-explodes",
    alt: "HAP robot with surprised expression, head exploding with clouds and lightning bolts",
    caption: "HAP's brain trying to locate the page you requested.",
  },
  {
    id: "hap-forked-road",
    alt: "HAP robot at forked road with if(true) and else direction signs",
    caption: "You took the wrong fork. HAP respectfully suggests the other one.",
  },
  {
    id: "hap-safari",
    alt: "HAP robot wearing safari outfit and pith helmet looking through binoculars",
    caption: "HAP searched the entire savanna. Your page is not out there.",
  },
  {
    id: "hap-sad-falling-papers",
    alt: "HAP robot looking sad holding papers with more scattered on floor",
    caption: "HAP had your page right here. It's gone now. HAP is handling it.",
  },
  {
    id: "hap-w-bug",
    alt: "HAP robot holding magnifying glass, examining cute green bug on ground",
    caption: "HAP found a bug. Not your page, though. Just a bug.",
  },
  {
    id: "hap-sconcerned-laptop",
    alt: "HAP robot sitting at desk looking worried while staring at laptop screen",
    caption: "HAP checked the laptop. The laptop confirmed you are lost.",
  },
  {
    id: "hap-scientist",
    alt: "HAP robot wearing glasses holding bubbling test tube with chemistry symbols",
    caption: "HAP ran the experiment. Results: your page does not exist.",
  },
  {
    id: "hap-astronaut",
    alt: "HAP robot in astronaut suit floating in colorful space with planets",
    caption: "HAP searched outer space. Your page is not there either.",
  },
  {
    id: "hap-thinking-w-duck",
    alt: "HAP robot thinking pensively while holding rubber duck, finger on chin",
    caption: "HAP asked the duck. The duck has no idea where your page went.",
  },
  {
    id: "hap-holding-mystical-orb",
    alt: "HAP robot cradling a glowing mystical orb in both hands",
    caption: "The orb sees all. The orb does not see your page.",
  },
  {
    id: "hap-fishing-for-code",
    alt: "HAP robot in explorer outfit fishing with code file on the hook",
    caption: "HAP cast a line. Caught some code. Not your page.",
  },
  {
    id: "hap-wanting-snack",
    alt: "HAP robot thinking about food with thought bubbles showing tacos and snacks",
    caption: "HAP was going to find your page but got distracted thinking about tacos.",
  },
  {
    id: "hap-recharges",
    alt: "HAP robot sleeping peacefully while plugged into wall outlet, charging",
    caption: "HAP gave up looking and took a nap. Can you blame HAP?",
  },
  {
    id: "hap-juggles",
    alt: "HAP robot juggling floating HTML code tags like html and div",
    caption: "HAP is juggling a lot right now. Finding your page is not one of them.",
  },
  {
    id: "hap-as-chef",
    alt: "HAP robot wearing chef hat, holding spatula with pancakes and frying pan",
    caption: "HAP made pancakes instead of finding your page. Better use of time, honestly.",
  },
  {
    id: "hap-dj",
    alt: "HAP robot DJing at turntables on stage with colorful lights and music notes",
    caption: "HAP dropped the beat. Also dropped your page. Only one was on purpose.",
  },
  {
    id: "hap-pointing-up",
    alt: "HAP robot pointing upward with one finger, smiling encouragingly",
    caption: "HAP points to the URL bar. The answer to your problem is up there.",
  },
  {
    id: "hap-blizzard",
    alt: "HAP robot waving in winter blizzard wearing green earmuffs and red striped scarf with snowflakes swirling",
    caption: "HAP looked in a blizzard for your page. HAP is cold and it's your fault.",
  },
];

/**
 * Cloudinary URL prefix for HAP pose images.
 *
 * The query-like segment between /upload/ and /canvas/ is a chain of
 * Cloudinary transformations applied on the fly:
 *   f_auto  — serve modern formats (WebP/AVIF) when the browser supports them
 *   q_auto  — pick a quality level that balances size and clarity
 *   w_320   — resize to 320 pixels wide
 *   c_limit — never enlarge images that are already smaller than 320px
 *
 * The pose id is appended at request time (see loadPose).
 */
const CLOUDINARY_BASE =
  "https://res.cloudinary.com/cynthia-teeters/image/upload/f_auto,q_auto,w_320,c_limit/canvas/hap/";

/**
 * Pick a random pose from HAP_POSES.
 *
 * The standard "random element" idiom in JavaScript:
 *   Math.random()   → a float in [0, 1)
 *   * length        → scales it to [0, length)
 *   Math.floor(...) → rounds down to an integer in [0, length - 1]
 *
 * @returns {HapPose} A randomly selected pose object.
 */
function pickPose() {
  return HAP_POSES[Math.floor(Math.random() * HAP_POSES.length)];
}

/**
 * Fetch a roast from the serverless function and display it in #roast-text.
 *
 * Marked `async` because we use `await` to wait on two Promises — the
 * fetch itself, then the JSON-parsing of the response body. Wrapping
 * both in try/catch means any failure (network down, server error,
 * malformed JSON) lands in the catch block and shows a friendly
 * fallback message instead of leaving the loading spinner forever.
 *
 * The cache-buster `?t=${Date.now()}` makes each request URL unique,
 * which prevents the browser (or any caching proxy) from returning a
 * cached response and giving the user the same insult twice.
 *
 * @returns {Promise<void>}
 */
async function loadRoast() {
  const roastEl = document.querySelector("#roast-text");

  try {
    const response = await fetch(`/.netlify/functions/insult?t=${Date.now()}`);

    /* response.ok is true for any 2xx status. Anything else (404, 500,
     * 429, etc.) is treated as a failure and falls through to catch. */
    if (!response.ok) throw new Error(`Status ${response.status}`);

    const data = await response.json();

    /* SECURITY: textContent (not innerHTML) is the safe choice here.
     * Even if the API ever returned a string containing <script> tags
     * or HTML, textContent renders it as plain text — no code runs.
     * Using innerHTML on untrusted data is a classic XSS vulnerability. */
    roastEl.textContent = data.insult.replace(/^["']+|["']+$/g, "");
    roastEl.classList.remove("loading");
  } catch {
    roastEl.textContent = "HAP tried to think of something clever. The Wi-Fi disagreed.";
    roastEl.classList.remove("loading");
  }
}

/**
 * Pick a pose and update the image and caption elements on the page.
 * @returns {void}
 */
function loadPose() {
  const pose = pickPose();
  const img = document.querySelector("#hap-img");
  const caption = document.querySelector("#hap-caption");

  /* Setting img.src triggers the browser to start downloading the image. */
  img.src = `${CLOUDINARY_BASE}${pose.id}`;

  /* ACCESSIBILITY: alt text is required for screen-reader users and
   * also displays if the image fails to load. Always set it from a
   * descriptive string, never from the file name. */
  img.alt = pose.alt;
  caption.textContent = pose.caption;
}

import { applyTheme, getInitialTheme, toggleTheme } from "./theme.mjs";

/* Initialize theme before doing other UI work */
applyTheme(getInitialTheme());

/* Run both loaders once on initial page load. */
loadRoast();
loadPose();

/* Wire up the "Generate a new roast" button.
 *
 * addEventListener is the modern way to attach event handlers. It is
 * preferred over inline `onclick="..."` attributes because:
 *   1. It separates JavaScript behavior from HTML markup.
 *   2. It works with strict Content-Security-Policy (no inline JS).
 *   3. Multiple handlers can be attached to the same event.
 *
 * The callback uses an arrow function `() => { ... }`, which is a
 * shorter syntax for an anonymous function.
 */
document.querySelector("#new-roast-btn").addEventListener("click", () => {
  const roastEl = document.querySelector("#roast-text");
  roastEl.textContent = "Consulting HAP's judgment engine...";
  roastEl.classList.add("loading");
  loadRoast();
  loadPose();
});

/* Theme toggle wiring for the 404 page */
const themeBtn = document.querySelector("#theme-toggle-btn");
if (themeBtn) {
  const isDark = document.documentElement.classList.contains("dark");
  themeBtn.textContent = isDark ? "☀️" : "🌙";
  themeBtn.addEventListener("click", () => {
    const next = toggleTheme();
    themeBtn.textContent = next === "dark" ? "☀️" : "🌙";
  });
}
