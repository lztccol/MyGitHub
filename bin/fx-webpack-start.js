#!/usr/bin/env node

var defaultConfig = require('../lib/config/default')
var commander = require('commander');
var program = new commander.Command();
var start = require('../lib/start');
program
  .usage('fx-webpack start [options] [entry]')
  .description('start development server')
  .option('-o,--open', 'open browser on server start')
  .option('-c,--copy', 'copy url to clipboard on server start')
  .option('-h,--host <host>', `specify host (default: ${defaultConfig.fxDevServer.host})`)
  .option('-p,--port <port>', `specify port (default: ${defaultConfig.fxDevServer.port})`)
  .option('-s,--https', `use https (default: ${defaultConfig.fxDevServer.https})`)
  .action(start)
  .parse(process.argv);