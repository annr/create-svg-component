const fs = require('fs');
const path = require('path');
const utils = require('./utils');
const template = require('./template');
const { JSDOM } = require('jsdom');
const HTMLtoJSX = require('htmltojsx');

const converter = new HTMLtoJSX({ createClass: false });

const processWidthAndHeight = (input) => {
  const svg = input;
  const [, , width, height] = svg.getAttribute('viewBox').split(' ');
  if (!width || !height) {
    console.error('No width and/or height from viewBox attribute');
    return;
  }
  // use viewBox for height and width if attributes not set
  if (!svg.hasAttribute('width') && width) {
    svg.setAttribute('width', width);
  }
  if (!svg.hasAttribute('height') && height) {
    svg.setAttribute('height', height);
  }
  if (svg.getAttribute('width') !== width || svg.getAttribute('height') !== height) {
    console.warn('Mismatched viewBox and size attributes');
    return;
  }
  return svg;
};

const writeFile = (jsxSvg, name = 'Component', outputPath = '', ext = '.tsx') => {
  const file = path.resolve(process.cwd(), outputPath, `${name}${ext}`);
  fs.writeFile(file, jsxSvg, { flag: 'w' }, (err) => {
    if (err) {
      console.error(`Output file ${file} not writable`);
      return;
    }
    console.log(`Component written to ${file}`);
  });
};

const processSvg = function processSvg(input) {
  const dom = new JSDOM(input);
  let processed;
  let svg = dom.window.document.getElementsByTagName('body')[0].firstChild;
  // we require viewBox
  if (!svg.getAttribute('viewBox')) {
    console.error('Missing viewBox attribute. Skipping...');
    return;
  }
  svg = processWidthAndHeight(svg);
  if (!svg) {
    return;
  }
  svg.setAttribute(':props:', ''); // to be replaced by spread below
  // Convert to string for further processing
  processed = svg.parentNode.innerHTML;
  // HTML -> JSX
  processed = converter.convert(processed);
  processed = processed.replace(/:props:/g, '{...props}');
  return processed;
};

const processFile = function processFile(fileToRead, outputPath) {
  const componentName = utils.componentName(fileToRead);
  let output;
  fs.readFile(fileToRead, 'utf8', (err, file) => {
    if (err) {
      console.error(err);
      return;
    }
    output = processSvg(file);
    // if SVG was able to be process, add it to template and write it to file
    if (output) {
      output = template(processSvg(file), componentName);
      writeFile(output, componentName, outputPath);
    }
  });
};

const processFiles = function processFiles(dir, output) {
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
        if (normalizedDir.indexOf('/') !== (normalizedDir.length - 1)) {
          // if no slash with dir, add it.
          normalizedDir += '/';
        }
        processFile(normalizedDir + fileName, output);
      }
    });
  });
};

module.exports = {
  processFile,
  processFiles,
  processSvg,
};
