const eslintConfig = [
  {
    ignores: [".next/", "node_modules/", "coverage/"],
  },
  {
    rules: {
      // Design System Enforcement Rules
      
      // Enforce consistent component usage
      "react/prop-types": "off",
      "react/react-in-jsx-scope": "off",
      
      // TypeScript rules
      "@typescript-eslint/no-unused-vars": [
        "warn",
        { 
          argsIgnorePattern: "^_",
          varsIgnorePattern: "^_" 
        }
      ],
      "@typescript-eslint/no-explicit-any": "warn",
      
      // General best practices
      "no-console": ["warn", { allow: ["warn", "error"] }],
      "prefer-const": "warn",
    },
  },
];

export default eslintConfig;
