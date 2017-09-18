

/**
 * Creates a full component string based upon provided svg data and a component name
 * @param  string svgOutput     The svg data, preformatted
 * @param  string componentName The name of the component without extension
 * @return string               The parsed component string
 */
module.exports = (svgOutput, componentName) =>
  `/*! Copyright (c) Microsoft Corporation. All rights reserved. Licensed under the MIT license. */
/* tslint:disable:max-line-length */
// This file was auto-generated -- do not edit. Use https://www.npmjs.com/package/create-svg-component

import * as React from 'react';

const ${componentName} = function ${componentName}(props: any) {
  return (
${svgOutput.split('\n').map(line => `    ${line}`).join('\n')}
  );
};

export default ${componentName};
`;
