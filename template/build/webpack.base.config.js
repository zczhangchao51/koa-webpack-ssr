const path = require('path')
const utils = require('./utils')
const config = require('../config')
const vueConfig = require('./vue-loader.config')
const webpack = require('webpack')
const ExtractTextPlugin = require('extract-text-webpack-plugin')
const FriendlyErrorsPlugin = require('friendly-errors-webpack-plugin')
const OptimizeCSSPlugin = require('optimize-css-assets-webpack-plugin')

const isProd = process.env.NODE_ENV === 'production'

module.exports = {
  context: path.resolve(__dirname, '../'),
  devtool: isProd ? false : '#cheap-module-source-map',
  output: {
    path: config.build.assetsRoot,
    publicPath: isProd
      ? config.build.assetsPublicPath
      : config.dev.assetsPublicPath,
    filename: isProd
      ? utils.assetsPath('js/[name].[chunkhash].js')
      : '[name].js',
    chunkFilename: isProd ? utils.assetsPath('js/[id].[chunkhash].js') : void 0
  },
  resolve: {
    extensions: ['.js', '.vue', '.json'],
    alias: config.base.alias
  },
  module: {
    rules: [
      {
        test: /\.vue$/,
        loader: 'vue-loader',
        options: vueConfig
      },
      {
        test: /\.js$/,
        loader: 'babel-loader',
        exclude: /node_modules/
      },
      {
        test: /\.(png|jpe?g|gif|svg)(\?.*)?$/,
        loader: 'url-loader',
        options: {
          limit: 1024,
          name: utils.assetsPath('img/[name].[hash:7].[ext]')
        }
      },
      {
        test: /\.(mp4|webm|ogg|mp3|wav|flac|aac)(\?.*)?$/,
        loader: 'url-loader',
        options: {
          limit: 1024,
          name: utils.assetsPath('media/[name].[hash:7].[ext]')
        }
      },
      {
        test: /\.(woff2?|eot|ttf|otf)(\?.*)?$/,
        loader: 'url-loader',
        options: {
          limit: 1024,
          name: utils.assetsPath('fonts/[name].[hash:7].[ext]')
        }
      }
    ].concat(
      utils.styleLoaders({
        sourceMap: isProd
          ? config.build.productionSourceMap
          : config.dev.cssSourceMap,
        extract: false,
        usePostCSS: true
      })
    )
  },
  plugins: isProd
    ? [
      new webpack.optimize.UglifyJsPlugin({
        uglifyOptions: {
          compress: {
            warnings: false
          }
        },
        sourceMap: config.build.productionSourceMap,
        parallel: true
      }),
      // keep module.id stable when vendor modules does not change
      new webpack.HashedModuleIdsPlugin(),
      // enable scope hoisting
      new webpack.optimize.ModuleConcatenationPlugin(),
      // extract css into its own file
      new ExtractTextPlugin({
        filename: utils.assetsPath('css/[name].[contenthash].css'),
        // Setting the following option to `false` will not extract CSS from codesplit chunks.
        // Their CSS will instead be inserted dynamically with style-loader when the codesplit chunk has been loaded by webpack.
        // It's currently set to `true` because we are seeing that sourcemaps are included in the codesplit bundle as well when it's `false`,
        // increasing file size: https://github.com/vuejs-templates/webpack/issues/1110
        allChunks: true
      }),
      // Compress extracted CSS. We are using this plugin so that possible
      // duplicated CSS from different components can be deduped.
      new OptimizeCSSPlugin({
        cssProcessorOptions: config.build.productionSourceMap
          ? { safe: true, map: { inline: false } }
          : { safe: true }
      })
    ]
    : [new FriendlyErrorsPlugin()]
}
