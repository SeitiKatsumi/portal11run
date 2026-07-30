import { FlatCompat } from "@eslint/eslintrc";
import { dirname } from "node:path";
import { fileURLToPath } from "node:url";

const nextConfigDirectory = dirname(fileURLToPath(import.meta.resolve("eslint-config-next/package.json")));
const compat = new FlatCompat({
  baseDirectory: import.meta.dirname,
  resolvePluginsRelativeTo: dirname(nextConfigDirectory)
});

const eslintConfig = [
  ...compat.config({ extends: ["next/core-web-vitals", "next/typescript"] }),
  {
    ignores: [
      ".next/**",
      "out/**",
      "build/**",
      "next-env.d.ts",
      "data/**",
      "public/**",
      ".design/**",
      "artifacts/**"
    ]
  }
];

export default eslintConfig;
