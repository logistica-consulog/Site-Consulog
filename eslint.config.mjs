import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  {
    ignores: [
      "node_modules/**",
      ".next/**",
      "out/**",
      "build/**",
      "next-env.d.ts",
    ],
  },
  {
    rules: {
      // Permitir any em casos específicos (utils, helpers)
      "@typescript-eslint/no-explicit-any": "warn",

      // Permitir variáveis não utilizadas em alguns casos
      "@typescript-eslint/no-unused-vars": [
        "warn",
        {
          argsIgnorePattern: "^_",
          varsIgnorePattern: "^_",
          caughtErrorsIgnorePattern: "^_",
        },
      ],

      // Permitir img tag (temos logo específico)
      "@next/next/no-img-element": "warn",

      // Avisos para exhaustive-deps (não bloqueia build)
      "react-hooks/exhaustive-deps": "warn",
    },
  },
];

export default eslintConfig;
