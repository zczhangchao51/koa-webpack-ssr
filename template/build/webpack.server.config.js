const webpack = require('webpack')
const merge = require('webpack-merge')
const utils = require('./utils')
const config = require('../config')
const base = require('./webpack.base.config')
const nodeExternals = require('webpack-node-externals')
const VueSSRServerPlugin = require('vue-server-renderer/server-plugin')

const isProd = process.env.NODE_ENV === 'production'

module.exports = merge(base, {
  target: 'node',
  node: false,
  devtool: '#source-map',
  entry: config.base.serverEntry,
  performance: {
    hints: false,
    maxAssetSize: Infinity
  },
  output: {
    filename: 'server-bundle.js',
    libraryTarget: 'commonjs2'
  },
  // https://webpack.js.org/configuration/externals/#externals
  // https://github.com/liady/webpack-node-externals
  externals: nodeExternals({
    // do not externalize CSS files in case we need to import it from a dep
    whitelist: /\.css$/
  }),
  plugins: [
    new webpack.DefinePlugin({
      'process.env.NODE_ENV': JSON.stringify(
        process.env.NODE_ENV || 'development'
      ),
      'process.env.VUE_ENV': '"server"',
      'process.browser': false,
      'process.server': true
    }),
    new VueSSRServerPlugin()
  ]
})
