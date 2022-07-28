import tailwindcss from 'tailwindcss';
import postcss from 'postcss';
import { createCompiler } from './compiler';
import { createRuntime } from './runtime';
import { createClassesWatcher } from './watcher';

export { tailwindcss, postcss, createCompiler, createRuntime, createClassesWatcher };
