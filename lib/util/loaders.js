const getPath = require('./getPath');
const isBuildMode = require('../isBuildMode')
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
// Generate loaders for standalone style files
exports.styleLoaders = function(options) {
    const output = []
    const loaders = exports.cssLoaders(options)
    for (const extension in loaders) {
        const loader = loaders[extension]
        output.push({
            test: new RegExp('\\.' + extension + '$'),
            use: loader
        })
    }
    return output
}

exports.cssLoaders = function(options) {
    options = options || {}

    const cssLoader = {
        loader: 'css-loader',
        options: {
            minimize: isBuildMode,
            sourceMap: options.sourceMap
        }
    }

    // generate loader string to be used with extract text plugin
    function generateLoaders(loader, loaderOptions) {
        const loaders = [
            cssLoader,
            'sass-loader',
            {
                loader: 'sass-resources-loader',
                options: {
                    resources: [
                        getPath.projectPath('./src/assets/scss/global.scss')
                    ]
                }
            }
        ]
        if (loader) {
            loaders.push({
                loader: loader + '-loader',
                options: Object.assign({}, loaderOptions, {
                    sourceMap: options.sourceMap
                })
            })
        }

        // Extract CSS when that option is specified
        // (which is the case during production build)
        if (options.extract) {
            loaders.unshift(MiniCssExtractPlugin.loader)
            return loaders
        } else {
            return ['vue-style-loader'].concat(loaders)
        }
    }

    function generateSassResourceLoader() {
        const loaders = [
            cssLoader,
            'sass-loader',
            {
                loader: 'sass-resources-loader',
                options: {
                    resources: [
                        getPath.projectPath('./src/assets/scss/global.scss')
                    ]
                }
            }
        ]
        // Extract CSS when that option is specified
        // (which is the case during production build)
        if (options.extract) {
            loaders.unshift(MiniCssExtractPlugin.loader)
            return loaders
        } else {
            return ['vue-style-loader'].concat(loaders)
        }
    }

    // https://vue-loader.vuejs.org/en/configurations/extract-css.html
    return {
        css: generateLoaders(),
        postcss: generateLoaders(),
        less: generateLoaders('less'),
        // sass: generateLoaders('sass', { indentedSyntax: true }),
        // scss: generateLoaders('sass'),
        sass: generateSassResourceLoader(),
        scss: generateSassResourceLoader(),
        stylus: generateLoaders('stylus'),
        styl: generateLoaders('stylus')
    }
}