// eslint.config.js (Step 5)
import js from '@eslint/js';
import globals from 'globals';
import react from 'eslint-plugin-react';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';

export default [
  { ignores: ['dist', 'node_modules/'] },
  // Config for backend JS files
  {
    files: ['backend/**/*.js'],
    languageOptions: {
      ecmaVersion: 2020,
      sourceType: 'commonjs',
      globals: {
        ...globals.node,
      },
    },
    rules: {
      ...js.configs.recommended.rules,
      'no-unused-vars': ['warn', { 'argsIgnorePattern': '^_' }],
    },
  },
  // Config for specific config files (frontend and backend) using CommonJS
  {
    files: [
        'frontend/tailwind.config.js', 
        'frontend/tailwind.config.cjs',
        'frontend/babel.config.js', 
        'frontend/postcss.config.js', 
        'frontend/vite.config.js',
        'frontend/vitest.config.js',
        'backend/tailwind.config.js',
        'backend/postcss.config.js',
    ],
    languageOptions: {
      ecmaVersion: 2020,
      sourceType: 'commonjs',
      globals: {
        ...globals.node,
      },
    },
    rules: {
      ...js.configs.recommended.rules,
      'no-unused-vars': ['warn', { 'argsIgnorePattern': '^_' }],
    },
  },
  // Config for the root eslint.config.js itself and root vite.config.js
  {
    files: ['eslint.config.js', 'vite.config.js'], // Root vite.config.js is also ESM
    languageOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
        globals: {
            ...globals.node, 
        }
    },
    rules: {
        ...js.configs.recommended.rules,
        'no-unused-vars': ['warn', { 'argsIgnorePattern': '^_' }],
    }
  },
  // Config for React/frontend files
  {
    files: ['frontend/src/**/*.{js,jsx}'],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
      parserOptions: {
        ecmaVersion: 'latest',
        ecmaFeatures: { jsx: true },
        sourceType: 'module',
      },
    },
    settings: { react: { version: '18.3' } },
    plugins: {
      react,
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
    },
    rules: {
      ...js.configs.recommended.rules,
      ...react.configs['jsx-runtime'].rules, // Using jsx-runtime rules
      ...reactHooks.configs.recommended.rules,
      'react/jsx-no-target-blank': 'off',
      'react-refresh/only-export-components': [
        'warn',
        { allowConstantExport: true },
      ],
      'react/prop-types': 'off', // Kept off as per original .bak logic
    },
  },
];
