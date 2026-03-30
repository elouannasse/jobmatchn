import js from "@eslint/js";

export default [
  {
    ignores: [
      ".next/**",
      "out/**",
      "build/**",
      "node_modules/**",
      "next-env.d.ts",
      "public/**"
    ],
  },
  js.configs.recommended,
  {
    rules: {
      "no-unused-vars": "warn",
      "no-console": "warn",
    },
  },
];
