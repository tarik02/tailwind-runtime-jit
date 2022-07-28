import { Config } from 'tailwindcss';

import { createCompiler } from './compiler';
import { createClassesWatcher } from './watcher';


export const createRuntime = () => {
  const styleElement = document.createElement('style');
  document.head.appendChild(styleElement);

  document.addEventListener('DOMContentLoaded', () => {
    document.head.appendChild(styleElement);
  });

  const applyStyles = (styles: string): void => {
    styleElement.textContent = styles;
    document.head.appendChild(styleElement);
  };

  let compiler: ReturnType<typeof createCompiler> = createCompiler({});
  let classNames: string[] = [];

  const setConfig = (config: Config) => {
    compiler = createCompiler(config);
    compiler(classNames).then(applyStyles);
  };

  const close = createClassesWatcher(newClassNames => {
    classNames = newClassNames;
    compiler(classNames).then(applyStyles);
  });

  return {
    setConfig,
    close,
  };
};
