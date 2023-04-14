import { createRuntime } from './runtime.js';

const apiUrl = new URL('/tailwind-runtime-jit', (document.currentScript! as HTMLScriptElement).src);

createRuntime({
    apiUrl: apiUrl.toString()
});
