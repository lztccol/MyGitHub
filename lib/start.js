'use strict'

module.exports = async function (args) {

    // 读取配置
    const config = require('./config').getDevConfig();
    const chalk = require('chalk')
    console.log(chalk.yellowBright('Starting development server...'))

    // although this is primarily a dev server, it is possible that we
    // are running it in a mode with a production env, e.g. in E2E tests.
    const isInContainer = checkInContainer()
    const isProduction = process.env.NODE_ENV === 'production'

    const url = require('url')
    const webpack = require('webpack')
    const WebpackDevServer = require('webpack-dev-server')
    const portfinder = require('portfinder')
    const utils = require('./util/getPath');
    const prepareURLs = require('./util/prepareURLs')
    const prepareProxy = require('./util/prepareProxy')
    const launchEditorMiddleware = require('launch-editor-middleware')
    const isAbsoluteUrl = require('./util/isAbsoluteUrl')

    // resolve server options
    const useHttps = args.https || config.devServer.https;
    const protocol = useHttps ? 'https' : 'http';
    const host = args.host || process.env.HOST || config.devServer.host;
    portfinder.basePort = args.port || process.env.PORT || config.devServer.port;
    const port = await portfinder.getPortPromise();
    const rawPublicUrl = args.public || config.devServer.publicPath
    const publicUrl = rawPublicUrl
        ? /^[a-zA-Z]+:\/\//.test(rawPublicUrl)
            ? rawPublicUrl
            : `${protocol}://${rawPublicUrl}`
        : null

    const urls = prepareURLs(
        protocol,
        host,
        port,
        isAbsoluteUrl(config.devServer.publicPath) ? '/' : config.devServer.publicPath
    )

    const localUrlForBrowser = publicUrl || urls.localUrlForBrowser

    const proxySettings = prepareProxy(
        config.devServer.proxy,
        utils.projectPath('public')
    )

    // inject dev & hot-reload middleware entries
    if (!isProduction) {
        const sockjsUrl = publicUrl
            // explicitly configured via devServer.public
            ? `?${publicUrl}/sockjs-node`
            : isInContainer
                // can't infer public netowrk url if inside a container...
                // use client-side inference (note this would break with non-root publicPath)
                ? ``
                // otherwise infer the url
                : `?` + url.format({
                    protocol,
                    port,
                    hostname: urls.lanUrlForConfig || 'localhost',
                    pathname: '/sockjs-node'
                })
        const devClients = [
            // dev server client
            require.resolve(`webpack-dev-server/client`) + sockjsUrl,
            // hmr client
            require.resolve(false
                ? 'webpack/hot/only-dev-server'
                : 'webpack/hot/dev-server')
            // TODO custom overlay client
        ]
        if (process.env.APPVEYOR) {
            devClients.push(`webpack/hot/poll?500`)
        }
        // inject dev/hot client
        addDevClientToEntry(config, devClients)
    }

    // create compiler
    const compiler = webpack(config)

    // create server
    const server = new WebpackDevServer(compiler, Object.assign({
        clientLogLevel: 'silent',
        historyApiFallback: {
            disableDotRule: true,
            rewrites: genHistoryApiFallbackRewrites(config.devServer.publicPath, config.devServer.pages)
        },
        contentBase: utils.projectPath('public'),
        watchContentBase: !isProduction,
        hot: !isProduction,
        quiet: true,
        compress: isProduction,
        publicPath: config.devServer.publicPath,
        overlay: isProduction // TODO disable this
            ? false
            : { warnings: false, errors: true }
    }, config.devServer, {
            https: useHttps,
            // proxy: proxySettings,
            before(app, server) {
                // launch editor support.
                // this works with vue-devtools & @vue/cli-overlay
                app.use('/__open-in-editor', launchEditorMiddleware(() => console.log(
                    `To specify an editor, specify the EDITOR env variable or ` +
                    `add "editor" field to your Vue project config.\n`
                )))
            },
            // avoid opening browser
            open: args.open || config.devServer.open
        }))

        ;['SIGINT', 'SIGTERM'].forEach(signal => {
            process.on(signal, () => {
                server.close(() => {
                    process.exit(0)
                })
            })
        })

    // on appveyor, killing the process with SIGTERM causes execa to
    // throw error
    if (process.env.NODE_ENV === 'dev') {
        process.stdin.on('data', data => {
            if (data.toString() === 'close') {
                console.log('got close signal!')
                server.close(() => {
                    process.exit(0)
                })
            }
        })
    }

    return new Promise((resolve, reject) => {
        let isFirstCompile = true
        compiler.hooks.done.tap('fx-webpack start', stats => {
            if (stats.hasErrors()) {
                console.log(chalk.redBright(stats.toString()));
                return
            }
            let copied = ''
            try {
                if (isFirstCompile && args.copy) {
                    try {
                        require('clipboardy').writeSync(localUrlForBrowser)
                        copied = chalk.dim('(copied to clipboard)')
                    } catch (_) {
                        /* catch exception if copy to clipboard isn't supported (e.g. WSL), see issue #3476 */
                    }
                }

                const networkUrl = publicUrl
                    ? publicUrl.replace(/([^/])$/, '$1/')
                    : urls.lanUrlForTerminal

                console.log()
                console.log(`  App running at:`)
                console.log(`  - Local:   ${chalk.cyan(urls.localUrlForTerminal)} ${copied}`)
                if (!isInContainer) {
                    console.log(`  - Network: ${chalk.cyan(networkUrl)}`)
                } else {
                    console.log()
                    console.log(chalk.yellow(`  It seems you are running Fx-webpack CLI inside a container.`))
                    if (!publicUrl && config.devServer.publicPath && config.devServer.publicPath !== '/') {
                        console.log()
                        console.log(chalk.yellow(`  Since you are using a non-root publicPath, the hot-reload socket`))
                        console.log(chalk.yellow(`  will not be able to infer the correct URL to connect. You should`))
                        console.log(chalk.yellow(`  explicitly specify the URL via ${chalk.blue(`devServer.public`)}.`))
                        console.log()
                    }
                    console.log(chalk.yellow(`  Access the dev server via ${chalk.cyan(
                        `${protocol}://localhost:<your container's external mapped port>${config.devServer.publicPath}`
                    )}`))
                }
                console.log()

                if (isFirstCompile) {
                    isFirstCompile = false

                    if (!isProduction) {
                        console.log(`  Note that the development build is not optimized.`)
                        console.log(`  To create a production build, run ${chalk.cyan('fx-webpack build')}.`)
                    } else {
                        console.log(`  App is served in production mode.`)
                        console.log(`  Note this is for preview or E2E testing only.`)
                    }
                    console.log()

                    if (args.open || config.devServer.open) {
                        const pageUri = (config.devServer.openPage && typeof config.devServer.openPage === 'string')
                            ? config.devServer.openPage
                            : ''
                        // openBrowser(localUrlForBrowser + pageUri)
                    }

                    // resolve returned Promise
                    // so other commands can do api.service.run('serve').then(...)
                    resolve({
                        server,
                        url: localUrlForBrowser
                    })
                } else if (process.env.NODE_ENV === 'dev') {
                    // signal for test to check HMR
                    console.log('App updated')
                }
            } catch (error) {
                reject(err);
            }
        });
        server.listen(port, host, err => {
            if (err) {
                reject(err)
            }
        })
    })

}

// https://stackoverflow.com/a/20012536
function checkInContainer() {
    const fs = require('fs')
    if (fs.existsSync(`/proc/1/cgroup`)) {
        const content = fs.readFileSync(`/proc/1/cgroup`, 'utf-8')
        return /:\/(lxc|docker|kubepods)\//.test(content)
    }
}

function addDevClientToEntry(config, devClient) {
    const { entry } = config
    if (typeof entry === 'object' && !Array.isArray(entry)) {
        Object.keys(entry).forEach((key) => {
            entry[key] = devClient.concat(entry[key])
        })
    } else if (typeof entry === 'function') {
        config.entry = entry(devClient)
    } else {
        config.entry = devClient.concat(entry)
    }
}

function genHistoryApiFallbackRewrites(baseUrl, pages = {}) {
    const path = require('path')
    const multiPageRewrites = Object
        .keys(pages)
        // sort by length in reversed order to avoid overrides
        // eg. 'page11' should appear in front of 'page1'
        .sort((a, b) => b.length - a.length)
        .map(name => ({
            from: new RegExp(`^/${name}`),
            to: path.posix.join(baseUrl, pages[name].filename || `${name}.html`)
        }))
    return [
        ...multiPageRewrites,
        { from: /./, to: path.posix.join(baseUrl, 'index.html') }
    ]
}