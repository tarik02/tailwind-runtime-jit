import { Volume } from 'memfs';
import Webpack from 'webpack';
import { createRuntimeWebpackConfig } from './createRuntimeWebpackConfig.js';

type Options = {
  esModule?: boolean;
};

export async function pitch(this: Webpack.LoaderContext<Options>) {
  this.cacheable && this.cacheable(true);

  const options = this.getOptions({
    type: 'object',
    properties: {
      esModule: {
        type: 'boolean',
      },
    },
  });

  const config = await createRuntimeWebpackConfig(this.rootContext);

  const compiler = Webpack.webpack({
    ...config,
    mode: this.mode,
    devtool: false
  });

  const fs = new Volume();
  compiler.outputPath = '/';
  compiler.outputFileSystem = fs;

  const stats = await new Promise<Webpack.Stats>((resolve, reject) => {
    compiler.run((err, stats) => {
      if (err) {
        reject(err);
      } else {
        resolve(stats!);
      }
    });
  });

  for (const dependency of stats.compilation.fileDependencies) {
    this.addDependency(dependency);
  }

  for (const dependency of stats.compilation.contextDependencies) {
    this.addContextDependency(dependency);
  }

  for (const dependency of stats.compilation.buildDependencies) {
    this.addBuildDependency(dependency);
  }

  for (const dependency of stats.compilation.missingDependencies) {
    this.addMissingDependency(dependency);
  }

  for (const error of stats.compilation.errors) {
    this.emitError(error);
  }

  for (const error of stats.compilation.warnings) {
    this.emitWarning(error);
  }

  if (options.esModule) {
    return `
import * as config from ${JSON.stringify('!' + this.resourcePath)};
${fs.readFileSync('/index.js')}
var runtime = TailwindRuntimeJit.createRuntime();
runtime.setConfig(config.default ? config.default : config);
import.meta.webpackHot.accept(${JSON.stringify('!' + this.resourcePath)}, function () {
  runtime.setConfig(config.default ? config.default : config);
});
`;
  }

  return `
${fs.readFileSync('/index.js')}
var config = require(${JSON.stringify('!' + this.resourcePath)});
var runtime = require('tailwind-runtime-jit').createRuntime();
runtime.setConfig(config);
module.hot.accept(${JSON.stringify('!' + this.resourcePath)}, function () {
  runtime.setConfig(require(${JSON.stringify('!' + this.resourcePath)}));
});
module.exports = {};
`;
};
