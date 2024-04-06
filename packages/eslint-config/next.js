const { resolve } = require("node:path");

const project = resolve(process.cwd(), "tsconfig.json");

/** @type {import("eslint").Linter.Config} */
module.exports = {
    parser: "@typescript-eslint/parser",
    extends: [
        "eslint:recommended",
        "prettier",
        require.resolve("@vercel/style-guide/eslint/next"),
        "eslint-config-turbo",
		"plugin:@typescript-eslint/recommended",
        "plugin:unicorn/recommended",
    ],
    globals: {
        React: true,
        JSX: true,
    },
    env: {
        node: true,
        browser: true,
    },
    plugins: ["only-warn", "@typescript-eslint"],
    rules: {
        "no-unused-vars": "off",
        "@typescript-eslint/no-unused-vars": ["error"],
		"@typescript-eslint/no-explicit-any": "off",
    },
    settings: {
        "import/resolver": {
            typescript: {
                project,
            },
        },
    },
    ignorePatterns: [
        // Ignore dotfiles
        ".*.js",
        "node_modules/",
    ],
    overrides: [{ files: ["*.js?(x)", "*.ts?(x)"] }],
};
