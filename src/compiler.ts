import * as FS from 'fs';
import * as Path from 'path';
import { Config } from 'tailwindcss';

const { default: postcss } = require('postcss');
const { default: tailwindcss } = require('tailwindcss');

// @ts-ignore
import preflightCss from 'tailwindcss/lib/css/preflight.css';


FS.mkdirSync('/css');
// @ts-ignore
FS.writeFileSync('/css/preflight.css', preflightCss);

export const createCompiler = (config: Omit<Config, 'content'>) => {
  const virtualSourcePath = `/tmp/${Math.random().toString().slice(2)}.css`;

  const compiler = postcss([
    tailwindcss({
      ...config,
      content: [virtualSourcePath]
    }),
  ]);

  let lock = Promise.resolve(undefined as any);

  return (classNames: string[]): Promise<string> => {
    const resultPromise = lock.then(async () => {
      FS.mkdirSync(Path.dirname(virtualSourcePath), { recursive: true });
      FS.writeFileSync(virtualSourcePath, 'm-0 ' + classNames.join(' '));

      try {
        const { css } = await compiler.process('@tailwind components;@tailwind utilities;@tailwind variants;', {
          from: 'source.css',
        });

        return css;
      } finally {
        FS.unlinkSync(virtualSourcePath);
      }
    });

    lock = resultPromise;
    return resultPromise;
  };
};
