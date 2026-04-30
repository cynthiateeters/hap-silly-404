import js from "@eslint/js";
import globals from "globals";
import prettierConfig from "eslint-config-prettier";

export default [
  {
    ignores: [".netlify/", "node_modules/"],
  },
  js.configs.recommended,
  prettierConfig,

  // Browser JS — the 404 page client script
  {
    files: ["js/**/*.mjs"],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: "module",
      globals: {
        ...globals.browser,
      },
    },
  },

  // Netlify serverless function — Node runtime with Web APIs
  {
    files: ["netlify/**/*.mjs"],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: "module",
      globals: {
        ...globals.node,
        Request: "readonly",
        Response: "readonly",
        fetch: "readonly",
      },
    },
  },

  // Test files — run in Node with Web Request/Response globals (Vitest)
  {
    files: ["tests/**/*.js"],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: "module",
      globals: {
        ...globals.node,
        Request: "readonly",
        Response: "readonly",
        fetch: "readonly",
        vi: "readonly",
      },
    },
  },
];
