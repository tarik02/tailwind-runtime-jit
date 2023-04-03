import NodePolyfillPlugin from 'node-polyfill-webpack-plugin';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
import { createLoader } from 'simple-functional-loader';
import Webpack from 'webpack';

const externals: Record<string, string> = {
  chokidar: 'self.chokidar',
  purgecss: 'self.purgecss',
  tmp: 'self.tmp',
};

export const createRuntimeWebpackConfig = async (context: string): Promise<Webpack.Configuration> => {
  const require = createRequire(context + '/');

  const config: Webpack.Configuration = {
    context,
    entry: {
      index: fileURLToPath(new URL('browser.js', import.meta.url)),
    },
    output: {
      filename: '[name].js',
      globalObject: 'self',
      library: {
        type: 'global',
        name: 'TailwindRuntimeJit',
      },
    },
    resolve: {
      alias: {
        fs: fileURLToPath(new URL('modules/fs.js', import.meta.url)),
        '@tailwindcss/oxide': fileURLToPath(new URL('modules/tailwindcss-oxide.js', import.meta.url)),
      },
      fallback: {
        module: false,
      },
      modules: require.main!.paths
    },
    module: {
      rules: [
        {
          test: /\.css$/i,
          type: 'asset/source',
        },
        {
          test: require.resolve('glob-parent'),
          use: [
            createLoader(function (_source: string) {
              return `module.exports = () => ''`;
            }),
          ],
        },
        {
          test: require.resolve('is-glob'),
          use: [
            createLoader(function (_source: string) {
              return `module.exports = () => false`;
            }),
          ],
        },
        {
          test: require.resolve('fast-glob'),
          use: [
            createLoader(function (source: string) {
              return `module.exports = {
                sync: (patterns) => [].concat(patterns),
                generateTasks: files => [{ positive: files, negative: [] }],
                escapePath: path => path,
              }`
            }),
          ],
        },
        {
          test: require.resolve('tailwindcss/lib/lib/setupTrackingContext.js'),
          use: createLoader(function (source: string) {
            return source.replace(`require(userConfigPath)`, `null`)
          }),
        },
        {
          test: require.resolve('tailwindcss/lib/lib/load-config.js'),
          use: createLoader(function (source: string) {
            return `module.exports = require('tailwind-runtime-jit/internal/load-config');`;
          }),
        },
        {
          test: require.resolve('tailwindcss/lib/plugin.js'),
          use: createLoader(function (source: string) {
            return source.replace(/\w+\.env\.OXIDE/, 'false');
          }),
        },
        {
          test: require.resolve('tailwindcss/lib/util/validateConfig.js'),
          use: createLoader(function (source: string) {
            console.log(
              source.replace(
                /require\(['"]@tailwindcss\/line-clamp['"]\)/,
                `{}`,
              )
            )
            return source
              .replace(
                /config\.content\.files\.length\s*===\s*0/,
                'false'
              )
              .replace(
                /require\(['"]@tailwindcss\/line-clamp['"]\)/,
                `{}`,
              );
          }),
        },
      ]
    },
    plugins: [
      new NodePolyfillPlugin(),
      new Webpack.DefinePlugin({
        'process.env.TAILWIND_MODE': JSON.stringify('build'),
        'process.env.TAILWIND_DISABLE_TOUCH': true,
        'process.env.OXIDE': JSON.stringify(JSON.stringify(false)),
      })
    ],
    externals: [
      ({ context, request }, callback) => {
        if (/node_modules/.test(context!) && externals[request!]) {
          return callback(undefined, externals[request!]);
        }
        callback();
      }
    ],
  };

  return config;
};
