module.exports = {
    "env": {
        "browser": true,
        "es2021": true,
        "jest": true,
    },
    "extends": ["plugin:react/recommended","plugin:react/jsx-runtime"],
    "parser": "@typescript-eslint/parser",
    "parserOptions": {
        "ecmaFeatures": {
            "jsx": true
        },
        "ecmaVersion": "latest",
        "sourceType": "module"
    },
    "plugins": [
        "react",
        "@typescript-eslint",
        "jest",
        "jest-dom",
        "testing-library"
    ],
    "rules": {
    }
}
