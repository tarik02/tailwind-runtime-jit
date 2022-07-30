import { Volume } from 'memfs';
import Webpack from 'webpack';
import { createRuntimeWebpackConfig } from './createRuntimeWebpackConfig.js';

export async function pitch(this: Webpack.LoaderContext<{}>) {
  this.cacheable && this.cacheable(true);

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
