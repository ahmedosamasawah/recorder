import js from '@eslint/js'
import globals from 'globals'
import sveltePlugin from 'eslint-plugin-svelte'

export default [
    js.configs.recommended,
    {
        ignores: ['misc/**/*', 'node_modules', 'dist'],
    },
    {
        files: ['**/*.js'],
        languageOptions: {
            sourceType: 'module',
            globals: {...globals.es2021, ...globals.browser},
        },
    },
    {
        files: ['**/*.svelte'],
        languageOptions: {
            sourceType: 'module',
            globals: {...globals.es2021, ...globals.browser},
        },
        plugins: {
            svelte: sveltePlugin,
        },
        rules: {
            ...sveltePlugin.configs.recommended.rules,
            'no-inner-declarations': 'off',
            'no-self-assign': 'off',
        },
    },
]
