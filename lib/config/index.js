'use strict'

const fs = require('fs');
const chalk = require('chalk');
const devConfig = require('./webpack/webpack.dev.conf');
const buildConfig = require('./webpack/webpack.prod.conf');

function check(config) {
    // wepack构建前，先检查入口文件是否存在
    if (!fs.existsSync(config.consolePath.entryApp)) {
        console.log(chalk.redBright(`Error finding entry file at ${config.consolePath.entryApp}`));
        process.exit(1);
    }
    // wepack构建前，先检查html模板文件是否存在
    if (!fs.existsSync(config.consolePath.htmlTemplate)) {
        console.log(chalk.redBright(`Error finding template file at ${config.consolePath.htmlTemplate}`));
        process.exit(1);
    }
    // wepack构建前，先检查拷贝源文件目录是否存在
    if (!fs.existsSync(config.consolePath.copyFrom)) {
        console.log(chalk.redBright(`Error finding directory at ${config.consolePath.copyFrom}`));
        process.exit(1);
    }
}
/**
 * 正式打包配置
 */
exports.getBuildConfig = function () {
    console.log(chalk.yellowBright('Loading user profile fx.webpack.config.js ...\n'));
    const userConfig = require('../load-user-config')(); // 读取用户配置文件
    console.log(chalk.yellowBright('Loading default profile webpack.prod.conf ...\n'));
    const config = buildConfig(userConfig); // 生成最终配置文件

    check(config);

    // 输出配置信息
    const configMsg = `    Application entry：${config.consolePath.entryApp}
    Output directory：${config.consolePath.outputPath}
    Output asset file directory：${config.consolePath.outAssetsPath}
    Copy source file directory：${config.consolePath.copyFrom}
    Copy target file directory：${config.consolePath.copyTo}
    Output Html title：${config.consolePath.htmlTitle}
    Output Html file path：${config.consolePath.htmlFilename}
    Input Html Template Path：${config.consolePath.htmlTemplate}\n`;
    console.log(configMsg);
    delete config.consolePath; // 删除非webpakck配置项
    console.log(chalk.yellowBright('Configuration file load complete.\n'));

    return config;
}

exports.getDevConfig = function () {
    console.log(chalk.yellowBright('Loading user profile fx.webpack.config.js ...\n'));
    const userConfig = require('../load-user-config')(); // 读取用户配置文件
    console.log(chalk.yellowBright('Loading default profile webpack.dev.conf ...\n'));
    const config = devConfig(userConfig); // 生成最终配置文件

    check(config);

    // 输出配置信息
    const configMsg = `    Application entry：${config.consolePath.entryApp}
    Copy source file directory：${config.consolePath.copyFrom}
    Output Html title：${config.consolePath.htmlTitle}
    Input Html Template Path：${config.consolePath.htmlTemplate}\n`;
    console.log(configMsg);
    delete config.consolePath; // 删除非webpakck配置项
    console.log(chalk.yellowBright('Configuration file load complete.\n'));

    return config;
}
