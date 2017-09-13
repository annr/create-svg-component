#! /usr/bin/env node

const fs = require('fs');
const path = require('path');
const HTMLtoJSX = require('htmltojsx');
const jsdom = require('jsdom-no-contextify');

// custom files
const content = require('./strings/en-us');
const getComponentName = require('./src/getComponentName');
const formatSVG = require('./src/formatSVG');
const generateComponentFile = require('./src/generateComponentFile');

// test values.
// const inputName = 'skype';
// const componentName = 'Skype';
// const outputPath = 'components';

let inputName = process.argv[1];
let newComponentName = process.argv[2];
let outputPath = process.argv[3];

if(process.argv[4]) {
  // shift them. This is terrible and will be removed.
  inputName = process.argv[2];
  newComponentName = process.argv[3];
  outputPath = process.argv[4];
}

// Bootstrap base variables
const converter = new HTMLtoJSX({ createClass: false });
const svg = `./${inputName}.svg`; // to do: fix path, remove svg
let fileCount = 0;

const writeFile = (processedSVG, fileName) => {
  let file;
  let filesWritten = 0;

  if (outputPath){
    file = path.resolve(process.cwd(), outputPath, `${fileName}.tsx`);
  } else {
    file = path.resolve(process.cwd(), `${fileName}.tsx`);
  }

  fs.writeFile(file, processedSVG, { flag: 'w' }, function (err) {
    if (err) {
      console.error(`Output file ${file} not writable`);
      return;
    }
    filesWritten++;

    console.log('File written to -> ' + file);

    if (filesWritten === fileCount) {
      console.log(`${filesWritten} components created. That must be some kind of record`);
      console.log();
      console.log(content.processCompleteText);
      console.log();
    }
  });
};

const runUtil = (fileToRead, fileToWrite) => {
  fs.readFile(fileToRead, 'utf8', function (err, file) {
    if (err) {
      console.error(err);
      return;
    }

    let output = file;

    jsdom.env(output, (err, window) => {

      const body = window.document.getElementsByTagName('body')[0];

      // use viewbox for height and width if attributes not set
      if(body.firstChild.hasAttribute('viewBox')) {
        const [minX, minY, width, height] = body.firstChild.getAttribute('viewBox').split(/[,\s]+/);
        if(!width || !height) {
          throw new Error('Could not get SVG height and width from viewBox')
        }
      }

      if(!body.firstChild.hasAttribute('width')) {
        body.firstChild.setAttribute('width', width);
      }
      if(!body.firstChild.hasAttribute('height')) {
        body.firstChild.setAttribute('height', height);
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

      writeFile(output, fileToWrite);
    });

  });
};

const runUtilForAllInDir = () => {
  fs.readdir(process.cwd(), (err, files) => {
    if (err) {
      return console.log(err);
    }

    files.forEach((file, i) => {
      const extention = path.extname(file);
      const fileName = path.basename(file);

      if (extention === '.svg') {
        // variable instantiated up top
        const componentName = getComponentName(file, fileName);
        runUtil(fileName, componentName);
        fileCount++;
      }
    });
  });
};

// Exit out early arguments
if (process.argv[0] === '--help') {
  console.log(content.helptext);
  process.exit(1);
}

// Main entry point
// if (firstArg === 'dir') {
//   runUtilForAllInDir();
// } else {
//   fileCount++;
  runUtil(svg, newComponentName);
// }

