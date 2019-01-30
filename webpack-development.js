const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MinifyPlugin = require("babel-minify-webpack-plugin");
const PreloadWebpackPlugin = require('preload-webpack-plugin');
const OptimizeCssAssetsPlugin = require('optimize-css-assets-webpack-plugin');
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;
const CompressionPlugin = require('compression-webpack-plugin');
const ServiceWorkerWebpackPlugin = require('serviceworker-webpack-plugin');
const path = require('path')
module.exports = {
      devServer: {
          historyApiFallback: true,
          port:9000
        },
    module: {
        rules: [
            {
                test: /\.(js|jsx)$/,
                exclude: /(node_modules|bower_components)/,
                use: {
                  loader: 'babel-loader',
                  options: {
                    presets: ['@babel/preset-env'],
                    plugins:["@babel/plugin-proposal-object-rest-spread",
                    [
                      "@babel/plugin-transform-runtime",
                      {
                        "helpers": true
                      }
                    ],
                    "babel-plugin-styled-components",
                    [ "@babel/plugin-proposal-decorators", {"legacy":true}],
                    "@babel/plugin-proposal-class-properties",
                    ["@babel/plugin-transform-react-jsx", {
                      "pragma":"Hound.createElement"
                    }],
                    "@babel/plugin-syntax-jsx",
                    "@babel/plugin-transform-classes"
                    ],
                  }
                }
            },
            {
                test: /\.less$/,
                use: [ MiniCssExtractPlugin.loader, 'css-loader',"less-loader","postcss-loader"]
            },
            {
                test: /\.(png|jpg|gif|svg)$/i,
                use: [
                  {
                    loader: 'url-loader',
                    options: {
                      limit: 8192
                    }
                  }
                ]
            },
            {
                test: /\.worker\.js$/,
                use: { loader: 'worker-loader' }
            }
        ]
      },
      plugins: [
        new MiniCssExtractPlugin({
          filename: "[name].[hash].css",
          chunkFilename: "[id].css"
        }),
        new HtmlWebpackPlugin({
            title:"classroom",
            hash:false,
            filename:'index.html',
            template:'public/index.html'
        }),
        new PreloadWebpackPlugin({
             rel: 'preload',
             as(entry) {
               if (/\.css$/.test(entry)) return 'style';
               if (/\.woff$/.test(entry)) return 'font';
               if (/\.png$/.test(entry)) return 'image';
               return 'script';
             }
           }),
        new MinifyPlugin({}, {comments:false}),
        new OptimizeCssAssetsPlugin({
          cssProcessor: require('cssnano'),
          cssProcessorPluginOptions: {
            preset: ['default', { discardComments: { removeAll: true } }],
          },
          canPrint: true
        }),
        new BundleAnalyzerPlugin(),
        new ServiceWorkerWebpackPlugin({
         entry: path.join(__dirname, 'src/sw.js'),
       })
      ]
}
