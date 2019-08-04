'use strict'

const fs = require('fs');
const chalk = require('chalk');
const utils = require('./util/getPath');

module.exports = function () {
  let fileConfig;
  const configPath = utils.projectPath('fx.webpack.config.js');
  if (fs.existsSync(configPath)) {
    try {
      fileConfig = require(configPath);

      if (typeof fileConfig === 'function') {
        fileConfig = fileConfig();
      }

      if (!fileConfig || typeof fileConfig !== 'object') {
        console.log(
          `Error loading ${chalk.redBright('fx.webpack.config.js')}: should export an object or a function that returns object.`
        );
        fileConfig = null;
      }
    } catch (e) {
      console.log(`Error loading ${chalk.redBright('fx.webpack.config.js')}:`);
      throw e;
    }
  } else {
    console.log(`Error finding file ${chalk.redBright('fx.webpack.config.js')} at ${process.cwd()}`);
  }
  if (!fileConfig) {
    process.exit(1);
  }
  return fileConfig;
}
