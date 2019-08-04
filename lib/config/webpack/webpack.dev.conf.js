'use strict'
const utils = require('../../util/getPath')
const loaders = require('../../util/loaders')
const webpack = require('webpack')
const merge = require('webpack-merge')
const baseWebpackConfig = require('./webpack.base.conf')
const defaultConfig = require('../default')
const HtmlWebpackPlugin = require('html-webpack-plugin')

const getWebpackConfig = function (userConfig) {
    const htmlTitle = userConfig.fxHtml.title || defaultConfig.fxHtml.title;
    const htmlFilename = userConfig.fxHtml.filename || defaultConfig.fxHtml.filename;
    const htmlTemplate = userConfig.fxHtml.template || defaultConfig.fxHtml.template;

    const copyFrom = utils.copyFromPath(userConfig);

    const host = userConfig.fxDevServer.host || defaultConfig.fxDevServer.host;
    const port = userConfig.fxDevServer.port || defaultConfig.fxDevServer.port;
    const hot = userConfig.fxDevServer.hot || defaultConfig.fxDevServer.hot;

    let { https, compress, open } = userConfig.fxDevServer;
    if (https === undefined){
        https = defaultConfig.fxDevServer.https
    }
    if (compress === undefined){
        compress = defaultConfig.fxDevServer.compress
    }
    if (open === undefined){
        open = defaultConfig.fxDevServer.open
    }

    const clientLogLevel = userConfig.fxDevServer.clientLogLevel || defaultConfig.fxDevServer.clientLogLevel;
    const proxy = userConfig.fxDevServer.proxy || defaultConfig.fxDevServer.proxy;
    const devConfig = {
        consolePath: {
            htmlTitle,
            htmlFilename: utils.outputPath(userConfig, htmlFilename),
            htmlTemplate: utils.projectPath(htmlTemplate),
            copyFrom
        },
        mode: 'development',
        devServer: {
            port,
            host,
            https,
            hot,
            compress,
            open,
            clientLogLevel, //配置在客户端的日志等级，这会影响到你在浏览器开发者工具控制台里看到的日志内容
            quiet: true, // necessary for FriendlyErrorsPlugin
            overlay: false, // { warnings: false, errors: true }
            proxy,
            publicPath: '',
            watchOptions: {
                poll: false,
            }
        },
        module: {
            rules: loaders.styleLoaders({ sourceMap: false })
        },
        // cheap-module-eval-source-map is faster for development
        devtool: '#cheap-module-eval-source-map',
        plugins: [
            new webpack.DefinePlugin({
                'process.env': { NODE_ENV: '"' + process.env.NODE_ENV + '"', }
            }),
            new webpack.NamedModulesPlugin(), // HMR shows correct file names in console on update.
            // https://github.com/glenjamin/webpack-hot-middleware#installation--usage
            new webpack.HotModuleReplacementPlugin(),
            new webpack.NoEmitOnErrorsPlugin(),
            // https://github.com/ampedandwired/html-webpack-plugin
            new HtmlWebpackPlugin({
                title: htmlTitle,
                filename: htmlFilename,
                template: htmlTemplate,
                inject: true,
            }),
        ]
    }
    return merge(baseWebpackConfig(userConfig), devConfig);
}

module.exports = getWebpackConfig;