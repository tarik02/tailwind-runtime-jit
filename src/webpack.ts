import bodyParser from 'body-parser';
import * as Express from 'express';
import type { Config } from 'tailwindcss';
import loadConfig from 'tailwindcss/loadConfig.js';
import Webpack from 'webpack';

import { injectDevServerMiddlewareSetup } from './quirks/injectDevServerMiddlewareSetup.js';

type Options = {
    config?: string | Config
};

export default class TailwindRuntimeJitWebpack {
    static browserScript = 'tailwind-runtime-jit/browser';

    constructor(public readonly options: Readonly<Options> = {}) {
    }

    apply(compiler: Webpack.Compiler) {
        const config = typeof this.options.config === 'object' ?
            this.options.config :
            loadConfig(this.options.config ?? `${ compiler.context }/tailwind.config`);

        const compilerPromise = (async () => {
            const { default: postcss } = await import('postcss');
            const { default: tailwindcss } = await import('tailwindcss');

            return {
                postcss,
                tailwindcss
            };
        })();

        injectDevServerMiddlewareSetup(compiler.options, {
            before: (middlewares, devServer) => {
                middlewares.push({
                    name: 'tailwind-runtime-jit',
                    path: '/tailwind-runtime-jit',
                    middleware: [
                        bodyParser.json(),
                        (req: Express.Request, res: Express.Response, next: Express.NextFunction) => {
                            if (req.method.toUpperCase() !== 'POST') {
                                return next();
                            }

                            compilerPromise
                                .then(async ({ postcss, tailwindcss }) => {
                                    const classNames = req.body as string[];

                                    const postcssCompiler = postcss([
                                        tailwindcss({
                                            ...config,
                                            content: [
                                                { raw: 'm-0 ' + classNames.join(' ') }
                                            ]
                                        })
                                    ]);

                                    const { css } = await postcssCompiler.process(
                                        '@tailwind components;@tailwind utilities;@tailwind variants;',
                                        {
                                            from: 'source.css'
                                        }
                                    );

                                    res.write(css);
                                    res.send();
                                })
                                .catch(error => {
                                    compiler.getInfrastructureLogger('tailwind-runtime-jit').error(error);
                                    res.status(500).send(error.message);
                                });
                        }
                    ] as any
                });
                return middlewares;
            }
        });
    }
}
