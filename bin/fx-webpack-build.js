#!/usr/bin/env node

var chalk = require('chalk');
var commander = require('commander');
var program = new commander.Command();
program
  .option('-d, --dev', 'build for development')
  .option('-t, --test', 'build for test')
  .option('-r, --preprod', 'build for prepare production')
  .option('-p, --production', 'build for production')
  .parse(process.argv);

if (!program.dev && !program.test && !program.preprod && !program.production) {
  program.outputHelp(getUsageTxt);
  process.exit(1);
}

function getUsageTxt(txt) {
  var usage = txt.split('\n');
  usage[0] = 'Usage: fx-webpack build [options]';
  return chalk.yellowBright(usage.join('\n')); //display the help text in red on the console
}
  
var curEnv = 'production';
if (program.dev) {
  curEnv = 'dev';
}
if (program.test) {
  curEnv = 'test';
}
if (program.preprod) {
  curEnv = 'preprod';
}
if (program.production) {
  curEnv = 'production';
}

process.env.NODE_ENV = curEnv
console.log('process.env.NODE_ENV：' + chalk.redBright(curEnv) + '\n');
require('../lib/build')();