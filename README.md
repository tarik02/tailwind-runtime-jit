# tailwind-runtime-jit

![Check](https://github.com/Tarik02/tailwind-runtime-jit/actions/workflows/check.yml/badge.svg)
![Release](https://github.com/Tarik02/tailwind-runtime-jit/actions/workflows/release.yml/badge.svg)
[![npm version](https://badge.fury.io/js/tailwind-runtime-jit.svg)](https://badge.fury.io/js/tailwind-runtime-jit)

## Installation

```bash
yarn add --dev postcss tailwindcss tailwind-runtime-jit
# or
npm install --save-dev postcss tailwindcss tailwind-runtime-jit
```

## Usage

Add this to your webpack config:
```js
import TailwindJitPlugin from 'tailwind-runtime-jit/webpack';

  // ...

  entry: {
    app: [
      ...process.env.NODE_ENV === 'development' ? [ './tailwind.config.js' ] : [], // +
      'src/index.js',
    ],
  },

  // ...

  plugins: [
    // ...

    ...process.env.NODE_ENV === 'development' ? [ new TailwindJitPlugin ] : [], // +
  ],

  // ...
```
