'use strict'
const path = require('path')
const defaultConfig = require('../config/default')

/**
 * 项目目录，即package.json所在目录
 * @param  {...any} _path 
 */
function projectPath(..._path) {
    return path.join.call(this, process.cwd(), ..._path);
}

exports.projectPath = projectPath;

/**
 * 输出目录
 * @param {*} userConfig 用户配置，在build.js读取，不要另外读取
 * @param  {...any} _path 
 */
function outputPath (userConfig, ..._path) {
    return projectPath((userConfig.fxOutputPath || defaultConfig.fxOutputPath), ..._path);
}

exports.outputPath = outputPath;

/**
 * 要拷贝的源文件目录
 * @param {*} userConfig 
 * @param  {...any} _path 
 */
function copyFromPath (userConfig, ..._path) {
    return projectPath((userConfig.fxAppPublic || defaultConfig.fxAppPublic), ..._path);
}

exports.copyFromPath = copyFromPath;

/**
 * 拷贝的文件输出目录
 * @param {*} userConfig 
 */
function copyToPath (userConfig) {
    return outputPath(userConfig, userConfig.fxAssetsPath || defaultConfig.fxAssetsPath);
}

exports.copyToPath = copyToPath;

function outAssetsPath (userConfig, _path) {
    return path.posix.join(userConfig.fxAssetsPath || defaultConfig.fxAssetsPath, _path)
}

exports.outAssetsPath = outAssetsPath;

exports.outAssetsPathAbsolute = function (userConfig, _path = '') {
    return outputPath(userConfig, outAssetsPath(userConfig, _path));
}

exports.aliasPath = function (userConfig) {
    const obj = userConfig.fxAlias || defaultConfig.fxAlias || {};
    const aliasPath = {};
    Object.keys(obj).forEach((key) =>{
        aliasPath[key] = projectPath(obj[key]);
    })
    return aliasPath;
}