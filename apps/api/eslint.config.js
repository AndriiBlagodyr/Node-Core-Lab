// Foundation: strict ESLint for the API package.
// IMPLEMENT: enable typescript-eslint recommended + Fastify-friendly rules.
// Optionally add import boundary rules later (architecture roadmap §1).

/** @type {import("eslint").Linter.Config[]} */
export default [
  {
    ignores: ["dist/**", "node_modules/**", "labs/**"],
  },
  {
    files: ["src/**/*.{ts,tsx}"],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: "module",
    },
    rules: {
      // TODO(foundation): replace with typescript-eslint flat config
    },
  },
];
