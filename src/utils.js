function snakeToCamel(s) {
  return s.replace(/(-\w)/g, m => m[1].toUpperCase());
}

function removeExtension(s, ext = '.svg') {
  if (s.indexOf(ext) !== -1) {
    return s.substr(0, s.indexOf(ext));
  }
  return s;
}

const componentName = function componentName(file) {
  let prep;

  // grab filename
  const filePathElements = file.split('/');
  prep = filePathElements[filePathElements.length - 1];

  prep = removeExtension(snakeToCamel(prep));

  return prep[0].toUpperCase() + prep.substr(1);
};

module.exports = {
  componentName,
};

