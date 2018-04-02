const webpack = require('webpack')
const merge = require('webpack-merge')
const utils = require('./utils')
const config = require('../config')
const base = require('./webpack.base.config')
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer')
  .BundleAnalyzerPlugin
// const Chalk = require('chalk')
// const ProgressBarPlugin = require('progress-bar-webpack-plugin')
const { GenerateSW } = require('workbox-webpack-plugin')
const VueSSRClientPlugin = require('vue-server-renderer/client-plugin')

const isProd = process.env.NODE_ENV === 'production'

const webpackConfig = merge(base, {
  entry: {
    app: config.base.clientEntry
  },
  devtool:
    config.build.productionSourceMap && isProd ? config.build.devtool : false,
  node: {
    // prevent webpack from injecting useless setImmediate polyfill because Vue
    // source contains it (although only uses it if it's native).
    setImmediate: false,
    // prevent webpack from injecting mocks to Node native modules
    // that does not make sense for the client
    dgram: 'empty',
    fs: 'empty',
    net: 'empty',
    tls: 'empty',
    child_process: 'empty'
  },
  performance: {
    maxEntrypointSize: 300000,
    hints: isProd ? 'warning' : false
  },
  plugins: [
    // strip dev-only code in Vue source
    new webpack.DefinePlugin({
      'process.env.NODE_ENV': JSON.stringify(
        process.env.NODE_ENV || 'development'
      ),
      'process.env.VUE_ENV': '"client"',
      'process.browser': true,
      'process.server': false
    }),
    // new webpack.ProvidePlugin({
    //   $: 'jquery',
    //   jQuery: 'jquery'
    // }),
    // Build progress bar
    // new ProgressBarPlugin({
    //   complete: Chalk.green('█'),
    //   incomplete: Chalk.white('█'),
    //   format: '  :bar ' + Chalk.green.bold(':percent') + ' :msg',
    //   clear: false
    // }),
    new VueSSRClientPlugin()
  ]
})

if (isProd) {
  webpackConfig.plugins.push(
    // service worker
    new GenerateSW({
      swDest: 'sw.js',
      cacheId: 'koa-webpack-ssr',
      clientsClaim: true,
      skipWaiting: true,
      importWorkboxFrom: 'local',
      runtimeCaching: [
        {
          urlPattern: '/',
          handler: 'networkFirst'
        }
      ]
    }),
    // extract vendor chunks for better caching
    new webpack.optimize.CommonsChunkPlugin({
      name: 'vendor',
      minChunks: function(module) {
        // a module is extracted into the vendor chunk if...
        return (
          // it's inside node_modules
          /node_modules/.test(module.context) &&
          // and not a CSS file (due to extract-text-webpack-plugin limitation)
          !/\.css$/.test(module.request)
        )
      }
    }),
    // extract webpack runtime & manifest to avoid vendor chunk hash changing
    // on every build.
    new webpack.optimize.CommonsChunkPlugin({
      name: 'manifest',
      minChunks: Infinity
    }),
    // This instance extracts shared chunks from code splitted chunks and bundles them
    // in a separate chunk, similar to the vendor chunk
    // see: https://webpack.js.org/plugins/commons-chunk-plugin/#extra-async-commons-chunk
    new webpack.optimize.CommonsChunkPlugin({
      name: 'app',
      async: 'vendor-async',
      children: true,
      minChunks: 3
    })
  )

  if (config.build.bundleAnalyzerReport) {
    webpackConfig.plugins.push(new BundleAnalyzerPlugin())
  }
}

module.exports = webpackConfig
