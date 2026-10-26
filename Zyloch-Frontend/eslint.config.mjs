import nextVitals from "eslint-config-next/core-web-vitals";

const eslintConfig = [
  ...nextVitals,
  {
    ignores: ["node_modules/**", ".next/**", "dist/**", "build/**"],
  },
  {
    rules: {
      "react-hooks/exhaustive-deps": "warn",
      "react-hooks/set-state-in-effect": "warn",
      "react-hooks/immutability": "warn",
      "react-hooks/static-components": "warn",
      "no-unused-vars": "warn",
      "no-console": "off",
      "@next/next/no-img-element": "warn",
    },
  },
];

export default eslintConfig;
