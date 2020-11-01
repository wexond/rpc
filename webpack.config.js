/* eslint-disable */
const { getConfig, dev } = require('./webpack.config.base');
const { spawn, execSync } = require('child_process');
const { writeFileSync, readdirSync, readFileSync } = require('fs');
const { join, resolve } = require('path');
const CopyPlugin = require('copy-webpack-plugin');
// const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer');
// const ForkTsCheckerWebpackPlugin = require('fork-ts-checker-webpack-plugin');
// const stripJsonComments = require(`strip-json-comments`);
// const idlToJson = require('./tools/idl_to_json');
// const jsonAPICompiler = require('./tools/json_schema_compiler');

let terser = require('terser');
/* eslint-enable */

let electronProcess;

const mainConfig = getConfig({
  target: 'electron-main',

  devtool: dev ? 'inline-source-map' : false,

  watch: dev,

  entry: {
    main: './src/main',
  },

  plugins: [
    // new BundleAnalyzerPlugin(),
    // new ForkTsCheckerWebpackPlugin(),
  ],
});

if (process.env.START === '1') {
  mainConfig.plugins.push({
    apply: (compiler) => {
      compiler.hooks.afterEmit.tap('AfterEmitPlugin', () => {
        if (electronProcess) {
          try {
            if (process.platform === 'win32') {
              execSync(`taskkill /pid ${electronProcess.pid} /f /t`);
            } else {
              electronProcess.kill();
            }

            electronProcess = null;
          } catch (e) {}
        }

        electronProcess = spawn('npm', ['start'], {
          shell: true,
          env: process.env,
          stdio: 'inherit',
        });
      });
    },
  });
}

const preloadConfig = getConfig({
  target: 'electron-renderer',

  devtool: false,

  watch: dev,

  entry: {
    appPreload: resolve('./src/renderer/app/preload'),
  },

  plugins: [],
});

module.exports = [mainConfig, preloadConfig];
