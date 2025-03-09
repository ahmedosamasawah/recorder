import js from '@eslint/js'
import tsPlugin from '@typescript-eslint/eslint-plugin'
import tsParser from '@typescript-eslint/parser'
import eslintPluginImportX from 'eslint-plugin-import-x'
import simpleImportSort from 'eslint-plugin-simple-import-sort'
import sveltePlugin from 'eslint-plugin-svelte'
import {readFileSync as r} from 'fs'
import globals from 'globals'
import svelteParser from 'svelte-eslint-parser' // ✅ Correct parser usage for .svelte

const prep_globals = s => Object.fromEntries(s.split(' ').map(g => [g, 'readonly']))

const globals_all = {
    ...prep_globals(
        r('src/auto-imports.d.ts', 'utf8')
            .match(/const (\w+):/g)
            ?.map(x => x.slice(6, -1))
            .join(' ') || '',
    ),
    ...prep_globals('Sentry'),
}

export default [
    js.configs.recommended,

    {
        ignores: [
            'misc/**/*',
            ...'node_modules,dist,dist-native,android,ios,public'.split(',').map(x => x + '/**/*'),
            'build.js',
        ],
    },

    // ✅ TypeScript and JavaScript configuration
    {
        files: ['**/*.ts', '**/*.js'],
        languageOptions: {
            parser: tsParser,
            sourceType: 'module',
            globals: {...globals.es2021, ...globals.browser, ...globals_all},
        },
        plugins: {
            '@typescript-eslint': tsPlugin,
        },
        rules: {
            ...tsPlugin.configs.recommended.rules,
            '@typescript-eslint/no-unused-vars': [
                'warn',
                {argsIgnorePattern: '^_', varsIgnorePattern: '^_'},
            ],
        },
    },

    // ✅ Svelte Configuration (Fixing Parsing Errors)
    {
        files: ['**/*.svelte'],
        languageOptions: {
            parser: svelteParser, // ✅ Corrected parser usage
            sourceType: 'module',
            globals: {...globals.es2021, ...globals.browser, ...globals_all},
            parserOptions: {
                parser: tsParser, // ✅ Ensuring TypeScript support inside Svelte
                extraFileExtensions: ['.svelte'],
            },
        },
        plugins: {
            svelte: sveltePlugin, // ✅ Keep this for Svelte-specific linting rules
        },
        rules: {
            ...sveltePlugin.configs.recommended.rules,
            'no-inner-declarations': 'off',
            'no-self-assign': 'off',
            'svelte/no-at-html-tags': 'off',
            'svelte/require-each-key': 'off',
            'svelte/valid-compile': ['error', {ignoreWarnings: true}],
            'no-unused-vars': ['error', {argsIgnorePattern: '^_', varsIgnorePattern: '^_'}],
        },
    },

    // ✅ Import sorting and rules
    {
        plugins: {
            'simple-import-sort': simpleImportSort,
            'import-x': eslintPluginImportX,
        },
        rules: {
            'simple-import-sort/imports': 'error',
            'simple-import-sort/exports': 'error',
            'import-x/first': 'error',
            'import-x/newline-after-import': 'error',
            'import-x/no-duplicates': 'error',
            'import-x/extensions': [
                'error',
                'always',
                {
                    ignorePackages: true,
                },
            ],
        },
    },
]
