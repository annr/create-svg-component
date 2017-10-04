#! /usr/bin/env node

const yargs = require('yargs');

module.exports = {
  run: function processArgs() {
    const args = yargs
      .option('dir', {
        default: '',
        describe: 'Source folder for SVGs'
      })
      .option('output', {
        alias: 'o',
        default: '',
        describe: 'Destination folder for processed SVGs'
      })
      .option('help', { default: false })
      .argv;

    if (args.dir && !args.output) {
      args.output = args.dir;
    }

    if (!args.dir) {
      if (!args._[0]) {
        console.log('Please specify a file or a path ("svgcomp --help" for instructions)');
        process.exit(1);
      }
      let inputName = args._[0];
      // if input name does not include .svg, add it.
      if (inputName.indexOf('.svg') === -1) {
        inputName += '.svg';
      }
      args.svg = `./${inputName}`;
    }
    return args;
  },
};
