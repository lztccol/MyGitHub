#!/usr/bin/env node

require('../lib/check-versions')()
var colors = require('colors');

var commander = require('commander');
var program = new commander.Command()
program.version(require('../package').version)
  .description('Fx-webpack first version, support Vue')
  .usage('<command> [options]')
  .command('start', 'Start a development server that provides live reloading')
  .command('build', 'Build for development/test/prepare production/production')
  .parse(process.argv);

const cmd = process.argv.slice(2);
if (cmd.length && (cmd[0] !== 'build' && cmd[0] !== 'start')) {
  program.outputHelp();
}