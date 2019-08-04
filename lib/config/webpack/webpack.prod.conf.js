'use strict'
const utils = require('../../util/getPath')
const loaders = require('../../util/loaders')
const webpack = require('webpack')
const merge = require('webpack-merge')
const baseWebpackConfig = require('./webpack.base.conf')
const defaultConfig = require('../default')
const CopyWebpackPlugin = require('copy-webpack-plugin')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const OptimizeCSSPlugin = require('optimize-css-assets-webpack-plugin')
const UglifyJsPlugin = require('uglifyjs-webpack-plugin')

const productionSourceMap = process.env.NODE_ENV !== 'production';

const getWebpackConfig = function (userConfig) {
    const htmlTitle = userConfig.fxHtml.title || defaultConfig.fxHtml.title;
    const htmlFilename = userConfig.fxHtml.filename || defaultConfig.fxHtml.filename;
    const htmlTemplate = userConfig.fxHtml.template || defaultConfig.fxHtml.template;

    const copyFrom = utils.copyFromPath(userConfig);
    const copyTo = utils.copyToPath(userConfig);
    const prodConfig = {
        consolePath: {
            htmlTitle,
            htmlFilename: utils.outputPath(userConfig, htmlFilename),
            htmlTemplate: utils.projectPath(htmlTemplate),
            copyFrom,
            copyTo
        },
        mode: 'production', // 设置mode
        module: {
            rules: loaders.styleLoaders({
                sourceMap: productionSourceMap,
                extract: true
            })
        },
        performance: {
            hints: false
        },
        devtool: productionSourceMap ? '#source-map' : false,
        output: {
            filename: utils.outAssetsPath(userConfig, 'js/[name].[chunkhash].js'),
            chunkFilename: utils.outAssetsPath(userConfig, 'js/[id].[chunkhash].js')
        },
        optimization: {
            runtimeChunk: {
                name: 'manifest'
                // minChunks: Infinity
            },
            minimizer: [
                new UglifyJsPlugin({
                    uglifyOptions: {
                        warnings: false,
                        compress: {
                            drop_console: process.env.NODE_ENV === 'production' || process.env.NODE_ENV === 'prepare',
                            drop_debugger: true
                        }
                    },
                    cache: true,
                    sourceMap: productionSourceMap,
                    parallel: true
                }),
                new OptimizeCSSPlugin({
                    cssProcessorOptions: { safe: true }
                }),
            ],
            splitChunks: {
                chunks: 'all',
                minSize: 30000,
                minChunks: 1,
                maxAsyncRequests: 5,
                maxInitialRequests: 3,
                name: true,
                cacheGroups: {
                    vendor: {
                        name: 'vendor',
                        // filename: utils.assetsPath('js/vendor.[chunkhash].js'),
                        chunks: 'all', // 必须三选一： "initial" | "all"(默认就是all) | "async"
                        priority: -10,
                        reuseExistingChunk: false,
                        test: /node_modules\/(.*)\.js/,
                        // test: /[\\/]node_modules[\\/]/,
                        enforce: true,
                    },
                    styles: {
                        name: 'styles',
                        test: /\.(scss|css)$/,
                        chunks: 'all',
                        minChunks: 1,
                        reuseExistingChunk: true,
                        enforce: true
                    }
                }
            }
        },
        plugins: [
            // http://vuejs.github.io/vue-loader/en/workflow/production.html
            new webpack.DefinePlugin({
                'process.env': { NODE_ENV: '"' + process.env.NODE_ENV + '"', }
            }),
            // UglifyJs do not support ES6+, you can also use babel-minify for better treeshaking: https://github.com/babel/minify
            // new webpack.optimize.UglifyJsPlugin({
            //     compress: {
            //         warnings: false,
            //         // drop_debugger: true,  
            //         // drop_console: true  
            //     },
            //     sourceMap: true
            // }),
            // extract css into its own file
            new MiniCssExtractPlugin({
                filename: utils.outAssetsPath(userConfig, 'css/[name].[contenthash].css')
            }),
            // Compress extracted CSS. We are using this plugin so that possible
            // duplicated CSS from different components can be deduped.
            new OptimizeCSSPlugin({
                cssProcessorOptions: {
                    safe: true
                }
            }),
            // generate dist index.html with correct asset hash for caching.
            // you can customize output by editing /index.html
            // see https://github.com/ampedandwired/html-webpack-plugin
            new HtmlWebpackPlugin({
                title: htmlTitle,
                filename: htmlFilename,
                template: htmlTemplate,
                inject: true,
                minify: {
                    removeComments: true,
                    collapseWhitespace: true,
                    removeAttributeQuotes: true
                    // more options:
                    // https://github.com/kangax/html-minifier#options-quick-reference
                },
                // necessary to consistently work with multiple chunks via CommonsChunkPlugin
                chunksSortMode: 'dependency'
            }),
            new (require('compression-webpack-plugin'))({
                filename: '[path].gz[query]',
                algorithm: 'gzip',
                test: new RegExp(
                    '\\.(' +
                    ['js', 'css'].join('|') +
                    ')$'
                ),
                threshold: 10240,
                minRatio: 0.8
            }),
            // keep module.id stable when vender modules does not change
            // new webpack.HashedModuleIdsPlugin(),
            // copy custom static assets
            new CopyWebpackPlugin([{
                from: copyFrom,
                to: copyTo,
                ignore: ['.*']
            }])
        ]
    }

    if (process.env.npm_config_report) {
        const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin
        prodConfig.plugins.push(new BundleAnalyzerPlugin())
    }
    return merge(baseWebpackConfig(userConfig), prodConfig);
}

module.exports = getWebpackConfig