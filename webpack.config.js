const webpack = require('webpack');
const path = require('path');
const webpackMerge = require('webpack-merge');
const modeConfig = env => require(`./webpack-${env}`);

module.exports = ({mode} = {mode:"development"}) => {
    return webpackMerge(
        {
            entry: './src/index.js',
            output: {
                path: path.resolve(__dirname, 'build'),
                filename: '[name].[hash].js',
                chunkFilename: '[name].lazy-chunk.js'
              },
            mode,
            resolve: {
                extensions: ['*', '.js', '.jsx']
            },
            optimization: {
                splitChunks: {
                    cacheGroups: {
                        commons: { test: /[\\/]node_modules[\\/]/, name: "vendors", chunks: "all" }
                    }
                }
            }
        },
        modeConfig(mode)
    )
  };
