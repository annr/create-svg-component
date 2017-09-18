#! /usr/bin/env node

const fs = require('fs');
const path = require('path');
const HTMLtoJSX = require('htmltojsx');
const jsdom = require('jsdom-no-contextify');
const yargs = require('yargs');

// custom files
const content = require('./strings/en-us');
const getComponentName = require('./src/getComponentName');
const formatSVG = require('./src/formatSVG');
const generateComponentFile = require('./src/generateComponentFile');

const args = yargs
  .option('dir', { default: '' })
  .option('output', { alias: 'o' })
  .option('help', { default: false })
  .argv;

const dirPath = args.dir;
let outputPath = args.output;
let svg;
let inputName;
let newComponentName;

if (args.help) {
  console.log(content.helptext);
  process.exit(1);
}

if (dirPath && !outputPath) {
  outputPath = dirPath;
}

if (!dirPath) {
  inputName = args._[0];
  newComponentName = args._[1];

  // if input name does not include .svg, add it.
  if (inputName.indexOf('.svg') === -1) {
    inputName += '.svg';
  }
  svg = `./${inputName}`;
}

const converter = new HTMLtoJSX({ createClass: false });

// let fileCount = 0;

const writeFile = (processedSVG, fileName) => {
  let file;

  if (outputPath) {
    file = path.resolve(process.cwd(), outputPath, `${fileName}.tsx`);
  } else {
    file = path.resolve(process.cwd(), `${fileName}.tsx`);
  }

  fs.writeFile(file, processedSVG, { flag: 'w' }, (err) => {
    if (err) {
      console.error(`Output file ${file} not writable`);
      return;
    }

    console.log(`Component written to ${file}`);
  });
};

const runUtil = (fileToRead, fileToWrite) => {
  fs.readFile(fileToRead, 'utf8', (err, file) => {
    if (err) {
      console.error(err);
      return;
    }

    let output = file;

    jsdom.env(output, (jsdomErr, window) => {
      const body = window.document.getElementsByTagName('body')[0];

      // we require viewBox
      if (!body.firstChild.getAttribute('viewBox')) {
        console.error(`${fileToRead} does not have a viewBox attribute. Skipping...`);
        return;
      }

      if (body.firstChild.hasAttribute('viewBox')) {
        const [, , width, height] = body.firstChild.getAttribute('viewBox').split(/[,\s]+/);
        if (!width || !height) {
          const errorMsg = 'Could not get width and/or height from existing viewBox attribute. Skipping...';
          console.error(`${fileToRead}: ${errorMsg}`);
          return;
        }
        // use viewBox for height and width if attributes not set
        if (!body.firstChild.hasAttribute('width') && width) {
          body.firstChild.setAttribute('width', width);
        }
        if (!body.firstChild.hasAttribute('height') && height) {
          body.firstChild.setAttribute('height', height);
        }
        if (body.firstChild.getAttribute('width') !== width || body.firstChild.getAttribute('height') !== height) {
          console.warn(`${fileToRead}: has mismatched viewBox and height or width attributes`);
        }
      }

      // Add generic props attribute to parent element, allowing props to be passed to the svg
      // such as className
      body.firstChild.setAttribute(':props:', '');

      // Now that we are done with manipulating the node/s we can return it back as a string
      output = body.innerHTML;

      // Convert from HTML to JSX
      output = converter.convert(output);

      // jsdom and htmltojsx will automatically (and correctly) wrap attributes in double quotes,
      // and generally just dislikes all the little markers used by react, such as the spread
      // operator. We will sub those back in manually now
      output = output.replace(/:props:/g, '{...props}');

      output = formatSVG(output);

      // Wrap it up in a React component
      output = generateComponentFile(output, fileToWrite);

      // fileCount++;
      writeFile(output, fileToWrite);
    });
  });
};

const runUtilForAllInDir = (dir) => {
  fs.readdir(`${process.cwd()}/${dir}`, (err, files) => {
    if (err) {
      return console.error(err);
    }

    files.forEach((file) => {
      const extention = path.extname(file);
      const fileName = path.basename(file);
      let normalizedDir = dir;

      if (extention === '.svg') {
        // variable instantiated up top
        const componentName = getComponentName(file, fileName);
        if (normalizedDir.indexOf('/') !== normalizedDir.length - 1) {
          // if no slash with dir, add it.
          normalizedDir += '/';
        }
        runUtil(dir + fileName, componentName);
      }
    });
  });
};

if (dirPath !== '') {
  runUtilForAllInDir(dirPath);
} else {
  // fileCount++;
  if (!newComponentName) {
    newComponentName = getComponentName(svg, path.basename(svg));
  }
  runUtil(svg, newComponentName);
}

