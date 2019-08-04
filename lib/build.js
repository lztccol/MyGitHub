'use strict'

const rm = require('rimraf')
const chalk = require('chalk')
const webpack = require('webpack')

module.exports = function () {
    // 读取配置
    const config = require('./config').getBuildConfig();
    console.log(chalk.yellowBright('Deleting Output directory： ' + config.output.path + '...\n'))
    // 删除已存在的输出目录
    rm(config.output.path, err => {
        if (err) throw err
        const envMap = {
            dev: '开发环境',
            test: '测试环境',
            prepare: '预生产环境',
            production: '生产环境',
        }
        console.log(chalk.yellowBright('正在构建： ' + envMap[process.env.NODE_ENV] + '...'))
        webpack(config, function (err, stats) {
            console.log(chalk.yellowBright('构建完毕\n'))
            if (err) throw err
            process.stdout.write(stats.toString({
                colors: true,
                modules: false,
                children: false,
                chunks: false,
                chunkModules: false
            }) + '\n\n')

            if (stats.hasErrors()) {
                console.log(chalk.red('  Build failed with errors.\n'))
                process.exit(1)
            }

            console.log(chalk.cyan('  Build complete.\n'))
            console.log(chalk.yellow(
                '  Tip: built files are meant to be served over an HTTP server.\n' +
                '  Opening index.html over file:// won\'t work.\n'
            ))
        })
    })
}