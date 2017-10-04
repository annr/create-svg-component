#! /usr/bin/env node

// local includes
const parseArgs = require('./src/parseArgs');
const svgComp = require('./src/svgComp');

// process args
const args = parseArgs.run();

// if there is no directory path, process one SVG
// otherwise, process the whole directory
if (!args.dir && args.svg) {
  svgComp.processFile(args.svg, args.output);
} else {
  svgComp.processFiles(args.dir, args.output);
}
