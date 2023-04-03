import Webpack from 'webpack';

type Options = {
  loader?: boolean;
  esModule?: boolean;
  cache?: string;
};

export default class TailwindRuntimeJitWebpack {
  static loader = 'tailwind-runtime-jit/loader';

  constructor(public readonly options: Readonly<Options> = {}) {
  }

  apply(compiler: Webpack.Compiler) {
    if (this.options.loader !== false) {
      compiler.options.module.rules.unshift({
        test: /(^|[\\\/])tailwind\.config\.[^.\\/]+$/i,
        loader: TailwindRuntimeJitWebpack.loader,
        options: {
          esModule: this.options.esModule,
          cache: this.options.cache,
        },
      });
    }

    (new Webpack.ExternalsPlugin(undefined, {
      'tailwind-runtime-jit': ['TailwindRuntimeJit'],
      'tailwind-runtime-jit/runtime': ['TailwindRuntimeJit', 'runtime'],
      'postcss': ['TailwindRuntimeJit', 'postcss'],
      'tailwindcss': ['TailwindRuntimeJit', 'tailwindcss'],
    })).apply(compiler);
  }
}
