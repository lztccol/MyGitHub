'use strict'
const utils = require('../../util/getPath')
const vueLoaderConfig = require('../vue/vue-loader.conf')
const defaultConfig = require('../default')
const VueLoaderPlugin = require('vue-loader/lib/plugin');
const WebpackBar = require('webpackbar');

const getWebpackConfig = function (userConfig) {
    const entryApp = userConfig.fxEntry || defaultConfig.fxEntry;
    const outputPath = utils.outputPath(userConfig);
    const resolveAlias = utils.aliasPath(userConfig);
    const config = {
        consolePath: {
            entryApp: utils.projectPath(entryApp),
            outputPath,
            resolveAlias: utils.aliasPath(userConfig),
            outAssetsPath: utils.outAssetsPathAbsolute(userConfig)
        },
        cache: true,
        entry: {
            app: entryApp
        },
        output: {
            path: outputPath,
            filename: '[name].js',
            publicPath: '',
        },
        resolve: {
            extensions: ['.js', '.json'],
            alias: resolveAlias,
        },
        module: {
            rules: [
                {
                    test: /\.js$/,
                    loader: ['babel-loader?cacheDirectory=true'],
                    include: [
                        utils.projectPath('src'),
                        utils.projectPath('test'),
                        utils.projectPath('node_modules/mint-ui/src/utils/dom.js')
                    ]
                },
                {
                    test: /\.(png|jpe?g|gif|svg)(\?.*)?$/,
                    loader: 'url-loader',
                    options: {
                        limit: 10000,
                        name: utils.outAssetsPath(userConfig, 'img/[name].[hash:7].[ext]')
                    }
                },
                {
                    test: /\.(mp4|webm|ogg|mp3|wav|flac|aac)(\?.*)?$/,
                    loader: 'url-loader',
                    options: {
                        limit: 10000,
                        name: utils.outAssetsPath(userConfig, 'media/[name].[hash:7].[ext]')
                    }
                },
                {
                    test: /\.(woff2?|eot|ttf|otf)(\?.*)?$/,
                    loader: 'url-loader',
                    options: {
                        limit: 10000,
                        name: utils.outAssetsPath(userConfig, 'fonts/[name].[hash:7].[ext]')
                    }
                }
            ]
        },
        externals: {

        },
        plugins: [
            new WebpackBar()
        ],
        node: {
            //node选项可以防止node包，还有 setImmediate 的 profill注入到代码中,具体查看node.js文档node对象栏
            // prevent webpack from injecting useless setImmediate polyfill because Vue
            // source contains it (although only uses it if it's native).
            //false: 什么都不提供。预期获取此对象的代码，可能会因为获取不到此对象，
            //触发 ReferenceError 而崩溃。尝试使用 require('modulename') 导入模块的代码，
            //可能会触发 Cannot find module "modulename" 错误。
            setImmediate: false,
            // prevent webpack from injecting mocks to Node native modules
            // that does not make sense for the client
            //提供一个空对象 
            dgram: 'empty',
            fs: 'empty',
            net: 'empty',
            tls: 'empty',
            child_process: 'empty'
        }
    }

    let { fxVue, fxReact, fxLess, fxSass} = userConfig;
    if (fxVue === undefined) {
        fxVue = defaultConfig.fxVue;
    }
    if (fxReact === undefined) {
        fxReact = defaultConfig.fxReact;
    }
    if (fxLess === undefined) {
        fxLess = defaultConfig.fxLess;
    }
    if (fxSass === undefined) {
        fxSass = defaultConfig.fxSass;
    }

    if (fxVue) {
        config.resolve.extensions.push('.vue');
        config.module.rules.push(
            {
                test: /\.vue$/,
                loader: 'vue-loader',
                options: vueLoaderConfig(userConfig)
            },
        );
        config.plugins.push(new VueLoaderPlugin());
        config.resolve.alias['vue$'] = 'vue/dist/vue.esm.js';
    }

    if (fxReact) {

    }

    if (fxLess) {

    }

    if (fxSass) {

    }
    return config;
}

module.exports = getWebpackConfig;