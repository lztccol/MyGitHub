'use strict'
const loaders = require('../../util/loaders')
const isBuildMode = require('../../isBuildMode')

const isProduction = isBuildMode
const productionSourceMap = process.env.NODE_ENV !== 'production';

module.exports = (userConifg) => ({
  loaders: loaders.cssLoaders({
    sourceMap: isProduction
      ? productionSourceMap
      : false,
    extract: isProduction
  }),
  transformToRequire: {
    video: 'src',
    source: 'src',
    img: 'src',
    image: 'xlink:href'
  }
});
