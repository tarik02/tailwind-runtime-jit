import tailwindcss from 'tailwindcss';
import postcss from 'postcss';
import { createCompiler } from './compiler.js';
import { createRuntime } from './runtime.js';
import { createClassesWatcher } from './watcher.js';

export { tailwindcss, postcss, createCompiler, createRuntime, createClassesWatcher };
