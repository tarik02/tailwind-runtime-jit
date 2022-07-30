import Webpack from 'webpack';

type Options = {
  loader?: boolean;
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
